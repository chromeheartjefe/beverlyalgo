import { eq } from "drizzle-orm"

import { db } from "@/db"
import { indexTickerCache } from "@/db/schema"
import { checkRateLimit } from "@/lib/rate-limit"
import { BINANCE_DATA_API } from "@/lib/screener-data"
import { fetchQuotes } from "@/lib/twelve-data"

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
// Data: SPY/QQQ track the indices near 1:1 and TLT (20+yr Treasury ETF)
// moves inversely to long-term yields. The dollar is read from EUR/USD.
const INDEX_LABELS: Record<string, string> = {
  "SPY":     "S&P 500",
  "QQQ":     "Nasdaq 100",
  "GBP/USD": "GBP/USD",
  "TLT":     "TLT",
}

// Gold and EUR/USD come from Binance's free, unlimited feed instead of
// Twelve Data credits: PAXG is a token backed 1:1 by an ounce of gold and
// tracks spot closely, EURUSDT is a deep EUR market against the dollar
// stablecoin. GBP/USD stays on Twelve Data: Binance's GBPUSDT is too thin.
const BINANCE_PROXY_LABELS: Record<string, string> = {
  PAXGUSDT: "Gold",
  EURUSDT:  "EUR/USD",
}

// Display order of the non-crypto part of the ticker (and the bot's snapshot)
const NON_CRYPTO_ORDER = ["S&P 500", "Nasdaq 100", "EUR/USD", "GBP/USD", "Gold", "TLT"]

// Market sessions, in New York time. Holidays aren't modelled: on a US
// holiday the ETFs just refresh to an unchanged price a few times.
type Session = "us-stocks" | "fx"
const SESSION: Record<string, Session> = {
  "SPY":     "us-stocks",
  "QQQ":     "us-stocks",
  "TLT":     "us-stocks",
  "GBP/USD": "fx",
}

function newYorkNow(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23",
  }).formatToParts(new Date())
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"))
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) }
}

function isOpen(session: Session): boolean {
  const { day, minutes } = newYorkNow()
  if (session === "us-stocks") {
    // 9:30 to 16:00 plus 10 minutes, so the closing price is picked up
    return day >= 1 && day <= 5 && minutes >= 9 * 60 + 30 && minutes <= 16 * 60 + 10
  }
  // Forex week: Sunday 17:00 to Friday 17:00 (plus 10 minutes for the close)
  if (day === 6) return false
  if (day === 0) return minutes >= 17 * 60
  if (day === 5) return minutes <= 17 * 60 + 10
  return true
}

// Extra context appended only when building the chatbot's prompt snapshot —
// kept out of the ticker's short display labels so the marquee stays compact.
const PROMPT_NOTES: Record<string, string> = {
  "S&P 500":   "tracked via SPY ETF",
  "Gold":      "spot gold, tracked via PAXG gold-backed token",
  "Nasdaq 100": "tracked via QQQ ETF",
  // UUP (dollar index ETF) was dropped to save Twelve Data credits; EUR is
  // ~58% of the dollar index, so EUR/USD carries the dollar read instead
  "EUR/USD":   "inverse dollar gauge, EUR is ~58% of the US Dollar Index, EUR/USD down means the dollar is strengthening",
  "TLT":       "20yr+ Treasury ETF, moves inversely to long-term yields — TLT up means yields falling, TLT down means yields rising",
}

// Twelve Data's free tier: 800 credits/day and 8/minute, 1 credit PER SYMBOL,
// shared with AI Screener on the same key (all calls go through
// lib/twelve-data.ts). The cache lives in the DB (indexTickerCache) so the
// refresh interval holds across every instance and restart, and a failed
// call falls back to the last cached prices instead of blanking the ticker.
//
// Refreshing all 7 symbols every 10 minutes around the clock was 1,008
// credits/day, over the daily cap on its own. So each group only refreshes
// while its market is open (see isOpen below); outside that the last prices
// stay on the ticker, which is what they are anyway.
const INDEX_REFRESH_MS = 10 * 60 * 1000
// At most one refresh attempt per minute across all instances (see fetchIndices)
const REFRESH_LOCK_MS = 60 * 1000

let cachedBinance: { crypto: TickerItem[]; proxies: TickerItem[] } = { crypto: [], proxies: [] }

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

