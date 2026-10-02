import "server-only"

import { sql } from "drizzle-orm"

import { one, rows } from "~/lib/db"
import { USERS } from "~/lib/excluded"
import { COST } from "~/lib/format"

/** The last `n` days (UTC) as a generate_series, oldest first. */
const DAYS = (n: number) =>
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
    FROM ${USERS} AS users
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
