import { and, eq, ne } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"

// Force dynamic + no-store: this response is per-user, never safe to cache
// at any layer (CDN, browser, or Next's data cache) — a cached response
// here would leak one user's account data to whoever loads it next.
export const dynamic = "force-dynamic"

const patchSchema = z.object({
  name:         z.string().trim().min(1).max(255).optional(),
  email:        z.string().trim().toLowerCase().email().optional(),
  notifSignals: z.boolean().optional(),
  notifJournal: z.boolean().optional(),
  notifUpdates: z.boolean().optional(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [row] = await db
    .select({
      name:         users.name,
      email:        users.email,
      plan:         users.plan,
      notifSignals: users.notifSignals,
      notifJournal: users.notifJournal,
      notifUpdates: users.notifUpdates,
      stripeCurrentPeriodEnd: users.stripeCurrentPeriodEnd,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(row, { headers: { "Cache-Control": "no-store" } })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const updates = parsed.data
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 })
  }

  if (updates.email) {
    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, updates.email), ne(users.id, session.user.id)))
      .limit(1)

    if (taken) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 })
    }
  }

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, session.user.id))
    .returning({
      name:         users.name,
      email:        users.email,
      plan:         users.plan,
      notifSignals: users.notifSignals,
      notifJournal: users.notifJournal,
      notifUpdates: users.notifUpdates,
      stripeCurrentPeriodEnd: users.stripeCurrentPeriodEnd,
    })

  return NextResponse.json(updated)
}
