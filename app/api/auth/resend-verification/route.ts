import crypto from "crypto"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { authTokens, users } from "@/db/schema"
import { sendVerificationEmail } from "@/lib/email"

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [row] = await db
    .select({ email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "User not found." }, { status: 404 })
  if (row.emailVerified) return NextResponse.json({ success: true, alreadyVerified: true })

  await db.delete(authTokens).where(and(eq(authTokens.userId, session.user.id), eq(authTokens.type, "email_verify")))

  const token = crypto.randomBytes(32).toString("hex")
  await db.insert(authTokens).values({
    userId:    session.user.id,
    token,
    type:      "email_verify",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })

  try {
    await sendVerificationEmail(row.email, token)
  } catch (err) {
    console.error("[/api/auth/resend-verification]", err)
    return NextResponse.json({ error: "Failed to send verification email." }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
