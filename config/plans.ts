// The two paid plans, in one place: what the pricing section and the checkout
// page show, and the Stripe Payment Link each plan was sold through before the
// site had its own checkout. The links stay as the fallback (see
// app/checkout/page.tsx) and the webhook still recognises purchases made
// through them.
//
// Display prices only. What a customer is charged comes from the Stripe Price
// behind STRIPE_PRICE_MONTHLY / STRIPE_PRICE_LIFETIME (lib/checkout.ts), and
// the checkout page shows the total Stripe reports for the session.

export type PaidPlan = "monthly" | "lifetime"

export const PAID_PLANS: Record<PaidPlan, {
  name: string
  price: number
  /** After the price: "/month" or "one-time" */
  cadence: string
  blurb: string
  paymentLink: string
}> = {
  monthly: {
    name: "Pro Monthly",
    price: 49,
    cadence: "/month",
    blurb: "Billed monthly. Cancel anytime.",
    paymentLink: "https://buy.stripe.com/4gMcMYeZkeoI5Pibz26wE04",
  },
  lifetime: {
    name: "Pro Lifetime",
    price: 299,
    cadence: "one-time",
    blurb: "Pay once. Yours forever, no renewals.",
    paymentLink: "https://buy.stripe.com/00w14geZkdkE6Tm1Ys6wE0a",
  },
}

export const isPaidPlan = (value: unknown): value is PaidPlan => value === "monthly" || value === "lifetime"

/** The site's own checkout page for a plan */
export const checkoutPath = (plan: PaidPlan) => `/checkout?plan=${plan}`

// The browser half of the switch: with no publishable key the plan buttons
// keep going to the Payment Links, exactly as before.
export const SITE_CHECKOUT_ENABLED = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
