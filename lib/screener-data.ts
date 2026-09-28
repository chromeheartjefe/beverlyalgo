import { fetchQuotes } from "@/lib/twelve-data"

export type MoverCandidate = {
  symbol:         string
  name?:          string
  price:          number
  changePercent:  number
  volume:         number // quote volume (crypto) or share volume (stocks) — same-unit comparisons only happen within one asset class
}

// A fixed universe of liquid USDT pairs, same idea as lib/market-data.ts's
// CRYPTO_LABELS — Binance has no free "top movers" endpoint, so movers are
// computed client-side from one batched 24hr-ticker call over this list
// rather than polling per-symbol. Kept separate from market-data.ts's list
// (this one is wider, since screening for movers benefits from more
// candidates than the ticker marquee needs).
const CRYPTO_UNIVERSE = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT", "ADAUSDT", "DOGEUSDT",
  "DOTUSDT", "AVAXUSDT", "LINKUSDT", "LTCUSDT", "TRXUSDT", "ATOMUSDT", "UNIUSDT",
  "NEARUSDT", "SUIUSDT", "ARBUSDT", "APTUSDT", "OPUSDT", "INJUSDT", "TIAUSDT",
  "RUNEUSDT", "FILUSDT", "IMXUSDT", "STXUSDT", "SEIUSDT", "RNDRUSDT", "PEPEUSDT",
  "WIFUSDT", "SHIBUSDT",
]

// Below this 24h quote volume (in USDT), a big % move is more likely a thin
// order book or a listing quirk than a real, tradeable "hot" mover.
const MIN_CRYPTO_QUOTE_VOLUME = 5_000_000

// Binance's public market-data host. api.binance.com refuses requests from
// US IP addresses (HTTP 451), and Vercel runs our functions in the US, so on
// the live site every crypto request failed and the Screener showed 0 crypto
// picks. data-api.binance.vision serves the same market data without that
// block. Also used by lib/market-data.ts.
export const BINANCE_DATA_API = "https://data-api.binance.vision"

export async function fetchCryptoMovers(limit = 15): Promise<MoverCandidate[]> {
  try {
    const symbols = encodeURIComponent(JSON.stringify(CRYPTO_UNIVERSE))
    const res = await fetch(`${BINANCE_DATA_API}/api/v3/ticker/24hr?symbols=${symbols}`, {
      next: { revalidate: 0 },
    })
    if (!res.ok) {
      console.error("[screener] Binance crypto movers failed:", res.status, (await res.text()).slice(0, 200))
      return []
    }

    const data: { symbol: string; lastPrice: string; priceChangePercent: string; quoteVolume: string }[] = await res.json()

    return data
      .map((d) => ({
        symbol:        d.symbol.replace(/USDT$/, ""),
        price:         parseFloat(d.lastPrice),
        changePercent: parseFloat(d.priceChangePercent),
        volume:        parseFloat(d.quoteVolume),
      }))
      .filter((c) => Number.isFinite(c.changePercent) && c.volume >= MIN_CRYPTO_QUOTE_VOLUME)
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, limit)
  } catch (err) {
    console.error("[screener] Binance crypto movers failed:", err)
    return []
  }
}

type AlphaVantageMover = { ticker: string; price: string; change_percentage: string; volume: string }


// Twelve Data's batch /quote charges 1 credit per symbol, not per HTTP call
// (confirmed live: a 30-symbol batch returned a 429 for exceeding the
// free-tier's 8-credits/minute cap in one shot, dropping the whole scan).
// Capping the refreshed pool at this keeps one scan's worth of quotes inside
// a single minute's budget, shared with lib/market-data.ts's index ticker on
// the same key.
const MAX_LIVE_QUOTE_SYMBOLS = 8

