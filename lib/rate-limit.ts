import { and, count, eq, gt, lt } from "drizzle-orm"
import { after } from "next/server"

import { db } from "@/db"
import { authTokens, processedStripeEvents, rateLimitHits } from "@/db/schema"

/**
 * Allows the call if fewer than `limit` hits were recorded for `key` within
 * the window, and records this one.
 *
 * Records first, then counts including itself. Counting first let parallel
 * requests all pass the check before any of them was written, so a burst
 * could exceed the limit. Now the worst case under a race is being slightly
 * stricter than the limit, never looser. A rejected call takes its own row
 * back out so it doesn't count against the user.
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const [hit] = await db.insert(rateLimitHits).values({ key }).returning({ id: rateLimitHits.id })
  const used = await countHits(key, windowMs)
  if (used > limit) {
    await db.delete(rateLimitHits).where(eq(rateLimitHits.id, hit.id))
    return false
  }
  scheduleCleanup()
  return true
}

/** Hits recorded for `key` within the window, without recording a new one. */
export async function countHits(key: string, windowMs: number): Promise<number> {
  const since = new Date(Date.now() - windowMs)
  const [{ value }] = await db
    .select({ value: count() })
    .from(rateLimitHits)
    .where(and(eq(rateLimitHits.key, key), gt(rateLimitHits.createdAt, since)))
  return value
}

export async function recordHit(key: string): Promise<void> {
  await db.insert(rateLimitHits).values({ key })
  scheduleCleanup()
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}

// ─── Housekeeping ─────────────────────────────────────────────────────────────
// rate_limit_hits, expired auth tokens and old Stripe event ids only ever
// grew. About 1 in 100 recorded hits also prunes them, after the response is
// sent (next/server `after`), so no cron job or extra latency is needed.

const HIT_RETENTION_MS    = 48 * 60 * 60 * 1000       // longest window in use is 24h
const STRIPE_RETENTION_MS = 60 * 24 * 60 * 60 * 1000  // Stripe retries for up to 3 days

function scheduleCleanup() {
  if (Math.random() >= 0.01) return
  try {
    after(async () => {
      const now = Date.now()
      try {
        await Promise.all([
          db.delete(rateLimitHits).where(lt(rateLimitHits.createdAt, new Date(now - HIT_RETENTION_MS))),
          db.delete(authTokens).where(lt(authTokens.expiresAt, new Date(now))),
          db.delete(processedStripeEvents).where(lt(processedStripeEvents.createdAt, new Date(now - STRIPE_RETENTION_MS))),
        ])
      } catch (err) {
        console.error("[rate-limit] cleanup failed:", err)
      }
    })
  } catch {
    // Outside a request scope (e.g. a script): skip, the next request cleans up
  }
}
