import "server-only"

import Stripe from "stripe"

// A Stripe *restricted* key with read-only permissions (see README), never
// the site's secret key. Null when not configured: pages then show a setup
// hint instead of Stripe data.
let client: Stripe | null | undefined

export function stripe(): Stripe | null {
  if (client !== undefined) return client
  const key = process.env.STRIPE_ADMIN_KEY
  client = key ? new Stripe(key) : null
  return client
}

/** Monthly amount of one subscription, in the currency's major unit. */
export function monthlyAmount(sub: Stripe.Subscription): number {
  return sub.items.data.reduce((total, item) => {
    const unit = (item.price.unit_amount ?? 0) / 100
    const qty = item.quantity ?? 1
    const interval = item.price.recurring?.interval
    const count = item.price.recurring?.interval_count ?? 1
    const perMonth =
      interval === "year" ? unit / (12 * count)
      : interval === "week" ? (unit * 52) / (12 * count)
      : interval === "day" ? (unit * 365) / (12 * count)
      : unit / count
    return total + perMonth * qty
  }, 0)
}

export function periodEnd(sub: Stripe.Subscription): Date | null {
  const end = sub.cancel_at ?? sub.items.data[0]?.current_period_end
  return end ? new Date(end * 1000) : null
}
