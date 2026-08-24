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

// Twelve Data's free tier caps out at 800 calls/day and 8/min, shared across
// every visitor on the site (and every chatbot message, which also reads
// this same cache). This module-level cache is the gate that keeps us far
// under that regardless of traffic: at most one upstream call every
// INDEX_REFRESH_MS across ALL concurrent requests hitting this server
// instance, plus a hard daily call-count budget as a second safety net, plus
// a last-known-good fallback so a rate-limited/failed call never blanks the
// data — it just keeps the last real price until the next refresh succeeds.
// (Caveat: on serverless, this state is per warm instance and resets on cold
// start — not a perfectly global counter — but combined with the 10-minute
// refresh window and the daily budget, it keeps real-world usage a small
// fraction of the free-tier limit even at high traffic.)
const INDEX_REFRESH_MS   = 10 * 60 * 1000 // 10 min -> max 144 calls/day per warm instance
const INDEX_DAILY_BUDGET = 200            // hard stop well under the 800/day free-tier cap

let cachedIndices: TickerItem[] = []
let lastIndexFetchAt = 0
let indexCallsToday = 0
let indexCallDay = ""

let cachedCrypto: TickerItem[] = []

function todayKey() {
  return new Date().toISOString().slice(0, 10)
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
  if (!apiKey) return cachedIndices

  const day = todayKey()
  if (day !== indexCallDay) {
    indexCallDay = day
    indexCallsToday = 0
  }

  const cacheIsFresh   = Date.now() - lastIndexFetchAt < INDEX_REFRESH_MS
  const budgetExceeded = indexCallsToday >= INDEX_DAILY_BUDGET
  if (cacheIsFresh || budgetExceeded) return cachedIndices

  indexCallsToday += 1
  lastIndexFetchAt = Date.now()

  try {
    const symbols = Object.keys(INDEX_LABELS)
    const res = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbols.join(","))}&apikey=${apiKey}`,
      { cache: "no-store" }
    )
    if (!res.ok) return cachedIndices
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

    if (next.length > 0) cachedIndices = next
    return cachedIndices
  } catch {
    return cachedIndices
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
