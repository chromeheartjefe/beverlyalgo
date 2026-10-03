import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { checkoutConfigured, priceIdFor, purchaseBlock } from "@/lib/checkout"
import { logEventOnce } from "@/lib/events"
import { checkRateLimit } from "@/lib/rate-limit"
import { stripe } from "@/lib/stripe"

// Opens a Stripe Checkout Session for the site's own checkout page
// (ui_mode "elements": Stripe's payment fields inside our layout). The page
// gets only the session's client secret. Paying grants nothing here: access
// is given by the webhook when Stripe reports the session completed, exactly
// as for the Payment Links.

const Body = z.object({ plan: z.enum(["monthly", "lifetime"]) })

// Tags these sessions in the Stripe dashboard, so this checkout can be
// compared with the Payment Links
const INTEGRATION = "entrix_site_checkout_kqzvmtxp"

const BLOCK_MESSAGE = {
  has_lifetime: "This account already has Lifetime access.",
  has_pro:      "This account already has Pro.",
  has_monthly:  "This account already has an active Monthly subscription.",
} as const

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 })
  const userId = session.user.id

  const parsed = Body.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Choose a plan." }, { status: 400 })
  const { plan } = parsed.data

  const priceId = priceIdFor(plan)
  if (!checkoutConfigured() || !priceId) {
    return NextResponse.json({ error: "Checkout is not available right now.", code: "not_configured" }, { status: 503 })
  }

  // Every page load and plan switch opens a session; this only stops a loop
  if (!(await checkRateLimit(`checkout-session:${userId}`, 40, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many attempts. Please try again in a few minutes." }, { status: 429 })
  }

  const [account] = await db
    .select({ email: users.email, plan: users.plan, customerId: users.stripeCustomerId, subscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 })

  try {
    const block = await purchaseBlock(account, plan)
    if (block) return NextResponse.json({ error: BLOCK_MESSAGE[block], code: block }, { status: 409 })

    const mode = plan === "monthly" ? "subscription" : "payment"
    const open = (customerId: string | null) =>
      stripe.checkout.sessions.create({
        ui_mode: "elements",
        mode,
        line_items: [{ price: priceId, quantity: 1 }],
        // How the webhook finds the account, as with the Payment Links
        client_reference_id: userId,
        // One Stripe customer per account: reuse it when there is one. A
        // one-time payment has to be told to create a customer, and the webhook
        // needs one to tie later refunds and disputes to the account.
        ...(customerId
          ? { customer: customerId }
          : { customer_email: account.email, ...(mode === "payment" ? { customer_creation: "always" as const } : {}) }),
        // Only reached by payment methods that leave the page (bank redirects)
        // and as a fallback; card and wallet payments finish in place
        return_url: `${req.nextUrl.origin}/checkout/complete?session_id={CHECKOUT_SESSION_ID}`,
        metadata: { plan, source: "site_checkout" },
        integration_identifier: INTEGRATION,
      })

    // The customer on file can be gone from Stripe (deleted in the dashboard,
    // or left over from another Stripe mode). That must not lock the account
    // out of paying: start with a fresh customer, and the purchase puts the
    // new one on the account.
    const checkout = await open(account.customerId).catch((err) => {
      const stripeError = err as { code?: string; param?: string }
      if (account.customerId && stripeError?.code === "resource_missing" && stripeError?.param === "customer") {
        console.warn("[/api/checkout/session] Stored Stripe customer no longer exists; opening checkout with a new one")
        return open(null)
      }
      throw err
    })
    if (!checkout.client_secret) throw new Error("Stripe returned no client secret")

    // Once a day per account: every reload and plan switch opens a session,
    // and the funnel should count people, not sessions
    await logEventOnce(userId, "checkout_opened", 24 * 60 * 60 * 1000, { plan })
    return NextResponse.json({ clientSecret: checkout.client_secret }, { headers: { "Cache-Control": "no-store" } })
  } catch (err) {
    console.error("[/api/checkout/session]", err)
    return NextResponse.json({ error: "Checkout is temporarily unavailable. Please try again in a moment." }, { status: 502 })
  }
}
