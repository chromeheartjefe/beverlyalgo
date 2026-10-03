import type Stripe from "stripe"

import { type PaidPlan } from "@/config/plans"
import { stripe } from "@/lib/stripe"

// Server side of the site's own checkout page. A plan is a Stripe Price,
// named by env var so the test sandbox and the live account can each point at
// their own prices:
//   STRIPE_PRICE_MONTHLY   recurring monthly price of Pro
//   STRIPE_PRICE_LIFETIME  one-time price of Pro Lifetime
// plus NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for the browser. Until all three
// are set the checkout page hands over to the old Payment Links.

const PRICE_ENV: Record<PaidPlan, string> = {
  monthly:  "STRIPE_PRICE_MONTHLY",
  lifetime: "STRIPE_PRICE_LIFETIME",
}

export const priceIdFor = (plan: PaidPlan): string | null => process.env[PRICE_ENV[plan]] || null

export const checkoutConfigured = (): boolean =>
  !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && !!priceIdFor("monthly") && !!priceIdFor("lifetime")

/**
 * Which plan a Checkout Session created by our own page was for, read from
 * the Price on its line item. Null for anything else: this Stripe account
 * also sells other products, and a session of theirs must never grant Pro.
 */
export async function planOfSiteCheckout(session: Stripe.Checkout.Session): Promise<PaidPlan | null> {
  const monthly = priceIdFor("monthly")
  const lifetime = priceIdFor("lifetime")
  if (!monthly && !lifetime) return null
  const items = await stripe.checkout.sessions.listLineItems(session.id, { limit: 10 })
  for (const item of items.data) {
    const priceId = item.price?.id
    if (!priceId) continue
    if (priceId === monthly && session.mode === "subscription") return "monthly"
    if (priceId === lifetime && session.mode === "payment") return "lifetime"
  }
  return null
}

// ─── What an account already has ──────────────────────────────────────────────
// One copy of these rules, used by the checkout page (who may open a checkout)
// and by lib/checkout-fulfillment.ts (what counts as buying twice). Two copies
// would drift: the page would let someone pay for what the other then refuses.

/** What the billing rules read from an account row */
export type BillingAccount = { plan: string; customerId: string | null; subscriptionId: string | null }

/** Pro without a subscription, bought through Stripe: a Lifetime account */
export const hasLifetime = (account: BillingAccount): boolean =>
  account.plan === "pro" && !account.subscriptionId && !!account.customerId

/**
 * The subscription on file, as Stripe has it now. Only "no such subscription"
 * counts as gone (null). Any other Stripe error is thrown, so nobody is billed
 * twice, or turned away, on a guess.
 */
export async function subscriptionOnFile(subscriptionId: string): Promise<Stripe.Subscription | null> {
  return stripe.subscriptions.retrieve(subscriptionId).catch((err) => {
    if ((err as { code?: string })?.code === "resource_missing") return null
    throw err
  })
}

/**
 * Running and set to keep renewing. One that is ending, cancelled or failing
 * to renew is not: buying again is then the customer coming back.
 */
export const isHealthySubscription = (subscription: Stripe.Subscription | null): boolean =>
  !!subscription &&
  (subscription.status === "active" || subscription.status === "trialing") &&
  !subscription.cancel_at_period_end &&
  !subscription.cancel_at

export type PurchaseBlock = "has_lifetime" | "has_pro" | "has_monthly"

/**
 * Why this account must not be sent to pay for this plan, or null when it
 * can. The same rules as the pricing section and the webhook's duplicate
 * guard: nobody pays twice for what they have. The one purchase open to a
 * Pro account is Monthly -> Lifetime (the webhook then ends the subscription),
 * and a subscriber whose subscription is ending or failing can subscribe again.
 */
export async function purchaseBlock(account: BillingAccount, plan: PaidPlan): Promise<PurchaseBlock | null> {
  if (account.plan !== "pro") return null
  if (!account.subscriptionId) return hasLifetime(account) ? "has_lifetime" : "has_pro"
  if (plan === "lifetime") return null
  return isHealthySubscription(await subscriptionOnFile(account.subscriptionId)) ? "has_monthly" : null
}
