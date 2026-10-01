import "server-only"

import type Stripe from "stripe"

import { excludedRefs, STRIPE_SINCE } from "~/lib/excluded"
import { monthlyAmount, periodEnd, stripe } from "~/lib/stripe"
import { cached } from "~/lib/ttl-cache"

export type SubRow = {
  id: string
  customerId: string
  status: Stripe.Subscription.Status
  canceling: boolean
  monthly: number
  currency: string
  periodEnd: Date | null
  created: Date
}

export type ChargeRow = {
  id: string
  customerId: string | null
  amount: number
  refunded: number
  currency: string
  created: Date
  paid: boolean
  disputed: boolean
  description: string | null
}

/** Everything the Revenue page and the Overview MRR tile need from Stripe (cached 2 min). */
export function getStripeData(): Promise<{ subs: SubRow[]; charges: ChargeRow[] } | null> {
  return cached("stripe-data", 2 * 60_000, loadStripeData)
}

async function loadStripeData(): Promise<{ subs: SubRow[]; charges: ChargeRow[] } | null> {
  const s = stripe()
  if (!s) return null

  const subs: SubRow[] = []
  for await (const sub of s.subscriptions.list({ status: "all", limit: 100 })) {
    subs.push({
      id:         sub.id,
      customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
      status:     sub.status,
      canceling:  sub.cancel_at_period_end || !!sub.cancel_at,
      monthly:    monthlyAmount(sub),
      currency:   sub.currency,
      periodEnd:  periodEnd(sub),
      created:    new Date(sub.created * 1000),
    })
    if (subs.length >= 1000) break
  }

  // Last 12 months, but never before this business started on Stripe
  const since = Math.max(Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60, Math.floor(STRIPE_SINCE.getTime() / 1000))
  const charges: ChargeRow[] = []
  for await (const c of s.charges.list({ created: { gte: since }, limit: 100 })) {
    charges.push({
      id:          c.id,
      customerId:  typeof c.customer === "string" ? c.customer : c.customer?.id ?? null,
      amount:      c.amount_captured / 100,
      refunded:    c.amount_refunded / 100,
      currency:    c.currency,
      created:     new Date(c.created * 1000),
      paid:        c.paid && c.status === "succeeded",
      disputed:    c.disputed,
      description: c.description,
    })
    if (charges.length >= 2000) break
  }

  // Leave out excluded accounts (e.g. the owner's own test purchases)
  const { customers } = await excludedRefs()
  return {
    subs: subs.filter((x) => !customers.has(x.customerId) && x.created >= STRIPE_SINCE),
    charges: charges.filter((x) => !x.customerId || !customers.has(x.customerId)),
  }
}

export function mrr(subs: SubRow[]): number {
  return subs.filter((s) => s.status === "active" || s.status === "past_due").reduce((t, s) => t + s.monthly, 0)
}

/** Net revenue per calendar month (UTC), last 12 months from STRIPE_SINCE on, oldest first. */
export function revenueByMonth(charges: ChargeRow[]): { month: string; revenue: number }[] {
  const out = new Map<string, number>()
  const now = new Date()
  const first = STRIPE_SINCE.toISOString().slice(0, 7)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    const key = d.toISOString().slice(0, 7)
    if (key >= first) out.set(key, 0)
  }
  for (const c of charges) {
    if (!c.paid) continue
    const key = c.created.toISOString().slice(0, 7)
    if (out.has(key)) out.set(key, (out.get(key) ?? 0) + c.amount - c.refunded)
  }
  return [...out].map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
}
