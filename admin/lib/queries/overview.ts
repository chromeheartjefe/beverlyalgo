import "server-only"

import { sql } from "drizzle-orm"

import { one, rows } from "~/lib/db"
import { COST } from "~/lib/format"

/** The last `n` days (UTC) as a generate_series, oldest first. */
export const DAYS = (n: number) =>
  sql.raw(`generate_series(date_trunc('day', now()) - interval '${n - 1} days', date_trunc('day', now()), interval '1 day')`)

export type Kpis = {
  total: number; new_1d: number; new_7d: number; new_30d: number
  verified: number; dau: number; wau: number; mau: number
  monthly: number; lifetime: number; manual: number
}

export async function getKpis() {
  return one<Kpis>(sql`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE created_at >= now() - interval '1 day')::int  AS new_1d,
      count(*) FILTER (WHERE created_at >= now() - interval '7 days')::int AS new_7d,
      count(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS new_30d,
      count(*) FILTER (WHERE email_verified IS NOT NULL)::int AS verified,
      count(*) FILTER (WHERE last_seen_at >= now() - interval '1 day')::int  AS dau,
      count(*) FILTER (WHERE last_seen_at >= now() - interval '7 days')::int AS wau,
      count(*) FILTER (WHERE last_seen_at >= now() - interval '30 days')::int AS mau,
      count(*) FILTER (WHERE plan <> 'free' AND stripe_subscription_id IS NOT NULL)::int AS monthly,
      count(*) FILTER (WHERE plan <> 'free' AND stripe_subscription_id IS NULL AND stripe_customer_id IS NOT NULL)::int AS lifetime,
      count(*) FILTER (WHERE plan <> 'free' AND stripe_subscription_id IS NULL AND stripe_customer_id IS NULL)::int AS manual
    FROM users
  `)
}

export async function getMonthSpend() {
  const row = await one<{ spend: number; estimated: number }>(sql`
    SELECT coalesce(sum(${COST()}), 0)::float8 AS spend,
           count(*) FILTER (WHERE cost_usd IS NULL)::int AS estimated
    FROM ai_usage WHERE created_at >= date_trunc('month', now())
  `)
  return row ?? { spend: 0, estimated: 0 }
}

export async function getSignupsPerDay(days = 30) {
  return rows<{ day: string; signups: number }>(sql`
    SELECT to_char(d, 'YYYY-MM-DD') AS day, count(u.id)::int AS signups
    FROM ${DAYS(days)} AS d
    LEFT JOIN users u ON date_trunc('day', u.created_at) = d
    GROUP BY d ORDER BY d
  `)
}

// "Active" = did something we record (sign-in, analysis, bot message, trade,
// scan...). Browsing alone only moves last_seen_at, which has no history.
export async function getActivePerDay(days = 30) {
  return rows<{ day: string; active: number }>(sql`
    WITH act AS (
      SELECT user_id, created_at FROM user_events
      UNION ALL SELECT user_id, created_at FROM chart_analyses
      UNION ALL SELECT user_id, created_at FROM chat_messages WHERE role = 'user'
      UNION ALL SELECT user_id, created_at FROM trades
      UNION ALL SELECT user_id, created_at FROM ai_usage WHERE user_id IS NOT NULL
    )
    SELECT to_char(d, 'YYYY-MM-DD') AS day, count(DISTINCT a.user_id)::int AS active
    FROM ${DAYS(days)} AS d
    LEFT JOIN act a ON a.created_at >= d AND a.created_at < d + interval '1 day'
    GROUP BY d ORDER BY d
  `)
}

export async function getAiCostPerDay(days = 30) {
  return rows<{ day: string; chart_analysis: number; chat: number; screener: number }>(sql`
    SELECT to_char(d, 'YYYY-MM-DD') AS day,
      coalesce(sum(a.cost) FILTER (WHERE a.feature = 'chart_analysis'), 0)::float8 AS chart_analysis,
      coalesce(sum(a.cost) FILTER (WHERE a.feature = 'chat'), 0)::float8 AS chat,
      coalesce(sum(a.cost) FILTER (WHERE a.feature = 'screener'), 0)::float8 AS screener
    FROM ${DAYS(days)} AS d
    LEFT JOIN (SELECT feature, created_at, ${COST()} AS cost FROM ai_usage) a
      ON a.created_at >= d AND a.created_at < d + interval '1 day'
    GROUP BY d ORDER BY d
  `)
}

export async function getAnalysesPerDay(days = 30) {
  return rows<{ day: string; buy: number; sell: number; neutral: number }>(sql`
    SELECT to_char(d, 'YYYY-MM-DD') AS day,
      count(c.id) FILTER (WHERE c.signal = 'BUY')::int AS buy,
      count(c.id) FILTER (WHERE c.signal = 'SELL')::int AS sell,
      count(c.id) FILTER (WHERE c.signal = 'NEUTRAL')::int AS neutral
    FROM ${DAYS(days)} AS d
    LEFT JOIN chart_analyses c ON c.created_at >= d AND c.created_at < d + interval '1 day'
    GROUP BY d ORDER BY d
  `)
}

export async function getMessagesPerDay(days = 30) {
  return rows<{ day: string; messages: number }>(sql`
    SELECT to_char(d, 'YYYY-MM-DD') AS day, count(m.id)::int AS messages
    FROM ${DAYS(days)} AS d
    LEFT JOIN chat_messages m ON m.role = 'user' AND m.created_at >= d AND m.created_at < d + interval '1 day'
    GROUP BY d ORDER BY d
  `)
}

export async function getTotals() {
  return one<{ analyses_30d: number; messages_30d: number; trades_30d: number; scans_30d: number; scan_views_30d: number }>(sql`
    SELECT
      (SELECT count(*) FROM chart_analyses WHERE created_at >= now() - interval '30 days')::int AS analyses_30d,
      (SELECT count(*) FROM chat_messages WHERE role = 'user' AND created_at >= now() - interval '30 days')::int AS messages_30d,
      (SELECT count(*) FROM trades WHERE created_at >= now() - interval '30 days')::int AS trades_30d,
      (SELECT count(*) FROM user_events WHERE type = 'screener_scan' AND meta::json->>'fresh' = 'true' AND created_at >= now() - interval '30 days')::int AS scans_30d,
      (SELECT count(*) FROM user_events WHERE type = 'screener_scan' AND coalesce(meta::json->>'fresh', 'false') <> 'true' AND created_at >= now() - interval '30 days')::int AS scan_views_30d
  `)
}
