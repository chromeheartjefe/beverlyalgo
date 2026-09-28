import "server-only"

import { type SQL, sql } from "drizzle-orm"

import { one, rows } from "~/lib/db"
import { COST, PLAN_KIND, type PlanKind } from "~/lib/format"

export const PAGE_SIZE = 50

export type UserFilters = {
  q?: string
  plan?: PlanKind | "paying"
  verified?: "yes" | "no"
  flag?: "at-risk" | "indicator-pending" | "inactive-30d"
  sort?: "created" | "seen" | "spend" | "analyses" | "messages"
  page?: number
}

export type UserRow = {
  id: string
  name: string
  email: string
  plan_kind: PlanKind
  verified: boolean
  created_at: string
  last_seen_at: string | null
  login_count: number
  period_end: string | null
  indicator: "none" | "pending" | "invited"
  analyses: number
  messages: number
  trades: number
  spend_30d: number
}

// Whitelisted: the sort value comes from the URL
const ORDER: Record<NonNullable<UserFilters["sort"]>, string> = {
  created:  "u.created_at DESC",
  seen:     "u.last_seen_at DESC NULLS LAST",
  spend:    "spend_30d DESC",
  analyses: "analyses DESC",
  messages: "messages DESC",
}

function where(f: UserFilters): SQL {
  const parts: SQL[] = [sql`true`]
  if (f.q) {
    const like = `%${f.q.trim()}%`
    parts.push(sql`(u.email ILIKE ${like} OR u.name ILIKE ${like} OR u.id = ${f.q.trim()} OR u.tradingview_username ILIKE ${like})`)
  }
  if (f.plan === "paying") parts.push(sql`u.plan <> 'free'`)
  else if (f.plan) parts.push(sql`${PLAN_KIND()} = ${f.plan}`)
  if (f.verified === "yes") parts.push(sql`u.email_verified IS NOT NULL`)
  if (f.verified === "no") parts.push(sql`u.email_verified IS NULL`)
  if (f.flag === "at-risk") parts.push(sql`u.plan <> 'free' AND (u.last_seen_at IS NULL OR u.last_seen_at < now() - interval '14 days')`)
  if (f.flag === "inactive-30d") parts.push(sql`(u.last_seen_at IS NULL OR u.last_seen_at < now() - interval '30 days')`)
  if (f.flag === "indicator-pending") parts.push(sql`u.indicator_requested_at IS NOT NULL AND u.indicator_invited_at IS NULL`)
  return sql.join(parts, sql` AND `)
}

export async function listUsers(f: UserFilters) {
  const page = Math.max(1, f.page ?? 1)
  const order = sql.raw(ORDER[f.sort ?? "created"] ?? ORDER.created)
  const w = where(f)

  const [list, count] = await Promise.all([
    rows<UserRow>(sql`
      SELECT u.id, u.name, u.email, ${PLAN_KIND()} AS plan_kind,
        (u.email_verified IS NOT NULL) AS verified,
        u.created_at, u.last_seen_at, u.login_count,
        u.stripe_current_period_end AS period_end,
        CASE WHEN u.indicator_invited_at IS NOT NULL THEN 'invited'
             WHEN u.indicator_requested_at IS NOT NULL THEN 'pending' ELSE 'none' END AS indicator,
        (SELECT count(*) FROM chart_analyses c WHERE c.user_id = u.id)::int AS analyses,
        (SELECT count(*) FROM chat_messages m WHERE m.user_id = u.id AND m.role = 'user')::int AS messages,
        (SELECT count(*) FROM trades t WHERE t.user_id = u.id)::int AS trades,
        (SELECT coalesce(sum(${COST("a.")}), 0) FROM ai_usage a
           WHERE a.user_id = u.id AND a.created_at >= now() - interval '30 days')::float8 AS spend_30d
      FROM users u
      WHERE ${w}
      ORDER BY ${order}
      LIMIT ${PAGE_SIZE} OFFSET ${(page - 1) * PAGE_SIZE}
    `),
    one<{ n: number }>(sql`SELECT count(*)::int AS n FROM users u WHERE ${w}`),
  ])

  return { list, total: count?.n ?? 0, page }
}
