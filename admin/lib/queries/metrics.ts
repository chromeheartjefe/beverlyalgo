import "server-only"

import { sql } from "drizzle-orm"

import { one, rows } from "~/lib/db"
import { EXCLUDED_IDS as EX, USERS } from "~/lib/excluded"
import { COST, PLAN_KIND, type PlanKind } from "~/lib/format"

// Business metrics for Overview, Engagement, the AI analyst and the insight
// rules. "Active" means the account did something we record (sign-in, chart
// analysis, bot message, trade, screener scan, AI call); page views alone
// only move users.last_seen_at, which has no history.

const ACT_RAW = sql.raw(`(
  SELECT user_id, created_at FROM user_events
  UNION ALL SELECT user_id, created_at FROM chart_analyses
  UNION ALL SELECT user_id, created_at FROM chat_messages WHERE role = 'user'
  UNION ALL SELECT user_id, created_at FROM trades
  UNION ALL SELECT user_id, created_at FROM ai_usage WHERE user_id IS NOT NULL
)`)
const ACT = sql`(SELECT * FROM ${ACT_RAW} act_all WHERE user_id NOT IN ${EX})`

// A "core" action = the user got value from a product feature (not just a login)
const CORE_RAW = sql.raw(`(
  SELECT user_id, created_at FROM chart_analyses
  UNION ALL SELECT user_id, created_at FROM chat_messages WHERE role = 'user'
  UNION ALL SELECT user_id, created_at FROM trades
  UNION ALL SELECT user_id, created_at FROM user_events WHERE type = 'screener_scan'
)`)
const CORE = sql`(SELECT * FROM ${CORE_RAW} core_all WHERE user_id NOT IN ${EX})`

/** Tables that may not exist yet on the live database (unreleased features) */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p
  } catch {
    return fallback
  }
}

/** Relative change, null when there is nothing to compare against */
export const change = (now: number, before: number): number | null => (before > 0 ? (now - before) / before : now > 0 ? null : 0)

export type Growth = {
  signups_7d: number; signups_prev_7d: number
  signups_30d: number; signups_prev_30d: number
  active_7d: number; active_prev_7d: number
  active_30d: number; active_prev_30d: number
  active_today: number; avg_daily_7d: number
  total_users: number; verified: number; paying: number
}

export async function getGrowth(): Promise<Growth | null> {
  return one<Growth>(sql`
    WITH act AS ${ACT},
    daily AS (
      SELECT date_trunc('day', created_at) AS d, count(DISTINCT user_id) AS n
      FROM act WHERE created_at >= date_trunc('day', now()) - interval '6 days'
      GROUP BY 1
    )
    SELECT
      (SELECT count(*) FROM ${USERS} AS users WHERE created_at >= now() - interval '7 days')::int AS signups_7d,
      (SELECT count(*) FROM ${USERS} AS users WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days')::int AS signups_prev_7d,
      (SELECT count(*) FROM ${USERS} AS users WHERE created_at >= now() - interval '30 days')::int AS signups_30d,
      (SELECT count(*) FROM ${USERS} AS users WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS signups_prev_30d,
      (SELECT count(DISTINCT user_id) FROM act WHERE created_at >= now() - interval '7 days')::int AS active_7d,
      (SELECT count(DISTINCT user_id) FROM act WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days')::int AS active_prev_7d,
      (SELECT count(DISTINCT user_id) FROM act WHERE created_at >= now() - interval '30 days')::int AS active_30d,
      (SELECT count(DISTINCT user_id) FROM act WHERE created_at >= now() - interval '60 days' AND created_at < now() - interval '30 days')::int AS active_prev_30d,
      (SELECT count(DISTINCT user_id) FROM act WHERE created_at >= date_trunc('day', now()))::int AS active_today,
      (SELECT coalesce(sum(n), 0) / 7.0 FROM daily)::float8 AS avg_daily_7d,
      (SELECT count(*) FROM ${USERS} AS users)::int AS total_users,
      (SELECT count(*) FROM ${USERS} AS users WHERE email_verified IS NOT NULL)::int AS verified,
      (SELECT count(*) FROM ${USERS} AS users WHERE plan <> 'free')::int AS paying
  `)
}

export type Activation = { cohort: number; activated: number; median_hours: number | null; ever_activated: number }

/**
 * Activation: a core action within 7 days of signing up. Measured on the
 * last 90 days of signups that are at least 7 days old, so everyone in the
 * group had the full week.
 */
