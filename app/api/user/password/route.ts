import bcrypt from "bcryptjs"
import { eq, sql } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { logEvent } from "@/lib/events"
import { checkPassword } from "@/lib/password-strength"
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

  const strength = checkPassword(parsed.data.newPassword, { email: session.user.email, name: session.user.name })
  if (!strength.ok) {
    return NextResponse.json({ error: strength.hint }, { status: 400 })
  }

  const [row] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 })

  // Google-only account: setting a first password goes through the email
  // link (it proves inbox access), not through a session alone
  if (!row.passwordHash) {
    return NextResponse.json(
      { error: "Your account signs in with Google and has no password yet. Use \"Email me a link\" to set one.", code: "password_not_set" },
      { status: 400 },
    )
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, row.passwordHash)
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10)
  // Bumping sessionVersion signs out every other session (see auth.ts);
  // the settings page signs this browser straight back in with the new password.
  await db
    .update(users)
    .set({ passwordHash, sessionVersion: sql`${users.sessionVersion} + 1` })
    .where(eq(users.id, session.user.id))

  await logEvent(session.user.id, "password_changed")
  return NextResponse.json({ success: true })
}
