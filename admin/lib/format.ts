import { sql } from "drizzle-orm"

// Rows recorded before 2026-09-28 have no cost_usd. They were all
// gpt-5.6-luna calls, so they are estimated at its rates (same as the site's
// monthly budget check in lib/ai-budget.ts). Newer rows carry their real cost.
const LEGACY_COST_IN  = 0.20 / 1_000_000
const LEGACY_COST_OUT = 1.20 / 1_000_000
export const AI_BUDGET_USD = Number(process.env.AI_MONTHLY_BUDGET_USD ?? 50)

/** SQL for a row's AI cost: the recorded cost, or an estimate for old rows. */
export const COST = (alias = "") =>
  sql.raw(`coalesce(${alias}cost_usd, ${alias}prompt_tokens * ${LEGACY_COST_IN} + ${alias}completion_tokens * ${LEGACY_COST_OUT})`)

/** SQL CASE turning plan + Stripe ids into free / monthly / lifetime / manual. */
export const PLAN_KIND = (alias = "u.") =>
  sql.raw(`CASE WHEN ${alias}plan = 'free' THEN 'free'
    WHEN ${alias}stripe_subscription_id IS NOT NULL THEN 'monthly'
    WHEN ${alias}stripe_customer_id IS NOT NULL THEN 'lifetime'
    ELSE 'manual' END`)

export type PlanKind = "free" | "monthly" | "lifetime" | "manual"

export const usd = (n: number | null | undefined, digits = 2) =>
  n == null ? "—" : `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

/** Tiny AI costs need more decimals to be readable ($0.0021). */
export const usdSmall = (n: number | null | undefined) =>
  n == null ? "—" : Math.abs(Number(n)) < 1 ? `$${Number(n).toFixed(4)}` : usd(n)

export const num = (n: number | null | undefined) => (n == null ? "—" : Number(n).toLocaleString("en-US"))

export const pct = (part: number, whole: number) => (whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "—")

export function dateTime(d: string | Date | null | undefined): string {
  if (!d) return "—"
  return new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function dateOnly(d: string | Date | null | undefined): string {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

/** "3h ago", "12d ago", "never" */
export function ago(d: string | Date | null | undefined): string {
  if (!d) return "never"
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000)
  if (s < 60) return "just now"
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 86400 * 60) return `${Math.floor(s / 86400)}d ago`
  return `${Math.floor(s / (86400 * 30))}mo ago`
}

export function price(n: number | null | undefined): string {
  if (n == null) return "—"
  const v = Number(n)
  const digits = v >= 1000 ? 2 : v >= 1 ? 2 : v >= 0.01 ? 4 : 8
  return `$${v.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}
