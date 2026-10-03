import { and, eq, isNull } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import type Stripe from "stripe"

import { PAID_PLANS } from "@/config/plans"
import { db } from "@/db"
import { processedStripeEvents, users } from "@/db/schema"
import { planOfSiteCheckout } from "@/lib/checkout"
import { fulfillCheckout, wasDuplicate } from "@/lib/checkout-fulfillment"
import { sendBillingAlert } from "@/lib/email"
import { requireEnv } from "@/lib/env"
import { logEventOnce } from "@/lib/events"
import { stripe } from "@/lib/stripe"

// Events this endpoint needs switched on in the Stripe dashboard (Developers >
// Webhooks > the entrixalgo.com endpoint). An event that isn't selected there
// never arrives, and the code for it below simply never runs.
//   checkout.session.completed, checkout.session.async_payment_succeeded,
//   checkout.session.expired,
//   customer.subscription.updated, customer.subscription.deleted,
//   charge.refunded, charge.dispute.created, charge.dispute.closed,
//   radar.early_fraud_warning.created

// Granting Pro for a paid checkout lives in lib/checkout-fulfillment.ts, shared
// with the checkout confirmation page. What stays here: everything that
// happens to a purchase afterwards (renewals, cancellations, refunds, disputes).
const LIFETIME_LINK = PAID_PLANS.lifetime.paymentLink // one-time
const DAY_MS = 24 * 60 * 60 * 1000

async function downgradeBySubscriptionId(subscriptionId: string) {
  await db
    .update(users)
    .set({ plan: "free", stripeSubscriptionId: null, stripeCurrentPeriodEnd: null })
    .where(eq(users.stripeSubscriptionId, subscriptionId))
}

// ─── Refunds, disputes and fraud warnings ─────────────────────────────────────
// Refunds: only a full refund of the Lifetime payment changes access. Monthly
// subscribers are never touched by a refund; their access follows the
// subscription (refund and cancel it in Stripe to end it).
//
// Disputes: the customer's bank has taken the money back. Lifetime access is
// revoked. A Monthly subscription is cancelled on the spot, so the card is not
// charged again (each further charge would be another dispute), and the
// account goes back to Free. A won dispute gives Lifetime back; a won Monthly
// dispute only alerts support, because a cancelled subscription can't be
// revived. Bank inquiries (the "warning" statuses) change nothing yet.
//
// Early fraud warnings: the card network flagged a payment before any dispute.
// A Monthly subscription is set not to renew, access stays, and support is
// told to refund, which normally heads off the dispute. Nothing is refunded
// automatically.
//
// This Stripe account also takes payments for other products. Every handler
// here acts only on a payment it can tie to an account in our own database.

/** The checkout session of a Lifetime payment, or null for any other charge */
async function lifetimeCheckoutOf(charge: Stripe.Charge): Promise<Stripe.Checkout.Session | null> {
  if (!charge.payment_intent) return null
  const { data } = await stripe.checkout.sessions.list({ payment_intent: String(charge.payment_intent), limit: 1 })
  const checkout = data[0]
  if (!checkout || checkout.mode !== "payment") return null
  // Bought on the site's own checkout page: told apart by its Price
  if (!checkout.payment_link) return (await planOfSiteCheckout(checkout)) === "lifetime" ? checkout : null
  const link = await stripe.paymentLinks.retrieve(String(checkout.payment_link))
  return link.url === LIFETIME_LINK ? checkout : null
}

async function revokeLifetime(charge: Stripe.Charge, reason: string) {
  if (!charge.customer) return []
  const checkout = await lifetimeCheckoutOf(charge)
  if (!checkout) return []
  // A second Lifetime payment that was set aside as a duplicate bought nothing.
  // Refunding it (which support is asked to do) must not take away the access
  // the first payment bought, even when both sit on the same Stripe customer.
  if (await wasDuplicate(checkout.id)) return []
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
  return revoked
}

const idOf = (value: string | { id: string } | null | undefined) => (!value ? null : typeof value === "string" ? value : value.id)

// The subscription a payment belongs to, the way Stripe documents it for API
// versions from 2025-03-31: payment intent -> invoice payments -> invoice ->
// its parent subscription. Null for one-time payments.
async function subscriptionOfPayment(paymentIntentId: string): Promise<string | null> {
  for await (const payment of stripe.invoicePayments.list({
    payment: { type: "payment_intent", payment_intent: paymentIntentId },
    status:  "paid",
    limit:   100,
  })) {
    const invoiceId = idOf(payment.invoice)
    if (!invoiceId) continue
    const invoice = await stripe.invoices.retrieve(invoiceId)
    if (invoice.parent?.type !== "subscription_details") continue
    const subscriptionId = idOf(invoice.parent.subscription_details?.subscription)
    if (subscriptionId) return subscriptionId
  }
  return null
}

