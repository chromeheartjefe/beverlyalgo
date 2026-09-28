import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import type { PlanStatus } from "@/lib/plan-status"
import { stripe } from "@/lib/stripe"

// Feeds the sidebar plan card. Read-only: it never changes the account or
// the Stripe subscription.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const [user] = await db
    .select({
      plan:           users.plan,
      customerId:     users.stripeCustomerId,
      subscriptionId: users.stripeSubscriptionId,
      periodEnd:      users.stripeCurrentPeriodEnd,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

  const noStore = { headers: { "Cache-Control": "no-store" } }

  if (user.plan === "free") {
    const body: PlanStatus = { plan: "free", billing: null, status: null, periodEnd: null }
    return NextResponse.json(body, noStore)
  }

  if (!user.subscriptionId) {
    // Pro without a subscription: a Lifetime purchase (has a Stripe customer)
    // or access granted by hand (no Stripe link at all).
    const body: PlanStatus = {
      plan: "pro", billing: user.customerId ? "lifetime" : "manual", status: "active", periodEnd: null,
    }
    return NextResponse.json(body, noStore)
  }

  // Monthly: the DB only knows the period end, not whether the subscriber
  // cancelled or a renewal payment failed, so ask Stripe. If Stripe is
  // unreachable, fall back to the stored date and show it as active.
  let status: PlanStatus["status"] = "active"
  let periodEnd = user.periodEnd?.toISOString() ?? null
  try {
    const sub = await stripe.subscriptions.retrieve(user.subscriptionId)
    if (sub.status === "canceled" || sub.status === "incomplete_expired" || sub.status === "paused") status = "ended"
    else if (sub.status === "past_due" || sub.status === "unpaid" || sub.status === "incomplete") status = "past_due"
    else if (sub.cancel_at_period_end || sub.cancel_at) status = "canceling"
    const end = sub.cancel_at ?? sub.items.data[0]?.current_period_end
    if (end) periodEnd = new Date(end * 1000).toISOString()
  } catch (err) {
    console.error("[/api/user/plan] Stripe lookup failed", err)
  }

  const body: PlanStatus = { plan: "pro", billing: "monthly", status, periodEnd }
  return NextResponse.json(body, noStore)
}