export async function getActivation(): Promise<Activation | null> {
  return one<Activation>(sql`
    WITH core AS ${CORE},
    firsts AS (
      SELECT u.id, u.created_at, min(c.created_at) AS first_core
      FROM ${USERS} u LEFT JOIN core c ON c.user_id = u.id
      GROUP BY u.id, u.created_at
    )
    SELECT
      count(*) FILTER (WHERE created_at >= now() - interval '90 days' AND created_at < now() - interval '7 days')::int AS cohort,
      count(*) FILTER (WHERE created_at >= now() - interval '90 days' AND created_at < now() - interval '7 days'
                       AND first_core IS NOT NULL AND first_core < created_at + interval '7 days')::int AS activated,
      (percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM first_core - created_at) / 3600)
        FILTER (WHERE first_core IS NOT NULL AND created_at >= now() - interval '90 days'))::float8 AS median_hours,
      count(*) FILTER (WHERE first_core IS NOT NULL)::int AS ever_activated
    FROM firsts
  `)
}

export type AdoptionRow = { key: string; label: string; users: number; uses: number }

/** How many accounts used each feature in the last 30 days */
export async function getFeatureAdoption(): Promise<AdoptionRow[]> {
  const [base, academy] = await Promise.all([
    one<Record<string, number>>(sql`
      SELECT
        (SELECT count(DISTINCT user_id) FROM chart_analyses WHERE user_id NOT IN ${EX} AND created_at >= now() - interval '30 days')::int AS analysis_u,
        (SELECT count(*) FROM chart_analyses WHERE user_id NOT IN ${EX} AND created_at >= now() - interval '30 days')::int AS analysis_n,
        (SELECT count(DISTINCT user_id) FROM chat_messages WHERE user_id NOT IN ${EX} AND role = 'user' AND created_at >= now() - interval '30 days')::int AS bot_u,
        (SELECT count(*) FROM chat_messages WHERE user_id NOT IN ${EX} AND role = 'user' AND created_at >= now() - interval '30 days')::int AS bot_n,
        (SELECT count(DISTINCT user_id) FROM trades WHERE user_id NOT IN ${EX} AND created_at >= now() - interval '30 days')::int AS journal_u,
        (SELECT count(*) FROM trades WHERE user_id NOT IN ${EX} AND created_at >= now() - interval '30 days')::int AS journal_n,
        (SELECT count(DISTINCT user_id) FROM user_events WHERE user_id NOT IN ${EX} AND type = 'screener_scan' AND created_at >= now() - interval '30 days')::int AS screener_u,
        (SELECT count(*) FROM user_events WHERE user_id NOT IN ${EX} AND type = 'screener_scan' AND created_at >= now() - interval '30 days')::int AS screener_n,
        (SELECT count(DISTINCT user_id) FROM trading_goals WHERE user_id NOT IN ${EX} AND updated_at >= now() - interval '30 days')::int AS goals_u,
        (SELECT count(*) FROM trading_goals WHERE user_id NOT IN ${EX} AND updated_at >= now() - interval '30 days')::int AS goals_n,
        (SELECT count(*) FROM ${USERS} AS users WHERE indicator_requested_at >= now() - interval '30 days')::int AS indicator_u
    `),
    safe(
      one<{ u: number; n: number }>(sql`
        SELECT count(DISTINCT user_id)::int AS u, count(*)::int AS n
        FROM academy_progress WHERE user_id NOT IN ${EX} AND last_completed_at >= now() - interval '30 days'
      `),
      null,
    ),
  ])
  const b = base ?? {}
  const list: AdoptionRow[] = [
    { key: "analysis", label: "Chart Analysis", users: b.analysis_u ?? 0, uses: b.analysis_n ?? 0 },
    { key: "bot",      label: "AI Bot",         users: b.bot_u ?? 0,      uses: b.bot_n ?? 0 },
    { key: "journal",  label: "Trade Journal",  users: b.journal_u ?? 0,  uses: b.journal_n ?? 0 },
    { key: "screener", label: "AI Screener",    users: b.screener_u ?? 0, uses: b.screener_n ?? 0 },
    { key: "goals",    label: "Calendar goals", users: b.goals_u ?? 0,    uses: b.goals_n ?? 0 },
    { key: "indicator", label: "Indicator requests", users: b.indicator_u ?? 0, uses: b.indicator_u ?? 0 },
  ]
  if (academy) list.push({ key: "academy", label: "Academy", users: academy.u, uses: academy.n })
  return list.sort((a, b) => b.users - a.users)
}

export type CohortRow = { week: string; size: number; weeks: (number | null)[] }