type Owner = {
  kind:    "monthly" | "lifetime"
  account: { id: string; email: string; subscriptionId: string | null }
  /** Monthly: the subscription the payment was for */
  subscriptionId: string | null
}

// Whose payment this is. Monthly: the account holding the subscription, or,
// once that has been cancelled, the account still holding its Stripe customer.
// Lifetime: the account holding the customer of a Lifetime payment-link charge.
async function ownerOfCharge(charge: Stripe.Charge, paymentIntentId: string | null): Promise<Owner | null> {
  const account = { id: users.id, email: users.email, subscriptionId: users.stripeSubscriptionId }
  const customerId = idOf(charge.customer)

  const subscriptionId = paymentIntentId ? await subscriptionOfPayment(paymentIntentId) : null
  if (subscriptionId) {
    const [holder] = await db.select(account).from(users).where(eq(users.stripeSubscriptionId, subscriptionId)).limit(1)
    if (holder) return { kind: "monthly", account: holder, subscriptionId }
    if (!customerId) return null
    const [former] = await db.select(account).from(users).where(eq(users.stripeCustomerId, customerId)).limit(1)
    return former ? { kind: "monthly", account: former, subscriptionId } : null
  }

  if (!customerId || !(await lifetimeCheckoutOf(charge))) return null
  const [holder] = await db.select(account).from(users).where(eq(users.stripeCustomerId, customerId)).limit(1)
  return holder ? { kind: "lifetime", account: holder, subscriptionId: null } : null
}

const paymentUrl = (charge: Stripe.Charge, paymentIntentId: string | null) =>
  `https://dashboard.stripe.com/payments/${paymentIntentId ?? charge.id}`

const amountOf = (amount: number, currency: string) => `${(amount / 100).toFixed(2)} ${currency.toUpperCase()}`

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const charge = typeof dispute.charge === "string" ? await stripe.charges.retrieve(dispute.charge) : dispute.charge
  const paymentIntentId = idOf(dispute.payment_intent) ?? idOf(charge.payment_intent)
  const owner = await ownerOfCharge(charge, paymentIntentId)
  if (!owner) return

  const rows: [string, string][] = [
    ["Account", owner.account.email],
    ["Plan", owner.kind === "monthly" ? "Monthly" : "Lifetime"],
    ["Amount", amountOf(dispute.amount, dispute.currency)],
    ["Reason given", dispute.reason],
  ]
  const url = paymentUrl(charge, paymentIntentId)

  // An inquiry is the bank asking a question; no money has moved yet
  if (dispute.status.startsWith("warning_")) {
    await sendBillingAlert({
      subject: `Bank inquiry on a payment: ${owner.account.email}`,
      title:   "Bank inquiry on a payment",
      summary: "The customer's bank opened an inquiry. It is not a dispute yet, and nothing was changed on the account.",
      rows,
      action:  "Answer it in Stripe, or refund the payment to close it before it becomes a dispute.",
      url,
    })
    return
  }

  if (owner.kind === "monthly" && owner.subscriptionId) {
    let done = "The subscription was cancelled so the card is not charged again, and the account is back on Free."
    try {
      await stripe.subscriptions.cancel(owner.subscriptionId)
    } catch (err) {
      // Usually already cancelled. The row below is cleared either way.
      const current = await stripe.subscriptions.retrieve(owner.subscriptionId).catch(() => null)
      if (current?.status !== "canceled") {
        console.error("[/api/webhooks/stripe] Couldn't cancel a disputed subscription:", owner.subscriptionId, err)
        done = "The subscription could NOT be cancelled automatically: cancel it in Stripe. The account is back on Free."
      }
    }
    await downgradeBySubscriptionId(owner.subscriptionId)
    await sendBillingAlert({
      subject: `Payment disputed: ${owner.account.email}`,
      title:   "A Monthly payment was disputed",
      summary: `The customer's bank reversed this payment. ${done}`,
      rows,
      action:  "Decide in Stripe whether to submit evidence. If the dispute is won you will get another email.",
      url,
    })
    return
  }

  const revoked = await revokeLifetime(charge, "dispute")
  if (!revoked.length) return
  await sendBillingAlert({
    subject: `Payment disputed: ${owner.account.email}`,
    title:   "A Lifetime payment was disputed",
    summary: "The customer's bank reversed this payment. Lifetime access was removed and the account is back on Free.",
    rows,
    action:  "Decide in Stripe whether to submit evidence. If the dispute is won, access is given back automatically.",
    url,
  })
}

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  if (dispute.status !== "won") return
  const charge = typeof dispute.charge === "string" ? await stripe.charges.retrieve(dispute.charge) : dispute.charge
  const paymentIntentId = idOf(dispute.payment_intent) ?? idOf(charge.payment_intent)
  const owner = await ownerOfCharge(charge, paymentIntentId)
  if (!owner) return

  const rows: [string, string][] = [
    ["Account", owner.account.email],
    ["Plan", owner.kind === "monthly" ? "Monthly" : "Lifetime"],
    ["Amount", amountOf(dispute.amount, dispute.currency)],
  ]
  const url = paymentUrl(charge, paymentIntentId)

  if (owner.kind === "lifetime") {
    // Only an account the dispute took back to Free; never one that has since
    // bought something else (that would carry a different Stripe customer).
    const restored = await db
      .update(users)
      .set({ plan: "pro" })
      .where(and(eq(users.id, owner.account.id), isNull(users.stripeSubscriptionId), eq(users.plan, "free")))
      .returning({ id: users.id })
    if (!restored.length) return
    console.warn("[/api/webhooks/stripe] Lifetime access restored after a won dispute")
    await sendBillingAlert({
      subject: `Dispute won: ${owner.account.email}`,
      title:   "Dispute won, Lifetime access restored",
      summary: "The dispute on this Lifetime payment was decided in your favour. The account has Lifetime access again.",
      rows,
      action:  "Nothing to do. You may want to let the customer know.",
      url,
    })
    return
  }

  await sendBillingAlert({
    subject: `Dispute won: ${owner.account.email}`,
    title:   "Dispute won on a Monthly payment",
    summary: "The dispute was decided in your favour. The subscription was cancelled when the dispute opened and cannot be revived, so the account is still on Free.",
    rows,
    action:  "If the customer should keep Pro, ask them to subscribe again from the pricing section.",
    url,
  })
}

