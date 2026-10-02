import type { Candle } from "@/lib/academy/types"

// Hand-written candles shared by the Level 3 (Smart Money / ICT) lessons.
// Every candle is deliberate, so lessons can point at the sweep, the
// displacement, the FVG and the order block by index. The lesson validator
// (.academy/check-lessons.ts) re-derives each of these facts from the data.

/**
 * The classic bullish reversal: a downtrend builds equal lows (sell-side
 * liquidity), candle 15 sweeps them and closes back above, candle 16
 * displaces up and closes above the last lower high (MSS), leaving a bullish
 * FVG between candle 15's high and candle 17's low. Price retraces into that
 * FVG at candle 20 and then runs to the old high (buy-side liquidity).
 */
export const REVERSAL: Candle[] = [
  [106.2, 106.45, 105.8, 105.9], // 0  old high: buy-side liquidity
  [105.9, 106.0, 105.2, 105.35],
  [105.35, 105.8, 105.2, 105.7],
  [105.7, 105.75, 104.7, 104.8],
  [104.8, 104.9, 104.05, 104.2],
  [104.2, 104.75, 104.1, 104.6],
  [104.6, 104.65, 103.5, 103.6], // 6  leaves a bearish FVG (5's low > 7's high)
  [103.6, 103.7, 102.8, 102.95], // 7  equal low 1
  [102.95, 103.55, 102.9, 103.45],
  [103.45, 104.0, 103.35, 103.9], // 9  lower high
  [103.9, 103.95, 103.2, 103.3],
  [103.3, 103.35, 102.82, 102.95], // 11 equal low 2
  [102.95, 103.45, 102.9, 103.4],
  [103.4, 103.75, 103.3, 103.6], // 13 last lower high
  [103.6, 103.65, 103.0, 103.1],
  [103.1, 103.2, 102.35, 103.0], // 15 sweep of the equal lows, last down candle: order block
  [103.0, 104.5, 102.95, 104.4], // 16 displacement, closes above 13's high: MSS
  [104.4, 105.0, 104.1, 104.9], // 17 its low leaves the FVG above 15's high
  [104.9, 105.3, 104.45, 105.1], // 18 swing high of the new leg
  [105.1, 105.15, 104.5, 104.6],
  [104.6, 104.7, 103.65, 103.9], // 20 retrace into the FVG, to its midpoint
  [103.9, 104.6, 103.8, 104.5],
  [104.5, 105.5, 104.4, 105.4],
  [105.4, 106.6, 105.3, 106.1], // 23 runs the old high
  [106.1, 106.3, 105.7, 105.85],
]

export const R = {
  oldHigh: 0,
  bearFvg: 6,
  eql1: 7,
  eql2: 11,
  lastLowerHigh: 13,
  sweep: 15,
  orderBlock: 15,
  displacement: 16,
  fvg: 16,
  legHigh: 18,
  retrace: 20,
  target: 23,
} as const

/** Same story, but the retrace goes deeper: into the OTE zone and the order block's top */
export const REVERSAL_DEEP: Candle[] = REVERSAL.map((c, i) => {
  if (i === 19) return [105.1, 105.15, 104.25, 104.3]
  if (i === 20) return [104.3, 104.4, 103.05, 103.5]
  if (i === 21) return [103.5, 104.3, 103.4, 104.2]
  if (i === 22) return [104.2, 105.5, 104.1, 105.4]
  return c
})

/** The other market for SMT divergence: same day, but it never sweeps its equal lows */
export const REVERSAL_NO_SWEEP: Candle[] = REVERSAL.map((c, i) => (i === 15 ? [103.1, 103.2, 102.98, 103.05] : c))

/** Mirror candles around a price, turning a bullish story into a bearish one */
function mirror(candles: Candle[], axis: number): Candle[] {
  const m = (p: number) => Number((2 * axis - p).toFixed(2))
  return candles.map(([o, h, l, c]) => [m(o), m(l), m(h), m(c)])
}

/** The bearish version of REVERSAL: equal highs swept, then the drop */
export const REVERSAL_BEAR = mirror(REVERSAL, 104)

/**
 * A breaker: a rally to a swing high (candle 4 is the last up candle before
 * the drop, a bearish order block), a drop that sweeps the old low at 1,
 * then a displacement up through the swing high that breaks the bearish order
 * block. The failed block flips into a bullish breaker; price retests it at
 * 13. Candle 10 also leaves a bullish FVG over the breaker: a unicorn.
 */
