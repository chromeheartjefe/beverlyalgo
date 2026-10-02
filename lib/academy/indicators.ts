import type { Candle } from "@/lib/academy/types"

// Standard indicator formulas for lesson charts, computed from the lesson's
// own candles so every line on screen is the real calculation. Values are
// null until an indicator has enough candles to start.

type Out = (number | null)[]

const closesOf = (candles: Candle[]) => candles.map((c) => c[3])

const round = (v: number | null, d = 4) => (v === null ? null : Number(v.toFixed(d)))

/** Simple moving average */
export function sma(values: number[], period: number): Out {
  return values.map((_, i) => {
    if (i < period - 1) return null
    let sum = 0
    for (let k = i - period + 1; k <= i; k++) sum += values[k]
    return round(sum / period)
  })
}

/** Exponential moving average, seeded with the SMA of the first `period` values */
export function ema(values: number[], period: number): Out {
  const out: Out = []
  const k = 2 / (period + 1)
  let prev: number | null = null
  values.forEach((v, i) => {
    if (i < period - 1) return out.push(null)
    if (prev === null) {
      let sum = 0
      for (let j = 0; j < period; j++) sum += values[j]
      prev = sum / period
    } else {
      prev = v * k + prev * (1 - k)
    }
    out.push(round(prev))
  })
  return out
}

/** Wilder's RSI */
export function rsi(candles: Candle[], period = 14): Out {
  const closes = closesOf(candles)
  const out: Out = closes.map(() => null)
  let avgGain = 0
  let avgLoss = 0
  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1]
    const gain = Math.max(change, 0)
    const loss = Math.max(-change, 0)
    if (i <= period) {
      avgGain += gain / period
      avgLoss += loss / period
      if (i < period) continue
    } else {
      avgGain = (avgGain * (period - 1) + gain) / period
      avgLoss = (avgLoss * (period - 1) + loss) / period
    }
    out[i] = round(avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss), 2)
  }
  return out
}

/** MACD line (fast EMA − slow EMA), signal line (EMA of MACD) and histogram */
export function macd(candles: Candle[], fast = 12, slow = 26, signalPeriod = 9) {
  const closes = closesOf(candles)
  const f = ema(closes, fast)
  const s = ema(closes, slow)
  const line: Out = closes.map((_, i) => (f[i] === null || s[i] === null ? null : round(f[i]! - s[i]!)))
  const start = line.findIndex((v) => v !== null)
  const signalPart = start < 0 ? [] : ema(line.slice(start) as number[], signalPeriod)
  const signal: Out = line.map((_, i) => (start < 0 || i < start ? null : signalPart[i - start]))
  const histogram: Out = line.map((v, i) => (v === null || signal[i] === null ? null : round(v - signal[i]!)))
  return { line, signal, histogram }
}

/** Bollinger Bands: SMA ± k standard deviations (population) */
export function bollinger(candles: Candle[], period = 20, k = 2) {
  const closes = closesOf(candles)
  const mid = sma(closes, period)
  const upper: Out = []
  const lower: Out = []
  closes.forEach((_, i) => {
    if (mid[i] === null) {
      upper.push(null)
      lower.push(null)
      return
    }
    let sq = 0
    for (let j = i - period + 1; j <= i; j++) sq += (closes[j] - mid[i]!) ** 2
    const sd = Math.sqrt(sq / period)
    upper.push(round(mid[i]! + k * sd))
    lower.push(round(mid[i]! - k * sd))
  })
  return { mid, upper, lower }
}

/** True range of candle i */
function trueRange(candles: Candle[], i: number): number {
  const [, h, l] = candles[i]
  if (i === 0) return h - l
  const prevClose = candles[i - 1][3]
  return Math.max(h - l, Math.abs(h - prevClose), Math.abs(l - prevClose))
}

/** Wilder's Average True Range */
export function atr(candles: Candle[], period = 14): Out {
  const out: Out = []
  let prev: number | null = null
  candles.forEach((_, i) => {
    const tr = trueRange(candles, i)
    if (i < period - 1) return out.push(null)
    if (prev === null) {
      let sum = 0
      for (let j = 0; j < period; j++) sum += trueRange(candles, j)
      prev = sum / period
    } else {
      prev = (prev * (period - 1) + tr) / period
    }
    out.push(round(prev))
  })
  return out
}

/** VWAP from the first candle: cumulative (typical price × volume) ÷ cumulative volume */
export function vwap(candles: Candle[], volumes: number[]): Out {
  let pv = 0
  let vol = 0
  return candles.map(([, h, l, c], i) => {
    const typical = (h + l + c) / 3
    pv += typical * volumes[i]
    vol += volumes[i]
    return round(vol ? pv / vol : null)
  })
}

export const closes = closesOf
