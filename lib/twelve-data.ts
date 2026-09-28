import { inArray } from "drizzle-orm"

import { db } from "@/db"
import { rateLimitHits } from "@/db/schema"
import { countHits, reserveHit } from "@/lib/rate-limit"

// ─── Twelve Data gateway ──────────────────────────────────────────────────────
// Every Twelve Data call goes through here (dashboard ticker, AI Screener),
// since they share one key and one free-tier budget: 8 credits per minute,
// 800 per day, 1 credit per symbol in a batch.
//
// Twelve Data reports "out of credits" as HTTP 200 with an error body, not a
// 429. That used to look like a normal reply with no prices in it, nothing
// recorded the failed attempt, and every open dashboard retried on its next
// poll, so one rate-limit turned into a storm. Now a failure sets a backoff
// window, during which callers get null and keep serving their cached data.

export type TwelveDataQuote = {
  close?:          string
  percent_change?: string
  volume?:         string
  status?:         string
}

const MINUTE_BACKOFF_MS = 2 * 60 * 1000 // per-minute cap, network errors, 5xx

// Our own credit ledger, one rate_limit_hits row per credit, so the ticker
// and the Screener can never together exceed the plan. Kept a little under
// the real caps as a safety margin.
const CREDIT_KEY          = "twelvedata:credit"
const CREDITS_PER_MINUTE  = 8
const CREDITS_PER_DAY     = 750 // real cap 800, resets 00:00 UTC

function msSinceUtcMidnight(): number {
  const now = new Date()
  return now.getTime() - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
}

/**
 * Reserves one credit per symbol, or returns null if that would go over the
 * minute or day budget. Insert first, then count (same as checkRateLimit):
 * parallel callers can only end up stricter than the budget, never over it.
 */
async function reserveCredits(n: number): Promise<string[] | null> {
  const rows = await db
    .insert(rateLimitHits)
    .values(Array.from({ length: n }, () => ({ key: CREDIT_KEY })))
    .returning({ id: rateLimitHits.id })
  const ids = rows.map((r) => r.id)

  const [minute, day] = await Promise.all([
    countHits(CREDIT_KEY, 60 * 1000),
    countHits(CREDIT_KEY, msSinceUtcMidnight()),
  ])
  if (minute > CREDITS_PER_MINUTE || day > CREDITS_PER_DAY) {
    await db.delete(rateLimitHits).where(inArray(rateLimitHits.id, ids))
    return null
  }
  return ids
}

const minuteBackoffKey = "twelvedata:backoff"
// Daily credits reset at 00:00 UTC, so the key carries the UTC date
const dayBackoffKey = () => `twelvedata:backoff-day:${new Date().toISOString().slice(0, 10)}`

async function inBackoff(): Promise<boolean> {
  const [minute, day] = await Promise.all([
    countHits(minuteBackoffKey, MINUTE_BACKOFF_MS),
    countHits(dayBackoffKey(), 24 * 60 * 60 * 1000),
  ])
  return minute > 0 || day > 0
}

async function backOff(reason: string, wholeDay: boolean) {
  console.warn(`[twelve-data] ${reason}, backing off ${wholeDay ? "until 00:00 UTC" : "for 2 minutes"}`)
  try {
    await reserveHit(wholeDay ? dayBackoffKey() : minuteBackoffKey)
  } catch {
    // Best-effort: without the row the next caller just retries once more
  }
}

/**
 * Quotes keyed by symbol, or null when the call was skipped (backoff) or
 * failed. Callers fall back to their own cached data on null.
 */
export async function fetchQuotes(symbols: string[]): Promise<Record<string, TwelveDataQuote> | null> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey || symbols.length === 0) return null
  if (await inBackoff()) return null
  if (!(await reserveCredits(symbols.length))) {
    console.warn(`[twelve-data] Skipped ${symbols.length}-credit call: own minute/day budget reached`)
    return null
  }

  try {
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`,
      { cache: "no-store" },
    )
    if (!res.ok) {
      await backOff(`HTTP ${res.status}`, false)
      return null
    }
    const data = await res.json()

    // Whole-request error (credits, key, plan): { code, message, status: "error" }
    if (data?.status === "error" || typeof data?.code === "number") {
      const message = String(data?.message ?? "")
      await backOff(`API error ${data?.code ?? ""}: ${message}`, /for the day/i.test(message))
      return null
    }

    // A single symbol comes back as the quote object itself; several come
    // back keyed by symbol. Normalize to the keyed shape either way.
    return symbols.length === 1 ? { [symbols[0]]: data } : data
  } catch (err) {
    await backOff(`request failed (${err instanceof Error ? err.message : "unknown"})`, false)
    return null
  }
}