// Alpha Vantage's free-tier TOP_GAINERS_LOSERS is not intraday-live — it
// lags by up to a full trading session (real-time/15-min-delayed US equity
// data is a paid add-on there), so a stock can show yesterday's close and a
// stale % move that's already fully reversed by the time this runs. Twelve
// Data's /quote (already keyed for the dashboard's index ticker in
// lib/market-data.ts) gives a genuinely current price + change for the same
// symbols, so it's used here to overwrite AV's numbers before anything is
// shown — AV only decides WHICH tickers are worth checking, never what
// price/% is displayed for them.
async function refreshWithLiveQuotes(candidates: MoverCandidate[]): Promise<MoverCandidate[]> {
  if (candidates.length === 0) return []

  const capped  = candidates.slice(0, MAX_LIVE_QUOTE_SYMBOLS)
  const symbols = capped.map((c) => c.symbol)

  try {
    // Shared gateway: credit budget, backoff, response normalized to keyed
    // shape. null = skipped or failed; the route then carries forward the
    // previous scan's stocks.
    const bySymbol = await fetchQuotes(symbols)
    if (!bySymbol) return []

    return capped
      .map((c): MoverCandidate | null => {
        const q = bySymbol[c.symbol]
        const price = parseFloat(q?.close ?? "")
        const changePercent = parseFloat(q?.percent_change ?? "")
        // No quote, an error status, or unparseable fields — drop the
        // candidate rather than fall back to AV's unverified number.
        if (!q || q.status === "error" || !Number.isFinite(price) || !Number.isFinite(changePercent)) return null
        const volume = parseFloat(q.volume ?? "")
        return { symbol: c.symbol, price, changePercent, volume: Number.isFinite(volume) ? volume : c.volume }
      })
      .filter((c): c is MoverCandidate => c !== null)
  } catch {
    return []
  }
}

// Alpha Vantage's TOP_GAINERS_LOSERS is purpose-built for narrowing the
// whole US market down to a candidate list — a free key covers it. Its free
// tier caps at 25 requests/day, which is why the route above this only
// calls it once per hour (≤24/day) via the DB-backed cache in
// app/api/screener/route.ts, not on every page load.
export async function fetchStockMovers(limit = 15): Promise<MoverCandidate[]> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY
  if (!apiKey) return []

  try {
    const res = await fetch(
      `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${apiKey}`,
      { cache: "no-store" },
    )
    if (!res.ok) return []
    const data = await res.json()

    // Rate-limited/invalid-key responses come back as HTTP 200 with a
    // "Note" or "Information" field instead of the real payload — treat
    // those the same as a failed call rather than crashing on `.map`.
    const gainers: AlphaVantageMover[] = Array.isArray(data.top_gainers) ? data.top_gainers : []
    const active:  AlphaVantageMover[] = Array.isArray(data.most_actively_traded) ? data.most_actively_traded : []

    // Actively-traded names first: they're large/liquid tickers almost always
    // covered by Twelve Data's quote lookup, whereas AV's raw top_gainers list
    // is dominated by illiquid penny stocks and warrants (…W/…R tickers) that
    // both rarely have live-quote coverage and aren't realistically tradeable
    // "hot right now" picks anyway. Since only the first MAX_LIVE_QUOTE_SYMBOLS
    // get verified below, this ordering matters.
    const seen = new Map<string, MoverCandidate>()
    for (const m of [...active, ...gainers]) {
      if (seen.has(m.ticker)) continue
      const changePercent = parseFloat(String(m.change_percentage).replace("%", ""))
      const price  = parseFloat(m.price)
      const volume = parseFloat(m.volume)
      if (!Number.isFinite(changePercent) || !Number.isFinite(price)) continue
      seen.set(m.ticker, { symbol: m.ticker, price, changePercent, volume: Number.isFinite(volume) ? volume : 0 })
    }

    // Re-ranked by TODAY's real move after the live-quote refresh below, so
    // the whole discovered pool is passed through rather than pre-slicing
    // to `limit` by AV's own (potentially stale) ordering first.
    const refreshed = await refreshWithLiveQuotes(Array.from(seen.values()))

    return refreshed
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, limit)
  } catch {
    return []
  }
}
