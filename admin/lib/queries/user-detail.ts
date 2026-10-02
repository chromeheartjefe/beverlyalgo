import "server-only"

import { sql } from "drizzle-orm"

import { one, rows } from "~/lib/db"
import { COST, PLAN_KIND, type PlanKind } from "~/lib/format"
import { monthlyAmount, periodEnd, stripe } from "~/lib/stripe"

export type UserDetail = {
  id: string; name: string; email: string; plan: string; plan_kind: PlanKind
  email_verified: string | null; created_at: string; last_seen_at: string | null
  last_login_at: string | null; login_count: number; session_version: number
  stripe_customer_id: string | null; stripe_subscription_id: string | null; period_end: string | null
  tradingview_username: string | null; indicator_requested_at: string | null; indicator_invited_at: string | null
  has_avatar: boolean
}

export async function getUser(id: string) {
  return one<UserDetail>(sql`
    SELECT id, name, email, plan, ${PLAN_KIND("")} AS plan_kind, email_verified, created_at, last_seen_at,
      last_login_at, login_count, session_version, stripe_customer_id, stripe_subscription_id,
      stripe_current_period_end AS period_end, tradingview_username, indicator_requested_at,
      indicator_invited_at, (avatar IS NOT NULL) AS has_avatar
    FROM users WHERE id = ${id}
  `)
}

export async function getAiUsage(id: string) {
  return rows<{ feature: string; calls: number; tokens: number; cost_7d: number; cost_30d: number; cost_all: number }>(sql`
    SELECT feature, count(*)::int AS calls,
      (sum(prompt_tokens) + sum(completion_tokens))::int AS tokens,
      coalesce(sum(${COST()}) FILTER (WHERE created_at >= now() - interval '7 days'), 0)::float8 AS cost_7d,
      coalesce(sum(${COST()}) FILTER (WHERE created_at >= now() - interval '30 days'), 0)::float8 AS cost_30d,
      coalesce(sum(${COST()}), 0)::float8 AS cost_all
    FROM ai_usage WHERE user_id = ${id}
    GROUP BY feature ORDER BY cost_all DESC
  `)
}

/** Daily allowances used in the last 24h (same keys the site enforces). */
export async function getLimitsToday(id: string) {
  return one<{ analyses: number; messages: number }>(sql`
    SELECT
      (SELECT count(*) FROM rate_limit_hits WHERE key = ${`analyze-daily:${id}`} AND created_at > now() - interval '24 hours')::int AS analyses,
      (SELECT count(*) FROM rate_limit_hits WHERE key = ${`chat-daily:${id}`} AND created_at > now() - interval '24 hours')::int AS messages
  `)
}

export type AnalysisRow = {
  id: string; pair: string; timeframe: string; signal: string; confidence: number
  entry: number | null; tp1: number | null; tp2: number | null; sl: number | null; rr_ratio: number | null
  variant: string | null; model: string | null; result: string | null
  prompt_tokens: number | null; completion_tokens: number | null; cost_usd: number | null; created_at: string
}

export async function getAnalyses(id: string, limit = 10) {
  return rows<AnalysisRow>(sql`
    SELECT id, pair, timeframe, signal, confidence, entry, tp1, tp2, sl, rr_ratio, variant, model, result,
      prompt_tokens, completion_tokens, cost_usd, created_at
    FROM chart_analyses WHERE user_id = ${id}
    ORDER BY created_at DESC LIMIT ${limit}
  `)
}

export async function getAnalysisStats(id: string) {
  return one<{ total: number; buy: number; sell: number; neutral: number; rejected: number }>(sql`
    SELECT
      (SELECT count(*) FROM chart_analyses WHERE user_id = ${id})::int AS total,
      (SELECT count(*) FROM chart_analyses WHERE user_id = ${id} AND signal = 'BUY')::int AS buy,
      (SELECT count(*) FROM chart_analyses WHERE user_id = ${id} AND signal = 'SELL')::int AS sell,
      (SELECT count(*) FROM chart_analyses WHERE user_id = ${id} AND signal = 'NEUTRAL')::int AS neutral,
      (SELECT count(*) FROM user_events WHERE user_id = ${id} AND type = 'analysis_rejected')::int AS rejected
  `)
}

export type TimelineRow = { created_at: string; kind: string; meta: string | null }

