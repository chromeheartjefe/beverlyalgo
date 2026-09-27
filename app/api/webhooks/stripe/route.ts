import { and, eq, isNull } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

import { db } from "@/db"
import { processedStripeEvents, users } from "@/db/schema"
import { requireEnv } from "@/lib/env"
import { stripe } from "@/lib/stripe"

// Maps the exact Payment Link URLs used in components/ui/pricing-section-4.tsx
// to our internal plan slug — avoids needing custom metadata set up in the
// Stripe dashboard. The Monthly link is a recurring subscription; the Lifetime
// link is a one-time payment (session.mode === "payment", no subscription) —
// handleCheckoutCompleted branches on that so a one-time purchase still grants
// "pro" instead of being silently dropped by a subscription-only check.
const MONTHLY_LINK  = "https://buy.stripe.com/4gMcMYeZkeoI5Pibz26wE04" // subscription
const LIFETIME_LINK = "https://buy.stripe.com/00w14geZkdkE6Tm1Ys6wE0a" // one-time

const PAYMENT_LINK_URL_TO_PLAN: Record<string, string> = {
  [MONTHLY_LINK]:  "pro",
  [LIFETIME_LINK]: "pro",
}

async function downgradeBySubscriptionId(subscriptionId: string) {
  await db
    .update(users)
    .set({ plan: "free", stripeSubscriptionId: null, stripeCurrentPeriodEnd: null })
    .where(eq(users.stripeSubscriptionId, subscriptionId))
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id
  if (!userId || !session.payment_link || !session.customer) return

  const paymentLink = await stripe.paymentLinks.retrieve(String(session.payment_link))
  const plan = PAYMENT_LINK_URL_TO_PLAN[paymentLink.url]
  if (!plan) return

  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(String(session.subscription))
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end

    await db
      .update(users)
      .set({
        plan,
        stripeCustomerId:       String(session.customer),
        stripeSubscriptionId:   subscription.id,
        stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      })
      .where(eq(users.id, userId))
  } else {
    // One-time purchase (e.g. Lifetime) — no subscription to track or ever expire.
    const [existing] = await db
      .select({ subscriptionId: users.stripeSubscriptionId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    await db
      .update(users)
      .set({
        plan,
        stripeCustomerId:       String(session.customer),
        stripeSubscriptionId:   null,
        stripeCurrentPeriodEnd: null,
      })
      .where(eq(users.id, userId))

    // A monthly subscriber upgrading to Lifetime used to keep being billed
    // monthly. Cancel the old subscription now. This runs AFTER the row above
    // drops its subscription id, so the customer.subscription.deleted event
    // this triggers matches no user and can't downgrade them. Cancelling
    // immediately doesn't refund the current month (Stripe's default).
    if (existing?.subscriptionId) {
      try {
        await stripe.subscriptions.cancel(existing.subscriptionId)
      } catch (err) {
        // Access is already correct; only the billing needs a manual cancel
        console.error("[/api/webhooks/stripe] Couldn't cancel old subscription after Lifetime purchase:", existing.subscriptionId, err)
      }
    }
  }
}

// ─── Refunds & disputes (Lifetime only) ───────────────────────────────────────
// Only a charge that Stripe confirms came from the Lifetime payment link can
// revoke access, and only on an account without a subscription. Monthly
// subscribers are never touched here: their access follows the subscription
// events above (refunding or disputing a subscription ends in
// customer.subscription.deleted if the subscription is cancelled).

async function isLifetimeCharge(charge: Stripe.Charge): Promise<boolean> {
  if (!charge.payment_intent) return false
  const { data } = await stripe.checkout.sessions.list({ payment_intent: String(charge.payment_intent), limit: 1 })
  const checkout = data[0]
  if (!checkout?.payment_link || checkout.mode !== "payment") return false
  const link = await stripe.paymentLinks.retrieve(String(checkout.payment_link))
  return link.url === LIFETIME_LINK
}

async function revokeLifetime(charge: Stripe.Charge, reason: string) {
  if (!charge.customer || !(await isLifetimeCharge(charge))) return
  const revoked = await db
    .update(users)
    .set({ plan: "free" })
    .where(and(
      eq(users.stripeCustomerId, String(charge.customer)),
      isNull(users.stripeSubscriptionId),
      eq(users.plan, "pro"),
    ))
    .returning({ id: users.id })
  if (revoked.length) console.warn(`[/api/webhooks/stripe] Lifetime access revoked (${reason}) for ${revoked.length} account(s)`)
}

async function handleSubscriptionUpdated(eventSubscription: Stripe.Subscription) {
  if (eventSubscription.status === "active" || eventSubscription.status === "trialing") {
    // Re-fetch through our SDK client rather than trusting the webhook payload's
    // shape — webhook events are sent using the Stripe account's configured
    // default API version, which may predate the SDK's pinned version (e.g. the
    // move of `current_period_end` from the subscription to its line items).
    const subscription = await stripe.subscriptions.retrieve(eventSubscription.id)
    const currentPeriodEnd = subscription.items.data[0]?.current_period_end
    await db
      .update(users)
      .set({ stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null })
      .where(eq(users.stripeSubscriptionId, subscription.id))
  } else if (
    eventSubscription.status === "canceled" ||
    eventSubscription.status === "unpaid" ||
    eventSubscription.status === "incomplete_expired"
  ) {
    await downgradeBySubscriptionId(eventSubscription.id)
  }
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature")
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 })

  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, requireEnv("STRIPE_WEBHOOK_SECRET"))
  } catch (err) {
    console.error("[/api/webhooks/stripe] Signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // Idempotency: insert the event id first. A unique-constraint conflict means
  // we've already processed this exact event (Stripe retry, or a replay) —
  // acknowledge it without re-running the handler.
  const [inserted] = await db
    .insert(processedStripeEvents)
    .values({ id: event.id, type: event.type })
    .onConflictDoNothing()
    .returning({ id: processedStripeEvents.id })

  if (!inserted) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Card payments arrive here already "paid". Delayed methods (bank
        // debits etc.) complete checkout while still "unpaid", and used to get
        // Pro before any money arrived, keeping it if the payment then failed.
        // Those are granted on async_payment_succeeded below instead.
        const checkout = event.data.object as Stripe.Checkout.Session
        if (checkout.payment_status === "paid" || checkout.payment_status === "no_payment_required") {
          await handleCheckoutCompleted(checkout)
        }
        break
      }
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        // Full refunds only; a partial goodwill refund keeps access
        if (charge.refunded) await revokeLifetime(charge, "refund")
        break
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute
        const charge = typeof dispute.charge === "string" ? await stripe.charges.retrieve(dispute.charge) : dispute.charge
        await revokeLifetime(charge, "dispute")
        break
      }
      case "customer.subscription.deleted":
        await downgradeBySubscriptionId((event.data.object as Stripe.Subscription).id)
        break
    }
  } catch (err) {
    console.error("[/api/webhooks/stripe]", event.type, err)
    // Un-claim the event so Stripe's automatic retry can actually reprocess it
    // instead of being silently swallowed as a "duplicate" next time.
    await db.delete(processedStripeEvents).where(eq(processedStripeEvents.id, event.id))
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
