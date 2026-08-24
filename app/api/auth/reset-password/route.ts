import bcrypt from "bcryptjs"
import { and, eq, gt } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/db"
import { authTokens, users } from "@/db/schema"

const schema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(72),
})

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your input." }, { status: 400 })
  }

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.token, parsed.data.token),
        eq(authTokens.type, "password_reset"),
        gt(authTokens.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!row) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10)
  await db.update(users).set({ passwordHash }).where(eq(users.id, row.userId))
  await db.delete(authTokens).where(and(eq(authTokens.userId, row.userId), eq(authTokens.type, "password_reset")))

  return NextResponse.json({ success: true })
}
