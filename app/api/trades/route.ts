import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { trades } from "@/db/schema"

const createSchema = z.object({
  date:      z.coerce.date(),
  pair:      z.string().trim().min(1).max(32),
  direction: z.enum(["Buy", "Sell"]),
  entry:     z.number().positive(),
  exit:      z.number().positive(),
  // Realized P&L, user-reported — can be negative (loss) or zero (breakeven).
  pnl:       z.number(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // No pagination yet — the dashboard overview sums this full list client-side
  // for win-rate/P&L stats, so silently truncating would quietly corrupt those
  // numbers. This cap only guards against pathological unbounded growth; a
  // real fix is a server-side aggregate query once trade counts justify it.
  const rows = await db
    .select()
    .from(trades)
    .where(eq(trades.userId, session.user.id))
    .orderBy(desc(trades.date))
    .limit(2000)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const [created] = await db
    .insert(trades)
    .values({ ...parsed.data, userId: session.user.id })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
