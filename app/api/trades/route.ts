import { count, desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { trades } from "@/db/schema"
import { checkRateLimit } from "@/lib/rate-limit"
import { MAX_TRADES_PER_USER, tradeInput } from "@/lib/trade-validation"

const createSchema = z.object(tradeInput)

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
    .limit(MAX_TRADES_PER_USER)

  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Generous for manual logging and CSV-style bursts, but stops scripted flooding
  const allowed = await checkRateLimit(`trade-create:${session.user.id}`, 120, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many trades added in a short time. Please try again later." }, { status: 429 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 })
  }

  const [{ value: existing }] = await db
    .select({ value: count() })
    .from(trades)
    .where(eq(trades.userId, session.user.id))
  if (existing >= MAX_TRADES_PER_USER) {
    return NextResponse.json(
      { error: `Your journal has reached the ${MAX_TRADES_PER_USER.toLocaleString("en-US")} trade limit. Delete old trades to add new ones.` },
      { status: 400 },
    )
  }

  const [created] = await db
    .insert(trades)
    .values({ ...parsed.data, userId: session.user.id })
    .returning()

  return NextResponse.json(created, { status: 201 })
}
