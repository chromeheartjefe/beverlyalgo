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

/** Body top and bottom of a candle */
export const body = (c: Candle) => ({ top: Math.max(c[0], c[3]), bottom: Math.min(c[0], c[3]) })

export const isUp = (c: Candle) => c[3] > c[0]
export const isDown = (c: Candle) => c[3] < c[0]

/** First index after `from` where the candle closes above (dir "up") or below `level` */
export function firstCloseBeyond(candles: Candle[], from: number, level: number, dir: "up" | "down"): number {
  return candles.findIndex((c, i) => i > from && (dir === "up" ? c[3] > level : c[3] < level))
}

/** First index after `from` whose wick reaches `level` */
export function firstTouch(candles: Candle[], from: number, level: number, side: "above" | "below"): number {
  return candles.findIndex((c, i) => i > from && (side === "below" ? c[2] <= level : c[1] >= level))
}

/** Set one candle to an exact shape (keeps neighbouring opens consistent where possible) */
export function setCandle(candles: Candle[], index: number, c: Candle): Candle[] {
  return candles.map((k, i) => (i === index ? c : k))
}
