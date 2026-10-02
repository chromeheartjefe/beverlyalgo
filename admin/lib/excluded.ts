import "server-only"

import { sql } from "drizzle-orm"
import { cache } from "react"

import { rows } from "~/lib/db"

// Accounts left out of every business metric (counts, activity, funnels,
// revenue, unit costs, AI snapshot). They stay visible on the Users page with
// an "excluded" badge. Add more with ADMIN_EXCLUDE_EMAILS (comma separated)
// in admin/.env.local.
const DEFAULT = [
  "prodbydesire777@gmail.com", // owner's second account (Pro lifetime), not a customer
]

const EXCLUDED_EMAILS = [
  ...new Set(
    [...DEFAULT, ...(process.env.ADMIN_EXCLUDE_EMAILS ?? "").split(",")]
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  ),
]

const LIST = EXCLUDED_EMAILS.map((e) => `'${e.replace(/'/g, "''")}'`).join(", ") || "''"

/** SQL: ids of the excluded accounts */
export const EXCLUDED_IDS = sql.raw(`(SELECT id FROM users WHERE lower(email) IN (${LIST}))`)

/** SQL: the users table without the excluded accounts. Use as `FROM ${USERS} u`. */
export const USERS = sql.raw(`(SELECT * FROM users WHERE lower(email) NOT IN (${LIST}))`)

/** Their user ids and Stripe customer ids, for filtering Stripe data in code */
export const excludedRefs = cache(async (): Promise<{ ids: Set<string>; customers: Set<string> }> => {
  const list = await rows<{ id: string; customer: string | null }>(sql`
    SELECT id, stripe_customer_id AS customer FROM users WHERE lower(email) IN (${sql.raw(LIST)})
  `)
  return {
    ids: new Set(list.map((r) => r.id)),
    customers: new Set(list.map((r) => r.customer).filter((c): c is string => !!c)),
  }
})

/**
 * Stripe history starts here. Payments, subscriptions and checkouts before
 * September 2026 belong to a different business on the same Stripe account,
 * so every revenue figure ignores them. Override with ADMIN_STRIPE_SINCE.
 */
export const STRIPE_SINCE = new Date(process.env.ADMIN_STRIPE_SINCE || "2026-09-01T00:00:00Z")

export const isExcludedEmail = (email: string) => EXCLUDED_EMAILS.includes(email.toLowerCase())
