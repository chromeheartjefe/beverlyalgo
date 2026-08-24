import { and, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { trades } from "@/db/schema"

const patchSchema = z.object({
  date:      z.coerce.date().optional(),
  pair:      z.string().trim().min(1).max(32).optional(),
  direction: z.enum(["Buy", "Sell"]).optional(),
  entry:     z.number().positive().optional(),
  exit:      z.number().positive().optional(),
  pnl:       z.number().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id }  = await params
  const body    = await req.json().catch(() => null)
  const parsed  = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const updates = parsed.data
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 })
  }

  const [updated] = await db
    .update(trades)
    .set(updates)
    .where(and(eq(trades.id, id), eq(trades.userId, session.user.id)))
    .returning()

  if (!updated) return NextResponse.json({ error: "Trade not found." }, { status: 404 })

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  const [deleted] = await db
    .delete(trades)
    .where(and(eq(trades.id, id), eq(trades.userId, session.user.id)))
    .returning({ id: trades.id })

  if (!deleted) return NextResponse.json({ error: "Trade not found." }, { status: 404 })

  return NextResponse.json({ success: true })
}