// One feed from every table that records something the user did. Bot
// messages are grouped per day so a long chat doesn't flood the timeline.
export async function getTimeline(id: string, limit = 80) {
  return rows<TimelineRow>(sql`
    SELECT * FROM (
      SELECT created_at, type AS kind, meta FROM user_events WHERE user_id = ${id}
      UNION ALL
      SELECT created_at, 'analysis', json_build_object('pair', pair, 'timeframe', timeframe, 'signal', signal, 'confidence', confidence)::text
        FROM chart_analyses WHERE user_id = ${id}
      UNION ALL
      SELECT created_at, 'trade_added', json_build_object('pair', pair, 'direction', direction, 'pnl', pnl)::text
        FROM trades WHERE user_id = ${id}
      UNION ALL
      SELECT max(created_at), 'bot_messages', json_build_object('count', count(*))::text
        FROM chat_messages WHERE user_id = ${id} AND role = 'user' GROUP BY date_trunc('day', created_at)
      UNION ALL
      SELECT updated_at, 'goal_set', json_build_object('month', month, 'amount', amount)::text
        FROM trading_goals WHERE user_id = ${id}
      UNION ALL
      SELECT created_at, 'signed_up', NULL FROM users WHERE id = ${id}
    ) t
    ORDER BY created_at DESC LIMIT ${limit}
  `)
}

export async function getTrading(id: string) {
  return one<{ trades: number; wins: number; losses: number; pnl: number; first: string | null; last: string | null; goals: number }>(sql`
    SELECT count(*)::int AS trades,
      count(*) FILTER (WHERE pnl > 0)::int AS wins,
      count(*) FILTER (WHERE pnl < 0)::int AS losses,
      coalesce(sum(pnl), 0)::float8 AS pnl,
      min(date) AS first, max(date) AS last,
      (SELECT count(*) FROM trading_goals WHERE user_id = ${id})::int AS goals
    FROM trades WHERE user_id = ${id}
  `)
}

export async function getSecurity(id: string, email: string) {
  const [summary, logins] = await Promise.all([
    one<{ failed_30d: number; fails_15m: number; password_changes: number; chat_messages: number }>(sql`
      SELECT
        (SELECT count(*) FROM user_events WHERE user_id = ${id} AND type = 'login_failed' AND created_at > now() - interval '30 days')::int AS failed_30d,
        (SELECT count(*) FROM rate_limit_hits WHERE key = ${`login-fail:email:${email}`} AND created_at > now() - interval '15 minutes')::int AS fails_15m,
        (SELECT count(*) FROM user_events WHERE user_id = ${id} AND type IN ('password_changed', 'password_reset'))::int AS password_changes,
        (SELECT count(*) FROM chat_messages WHERE user_id = ${id})::int AS chat_messages
    `),
    rows<{ created_at: string; type: string; meta: string | null }>(sql`
      SELECT created_at, type, meta FROM user_events
      WHERE user_id = ${id} AND type IN ('login', 'login_failed')
      ORDER BY created_at DESC LIMIT 10
    `),
  ])
  return { summary, logins }
}

export type StripeInfo = {
  subscription: { status: string; canceling: boolean; periodEnd: Date | null; monthly: number; created: Date } | null
  charges: { id: string; amount: number; refunded: number; currency: string; created: Date; paid: boolean; disputed: boolean; description: string | null }[]
  lifetimeValue: number
}

export async function getStripeInfo(customerId: string | null, subscriptionId: string | null): Promise<StripeInfo | "not-configured" | null> {
  const s = stripe()
  if (!s) return "not-configured"
  if (!customerId) return null

  const [sub, charges] = await Promise.all([
    subscriptionId ? s.subscriptions.retrieve(subscriptionId).catch(() => null) : Promise.resolve(null),
    s.charges.list({ customer: customerId, limit: 25 }),
  ])

  const list = charges.data.map((c) => ({
    id: c.id,
    amount: c.amount_captured / 100,
    refunded: c.amount_refunded / 100,
    currency: c.currency,
    created: new Date(c.created * 1000),
    paid: c.paid && c.status === "succeeded",
    disputed: c.disputed,
    description: c.description,
  }))

  return {
    subscription: sub
      ? { status: sub.status, canceling: sub.cancel_at_period_end || !!sub.cancel_at, periodEnd: periodEnd(sub), monthly: monthlyAmount(sub), created: new Date(sub.created * 1000) }
      : null,
    charges: list,
    lifetimeValue: list.filter((c) => c.paid).reduce((t, c) => t + c.amount - c.refunded, 0),
  }
}
