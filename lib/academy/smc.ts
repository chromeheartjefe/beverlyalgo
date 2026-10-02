import type { Candle } from "@/lib/academy/types"

// Smart Money helpers for lesson charts and the lesson validator. Lessons use
// them to find the real fair value gaps in their own candles instead of
// guessing, so every FVG drawn or asked about actually exists.

export interface Fvg {
  /** The middle candle of the three */
  index: number
  dir: "bull" | "bear"
  top: number
  bottom: number
}

/**
 * Three-candle fair value gaps. Bullish: candle 3's low is above candle 1's
 * high. Bearish: candle 3's high is below candle 1's low. The gap is the
 * space between them.
 */
export function findFvgs(candles: Candle[], minSize = 0): Fvg[] {
  const out: Fvg[] = []
  for (let i = 1; i + 1 < candles.length; i++) {
    const a = candles[i - 1]
    const c = candles[i + 1]
    if (c[2] - a[1] > minSize) out.push({ index: i, dir: "bull", top: c[2], bottom: a[1] })
    if (a[2] - c[1] > minSize) out.push({ index: i, dir: "bear", top: a[2], bottom: c[1] })
  }
  return out
}

/** Midpoint of a range: ICT's consequent encroachment of a gap */
export const midpoint = (top: number, bottom: number) => Number(((top + bottom) / 2).toFixed(4))

export const isDown = (c: Candle) => c[3] < c[0]
