import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { stripe } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [row] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row?.stripeCustomerId) {
    return NextResponse.json({ error: "No active subscription to manage." }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer:   row.stripeCustomerId,
    return_url: `${req.nextUrl.origin}/dashboard/settings`,
  })

  return NextResponse.json({ url: portalSession.url })
}
