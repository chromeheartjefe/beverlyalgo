import "server-only"

import { sql } from "drizzle-orm"
import Stripe from "stripe"

import { rows } from "~/lib/db"
import { excludedRefs, STRIPE_SINCE, USERS } from "~/lib/excluded"
import { PLAN_KIND, type PlanKind } from "~/lib/format"
import { stripe } from "~/lib/stripe"
import { cached } from "~/lib/ttl-cache"

// One Stripe Checkout Session = one opening of a payment page. The site's
// Pro buttons append client_reference_id (the user id) to the Payment Link,
// so sessions without it are old products on the same Stripe account or a
// link opened outside the site, and are left out. Signed-out visitors are
// sent to sign in first, so they only show up once they click again.

type CheckoutPlan = "Monthly" | "Lifetime"
export type CheckoutStatus = "paid" | "processing" | "abandoned" | "open"

export type CheckoutRow = {
  id: string
  userId: string
  plan: CheckoutPlan
  status: CheckoutStatus
  amount: number
  currency: string
  created: Date
}

type FunnelUser = { id: string; email: string; created_at: string; kind: PlanKind }

export type FunnelData =
  | { state: "ok"; sessions: CheckoutRow[]; users: Map<string, FunnelUser> }
  | { state: "no-key" }
  | { state: "no-permission" }

function status(s: Stripe.Checkout.Session): CheckoutStatus {
  if (s.status === "complete") return s.payment_status === "unpaid" ? "processing" : "paid"
  return s.status === "open" ? "open" : "abandoned"
}

/** Checkout sessions from Stripe (cached 2 min) */
export function getFunnelData(): Promise<FunnelData> {
  return cached("stripe-funnel", 2 * 60_000, loadFunnelData)
}

async function loadFunnelData(): Promise<FunnelData> {
  const s = stripe()
  if (!s) return { state: "no-key" }

  const sessions: CheckoutRow[] = []
  try {
    for await (const cs of s.checkout.sessions.list({ limit: 100, created: { gte: Math.floor(STRIPE_SINCE.getTime() / 1000) } })) {
      if (!cs.client_reference_id) continue
      sessions.push({
        id:       cs.id,
        userId:   cs.client_reference_id,
        plan:     cs.mode === "subscription" ? "Monthly" : "Lifetime",
        status:   status(cs),
        amount:   (cs.amount_total ?? 0) / 100,
        currency: cs.currency ?? "usd",
        created:  new Date(cs.created * 1000),
      })
      if (sessions.length >= 5000) break
    }
  } catch (err) {
    if (err instanceof Stripe.errors.StripePermissionError) return { state: "no-permission" }
    throw err
  }

  const { ids: excluded } = await excludedRefs()
  for (let i = sessions.length - 1; i >= 0; i--) if (excluded.has(sessions[i].userId)) sessions.splice(i, 1)

  // client_reference_id comes from a URL anyone could edit, so it's compared
  // as text (a non-uuid value just matches nobody instead of erroring).
  const ids = [...new Set(sessions.map((r) => r.userId))]
  const users = ids.length
    ? await rows<FunnelUser>(sql`
        SELECT u.id, u.email, u.created_at, ${PLAN_KIND()} AS kind
        FROM ${USERS} u
        WHERE u.id::text IN (${sql.join(ids.map((id) => sql`${id}`), sql`, `)})
      `)
    : []

  return { state: "ok", sessions, users: new Map(users.map((u) => [u.id, u])) }
}

/** Ids of accounts created in the last `days` days. */
export async function signupsSince(days: number): Promise<string[]> {
  const list = await rows<{ id: string }>(sql`
    SELECT id FROM ${USERS} AS users WHERE created_at >= now() - make_interval(days => ${days})
  `)
  return list.map((r) => r.id)
}

/** Checkout opens per UTC day, split into paid and not paid, oldest first. */
export function perDay(sessions: CheckoutRow[], days: number): { day: string; paid: number; notPaid: number }[] {
  const out = new Map<string, { paid: number; notPaid: number }>()
  const today = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i))
    out.set(d.toISOString().slice(0, 10), { paid: 0, notPaid: 0 })
  }
  for (const s of sessions) {
    const bucket = out.get(s.created.toISOString().slice(0, 10))
    if (!bucket) continue
    if (s.status === "paid") bucket.paid++
    else bucket.notPaid++
  }
  return [...out].map(([day, v]) => ({ day, ...v }))
}

export function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
