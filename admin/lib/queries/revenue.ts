import "server-only"

import type Stripe from "stripe"

import { monthlyAmount, periodEnd, stripe } from "~/lib/stripe"

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

/** Everything the Revenue page and the Overview MRR tile need from Stripe. */
export async function getStripeData(): Promise<{ subs: SubRow[]; charges: ChargeRow[] } | null> {
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

  const since = Math.floor(Date.now() / 1000) - 365 * 24 * 60 * 60
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

  return { subs, charges }
}

export function mrr(subs: SubRow[]): number {
  return subs.filter((s) => s.status === "active" || s.status === "past_due").reduce((t, s) => t + s.monthly, 0)
}

/** Net revenue per calendar month (UTC), last 12 months, oldest first. */
export function revenueByMonth(charges: ChargeRow[]): { month: string; revenue: number }[] {
  const out = new Map<string, number>()
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1))
    out.set(d.toISOString().slice(0, 7), 0)
  }
  for (const c of charges) {
    if (!c.paid) continue
    const key = c.created.toISOString().slice(0, 7)
    if (out.has(key)) out.set(key, (out.get(key) ?? 0) + c.amount - c.refunded)
  }
  return [...out].map(([month, revenue]) => ({ month, revenue: Math.round(revenue * 100) / 100 }))
}
