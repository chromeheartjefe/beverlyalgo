import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"

// Force dynamic + no-store: per-user access state, never safe to cache.
export const dynamic = "force-dynamic"

const requestSchema = z.object({
  tradingviewUsername: z
    .string()
    .trim()
    .min(3, "TradingView username must be at least 3 characters.")
    .max(50, "TradingView username is too long.")
    .regex(/^[A-Za-z0-9_.-]+$/, "Only letters, numbers, underscores, dots, and dashes are allowed."),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [row] = await db
    .select({
      tradingviewUsername:  users.tradingviewUsername,
      indicatorRequestedAt: users.indicatorRequestedAt,
      indicatorInvitedAt:   users.indicatorInvitedAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(row, { headers: { "Cache-Control": "no-store" } })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const plan = (session.user as { plan?: string }).plan ?? "free"
  if (plan === "free") {
    return NextResponse.json({ error: "Upgrade to Pro to request indicator access." }, { status: 403 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = requestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const [existing] = await db
    .select({ indicatorRequestedAt: users.indicatorRequestedAt })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  // Idempotent: a second submit never resets the 48h clock or re-queues the invite script.
  if (existing?.indicatorRequestedAt) {
    return NextResponse.json({ error: "Access has already been requested." }, { status: 409 })
  }

  const [updated] = await db
    .update(users)
    .set({
      tradingviewUsername:  parsed.data.tradingviewUsername,
      indicatorRequestedAt: new Date(),
    })
    .where(eq(users.id, session.user.id))
    .returning({
      tradingviewUsername:  users.tradingviewUsername,
      indicatorRequestedAt: users.indicatorRequestedAt,
      indicatorInvitedAt:   users.indicatorInvitedAt,
    })

  return NextResponse.json(updated)
}
