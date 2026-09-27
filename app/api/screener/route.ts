import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import OpenAI from "openai"

import { auth } from "@/auth"
import { db } from "@/db"
import { screenerCache } from "@/db/schema"
import { isBudgetExceeded, recordAiUsage } from "@/lib/ai-budget"
import { checkRateLimit } from "@/lib/rate-limit"
import { fetchCryptoMovers, fetchStockMovers, type MoverCandidate } from "@/lib/screener-data"
import { UserFacingError } from "@/lib/user-error"

// A real re-scan only happens if the cached row is older than this — see
// db/schema.ts's screenerCache comment for why this lives in Postgres
// rather than a module-level variable. Every "Scan"/"Refresh" click within
// the window returns this same cached result at zero API/AI cost.
const REFRESH_MS = 60 * 60 * 1000

export type ScreenerTicker = {
  symbol:         string
  assetType:      "stock" | "crypto"
  price:          number
  changePercent:  number
  direction:      "Bullish" | "Bearish" | "Watch"
  potential:      number
}

export type ScreenerResult = {
  tickers:     ScreenerTicker[]
  generatedAt: string
  stale:       boolean // true when a fresh scan was skipped (missing key / budget hit) and this is a carried-over result
}

const SYSTEM = `You are a market screener for a trading platform, picking which tickers are most worth a trader's attention right now. You are given real, already-computed 24h price/volume movers, not raw prices, do not invent tickers or numbers outside what is given.
Return JSON only: {"picks":[{"symbol":"str (exactly as given)","assetType":"stock|crypto","direction":"Bullish|Bearish|Watch","potential":0-100}]}
Selection: pick exactly 5 from the stock candidates and exactly 5 from the crypto candidates (fewer only if a list has under 5 entries total). Prefer candidates whose move is backed by real volume over a bigger % move on thin volume, that is a stronger, more tradeable signal.
direction: "Bullish" for a genuine upward move, "Bearish" for a genuine downward move, "Watch" only if the move looks like noise/a trap rather than real momentum (rare, most picks should be Bullish or Bearish).
potential: ground this in the actual change_percent and volume you were given, do not default to a narrow band, a huge volume-backed move earns 85+, a smaller or thinner one earns lower, spread your scores across the group instead of clustering them all together.`

// Kept out of a raw number so the model judges liquidity from a readable
// figure ("564M") rather than a long float, without needing to quote it back anywhere.
function fmtVolume(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)         return `${(v / 1_000).toFixed(1)}K`
  return v.toFixed(0)
}

function buildUserPrompt(stocks: MoverCandidate[], crypto: MoverCandidate[]) {
  const fmt = (list: MoverCandidate[]) =>
    list.map((c) => `${c.symbol}: price ${c.price}, 24h change ${c.changePercent > 0 ? "+" : ""}${c.changePercent.toFixed(2)}%, volume ${fmtVolume(c.volume)}`).join("\n")

  return `STOCK CANDIDATES:\n${stocks.length ? fmt(stocks) : "(none available)"}\n\nCRYPTO CANDIDATES:\n${crypto.length ? fmt(crypto) : "(none available)"}`
}

async function readCache() {
  const [row] = await db.select().from(screenerCache).where(eq(screenerCache.id, "singleton"))
  return row ?? null
}