// One Binance call for the crypto ticker plus the gold/EUR proxies
async function fetchBinance(): Promise<{ crypto: TickerItem[]; proxies: TickerItem[] }> {
  try {
    const symbols = encodeURIComponent(JSON.stringify([...Object.keys(CRYPTO_LABELS), ...Object.keys(BINANCE_PROXY_LABELS)]))
    // Market-data host, not api.binance.com (blocked for US servers, see lib/screener-data.ts)
    const res = await fetch(`${BINANCE_DATA_API}/api/v3/ticker/24hr?symbols=${symbols}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      console.error("[market-data] Binance ticker failed:", res.status)
      return cachedBinance
    }
    const data: { symbol: string; lastPrice: string; priceChangePercent: string }[] = await res.json()
    const toItem = (d: (typeof data)[number], label: string): TickerItem => ({
      label,
      price:         parseFloat(d.lastPrice),
      changePercent: parseFloat(d.priceChangePercent),
    })
    cachedBinance = {
      crypto:  data.filter((d) => CRYPTO_LABELS[d.symbol]).map((d) => toItem(d, CRYPTO_LABELS[d.symbol])),
      proxies: data.filter((d) => BINANCE_PROXY_LABELS[d.symbol]).map((d) => toItem(d, BINANCE_PROXY_LABELS[d.symbol])),
    }
    return cachedBinance
  } catch {
    return cachedBinance
  }
}

async function fetchIndices(): Promise<TickerItem[]> {
  const apiKey = process.env.TWELVE_DATA_API_KEY
  if (!apiKey) return []

  const cached     = await readIndexCache()
  // Filtered to the current symbol set: older cache rows can still hold
  // entries that moved to Binance (Gold, EUR/USD)
  const known = new Set(Object.values(INDEX_LABELS))
  const cachedData: TickerItem[] = cached ? (JSON.parse(cached.data) as TickerItem[]).filter((i) => known.has(i.label)) : []
  const cacheIsFresh = cached ? Date.now() - new Date(cached.generatedAt).getTime() < INDEX_REFRESH_MS : false
  if (cacheIsFresh) return cachedData

  // Only symbols whose market is open, plus any we have no price for yet
  // (e.g. a fresh cache on a weekend) so the ticker is never missing one
  const have = new Set(cachedData.map((item) => item.label))
  const symbols = Object.keys(INDEX_LABELS).filter((sym) => isOpen(SESSION[sym]) || !have.has(INDEX_LABELS[sym]))
  if (symbols.length === 0) return cachedData

  // Single refresher: every open dashboard polls this once a minute, so when
  // the cache expired, all of them used to call Twelve Data at once (7
  // credits each against an 8-credit/minute cap). Only the request that wins
  // this lock refreshes; everyone else keeps getting the cached prices.
  if (!(await checkRateLimit("twelvedata:ticker-refresh", 1, REFRESH_LOCK_MS))) return cachedData

  try {
    // null = rate-limited, failed or backing off (lib/twelve-data.ts)
    const data = await fetchQuotes(symbols)
    if (!data) return cachedData

    const fresh = symbols
      .map((sym) => {
        const q = data[sym]
        const price = parseFloat(q?.close ?? "")
        const changePercent = parseFloat(q?.percent_change ?? "")
        // Per-symbol errors inside a batch come back as { status: "error" }
        if (q?.status === "error" || !Number.isFinite(price) || !Number.isFinite(changePercent)) return null
        return { label: INDEX_LABELS[sym], price, changePercent }
      })
      .filter((item): item is TickerItem => item !== null)

    if (fresh.length === 0) return cachedData

    // Fresh quotes replace their cached entries; closed markets keep theirs
    const byLabel = new Map(cachedData.map((item) => [item.label, item]))
    for (const item of fresh) byLabel.set(item.label, item)
    const next = Object.values(INDEX_LABELS)
      .map((label) => byLabel.get(label))
      .filter((item): item is TickerItem => item !== undefined)

    await writeIndexCache(next)
    return next
  } catch {
    return cachedData
  }
}

export async function getMarketSnapshot(): Promise<TickerItem[]> {
  const [binance, indices] = await Promise.all([fetchBinance(), fetchIndices()])
  const rank = (label: string) => NON_CRYPTO_ORDER.indexOf(label)
  const nonCrypto = [...binance.proxies, ...indices].sort((a, b) => rank(a.label) - rank(b.label))
  return [...binance.crypto, ...nonCrypto]
}

export function formatSnapshotForPrompt(items: TickerItem[]): string {
  if (items.length === 0) return "No live market data available right now."
  const lines = items.map((i) => {
    const note = PROMPT_NOTES[i.label] ? ` [${PROMPT_NOTES[i.label]}]` : ""
    return `${i.label}: ${i.price} (${i.changePercent >= 0 ? "+" : ""}${i.changePercent.toFixed(2)}% 24h)${note}`
  })
  return lines.join("\n")
}
