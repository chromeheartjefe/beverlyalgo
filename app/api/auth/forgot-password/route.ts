import crypto from "crypto"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/db"
import { authTokens, users } from "@/db/schema"
import { sendPasswordResetEmail } from "@/lib/email"
import { checkRateLimit, clientIp } from "@/lib/rate-limit"

const schema = z.object({ email: z.string().trim().toLowerCase().email() })

// Always returns a generic success response, whether or not the email exists —
// don't leak account existence to the caller.
function genericResponse() {
  return NextResponse.json({
    success: true,
    message: "If an account exists for that email, we've sent a password reset link.",
  })
}

export async function POST(req: NextRequest) {
  // Never reveal that the limit was hit — still return the generic success response,
  // just skip the DB/email work entirely.
  const allowed = await checkRateLimit(`forgot-password:${clientIp(req)}`, 5, 60 * 60 * 1000)
  if (!allowed) return genericResponse()

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return genericResponse()

  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1)

  if (row) {
    try {
      const token = crypto.randomBytes(32).toString("hex")
      await db.insert(authTokens).values({
        userId:    row.id,
        token,
        type:      "password_reset",
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      })
      await sendPasswordResetEmail(parsed.data.email, token)
    } catch (err) {
      console.error("[/api/auth/forgot-password]", err)
    }
  }

  return genericResponse()
}