/** Weekly signup cohorts: share of each cohort active in week 0..n after signup */
export async function getCohorts(weeks = 8): Promise<CohortRow[]> {
  const [sizes, active] = await Promise.all([
    rows<{ wk: string; size: number }>(sql`
      SELECT to_char(date_trunc('week', created_at), 'YYYY-MM-DD') AS wk, count(*)::int AS size
      FROM ${USERS} AS users WHERE created_at >= date_trunc('week', now()) - ${sql.raw(`interval '${weeks - 1} weeks'`)}
      GROUP BY 1 ORDER BY 1
    `),
    rows<{ wk: string; k: number; n: number }>(sql`
      WITH act AS ${ACT},
      c AS (
        SELECT id, date_trunc('week', created_at) AS wk FROM ${USERS} AS users
        WHERE created_at >= date_trunc('week', now()) - ${sql.raw(`interval '${weeks - 1} weeks'`)}
      )
      SELECT to_char(c.wk, 'YYYY-MM-DD') AS wk,
        floor(extract(epoch FROM date_trunc('week', a.created_at) - c.wk) / 604800)::int AS k,
        count(DISTINCT a.user_id)::int AS n
      FROM c JOIN act a ON a.user_id = c.id AND a.created_at >= c.wk
      GROUP BY 1, 2
    `),
  ])
  const thisWeek = Date.now()
  return sizes.map((s) => {
    const start = new Date(`${s.wk}T00:00:00Z`).getTime()
    const elapsed = Math.floor((thisWeek - start) / (7 * 86400_000))
    return {
      week: s.wk,
      size: s.size,
      weeks: Array.from({ length: weeks }, (_, k) => {
        if (k > elapsed) return null
        const n = active.find((a) => a.wk === s.wk && a.k === k)?.n ?? 0
        return s.size > 0 ? n / s.size : 0
      }),
    }
  })
}

export type RiskRow = { id: string; email: string; kind: PlanKind; last_active: string | null; core_30d: number; created_at: string }

/** Paying accounts that have gone quiet: the churn watch list */
export async function getAtRiskPayers(): Promise<RiskRow[]> {
  return rows<RiskRow>(sql`
    WITH act AS ${ACT}, core AS ${CORE}
    SELECT u.id, u.email, ${PLAN_KIND()} AS kind, u.created_at,
      greatest(u.last_seen_at, (SELECT max(created_at) FROM act a WHERE a.user_id = u.id)) AS last_active,
      (SELECT count(*) FROM core c WHERE c.user_id = u.id AND c.created_at >= now() - interval '30 days')::int AS core_30d
    FROM ${USERS} u
    WHERE u.plan <> 'free'
    ORDER BY last_active ASC NULLS FIRST
  `)
}

export type PowerRow = { id: string; email: string; kind: PlanKind; actions: number; analyses: number; messages: number; trades: number }

export async function getPowerUsers(limit = 8): Promise<PowerRow[]> {
  return rows<PowerRow>(sql`
    SELECT u.id, u.email, ${PLAN_KIND()} AS kind,
      (coalesce(a.n, 0) + coalesce(m.n, 0) + coalesce(t.n, 0))::int AS actions,
      coalesce(a.n, 0)::int AS analyses, coalesce(m.n, 0)::int AS messages, coalesce(t.n, 0)::int AS trades
    FROM ${USERS} u
    LEFT JOIN (SELECT user_id, count(*) n FROM chart_analyses WHERE user_id NOT IN ${EX} AND created_at >= now() - interval '30 days' GROUP BY 1) a ON a.user_id = u.id
    LEFT JOIN (SELECT user_id, count(*) n FROM chat_messages WHERE user_id NOT IN ${EX} AND role = 'user' AND created_at >= now() - interval '30 days' GROUP BY 1) m ON m.user_id = u.id
    LEFT JOIN (SELECT user_id, count(*) n FROM trades WHERE user_id NOT IN ${EX} AND created_at >= now() - interval '30 days' GROUP BY 1) t ON t.user_id = u.id
    WHERE coalesce(a.n, 0) + coalesce(m.n, 0) + coalesce(t.n, 0) > 0
    ORDER BY actions DESC LIMIT ${limit}
  `)
}

export type UnitCosts = { cost_30d: number; cost_paying_30d: number; cost_free_30d: number; paying_users: number; free_active_30d: number }