export const BREAKER: Candle[] = [
  [100.0, 100.4, 99.3, 99.5],
  [99.5, 99.7, 98.8, 99.0], // 1  old low
  [99.0, 100.0, 98.95, 99.9],
  [99.9, 100.9, 99.8, 100.8],
  [100.8, 101.6, 100.7, 101.5], // 4  last up candle before the drop: bearish order block
  [101.5, 101.7, 100.6, 100.7], // 5  swing high
  [100.7, 100.8, 99.8, 99.9],
  [99.9, 100.1, 99.0, 99.2],
  [99.2, 99.3, 98.4, 98.9], // 8  sweeps the old low
  [98.9, 100.2, 98.85, 100.1],
  [100.1, 101.9, 100.0, 101.8], // 10 closes above the swing high, through the order block
  [101.8, 102.4, 101.6, 102.3],
  [102.3, 102.35, 101.5, 101.6],
  [101.6, 101.7, 100.9, 101.2], // 13 retest of the breaker
  [101.2, 102.2, 101.1, 102.1],
  [102.1, 103.0, 102.0, 102.9],
  [102.9, 103.6, 102.7, 103.4],
]

export const B = { oldLow: 1, orderBlock: 4, swingHigh: 5, sweep: 8, mss: 10, fvg: 10, retest: 13 } as const

/**
 * One trading day in hourly candles, from 6 pm New York (index 0) to 4 pm.
 * Quiet Asian range, a London drop below the Asian low and the midnight open
 * (the Judas swing), then the New York expansion higher.
 */
export const DAY: Candle[] = [
  [100.2, 100.35, 100.05, 100.25], // 0  6p
  [100.25, 100.45, 100.1, 100.15], // 1  7p
  [100.15, 100.5, 100.05, 100.4], // 2  8p   Asian high
  [100.4, 100.48, 100.15, 100.2], // 3  9p
  [100.2, 100.35, 100.0, 100.1], // 4  10p  Asian low
  [100.1, 100.4, 100.05, 100.3], // 5  11p
  [100.3, 100.45, 100.15, 100.2], // 6  12a  midnight open 100.30
  [100.2, 100.3, 100.02, 100.05], // 7  1a
  [100.05, 100.1, 99.6, 99.7], // 8  2a   sweeps the Asian low
  [99.7, 99.8, 99.35, 99.5], // 9  3a   Judas low
  [99.5, 100.2, 99.45, 100.1], // 10 4a
  [100.1, 100.6, 100.0, 100.5], // 11 5a
  [100.5, 100.7, 100.3, 100.6], // 12 6a
  [100.6, 101.1, 100.5, 101.0], // 13 7a
  [101.0, 101.9, 100.9, 101.8], // 14 8a
  [101.8, 102.4, 101.6, 102.3], // 15 9a
  [102.3, 102.7, 102.0, 102.5], // 16 10a
  [102.5, 102.6, 102.1, 102.2], // 17 11a
  [102.2, 102.4, 101.9, 102.0], // 18 12p
  [102.0, 102.3, 101.85, 102.2], // 19 1p
  [102.2, 102.55, 102.1, 102.45], // 20 2p
  [102.45, 102.6, 102.2, 102.3], // 21 3p
  [102.3, 102.4, 102.15, 102.35], // 22 4p
]

export const D = { asianFrom: 1, asianTo: 5, asianHigh: 100.5, asianLow: 100.0, midnight: 6, midnightOpen: 100.3, sweep: 8, judas: 9 } as const

const HOUR_TEXT = ["6p", "7p", "8p", "9p", "10p", "11p", "12a", "1a", "2a", "3a", "4a", "5a", "6a", "7a", "8a", "9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p"]

/** Clock labels for DAY, every `every` hours */
export const dayTimeLabels = (every = 3) => HOUR_TEXT.map((text, index) => ({ index, text })).filter((t) => t.index % every === 0)

/** Five-minute clock labels for REVERSAL as a 9:00 to 11:00 am chart */
export const fiveMinuteLabels = REVERSAL.map((_, i) => {
  const minutes = 9 * 60 + i * 5
  return { index: i, text: `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}` }
}).filter((t) => t.index % 6 === 0)
