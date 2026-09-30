import { and, count, eq, gt, or } from "drizzle-orm"

import { db } from "@/db"
import { chartAnalyses, freeAnalysisClaims } from "@/db/schema"

// ─── One free Chart Analysis for Free accounts ───────────────────────────────
// Lets a new user see a real analysis before paying. The analysis itself costs
// ~$0.0015, so the guards below are about keeping it one per person, not about
// money:
// - a verified email (Google sign-in counts as verified);
// - one per inbox: Gmail dots and +tags are the same inbox, and the claim
//   outlives a deleted account (free_analysis_claims.email_key is unique);
// - throwaway email services get none;
// - at most FREE_CLAIMS_PER_IP per network per 30 days. Loose on purpose:
//   phone carriers put many unrelated people behind one IP.
// A claim is taken before the AI call and given back if no analysis comes out
// (rejected screenshot, AI error), so a bad upload doesn't use it up.

export const FREE_CLAIMS_PER_IP = 3
const IP_WINDOW_MS = 30 * 24 * 60 * 60 * 1000
// Free accounts can retry rejected screenshots, but not endlessly
export const FREE_DAILY_ATTEMPTS = 5

export type FreeAnalysisState =
  | "pro"        // not a Free account
  | "available"  // can run the free analysis now
  | "verify"     // needs a verified email first
  | "used"       // this account or inbox already had it
  | "blocked"    // throwaway email service

type UserRow = { id: string; email: string; emailVerified: Date | null; plan: string }

/** The inbox an address delivers to: lowercased, +tag removed, Gmail dots removed. */
export function emailKey(email: string): string {
  const value = email.trim().toLowerCase()
  const at = value.lastIndexOf("@")
  if (at < 1) return value
  let local = value.slice(0, at).split("+")[0]
  let domain = value.slice(at + 1)
  if (domain === "googlemail.com") domain = "gmail.com"
  if (domain === "gmail.com") local = local.replaceAll(".", "")
  return `${local}@${domain}`
}

// Common throwaway inbox services. Not exhaustive; the per-inbox and
// per-network limits cover the rest.
const DISPOSABLE_DOMAINS = new Set([
  "10minutemail.com", "10minutemail.net", "20minutemail.com", "33mail.com", "burnermail.io",
  "discard.email", "dispostable.com", "dropmail.me", "emailondeck.com", "fakeinbox.com",
  "fakemail.net", "getairmail.com", "getnada.com", "guerrillamail.biz", "guerrillamail.com",
  "guerrillamail.de", "guerrillamail.info", "guerrillamail.net", "guerrillamail.org",
  "guerrillamailblock.com", "inboxkitten.com", "mail.tm", "mailcatch.com", "maildrop.cc",
  "mailinator.com", "mailinator.net", "mailnesia.com", "mailpoof.com", "mintemail.com",
  "mohmal.com", "moakt.com", "mytemp.email", "nada.email", "sharklasers.com", "spam4.me",
  "spamgourmet.com", "temp-mail.io", "temp-mail.org", "tempail.com", "tempmail.com",
  "tempmail.dev", "tempmail.net", "tempmailo.com", "tempr.email", "throwawaymail.com",
  "tmpmail.net", "tmpmail.org", "trashmail.com", "trashmail.de", "trashmail.net",
  "yopmail.com", "yopmail.fr", "yopmail.net",
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@").pop() ?? ""
  return DISPOSABLE_DOMAINS.has(domain)
}

/** True if this account, or anyone on the same inbox, already had the free analysis. */
async function alreadyUsed(user: UserRow): Promise<boolean> {
  const [[claim], [analyses]] = await Promise.all([
    db.select({ id: freeAnalysisClaims.id }).from(freeAnalysisClaims)
      .where(or(eq(freeAnalysisClaims.userId, user.id), eq(freeAnalysisClaims.emailKey, emailKey(user.email))))
      .limit(1),
    // An account that was Pro before already saw what the analysis does
    db.select({ n: count() }).from(chartAnalyses).where(eq(chartAnalyses.userId, user.id)),
  ])
  return !!claim || analyses.n > 0
}

export async function freeAnalysisState(user: UserRow): Promise<FreeAnalysisState> {
  if (user.plan !== "free") return "pro"
  if (isDisposableEmail(user.email)) return "blocked"
  if (await alreadyUsed(user)) return "used"
  if (!user.emailVerified) return "verify"
  return "available"
}

export type ClaimResult =
  | { ok: true; claimId: string }
  | { ok: false; reason: Exclude<FreeAnalysisState, "pro" | "available"> | "network" }

/**
 * Reserves the free analysis before the AI call. Atomic through the unique
 * user_id and email_key columns: two parallel requests can't both claim it.
 */
export async function claimFreeAnalysis(user: UserRow, ip: string): Promise<ClaimResult> {
  const state = await freeAnalysisState(user)
  if (state !== "available") return { ok: false, reason: state === "pro" ? "used" : state }

  if (ip !== "unknown") {
    const [recent] = await db.select({ n: count() }).from(freeAnalysisClaims)
      .where(and(eq(freeAnalysisClaims.ip, ip), gt(freeAnalysisClaims.createdAt, new Date(Date.now() - IP_WINDOW_MS))))
    if (recent.n >= FREE_CLAIMS_PER_IP) return { ok: false, reason: "network" }
  }

  const [claim] = await db
    .insert(freeAnalysisClaims)
    .values({ userId: user.id, emailKey: emailKey(user.email), ip: ip === "unknown" ? null : ip.slice(0, 64) })
    .onConflictDoNothing()
    .returning({ id: freeAnalysisClaims.id })
  return claim ? { ok: true, claimId: claim.id } : { ok: false, reason: "used" }
}

/** Gives the free analysis back when no analysis came out of the attempt. */
export async function releaseFreeAnalysis(claimId: string): Promise<void> {
  await db.delete(freeAnalysisClaims).where(eq(freeAnalysisClaims.id, claimId))
}