async function writeCache(result: ScreenerResult) {
  await db
    .insert(screenerCache)
    .values({ id: "singleton", data: JSON.stringify(result), generatedAt: new Date(result.generatedAt) })
    .onConflictDoUpdate({
      target: screenerCache.id,
      set: { data: JSON.stringify(result), generatedAt: new Date(result.generatedAt) },
    })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const row = await readCache()
  if (!row) return NextResponse.json({ result: null })

  return NextResponse.json({ result: JSON.parse(row.data) as ScreenerResult })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Burst guard only — most clicks resolve from the DB cache below without
  // touching any external API, so this just stops raw request spam.
  const burstAllowed = await checkRateLimit(`screener-burst:${session.user.id}`, 10, 60 * 1000)
  if (!burstAllowed) {
    return NextResponse.json({ error: "You're scanning too quickly. Please wait a moment and try again." }, { status: 429 })
  }

  const cached = await readCache()
  const cachedResult = cached ? (JSON.parse(cached.data) as ScreenerResult) : null
  const cacheAgeMs = cached ? Date.now() - new Date(cached.generatedAt).getTime() : Infinity

  if (cacheAgeMs < REFRESH_MS && cachedResult) {
    return NextResponse.json({ result: cachedResult })
  }

  if (!process.env.OPENAI_API_KEY) {
    if (cachedResult) return NextResponse.json({ result: cachedResult })
    console.error("[/api/screener] OPENAI_API_KEY is not set")
    return NextResponse.json({ error: "The AI Screener is temporarily unavailable. Please try again later." }, { status: 503 })
  }

  // Shares the same monthly $ ceiling as Chart Analysis / chat — see lib/ai-budget.ts.
  if (await isBudgetExceeded()) {
    if (cachedResult) return NextResponse.json({ result: cachedResult })
    return NextResponse.json(
      { error: "The AI Screener is temporarily unavailable due to high demand. Please try again later." },
      { status: 503 },
    )
  }

  try {
    const [stocks, crypto] = await Promise.all([fetchStockMovers(), fetchCryptoMovers()])

    if (stocks.length === 0 && crypto.length === 0) {
      if (cachedResult) return NextResponse.json({ result: { ...cachedResult, stale: true } })
      return NextResponse.json({ error: "Market data is temporarily unavailable. Please try again shortly." }, { status: 503 })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      response_format: { type: "json_object" },
      // Same model as Chart Analysis — its hidden reasoning tokens draw from
      // this same budget before any visible output, so dropping this too far
      // below what a full 10-pick response needs (even a compact one, without
      // a thesis) starves it and comes back with empty content, not a smaller
      // valid response.
      max_completion_tokens: 1000,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: buildUserPrompt(stocks, crypto) },
      ],
    })

    const choice     = completion.choices[0]
    const raw        = choice?.message?.content
    const stopReason = choice?.finish_reason

    if (choice?.message?.refusal) throw new UserFacingError("The scan couldn't be completed. Please try again.")
    if (stopReason === "length")  throw new UserFacingError("The scan took too long to finish. Please try again.")
    if (!raw)                     throw new UserFacingError("The scan couldn't be completed. Please try again.")

    const parsed = JSON.parse(raw) as { picks?: unknown }
    if (!Array.isArray(parsed.picks)) throw new UserFacingError("The scan couldn't be completed. Please try again.")

    const bySymbol = new Map<string, MoverCandidate>([...stocks, ...crypto].map((c) => [c.symbol, c]))
    const stockSymbols = new Set(stocks.map((c) => c.symbol))

    const picked: ScreenerTicker[] = (parsed.picks as Record<string, unknown>[])
      .map((p): ScreenerTicker | null => {
        const symbol = String(p.symbol ?? "")
        const candidate = bySymbol.get(symbol)
        if (!candidate) return null // AI hallucinated a symbol we never gave it — drop it, never fabricate price data
        const direction = ["Bullish", "Bearish", "Watch"].includes(String(p.direction)) ? (p.direction as ScreenerTicker["direction"]) : "Watch"
        const potential = Math.max(0, Math.min(100, Number(p.potential) || 0))
        return {
          symbol,
          assetType: stockSymbols.has(symbol) ? "stock" : "crypto",
          price: candidate.price,
          changePercent: candidate.changePercent,
          direction,
          potential,
        }
      })
      .filter((t): t is ScreenerTicker => t !== null)

    // The UI always shows 5 crypto + 5 stocks side by side — if the AI came
    // back short on either side (non-compliance, or a duplicate pick), fill
    // the remainder from the next-highest real movers it wasn't given a slot
    // for, rather than showing an uneven or empty column.
    function fillTo(list: ScreenerTicker[], pool: MoverCandidate[], assetType: "stock" | "crypto", target = 5): ScreenerTicker[] {
      const used = new Set(list.map((t) => t.symbol))
      const result = [...list]
      for (const c of pool) {
        if (result.length >= target) break
        if (used.has(c.symbol)) continue
        used.add(c.symbol)
        result.push({
          symbol: c.symbol,
          assetType,
          price: c.price,
          changePercent: c.changePercent,
          direction: c.changePercent >= 0 ? "Bullish" : "Bearish",
          potential: Math.max(40, Math.min(95, Math.round(50 + Math.abs(c.changePercent) * 2))),
        })
      }
      return result.slice(0, target)
    }

    const stockPicks  = fillTo(picked.filter((t) => t.assetType === "stock"),  stocks, "stock")
    const cryptoPicks = fillTo(picked.filter((t) => t.assetType === "crypto"), crypto, "crypto")

    // Stock-quote verification (Twelve Data) can come back empty on a shared
    // per-minute rate limit even though this scan is otherwise perfectly
    // healthy (crypto's a separate provider, unaffected). Rather than wipe
    // the stocks column to "no data" for the next hour, carry the previous
    // scan's stocks forward — same "never blank on a failed refresh"
    // principle lib/market-data.ts already uses for the index ticker.
    const previousStocks = cachedResult?.tickers.filter((t) => t.assetType === "stock") ?? []
    const finalStockPicks = stockPicks.length > 0 ? stockPicks : previousStocks

    const tickers = [...cryptoPicks, ...finalStockPicks]

    if (tickers.length === 0) throw new UserFacingError("The scan couldn't find any picks right now. Please try again shortly.")

    const result: ScreenerResult = { tickers, generatedAt: new Date().toISOString(), stale: false }
    await writeCache(result)

    if (completion.usage) {
      await recordAiUsage("screener", completion.usage.prompt_tokens, completion.usage.completion_tokens)
    }

    return NextResponse.json({ result })

  } catch (err) {
    console.error("[/api/screener]", err)
    if (cachedResult) return NextResponse.json({ result: { ...cachedResult, stale: true } })

    const message =
      err instanceof OpenAI.APIError  ? "Our servers are busy right now. Please try again in a moment."
      : err instanceof UserFacingError ? err.message
      : "The scan couldn't be completed. Please try again."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
