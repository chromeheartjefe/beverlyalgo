import { eq } from "drizzle-orm"

import { db } from "@/db"
import { indexTickerCache } from "@/db/schema"

export type TickerItem = { label: string; price: number; changePercent: number }

const CRYPTO_LABELS: Record<string, string> = {
  BTCUSDT:  "BTC",
  ETHUSDT:  "ETH",
  BNBUSDT:  "BNB",
  SOLUSDT:  "SOL",
  XRPUSDT:  "XRP",
  ADAUSDT:  "ADA",
  DOGEUSDT: "DOGE",
  DOTUSDT:  "DOT",
  AVAXUSDT: "AVAX",
  LINKUSDT: "LINK",
  LTCUSDT:  "LTC",
  TRXUSDT:  "TRX",
  ATOMUSDT: "ATOM",
  UNIUSDT:  "UNI",
  NEARUSDT: "NEAR",
  SUIUSDT:  "SUI",
  ARBUSDT:  "ARB",
}

// Real index/rate data (^GSPC, ^IXIC, DXY, 10Y yield) isn't free anywhere —
// exchanges license it. These are the closest free-tier proxies on Twelve
// Data: SPY/QQQ track the indices near 1:1, UUP tracks the dollar index,
// and TLT (20+yr Treasury ETF) moves inversely to long-term yields.
const INDEX_LABELS: Record<string, string> = {
  "SPY":     "S&P 500",
  "QQQ":     "Nasdaq 100",
  "EUR/USD": "EUR/USD",
  "GBP/USD": "GBP/USD",
  "XAU/USD": "Gold",
  "UUP":     "DXY proxy",
  "TLT":     "TLT",
}

// Extra context appended only when building the chatbot's prompt snapshot —
// kept out of the ticker's short display labels so the marquee stays compact.
const PROMPT_NOTES: Record<string, string> = {
  "S&P 500":   "tracked via SPY ETF",
  "Nasdaq 100": "tracked via QQQ ETF",
  "DXY proxy": "US Dollar Index, tracked via UUP ETF",
  "TLT":       "20yr+ Treasury ETF, moves inversely to long-term yields — TLT up means yields falling, TLT down means yields rising",
}

// Twelve Data's free tier caps out at 800 calls/day and 8 credits/minute,
// shared with AI Screener's stock-quote verification (lib/screener-data.ts)
// on the same key — a same-minute collision between the two can blow the
// per-minute cap on its own. This cache used to be a module-level variable,
// which reset on every dev-server restart or serverless cold start and
// fired an immediate fresh call each time — exactly the kind of unintended
// extra call that risks colliding with a screener scan. DB-backed via
// db/schema.ts's indexTickerCache instead: the "once per 10 minutes" gate
// now actually holds across every instance/restart (≤144 calls/day, well
// under the 800/day cap on its own, so the old separate daily-budget
// counter is redundant and dropped), and a rate-limited/failed call falls
// back to the last cached row rather than blanking the data.
const INDEX_REFRESH_MS = 10 * 60 * 1000

let cachedCrypto: TickerItem[] = []

async function readIndexCache() {
  try {
    const [row] = await db.select().from(indexTickerCache).where(eq(indexTickerCache.id, "singleton"))
    return row ?? null
  } catch {
    return null
  }
}

async function writeIndexCache(data: TickerItem[]) {
  try {
    await db
      .insert(indexTickerCache)
      .values({ id: "singleton", data: JSON.stringify(data), generatedAt: new Date() })
      .onConflictDoUpdate({
        target: indexTickerCache.id,
        set: { data: JSON.stringify(data), generatedAt: new Date() },
      })
  } catch {
    // Best-effort — a failed write just means the next request re-checks staleness itself.
  }
}

async function fetchCrypto(): Promise<TickerItem[]> {
  try {
    const symbols = encodeURIComponent(JSON.stringify(Object.keys(CRYPTO_LABELS)))
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${symbols}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return cachedCrypto
    const data: { symbol: string; lastPrice: string; priceChangePercent: string }[] = await res.json()
    cachedCrypto = data.map((d) => ({
      label:         CRYPTO_LABELS[d.symbol] ?? d.symbol,
      price:         parseFloat(d.lastPrice),
      changePercent: parseFloat(d.priceChangePercent),
    }))
    return cachedCrypto
  } catch {
    return cachedCrypto
  }
}

async function fetchIndices(): Promise<TickerItem[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) return []

  const cached     = await readIndexCache()
  const cachedData: TickerItem[] = cached ? JSON.parse(cached.data) : []
  const cacheIsFresh = cached ? Date.now() - new Date(cached.generatedAt).getTime() < INDEX_REFRESH_MS : false
  if (cacheIsFresh) return cachedData

  try {
    const symbols = Object.keys(INDEX_LABELS)
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`,
      { cache: "no-store" }
    )
    if (!res.ok) return cachedData
    const data = await res.json()

    const next = symbols
      .map((sym) => {
        const q = data[sym]
        if (!q?.close) return null
        return {
          label:         INDEX_LABELS[sym],
          price:         parseFloat(q.close),
          changePercent: parseFloat(q.percent_change),
        }
      })
      .filter((item): item is TickerItem => item !== null)

    if (next.length === 0) return cachedData

    await writeIndexCache(next)
    return next
  } catch {
    return cachedData
  }
}

export async function getMarketSnapshot(): Promise<TickerItem[]> {
  const [crypto, indices] = await Promise.all([fetchCrypto(), fetchIndices()])
  return [...crypto, ...indices]
}

export function formatSnapshotForPrompt(items: TickerItem[]): string {
  if (items.length === 0) return "No live market data available right now."
  const lines = items.map((i) => {
    const note = PROMPT_NOTES[i.label] ? ` [${PROMPT_NOTES[i.label]}]` : ""
    return `${i.label}: ${i.price} (${i.changePercent >= 0 ? "+" : ""}${i.changePercent.toFixed(2)}% 24h)${note}`
  })
  return lines.join("\n")
}
