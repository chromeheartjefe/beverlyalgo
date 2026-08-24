import { eq } from "drizzle-orm"
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
const PAYMENT_LINK_URL_TO_PLAN: Record<string, string> = {
  "https://buy.stripe.com/4gMcMYeZkeoI5Pibz26wE04": "pro", // Monthly (subscription)
  "https://buy.stripe.com/00w14geZkdkE6Tm1Ys6wE0a": "pro", // Lifetime (one-time)
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
    await db
      .update(users)
      .set({
        plan,
        stripeCustomerId:       String(session.customer),
        stripeSubscriptionId:   null,
        stripeCurrentPeriodEnd: null,
      })
      .where(eq(users.id, userId))
  }
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
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
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