async function handleFraudWarning(warning: Stripe.Radar.EarlyFraudWarning) {
  // Not actionable = already refunded or already disputed
  if (!warning.actionable) return
  const charge = typeof warning.charge === "string" ? await stripe.charges.retrieve(warning.charge) : warning.charge
  const paymentIntentId = idOf(warning.payment_intent) ?? idOf(charge.payment_intent)
  const owner = await ownerOfCharge(charge, paymentIntentId)
  if (!owner) return

  let done = "Nothing was changed on the account."
  // Only the subscription the account is on now; an old one is already over
  if (owner.kind === "monthly" && owner.subscriptionId && owner.account.subscriptionId === owner.subscriptionId) {
    try {
      await stripe.subscriptions.update(owner.subscriptionId, { cancel_at_period_end: true })
      done = "The subscription was set not to renew, so the card is not charged again. Access continues until the end of the paid period."
    } catch (err) {
      console.error("[/api/webhooks/stripe] Couldn't stop renewal after a fraud warning:", owner.subscriptionId, err)
      done = "The subscription could NOT be set to stop renewing automatically: do that in Stripe."
    }
  }

  await sendBillingAlert({
    subject: `Fraud warning on a payment: ${owner.account.email}`,
    title:   "Early fraud warning",
    summary: `The card network flagged this payment as possibly fraudulent (${warning.fraud_type}). A dispute usually follows unless the payment is refunded. ${done}`,
    rows: [
      ["Account", owner.account.email],
      ["Plan", owner.kind === "monthly" ? "Monthly" : "Lifetime"],
      ["Amount", amountOf(charge.amount, charge.currency)],
    ],
    action: "Refund this payment in Stripe now to avoid a dispute and its fee. It was not refunded automatically.",
    url:    paymentUrl(charge, paymentIntentId),
  })
}

// ─── Abandoned checkouts ──────────────────────────────────────────────────────
// A payment page that was opened and never paid expires after about a day.
// The site's buttons put the account id on it, so each one lands on that
// account's timeline. Paid checkouts never expire, so they are not counted
// here. The site's own checkout page opens one session per plan looked at, so
// someone who compared both and then paid leaves an unpaid one behind: an
// account that is Pro by the time a session expires did not abandon anything.
// It also opens a new session on every reload, so several can expire for one
// visit: an account is counted once a day, to keep this a count of people.
async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const userId = session.client_reference_id
  if (!userId) return
  const [account] = await db.select({ id: users.id, plan: users.plan }).from(users).where(eq(users.id, userId)).limit(1)
  if (!account || account.plan === "pro") return
  await logEventOnce(account.id, "checkout_abandoned", DAY_MS, {
    plan:     session.mode === "subscription" ? "monthly" : "lifetime",
    openedAt: new Date(session.created * 1000).toISOString(),
  })
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
          await fulfillCheckout(checkout)
        }
        break
      }
      case "checkout.session.async_payment_succeeded":
        await fulfillCheckout(event.data.object as Stripe.Checkout.Session)
        break
      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session)
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
      case "charge.dispute.created":
        await handleDisputeCreated(event.data.object as Stripe.Dispute)
        break
      case "charge.dispute.closed":
        await handleDisputeClosed(event.data.object as Stripe.Dispute)
        break
      case "radar.early_fraud_warning.created":
        await handleFraudWarning(event.data.object as Stripe.Radar.EarlyFraudWarning)
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
