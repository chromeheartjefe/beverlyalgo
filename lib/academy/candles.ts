import type { Candle } from "@/lib/academy/types"

// Helpers for hand-made teaching charts. Lessons describe the shape of a move
// as a list of closes; these turn it into believable candles. Seeded, so a
// lesson's chart is identical on every render and on the server.

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const round = (v: number, decimals: number) => Number(v.toFixed(decimals))

/**
 * Candles whose closes follow `closes`. Each opens at the previous close and
 * gets wicks of up to `wick` (in price) beyond its body.
 */
export function candlesFromCloses(
  closes: number[],
  { start, wick, seed = 1, decimals = 2 }: { start?: number; wick: number; seed?: number; decimals?: number },
): Candle[] {
  const rand = mulberry32(seed)
  let prev = start ?? closes[0]
  return closes.map((close) => {
    const open = prev
    const high = Math.max(open, close) + rand() * wick
    const low = Math.min(open, close) - rand() * wick
    prev = close
    return [round(open, decimals), round(high, decimals), round(low, decimals), round(close, decimals)]
  })
}

/**
 * Candles that zigzag through `points` ([candle index, price] pairs, first
 * index 0), where every turning point is a clean swing: a peak candle has the
 * highest high between its neighbouring turning points, a trough the lowest
 * low. Lessons can then point at swing candles by index with confidence.
 */
export function swingCandles(
  points: [number, number][],
  { noise, wick, seed = 1, decimals = 2 }: { noise: number; wick: number; seed?: number; decimals?: number },
): Candle[] {
  const candles = candlesFromCloses(pathCloses(points, { noise, seed }), { wick, seed, decimals })
  const gap = Math.max(wick, noise) * 0.5
  points.forEach(([k, v], p) => {
    const prev = points[p - 1]?.[1]
    const next = points[p + 1]?.[1]
    const peak = (prev === undefined || v > prev) && (next === undefined || v > next)
    const trough = (prev === undefined || v < prev) && (next === undefined || v < next)
    if (!peak && !trough) return
    const lo = points[p - 1]?.[0] ?? 0
    const hi = points[p + 1]?.[0] ?? candles.length - 1
    const c = candles[k]
    if (peak) {
      c[1] = round(Math.max(c[1], v + wick * 0.8), decimals)
      for (let i = lo; i <= hi; i++) {
        if (i === k) continue
        const cap = c[1] - gap
        candles[i][1] = round(Math.max(Math.max(candles[i][0], candles[i][3]), Math.min(candles[i][1], cap)), decimals)
      }
    } else {
      c[2] = round(Math.min(c[2], v - wick * 0.8), decimals)
      for (let i = lo; i <= hi; i++) {
        if (i === k) continue
        const floor = c[2] + gap
        candles[i][2] = round(Math.min(Math.min(candles[i][0], candles[i][3]), Math.max(candles[i][2], floor)), decimals)
      }
    }
  })
  return candles
}

/**
 * A path through `points` ([candle index, price] pairs, first index 0) with a
 * little seeded noise, one close per candle. Handy for "rally, then pullback"
 * shapes without typing every close.
 */
export function pathCloses(points: [number, number][], { noise, seed = 1 }: { noise: number; seed?: number }): number[] {
  const rand = mulberry32(seed)
  const out: number[] = []
  for (let p = 0; p + 1 < points.length; p++) {
    const [i0, v0] = points[p]
    const [i1, v1] = points[p + 1]
    for (let i = i0; i < i1; i++) {
      const t = (i - i0) / (i1 - i0)
      // Pin the turning points exactly, jitter everything between them
      out.push(v0 + (v1 - v0) * t + (i === i0 ? 0 : (rand() - 0.5) * 2 * noise))
    }
  }
  out.push(points[points.length - 1][1])
  return out
}
