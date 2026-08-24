import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { checkRateLimit } from "@/lib/rate-limit"

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8).max(72),
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Keyed by user id, not IP — this is an authenticated route, and an
  // attacker with a valid session could rotate IPs but not the session's user id.
  const allowed = await checkRateLimit(`password-change:${session.user.id}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
  }

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your input." }, { status: 400 })
  }

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 })

  const valid = await bcrypt.compare(parsed.data.currentPassword, row.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  await db.update(users).set({ passwordHash }).where(eq(users.id, session.user.id))

  return NextResponse.json({ success: true })
}
