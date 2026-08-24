import { and, eq, gt } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/db"
import { authTokens, users } from "@/db/schema"

const schema = z.object({ token: z.string().min(1) })

export async function POST(req: NextRequest) {
  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 })
  }

  const [row] = await db
    .select()
    .from(authTokens)
    .where(
      and(
        eq(authTokens.token, parsed.data.token),
        eq(authTokens.type, "email_verify"),
        gt(authTokens.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!row) {
    return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 })
  }

  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, row.userId))
  await db.delete(authTokens).where(eq(authTokens.id, row.id))

  return NextResponse.json({ success: true })
}
