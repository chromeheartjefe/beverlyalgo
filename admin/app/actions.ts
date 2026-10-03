"use server"

import { and, asc, desc, eq, gt, isNotNull, isNull, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

import { adminAuditLog, authTokens, chatMessages, users } from "@/db/schema"
import { newAuthToken } from "@/lib/auth-tokens"
import { sendIndicatorEarlyAccessEmail, sendIndicatorUpdateEmail, sendVerificationEmail } from "@/lib/email"
import { readDb, writeDb } from "~/lib/db"
import { loadIndicatorEmailAssets } from "~/lib/indicator-email"

// The console's only writes. Each one runs on the restricted write login
// (admin/sql/roles.sql), is confirmed in the UI first, and lands in
// admin_audit_log with what changed.

export type ActionResult = { ok: true; message: string } | { ok: false; message: string }

async function audit(action: string, targetUserId: string | null, details: Record<string, unknown>) {
  await writeDb().insert(adminAuditLog).values({ action, targetUserId, details: JSON.stringify(details) })
}

function fail(err: unknown): ActionResult {
  console.error("[admin action]", err)
  return { ok: false, message: err instanceof Error ? err.message : "Action failed." }
}

export async function markIndicatorInvited(userId: string): Promise<ActionResult> {
  try {
    const [row] = await writeDb()
      .update(users)
      .set({ indicatorInvitedAt: new Date() })
      .where(and(eq(users.id, userId), isNotNull(users.indicatorRequestedAt), isNull(users.indicatorInvitedAt)))
      .returning({ username: users.tradingviewUsername })
    if (!row) return { ok: false, message: "No pending indicator request for this user." }
    await audit("mark_invited", userId, { tradingviewUsername: row.username })
    revalidatePath("/indicator")
    revalidatePath(`/users/${userId}`)
    return { ok: true, message: `Marked @${row.username} as invited. They now see "You're in!".` }
  } catch (err) {
    return fail(err)
  }
}

const AUTH_URL_HINT = "Set AUTH_URL=https://entrixalgo.com in admin/.env.local, or the email link would point to this machine."

// Same flow as the site's own resend (app/api/auth/resend-verification):
// old verify tokens removed, a fresh 24h token, hashed in the DB.
async function sendFreshVerification(userId: string, email: string) {
  const db = writeDb()
  await db.delete(authTokens).where(and(eq(authTokens.userId, userId), eq(authTokens.type, "email_verify")))
  const { token, hash } = newAuthToken()
  await db.insert(authTokens).values({
    userId,
    token:     hash,
    type:      "email_verify",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  })
  await sendVerificationEmail(email, token)
}

export async function resendVerification(userId: string): Promise<ActionResult> {
  try {
    const [user] = await writeDb()
      .select({ email: users.email, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)
    if (!user) return { ok: false, message: "User not found." }
    if (user.emailVerified) return { ok: false, message: "Email is already verified." }
    if (!process.env.AUTH_URL?.startsWith("https://")) return { ok: false, message: AUTH_URL_HINT }

    await sendFreshVerification(userId, user.email)
    await audit("resend_verification", userId, { email: user.email })
    return { ok: true, message: `Verification email sent to ${user.email}.` }
  } catch (err) {
    return fail(err)
  }
}

// One-off catch-up after the localhost-link bug (lib/email.ts baseUrl):
// every unverified account gets a fresh, working link. Sent one at a time
// with a pause to stay under Resend's rate limit (2/s on the free plan,
// 100/day), capped per run, and refused if a bulk run happened in the last
// hour so a double click can't email everyone twice.
const BULK_MAX = 90
const BULK_GAP_MS = 700

export async function resendVerificationToAll(): Promise<ActionResult> {
  try {
    if (!process.env.AUTH_URL?.startsWith("https://")) return { ok: false, message: AUTH_URL_HINT }
    const db = writeDb()

    const [recent] = await db
      .select({ id: adminAuditLog.id })
      .from(adminAuditLog)
      .where(and(eq(adminAuditLog.action, "resend_verification_all"), gt(adminAuditLog.createdAt, new Date(Date.now() - 60 * 60 * 1000))))
      .limit(1)
    if (recent) return { ok: false, message: "A bulk resend already ran in the last hour. Check the Audit log." }

    const list = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(isNull(users.emailVerified))
      .orderBy(asc(users.createdAt))
      .limit(BULK_MAX)
    if (list.length === 0) return { ok: false, message: "Every account is already verified." }

    let sent = 0
    const failed: string[] = []
    for (const u of list) {
      try {
        await sendFreshVerification(u.id, u.email)
        sent++
      } catch (err) {
        console.error("[admin bulk resend]", u.email, err)
        failed.push(u.email)
      }
      await new Promise((r) => setTimeout(r, BULK_GAP_MS))
    }

    await audit("resend_verification_all", null, { sent, failed })
    revalidatePath("/users")
    revalidatePath("/audit")
    return failed.length === 0
      ? { ok: true, message: `Sent ${sent} verification emails.` }
      : { ok: false, message: `Sent ${sent}, failed ${failed.length}: ${failed.join(", ")}` }
  } catch (err) {
    return fail(err)
  }
}

// "Still being finished" update to everyone waiting for indicator access
// (requested, not yet invited). One per user ever: each send is logged
// per user in the audit log, and anyone already logged is skipped, so a
// second click only reaches people who requested since. Paced like the bulk
// verification resend (Resend free: 2/s, 100/day shared with other emails).
const INDICATOR_UPDATE_ACTION = "indicator_update_sent"

export async function sendIndicatorUpdateToWaiting(): Promise<ActionResult> {
  try {
    if (!process.env.AUTH_URL?.startsWith("https://")) return { ok: false, message: AUTH_URL_HINT }
    const db = writeDb()

    const already = await db
      .select({ userId: adminAuditLog.targetUserId })
      .from(adminAuditLog)
      .where(eq(adminAuditLog.action, INDICATOR_UPDATE_ACTION))
    const done = new Set(already.map((r) => r.userId))

    const waiting = await db
      .select({ id: users.id, email: users.email, username: users.tradingviewUsername })
      .from(users)
      .where(and(isNotNull(users.indicatorRequestedAt), isNull(users.indicatorInvitedAt)))
      .orderBy(asc(users.indicatorRequestedAt))
    const list = waiting.filter((u) => !done.has(u.id)).slice(0, BULK_MAX)
    if (list.length === 0) return { ok: false, message: "Everyone waiting already has this update." }

    let sent = 0
    const failed: string[] = []
    for (const u of list) {
      try {
        await sendIndicatorUpdateEmail(u.email, { tradingviewUsername: u.username })
        await audit(INDICATOR_UPDATE_ACTION, u.id, { tradingviewUsername: u.username })
        sent++
      } catch (err) {
        console.error("[admin indicator update]", u.email, err)
        failed.push(u.email)
      }
      await new Promise((r) => setTimeout(r, BULK_GAP_MS))
    }

    await audit("indicator_update_all", null, { sent, failed })
    revalidatePath("/indicator")
    revalidatePath("/audit")
    return failed.length === 0
      ? { ok: true, message: `Sent the update to ${sent} user${sent === 1 ? "" : "s"}.` }
      : { ok: false, message: `Sent ${sent}, failed ${failed.length}: ${failed.join(", ")}` }
  } catch (err) {
    return fail(err)
  }
}

// The indicator script itself, with install steps, to everyone waiting for
// access. Same rules as the update above: one per user ever, logged per user,
// paced. People stay in the waiting list; nothing on their account changes.
const INDICATOR_EARLY_ACCESS_ACTION = "indicator_early_access_sent"

export async function sendIndicatorEarlyAccessToWaiting(): Promise<ActionResult> {
  try {
    if (!process.env.AUTH_URL?.startsWith("https://")) return { ok: false, message: AUTH_URL_HINT }
    const assets = await loadIndicatorEmailAssets()
    if (!assets.ok) return { ok: false, message: assets.message }
    const db = writeDb()

    const already = await db
      .select({ userId: adminAuditLog.targetUserId })
      .from(adminAuditLog)
      .where(eq(adminAuditLog.action, INDICATOR_EARLY_ACCESS_ACTION))
    const done = new Set(already.map((r) => r.userId))

    const waiting = await db
      .select({ id: users.id, email: users.email, username: users.tradingviewUsername })
      .from(users)
      .where(and(isNotNull(users.indicatorRequestedAt), isNull(users.indicatorInvitedAt)))
      .orderBy(asc(users.indicatorRequestedAt))
    const list = waiting.filter((u) => !done.has(u.id)).slice(0, BULK_MAX)
    if (list.length === 0) return { ok: false, message: "Everyone waiting already has the early access email." }

    let sent = 0
    const failed: string[] = []
    for (const u of list) {
      try {
        await sendIndicatorEarlyAccessEmail(u.email, { script: assets.script, pineImage: assets.pineImage })
        await audit(INDICATOR_EARLY_ACCESS_ACTION, u.id, { tradingviewUsername: u.username })
        sent++
      } catch (err) {
        console.error("[admin indicator early access]", u.email, err)
        failed.push(u.email)
      }
      await new Promise((r) => setTimeout(r, BULK_GAP_MS))
    }

    await audit("indicator_early_access_all", null, { sent, failed })
    revalidatePath("/indicator")
    revalidatePath("/audit")
    return failed.length === 0
      ? { ok: true, message: `Sent early access to ${sent} user${sent === 1 ? "" : "s"}.` }
      : { ok: false, message: `Sent ${sent}, failed ${failed.length}: ${failed.join(", ")}` }
  } catch (err) {
    return fail(err)
  }
}

// Bumps session_version: every session of this user ends on its next
// request (auth.ts jwt callback). Their password is unchanged.
export async function forceSignOut(userId: string): Promise<ActionResult> {
  try {
    const [row] = await writeDb()
      .update(users)
      .set({ sessionVersion: sql`${users.sessionVersion} + 1` })
      .where(eq(users.id, userId))
      .returning({ sessionVersion: users.sessionVersion })
    if (!row) return { ok: false, message: "User not found." }
    await audit("force_sign_out", userId, { newSessionVersion: row.sessionVersion })
    revalidatePath(`/users/${userId}`)
    return { ok: true, message: "All of this user's sessions are signed out." }
  } catch (err) {
    return fail(err)
  }
}

export type ChatLine = { role: string; content: string; created_at: string }

// Debug-only read of a user's AI Bot conversation, capped so a long history
// can't flood the page. Logged like a write (privacy policy says reviews are logged).
const CHAT_VIEW_LIMIT = 40

export async function viewChat(userId: string, reason: string): Promise<{ ok: true; lines: ChatLine[] } | { ok: false; message: string }> {
  try {
    if (reason.trim().length < 5) return { ok: false, message: "Write a short reason (what you are debugging)." }
    const lines = await readDb()
      .select({ role: chatMessages.role, content: chatMessages.content, created_at: chatMessages.createdAt })
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(desc(chatMessages.seq))
      .limit(CHAT_VIEW_LIMIT)
    await audit("chat_viewed", userId, { reason: reason.trim(), messages: lines.length })
    return {
      ok: true,
      lines: lines.reverse().map((l) => ({ role: l.role, content: l.content, created_at: l.created_at.toISOString() })),
    }
  } catch (err) {
    const r = fail(err)
    return { ok: false, message: r.message }
  }
}
