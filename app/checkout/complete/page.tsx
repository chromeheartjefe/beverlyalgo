import { eq } from "drizzle-orm"
import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { CheckoutComplete } from "@/components/checkout/checkout-complete"
import { checkoutPath, type PaidPlan } from "@/config/plans"
import { db } from "@/db"
import { users } from "@/db/schema"
import { fulfillCheckout } from "@/lib/checkout-fulfillment"
import { stripe } from "@/lib/stripe"

export const metadata: Metadata = {
  title: "Payment received",
  robots: { index: false, follow: false },
}

export const dynamic = "force-dynamic"

// Where a customer lands after paying. The session is read back from Stripe
// and has to belong to the signed-in account and be paid, so opening this
// address can't grant anything by itself. When it is paid, access is granted
// right here, with the same code the webhook runs: the customer doesn't wait
// on Stripe's notification, and a late or lost one costs them nothing. The
// webhook still runs for everyone who closes the tab before this page loads.
//
// The page only ever makes the first grant for a session, and only for a
// recent one: a session stays "paid" in Stripe after a refund or a
// cancellation, and coming back to this address later must not undo those.

// A checkout session can be paid for up to a day after it is opened
const FRESH_FOR_SECONDS = 25 * 60 * 60
export default async function CheckoutCompletePage({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
  const { session_id: raw } = await searchParams
  const sessionId = typeof raw === "string" && /^cs_[A-Za-z0-9_]+$/.test(raw) ? raw : null
  if (!sessionId) redirect("/#pricing")

  const session = await auth()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(`/checkout/complete?session_id=${sessionId}`)}`)

  const checkout = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null)
  // Someone else's session, or one that doesn't exist: nothing to show
  if (!checkout || checkout.client_reference_id !== session.user.id) redirect("/dashboard")

  const plan: PaidPlan = checkout.mode === "subscription" ? "monthly" : "lifetime"

  // Not paid: back to the form (a declined or abandoned bank redirect)
  if (checkout.status !== "complete") redirect(checkoutPath(plan))

  // An old purchase: nothing to confirm any more
  if (Date.now() / 1000 - checkout.created > FRESH_FOR_SECONDS) redirect("/dashboard")

  // A payment method that settles later (a bank debit): money is on its way,
  // and the webhook grants access when it arrives
  const pending = checkout.payment_status === "unpaid"

  // If this fails the page still loads and waits for the webhook to do it
  const outcome = pending
    ? null
    : await fulfillCheckout(checkout, { firstGrantOnly: true }).catch((err) => {
        console.error("[/checkout/complete] Couldn't grant access from the confirmation page; the webhook will:", err)
        return null
      })

  // Granted earlier (the webhook got there first, or this page was reloaded):
  // show the account as it is now. If the access has since been taken away
  // again, there is nothing to confirm.
  let granted = outcome === "granted"
  if (outcome === "already" || outcome === "duplicate") {
    const [account] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, session.user.id)).limit(1)
    if (account?.plan !== "pro") redirect("/dashboard")
    granted = true
  }

  return <CheckoutComplete plan={plan} pending={pending} granted={granted} />
}
