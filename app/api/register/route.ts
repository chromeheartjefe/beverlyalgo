import bcrypt from "bcryptjs"
import crypto from "crypto"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { db } from "@/db"
import { authTokens, users } from "@/db/schema"
import { sendVerificationEmail } from "@/lib/email"
import { checkRateLimit, clientIp } from "@/lib/rate-limit"

const registerSchema = z.object({
  name:     z.string().trim().min(1).max(255),
  email:    z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(72), // bcrypt's input byte limit
})

export async function POST(req: NextRequest) {
  const allowed = await checkRateLimit(`register:${clientIp(req)}`, 5, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
  }

  const body = await req.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Please check your name, email, and password." }, { status: 400 })
  }

  const { name, email, password } = parsed.data

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const [created] = await db
    .insert(users)
    .values({ name, email, passwordHash, plan: "free" })
    .returning({ id: users.id })

  try {
    const token = crypto.randomBytes(32).toString("hex")
    await db.insert(authTokens).values({
      userId:    created.id,
      token,
      type:      "email_verify",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    })
    await sendVerificationEmail(email, token)
  } catch (err) {
    // Account creation shouldn't hard-fail on email deliverability issues.
    console.error("[/api/register] Failed to send verification email:", err)
  }

  return NextResponse.json({ success: true }, { status: 201 })
}
