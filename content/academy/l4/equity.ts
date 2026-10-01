import type { Candle } from "@/lib/academy/types"

// Account-balance charts for the Level 4 risk lessons. A fixed sequence of
// trade results (in R) is replayed at different risk sizes, so learners see
// the same trades, the same edge, and very different outcomes.

/** 50 trades: 20 winners of +2R, 30 losers of -1R (+0.2R per trade on average), with an 8-loss streak early on */
export const TRADES: number[] = [
  2, -1, 2, -1, -1, -1, -1, -1, -1, -1, -1, 2, -1, 2, 2, -1, -1, 2, -1, 2, -1, -1, 2, -1, 2,
  -1, 2, -1, -1, 2, 2, -1, -1, 2, -1, 2, -1, -1, 2, -1, 2, -1, 2, -1, -1, 2, 2, -1, -1, 2,
]

/** Balance after each trade, compounding `risk` (e.g. 0.01) of the current balance per R */
export function equityPath(start: number, risk: number, trades = TRADES): number[] {
  const out = [start]
  for (const r of trades) out.push(Number((out[out.length - 1] * (1 + risk * r)).toFixed(2)))
  return out
}

/** A balance series as flat candles, so TeachingChart can draw it as a line */
export function equityCandles(values: number[]): Candle[] {
  return values.map((v, i) => {
    const prev = i === 0 ? v : values[i - 1]
    return [prev, Math.max(prev, v), Math.min(prev, v), v]
  })
}

/** Deepest peak-to-trough fall of a balance series, as a fraction */
export function maxDrawdown(values: number[]): number {
  let peak = values[0]
  let worst = 0
  for (const v of values) {
    peak = Math.max(peak, v)
    worst = Math.max(worst, (peak - v) / peak)
  }
  return worst
}
