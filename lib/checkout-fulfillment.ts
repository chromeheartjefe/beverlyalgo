import { eq } from "drizzle-orm"
import type Stripe from "stripe"

import { PAID_PLANS } from "@/config/plans"
import { db } from "@/db"
import { processedStripeEvents, users } from "@/db/schema"
import { type BillingAccount, hasLifetime, isHealthySubscription, planOfSiteCheckout, subscriptionOnFile } from "@/lib/checkout"
import { sendBillingAlert } from "@/lib/email"
import { stripe } from "@/lib/stripe"

// Turning a paid Checkout Session into Pro on the account. Two callers:
//   - the Stripe webhook (app/api/webhooks/stripe), which always runs, even
//     when the customer closes the tab the moment they have paid;
//   - the confirmation page (app/checkout/complete), which runs it as soon as
//     the customer lands there, so nobody waits on a slow or missing webhook.
// Whichever gets there first does the work and the other finds it done: the
// account ends up the same either way, and the one part that must not happen
// twice (cancelling and reporting a duplicate purchase) is claimed first.
//
// The confirmation page may only make the FIRST grant for a session
// (firstGrantOnly). A session stays "paid" in Stripe for ever, including after
// a refund, a dispute or a cancellation has taken the access away again, so
// without that rule reopening an old confirmation address would hand Pro
// back. Every grant leaves a marker; once it exists the page changes nothing.
// The webhook is not bound by it: it acts on events Stripe sends, not on an
// address someone can revisit.
//
// A purchase comes from one of two places, and both grant the same thing:
//   - a Payment Link (config/plans.ts), recognised by its exact URL, which
//     avoids needing custom metadata set up in the Stripe dashboard;
//   - the site's own checkout page (/checkout), recognised by the Stripe Price
//     on the session (lib/checkout.ts).
// Monthly is a recurring subscription; Lifetime is a one-time payment
// (session.mode === "payment", no subscription), and the code below branches
// on that so a one-time purchase still grants "pro" instead of being silently
// dropped by a subscription-only check.
const PAYMENT_LINK_URL_TO_PLAN: Record<string, string> = {
  [PAID_PLANS.monthly.paymentLink]:  "pro",
  [PAID_PLANS.lifetime.paymentLink]: "pro",
}

const customerUrl = (customerId: string) => `https://dashboard.stripe.com/customers/${customerId}`

const money = (session: Stripe.Checkout.Session) =>
  session.amount_total == null ? "unknown" : `${(session.amount_total / 100).toFixed(2)} ${(session.currency ?? "usd").toUpperCase()}`

// ─── Buying twice ──────────────────────────────────────────────────────────────
// The pricing section and the checkout page keep Pro accounts away from what
// they already have, but a payment link can still be opened from an old tab or
// a saved address. A purchase that duplicates what the account already has is
// never applied: the account keeps exactly what it had, a new subscription is
// cancelled on the spot so it can't bill again, and support gets an email to
// refund the payment. Nothing is refunded automatically.

type Account = BillingAccount & { email: string }

const duplicateMarker = (sessionId: string) => `duplicate:${sessionId}`

/**
 * Whether this checkout session was set aside as a duplicate purchase. Its
 * payment bought nothing, so refunding it must not take away the access the
 * account already had (the webhook asks before revoking Lifetime).
 */
export async function wasDuplicate(sessionId: string): Promise<boolean> {
  const [row] = await db
    .select({ id: processedStripeEvents.id })
    .from(processedStripeEvents)
    .where(eq(processedStripeEvents.id, duplicateMarker(sessionId)))
    .limit(1)
  return !!row
}

/** True for the first caller only, so a duplicate is cancelled and reported once */
async function firstToHandleDuplicate(session: Stripe.Checkout.Session): Promise<boolean> {
  const [claimed] = await db
    .insert(processedStripeEvents)
    .values({ id: duplicateMarker(session.id), type: "checkout.duplicate" })
    .onConflictDoNothing()
    .returning({ id: processedStripeEvents.id })
  return !!claimed
}

async function reportDuplicate(account: Account, session: Stripe.Checkout.Session, had: string, bought: string, done: string) {
  console.warn(`[checkout] Duplicate purchase (${bought}) on an account with ${had}; not applied`)
  await sendBillingAlert({
    subject: `Duplicate purchase to refund: ${account.email}`,
    title:   "Duplicate purchase, refund needed",
    summary: `This account paid for ${bought} while it already had ${had}. The account was left as it was. ${done}`,
    rows: [
      ["Account", account.email],
      ["Already had", had],
      ["Paid for", bought],
      ["Amount", money(session)],
    ],
    action: "Refund this payment in Stripe. It was not refunded automatically.",
    url:    customerUrl(String(session.customer)),
  })
}

export type Fulfilment =
  | "granted"    // the account has what was bought
  | "duplicate"  // paid for something the account already had; left as it was, support told
  | "already"    // firstGrantOnly: this session was granted before, nothing was changed
  | "not_ours"   // no account on it, or a product this site doesn't sell

const grantMarker = (session: Stripe.Checkout.Session) => `fulfilled:${session.id}`

