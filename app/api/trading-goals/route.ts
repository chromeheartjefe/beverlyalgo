import { and, asc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { tradingGoals } from "@/db/schema"

const putSchema = z.object({
  month:  z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  // null clears this month's own goal (it then falls back to the carried one)
  amount: z.number().positive().max(1_000_000_000).nullable(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select({ month: tradingGoals.month, amount: tradingGoals.amount })
    .from(tradingGoals)
    .where(eq(tradingGoals.userId, session.user.id))
    .orderBy(asc(tradingGoals.month))

  return NextResponse.json(rows)
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = putSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a goal greater than $0." }, { status: 400 })
  }

  const { month, amount } = parsed.data
  const userId = session.user.id

  if (amount === null) {
    await db
      .delete(tradingGoals)
      .where(and(eq(tradingGoals.userId, userId), eq(tradingGoals.month, month)))
    return NextResponse.json({ month, amount: null })
  }

  const [saved] = await db
    .insert(tradingGoals)
    .values({ userId, month, amount })
    .onConflictDoUpdate({
      target: [tradingGoals.userId, tradingGoals.month],
      set:    { amount, updatedAt: new Date() },
    })
    .returning({ month: tradingGoals.month, amount: tradingGoals.amount })

  return NextResponse.json(saved)
}
