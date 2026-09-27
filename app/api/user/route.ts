import bcrypt from "bcryptjs"
import { and, eq, ne } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { db } from "@/db"
import { authTokens, users } from "@/db/schema"
import { newAuthToken } from "@/lib/auth-tokens"
import { sendEmailChangedNotice, sendVerificationEmail } from "@/lib/email"
import { checkRateLimit } from "@/lib/rate-limit"

// Force dynamic + no-store: this response is per-user, never safe to cache
// at any layer (CDN, browser, or Next's data cache) — a cached response
// here would leak one user's account data to whoever loads it next.
export const dynamic = "force-dynamic"

const patchSchema = z.object({
  name:            z.string().trim().min(1).max(255).optional(),
  email:           z.string().trim().toLowerCase().email().optional(),
  // Required only when `email` actually changes
  currentPassword: z.string().min(1).max(200).optional(),
  notifSignals:    z.boolean().optional(),
  notifJournal:    z.boolean().optional(),
  notifUpdates:    z.boolean().optional(),
})

const PUBLIC_FIELDS = {
  name:         users.name,
  email:        users.email,
  plan:         users.plan,
  notifSignals: users.notifSignals,
  notifJournal: users.notifJournal,
  notifUpdates: users.notifUpdates,
  stripeCurrentPeriodEnd: users.stripeCurrentPeriodEnd,
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [row] = await db
    .select(PUBLIC_FIELDS)
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (!row) return NextResponse.json({ error: "User not found" }, { status: 404 })

  return NextResponse.json(row, { headers: { "Cache-Control": "no-store" } })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const body   = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input." }, { status: 400 })
  }

  const { currentPassword, ...updates } = parsed.data
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update." }, { status: 400 })
  }

  const [current] = await db
    .select({ email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!current) return NextResponse.json({ error: "User not found" }, { status: 404 })

  // ─── Email change ───────────────────────────────────────────────────────────
  // A stolen session alone must not be enough to change the email: that plus
  // "forgot password" would hand over the account permanently. So it takes
  // the current password, the new address has to be verified again, and the
  // old address is told about it.
  const emailChanging = updates.email !== undefined && updates.email !== current.email
  if (!emailChanging) delete updates.email

  // Only the unchanged email was sent: nothing to write (an empty .set()
  // throws in Drizzle), so answer with the current profile as a no-op.
  if (Object.keys(updates).length === 0) {
    const [row] = await db.select(PUBLIC_FIELDS).from(users).where(eq(users.id, userId)).limit(1)
    return NextResponse.json({ ...row, emailChanged: false })
  }

  if (emailChanging) {
    if (!currentPassword) {
      return NextResponse.json(
        { error: "Enter your current password to change your email.", code: "password_required" },
        { status: 400 },
      )
    }

    // Same budget as the password-change route, so this can't be used as a
    // password-guessing endpoint either
    const allowed = await checkRateLimit(`email-change:${userId}`, 5, 60 * 60 * 1000)
    if (!allowed) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 })
    }

    if (!(await bcrypt.compare(currentPassword, current.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect.", code: "password_required" }, { status: 400 })
    }

    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, updates.email!), ne(users.id, userId)))
      .limit(1)

    if (taken) {
      return NextResponse.json({ error: "That email is already in use." }, { status: 409 })
    }
  }

  const [updated] = await db
    .update(users)
    .set(emailChanging ? { ...updates, emailVerified: null } : updates)
    .where(eq(users.id, userId))
    .returning(PUBLIC_FIELDS)

  if (emailChanging) {
    try {
      await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.type, "email_verify")))
      const { token, hash } = newAuthToken()
      await db.insert(authTokens).values({
        userId,
        token:     hash,
        type:      "email_verify",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      await Promise.all([
        sendVerificationEmail(updated.email, token),
        sendEmailChangedNotice(current.email, updated.email),
      ])
    } catch (err) {
      // The change itself succeeded; the user can resend verification from the banner
      console.error("[/api/user] Email-change emails failed:", err)
    }
  }

  return NextResponse.json({ ...updated, emailChanged: emailChanging })
}