async function wasGranted(session: Stripe.Checkout.Session): Promise<boolean> {
  const [row] = await db
    .select({ id: processedStripeEvents.id })
    .from(processedStripeEvents)
    .where(eq(processedStripeEvents.id, grantMarker(session)))
    .limit(1)
  return !!row
}

async function markGranted(session: Stripe.Checkout.Session): Promise<void> {
  await db.insert(processedStripeEvents).values({ id: grantMarker(session), type: "checkout.fulfilled" }).onConflictDoNothing()
}

/**
 * Safe to call more than once for the same session, and from two places at
 * once. Callers must only pass a session Stripe reports as paid
 * (payment_status "paid" or "no_payment_required").
 */
export async function fulfillCheckout(session: Stripe.Checkout.Session, { firstGrantOnly = false } = {}): Promise<Fulfilment> {
  const userId = session.client_reference_id
  if (!userId || !session.customer) return "not_ours"

  // Ours only: this Stripe account sells other things too
  let plan: string | undefined
  if (session.payment_link) {
    const paymentLink = await stripe.paymentLinks.retrieve(String(session.payment_link))
    plan = PAYMENT_LINK_URL_TO_PLAN[paymentLink.url]
  } else if (await planOfSiteCheckout(session)) {
    plan = "pro"
  }
  if (!plan) return "not_ours"

  if (firstGrantOnly && (await wasGranted(session))) return "already"

  const customerId = String(session.customer)
  const [existing] = await db
    .select({ email: users.email, plan: users.plan, customerId: users.stripeCustomerId, subscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (session.mode === "subscription" && session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(String(session.subscription))

    // Already Pro, and this is a different subscription from the one on file
    if (existing?.plan === "pro" && existing.subscriptionId !== subscription.id) {
      let duplicateOf: string | null = null
      if (hasLifetime(existing)) {
        duplicateOf = "Lifetime access"
      } else if (existing.subscriptionId) {
        // A healthy subscription makes the new one a duplicate. One that is
        // ending, cancelled or failing to renew doesn't: then the new purchase
        // is the customer coming back, and it replaces the old one below.
        // A Stripe error here fails the run so it is retried, rather than
        // guessing and billing twice (see subscriptionOnFile).
        const current = await subscriptionOnFile(existing.subscriptionId)
        if (isHealthySubscription(current)) {
          duplicateOf = "an active Monthly subscription"
        } else if (current && (current.status === "past_due" || current.status === "unpaid" || current.status === "incomplete")) {
          // Stop the failing one from retrying the old card. This runs before
          // the row below takes the new subscription id; if its deleted event
          // arrives first, the row is fixed by the update right after.
          await stripe.subscriptions.cancel(current.id).catch((err) =>
            console.error("[checkout] Couldn't cancel the replaced subscription:", current.id, err))
        }
      }

      if (duplicateOf) {
        if (!(await firstToHandleDuplicate(session))) return "duplicate"
        let done = "The new subscription was cancelled, so it will not bill again."
        try {
          await stripe.subscriptions.cancel(subscription.id)
        } catch (err) {
          console.error("[checkout] Couldn't cancel a duplicate subscription:", subscription.id, err)
          done = "The new subscription could NOT be cancelled automatically: cancel it in Stripe as well."
        }
        await reportDuplicate(existing, session, duplicateOf, "a Monthly subscription", done)
        return "duplicate"
      }
    }

    const currentPeriodEnd = subscription.items.data[0]?.current_period_end

    await db
      .update(users)
      .set({
        plan,
        stripeCustomerId:       customerId,
        stripeSubscriptionId:   subscription.id,
        stripeCurrentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
      })
      .where(eq(users.id, userId))
    await markGranted(session)
    return "granted"
  }

  // One-time purchase (e.g. Lifetime) — no subscription to track or ever expire.

  // A second Lifetime: the account has Lifetime and this session is not one
  // that was granted before. Told apart by the session's own marker, not by
  // the Stripe customer: the site checkout reuses the customer on file, so two
  // payments from two open tabs carry the same one. (A granted session
  // arriving again, the webhook next to the confirmation page, falls through.)
  if (existing && hasLifetime(existing) && !(await wasGranted(session))) {
    if (!(await firstToHandleDuplicate(session))) return "duplicate"
    await reportDuplicate(existing, session, "Lifetime access", "Lifetime access again", "There is no subscription to cancel.")
    return "duplicate"
  }

  // Marked before the account row changes: a second run of this same session
  // that reads the row a moment later then finds the marker, and does not take
  // the half-finished grant for a second purchase. If the update below fails,
  // the webhook's retry still grants (it is not bound by the marker).
  await markGranted(session)

  await db
    .update(users)
    .set({
      plan,
      stripeCustomerId:       customerId,
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
      // Access is already correct; only the billing needs a manual cancel.
      // (Also lands here when a second run finds it cancelled already.)
      console.error("[checkout] Couldn't cancel old subscription after Lifetime purchase:", existing.subscriptionId, err)
    }
  }
  return "granted"
}