/** AI spend split between paying and free accounts (last 30 days) */
export async function getUnitCosts(): Promise<UnitCosts | null> {
  return one<UnitCosts>(sql`
    SELECT
      coalesce(sum(${COST("a.")}), 0)::float8 AS cost_30d,
      coalesce(sum(${COST("a.")}) FILTER (WHERE u.plan <> 'free'), 0)::float8 AS cost_paying_30d,
      coalesce(sum(${COST("a.")}) FILTER (WHERE u.plan = 'free' OR u.id IS NULL), 0)::float8 AS cost_free_30d,
      (SELECT count(*) FROM ${USERS} AS users WHERE plan <> 'free')::int AS paying_users,
      count(DISTINCT a.user_id) FILTER (WHERE u.plan = 'free')::int AS free_active_30d
    FROM ai_usage a LEFT JOIN ${USERS} u ON u.id = a.user_id
    WHERE a.created_at >= now() - interval '30 days' AND (a.user_id IS NULL OR a.user_id NOT IN ${EX})
  `)
}

export type FreeTrial = { claims: number; claims_30d: number; claimed_then_paid: number }

/** The one free Chart Analysis for Free accounts, and whether it converts */
export async function getFreeTrial(): Promise<FreeTrial | null> {
  return safe(
    one<FreeTrial>(sql`
      SELECT count(*)::int AS claims,
        count(*) FILTER (WHERE f.created_at >= now() - interval '30 days')::int AS claims_30d,
        count(*) FILTER (WHERE u.plan <> 'free')::int AS claimed_then_paid
      FROM free_analysis_claims f LEFT JOIN ${USERS} u ON u.id = f.user_id
      WHERE f.user_id IS NULL OR f.user_id NOT IN ${EX}
    `),
    null,
  )
}

export type AcademyMetrics = { learners: number; learners_7d: number; lessons_30d: number; completions: number; certificates: number; avg_lessons: number }

export async function getAcademyMetrics(): Promise<AcademyMetrics | null> {
  return safe(
    one<AcademyMetrics>(sql`
      SELECT
        (SELECT count(DISTINCT user_id) FROM academy_progress WHERE user_id NOT IN ${EX})::int AS learners,
        (SELECT count(DISTINCT user_id) FROM academy_progress WHERE user_id NOT IN ${EX} AND last_completed_at >= now() - interval '7 days')::int AS learners_7d,
        (SELECT count(*) FROM academy_progress WHERE user_id NOT IN ${EX} AND first_completed_at >= now() - interval '30 days')::int AS lessons_30d,
        (SELECT count(*) FROM academy_progress WHERE user_id NOT IN ${EX})::int AS completions,
        (SELECT count(*) FROM academy_certificates WHERE user_id NOT IN ${EX})::int AS certificates,
        (SELECT coalesce(avg(n), 0) FROM (SELECT count(*) n FROM academy_progress WHERE user_id NOT IN ${EX} GROUP BY user_id) x)::float8 AS avg_lessons
    `),
    null,
  )
}

export type LifecycleFunnel = { signed_up: number; verified: number; activated: number; paying: number }

/** All time: signed up → verified email → used a core feature → paying */
export async function getLifecycle(): Promise<LifecycleFunnel | null> {
  return one<LifecycleFunnel>(sql`
    WITH core AS ${CORE}
    SELECT
      count(*)::int AS signed_up,
      count(*) FILTER (WHERE email_verified IS NOT NULL)::int AS verified,
      count(*) FILTER (WHERE EXISTS (SELECT 1 FROM core c WHERE c.user_id = u.id))::int AS activated,
      count(*) FILTER (WHERE plan <> 'free')::int AS paying
    FROM ${USERS} u
  `)
}

export type RecentSignup = { id: string; email: string; created_at: string; verified: boolean; kind: PlanKind; actions: number }

export async function getRecentSignups(limit = 6): Promise<RecentSignup[]> {
  return rows<RecentSignup>(sql`
    WITH core AS ${CORE}
    SELECT u.id, u.email, u.created_at, (u.email_verified IS NOT NULL) AS verified, ${PLAN_KIND()} AS kind,
      (SELECT count(*) FROM core c WHERE c.user_id = u.id)::int AS actions
    FROM ${USERS} u ORDER BY u.created_at DESC LIMIT ${limit}
  `)
}

/** Signups and active accounts per day in one series, for the growth chart */
export async function getGrowthSeries(days = 30) {
  return rows<{ day: string; signups: number; active: number }>(sql`
    WITH act AS ${ACT}
    SELECT to_char(d, 'YYYY-MM-DD') AS day,
      (SELECT count(*) FROM ${USERS} u WHERE u.created_at >= d AND u.created_at < d + interval '1 day')::int AS signups,
      (SELECT count(DISTINCT a.user_id) FROM act a WHERE a.created_at >= d AND a.created_at < d + interval '1 day')::int AS active
    FROM generate_series(date_trunc('day', now()) - ${sql.raw(`interval '${days - 1} days'`)}, date_trunc('day', now()), interval '1 day') AS d
    ORDER BY d
  `)
}
