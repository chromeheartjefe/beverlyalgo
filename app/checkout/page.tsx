import { eq } from "drizzle-orm"
import { CheckCircle2 } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { Checkout } from "@/components/checkout/checkout"
import { checkoutPath, isPaidPlan, PAID_PLANS, type PaidPlan } from "@/config/plans"
import { db } from "@/db"
import { users } from "@/db/schema"
import { checkoutConfigured, type PurchaseBlock, purchaseBlock } from "@/lib/checkout"

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
}

// Per account, never cached
export const dynamic = "force-dynamic"

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string | string[] }> }) {
  const { plan: rawPlan } = await searchParams
  const plan: PaidPlan = isPaidPlan(rawPlan) ? rawPlan : "monthly"

  const session = await auth()
  if (!session?.user?.id) redirect(`/sign-in?callbackUrl=${encodeURIComponent(checkoutPath(plan))}`)

  const [account] = await db
    .select({ email: users.email, plan: users.plan, customerId: users.stripeCustomerId, subscriptionId: users.stripeSubscriptionId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
  if (!account) redirect(`/sign-in?callbackUrl=${encodeURIComponent(checkoutPath(plan))}`)

  // Not set up on this deployment (no publishable key or price ids): the
  // Payment Link for the plan still works, with the account attached the same
  // way the pricing buttons always did.
  if (!checkoutConfigured()) {
    const params = new URLSearchParams({ client_reference_id: session.user.id, prefilled_email: account.email })
    redirect(`${PAID_PLANS[plan].paymentLink}?${params.toString()}`)
  }

  // What this account can still buy. The session route checks again before
  // any payment page opens; a Stripe hiccup here must not block the page.
  const blockFor = (p: PaidPlan): Promise<PurchaseBlock | null> => purchaseBlock(account, p).catch(() => null)
  const [monthly, lifetime] = await Promise.all([blockFor("monthly"), blockFor("lifetime")])
  const blocked = { monthly, lifetime }

  if (monthly && lifetime) {
    return (
      <main id="main-content" className="flex min-h-dvh items-center justify-center bg-[#09090f] px-4 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0d0d1c] p-7 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-emerald-400/25 bg-emerald-500/10">
            <CheckCircle2 className="size-6 text-emerald-300" aria-hidden />
          </div>
          <h1 className="mt-4 text-lg font-semibold">You already have Pro</h1>
          <p className="mt-1.5 text-sm text-gray-400">Everything is unlocked on this account. There is nothing left to buy.</p>
          <Link
            href="/dashboard"
            className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-5 text-sm font-semibold text-white transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
          >
            Go to dashboard
          </Link>
        </div>
      </main>
    )
  }

  // Asked for a plan this account can't buy: open the one it can
  const open: PaidPlan = blocked[plan] ? (plan === "monthly" ? "lifetime" : "monthly") : plan

  return <Checkout initialPlan={open} email={account.email} blocked={blocked} />
}
