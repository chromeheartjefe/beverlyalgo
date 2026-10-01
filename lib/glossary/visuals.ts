import { B, BREAKER, D, DAY, dayTimeLabels, R, REVERSAL, REVERSAL_DEEP } from "@/content/academy/l3/setups"
import { equityCandles, equityPath } from "@/content/academy/l4/equity"
import { candlesFromCloses, pathCloses, swingCandles } from "@/lib/academy/candles"
import { atr, bollinger, closes, ema, macd, rsi, sma } from "@/lib/academy/indicators"
import { midpoint } from "@/lib/academy/smc"
import type { Candle, ChartSpec, FigureId } from "@/lib/academy/types"
import type { VisualKey } from "@/lib/glossary/types"

// Visuals for glossary terms: small teaching charts (reusing the Academy's
// chart engine and hand-made setups) or Academy figures. Built lazily per key.

export type GlossaryVisual = { type: "chart"; chart: ChartSpec } | { type: "figure"; id: FigureId }

const F: Candle = [100, 100.15, 99.85, 100.05]

function trend(): Candle[] {
  return swingCandles([[0, 100], [4, 103], [8, 101.4], [13, 105.2], [17, 103.3], [22, 107.4], [26, 105.6], [30, 108.8]], {
    noise: 0.2,
    wick: 0.3,
    seed: 52,
  })
}

function indicatorSeries(): Candle[] {
  return candlesFromCloses(pathCloses([[0, 100], [12, 96], [28, 108], [36, 105], [50, 111], [60, 107]], { noise: 0.35, seed: 84 }), {
    wick: 0.45,
    seed: 84,
  })
}

const BUILDERS: Record<VisualKey, () => GlossaryVisual> = {
  candle: () => ({ type: "figure", id: "candle-anatomy" }),
  doji: () => ({
    type: "chart",
    chart: { candles: [F, F, [100, 101.2, 98.8, 100.02], F, F], highlight: [2], decimals: 1, height: 200, annotations: [{ kind: "marker", index: 2, at: "high", text: "Doji", tone: "neutral" }] },
  }),
  hammer: () => ({
    type: "chart",
    chart: {
      candles: candlesFromCloses([103, 102.4, 101.8, 101.1, 100.4], { start: 103.4, wick: 0.15, seed: 2 }).concat([[100.35, 100.6, 98.9, 100.55], [100.55, 101.4, 100.4, 101.3]]),
      decimals: 1,
      height: 200,
      annotations: [{ kind: "marker", index: 5, at: "low", text: "Hammer", tone: "up" }],
    },
  }),
  engulfing: () => ({
    type: "chart",
    chart: {
      candles: [F, [100.6, 100.7, 99.6, 99.8], [99.7, 101.0, 99.6, 100.85], F],
      highlight: [1, 2],
      decimals: 1,
      height: 200,
      annotations: [{ kind: "marker", index: 2, at: "high", text: "Bullish engulfing", tone: "up" }],
    },
  }),
  volume: () => {
    const c = candlesFromCloses([...pathCloses([[0, 100], [8, 100.6], [15, 100.3]], { noise: 0.15, seed: 8 }), 102.2, 102.6, 102.4, 103], { wick: 0.25, seed: 8 })
    return { type: "chart", chart: { candles: c, volumes: c.map((_, i) => (i === 16 ? 430 : 110 + ((i * 37) % 60))), decimals: 1 } }
  },
  gap: () => {
    const a = candlesFromCloses([100.2, 100.6, 100.3, 100.9, 100.7, 101.1], { start: 100, wick: 0.3, seed: 3 })
    const b = candlesFromCloses([104.5, 104.9, 104.6, 105.2, 105.0], { start: 104.1, wick: 0.3, seed: 4 })
    return { type: "chart", chart: { candles: [...a, ...b], decimals: 1, annotations: [{ kind: "marker", index: 6, at: "low", text: "Gap up", tone: "up" }] } }
  },
  uptrend: () => ({
    type: "chart",
    chart: {
      candles: trend(),
      decimals: 1,
      annotations: [
        { kind: "marker", index: 13, at: "high", text: "HH", tone: "up" },
        { kind: "marker", index: 22, at: "high", text: "HH", tone: "up" },
        { kind: "marker", index: 8, at: "low", text: "HL", tone: "up" },
        { kind: "marker", index: 17, at: "low", text: "HL", tone: "up" },
      ],
    },
  }),
  bos: () => {
    const c = swingCandles([[0, 100], [8, 103.5], [12, 101.6], [20, 106]], { noise: 0.2, wick: 0.35, seed: 56 })
    const lvl = c[8][1]
    const at = c.findIndex((k, i) => i > 12 && k[3] > lvl)
    return { type: "chart", chart: { candles: c, decimals: 1, annotations: [{ kind: "line", from: [8, lvl], to: [at, lvl], label: "BOS", tone: "up", dashed: true }] } }
  },
  choch: () => {
    const c = swingCandles([[0, 102], [4, 104.2], [8, 102.8], [12, 105.6], [16, 103.8], [20, 106.4], [26, 102], [29, 103.4]], { noise: 0.15, wick: 0.3, seed: 57 })
    const lvl = c[16][2]
    const at = c.findIndex((k, i) => i > 20 && k[3] < lvl)
    return { type: "chart", chart: { candles: c, decimals: 1, annotations: [{ kind: "line", from: [16, lvl], to: [at, lvl], label: "CHoCH", tone: "warn", dashed: true }] } }
  },
  support: () => {
    const c = swingCandles([[0, 103], [5, 100.2], [9, 102.6], [14, 100.1], [18, 102.9], [23, 100.25], [28, 103.4]], { noise: 0.15, wick: 0.25, seed: 61 })
    return { type: "chart", chart: { candles: c, decimals: 1, annotations: [{ kind: "zone", from: 3, top: 100.4, bottom: 99.75, label: "Support", tone: "up" }] } }
  },
  trendline: () => {
    const c = swingCandles([[0, 101.2], [4, 100], [8, 102.6], [12, 101.6], [16, 104.2], [20, 103.2], [25, 105.8]], { noise: 0.15, wick: 0.25, seed: 64 })
    return { type: "chart", chart: { candles: c, decimals: 1, annotations: [{ kind: "line", from: [4, c[4][2]], to: [12, c[12][2]], extend: true, tone: "up", label: "Trendline" }] } }
  },
  fibonacci: () => {
    const c = swingCandles([[0, 100], [10, 110], [16, 103.95], [24, 112]], { noise: 0.25, wick: 0.3, seed: 71 })
    const lo = c[0][2]
    const hi = c[10][1]
    const lv = (r: number) => Number((hi - (hi - lo) * r).toFixed(2))
    return {
      type: "chart",
      chart: {
        candles: c,
        decimals: 1,
        annotations: [
          { kind: "hline", price: lv(0.382), label: "38.2%", tone: "neutral", dashed: true },
          { kind: "hline", price: lv(0.5), label: "50%", tone: "neutral", dashed: true },
          { kind: "hline", price: lv(0.618), label: "61.8%", tone: "warn", dashed: true },
        ],
      },
    }
  },
  "moving-average": () => {
    const c = indicatorSeries()
    return { type: "chart", chart: { candles: c, decimals: 1, overlays: [{ values: ema(closes(c), 9), tone: "accent", label: "EMA 9" }, { values: sma(closes(c), 21), tone: "warn", label: "SMA 21" }] } }
  },
  rsi: () => {
    const c = indicatorSeries()
    return { type: "chart", chart: { candles: c, decimals: 1, pane: { label: "RSI 14", lines: [{ values: rsi(c, 14), tone: "accent" }], levels: [30, 70], min: 0, max: 100 } } }
  },
  macd: () => {
    const c = indicatorSeries()
    const m = macd(c)
    return { type: "chart", chart: { candles: c, decimals: 1, pane: { label: "MACD", lines: [{ values: m.line, tone: "accent" }, { values: m.signal, tone: "warn" }], histogram: m.histogram, decimals: 1 } } }
  },
  bollinger: () => {
    const c = indicatorSeries()
    const b = bollinger(c, 20, 2)
    return {
      type: "chart",
      chart: { candles: c, decimals: 1, overlays: [{ values: b.upper, tone: "accent" }, { values: b.mid, tone: "neutral", dashed: true }, { values: b.lower, tone: "accent" }] },
    }
  },
  atr: () => {
    const calm = candlesFromCloses(pathCloses([[0, 100], [16, 101.5], [30, 100.8]], { noise: 0.15, seed: 86 }), { wick: 0.2, seed: 86 })
    const wild = candlesFromCloses(pathCloses([[0, 101.6], [8, 98.5], [16, 103.5], [26, 99.8]], { noise: 1.1, seed: 87 }), { start: calm[calm.length - 1][3], wick: 0.9, seed: 87 })
    const c = [...calm, ...wild]
    return { type: "chart", chart: { candles: c, decimals: 1, pane: { label: "ATR 14", lines: [{ values: atr(c, 14), tone: "warn" }], decimals: 1 } } }
  },
  divergence: () => {
    const c = candlesFromCloses(pathCloses([[0, 100], [14, 95], [24, 106], [30, 103], [44, 106.8], [52, 102.5]], { noise: 0.15, seed: 89 }), { wick: 0.3, seed: 89 })
    return { type: "chart", chart: { candles: c, decimals: 1, pane: { label: "RSI 14", lines: [{ values: rsi(c, 14), tone: "accent" }], levels: [30, 70], min: 0, max: 100 } } }
  },
  liquidity: () => ({ type: "figure", id: "liquidity-sweep" }),
  sweep: () => {
    const eql = Math.min(REVERSAL[R.eql1][2], REVERSAL[R.eql2][2])
    return {
      type: "chart",
      chart: {
        candles: REVERSAL.slice(0, 21),
        decimals: 2,
        annotations: [
          { kind: "hline", price: eql, tone: "neutral", dashed: true },
          { kind: "marker", index: R.sweep, at: "low", text: "Sweep", tone: "up" },
        ],
      },
    }
  },
  "equal-lows": () => ({
    type: "chart",
    chart: {
      candles: REVERSAL.slice(0, 15),
      decimals: 2,
      annotations: [{ kind: "line", from: [R.eql1, REVERSAL[R.eql1][2]], to: [R.eql2, REVERSAL[R.eql2][2]], label: "Equal lows", tone: "down", dashed: true }],
    },
  }),
  fvg: () => ({ type: "figure", id: "fvg-fill" }),
  "order-block": () => {
    const ob = REVERSAL[R.orderBlock]
    return { type: "chart", chart: { candles: REVERSAL_DEEP, decimals: 2, annotations: [{ kind: "zone", from: R.orderBlock, to: R.target, top: ob[1], bottom: ob[2], label: "Bullish order block", tone: "up" }] } }
  },
  breaker: () => {
    const ob = BREAKER[B.orderBlock]
    return {
      type: "chart",
      chart: {
        candles: BREAKER,
        decimals: 2,
        annotations: [
          { kind: "zone", from: B.orderBlock, top: ob[1], bottom: ob[2], label: "Breaker", tone: "up" },
          { kind: "marker", index: B.sweep, at: "low", text: "Sweep", tone: "down" },
        ],
      },
    }
  },
  displacement: () => ({
    type: "chart",
    chart: { candles: REVERSAL, decimals: 2, highlight: [R.displacement, R.displacement + 1], annotations: [{ kind: "marker", index: R.displacement, at: "low", text: "Displacement", tone: "up" }] },
  }),
  "premium-discount": () => {
    const lo = REVERSAL[R.sweep][2]
    const hi = REVERSAL[R.legHigh][1]
    const eq = midpoint(hi, lo)
    return {
      type: "chart",
      chart: {
        candles: REVERSAL,
        decimals: 2,
        annotations: [
          { kind: "zone", from: R.legHigh, to: R.target, top: hi, bottom: eq, label: "Premium", tone: "down" },
          { kind: "zone", from: R.legHigh, to: R.target, top: eq, bottom: lo, label: "Discount", tone: "up" },
        ],
      },
    }
  },
  ote: () => {
    const lo = REVERSAL_DEEP[R.sweep][2]
    const hi = REVERSAL_DEEP[R.legHigh][1]
    const at = (r: number) => Number((hi - (hi - lo) * r).toFixed(3))
    return { type: "chart", chart: { candles: REVERSAL_DEEP, decimals: 2, annotations: [{ kind: "zone", from: R.legHigh, to: R.target, top: at(0.62), bottom: at(0.79), label: "OTE 62-79%", tone: "accent" }] } }
  },
  "asian-range": () => ({
    type: "chart",
    chart: {
      candles: DAY,
      decimals: 2,
      timeLabels: dayTimeLabels(3),
      sessions: [{ from: D.asianFrom, to: D.asianTo, label: "Asian range", tone: "neutral" }],
      annotations: [
        { kind: "line", from: [D.asianFrom, D.asianHigh], to: [12, D.asianHigh], tone: "up", dashed: true },
        { kind: "line", from: [D.asianFrom, D.asianLow], to: [12, D.asianLow], tone: "down", dashed: true },
      ],
    },
  }),
  killzone: () => ({ type: "figure", id: "killzones" }),
  judas: () => ({ type: "figure", id: "power-of-three" }),
  "head-and-shoulders": () => {
    const c = swingCandles([[0, 100], [5, 103.5], [9, 101.8], [14, 105.5], [18, 101.9], [23, 103.6], [30, 99.8]], { noise: 0.15, wick: 0.2, seed: 67 })
    return {
      type: "chart",
      chart: {
        candles: c,
        decimals: 1,
        annotations: [
          { kind: "line", from: [9, c[9][2]], to: [18, c[18][2]], extend: true, tone: "down", dashed: true, label: "Neckline" },
          { kind: "marker", index: 14, at: "high", text: "Head", tone: "down" },
        ],
      },
    }
  },
  "double-top": () => {
    const c = swingCandles([[0, 100], [6, 104], [10, 102], [15, 104.05], [22, 100.6]], { noise: 0.15, wick: 0.2, seed: 66 })
    return { type: "chart", chart: { candles: c, decimals: 1, annotations: [{ kind: "hline", price: c[10][2], label: "Neckline", tone: "down", dashed: true }] } }
  },
  "order-book": () => ({ type: "figure", id: "order-book" }),
  drawdown: () => ({ type: "chart", chart: { candles: equityCandles(equityPath(10000, 0.1)), style: "line", decimals: 0 } }),
  spring: () => {
    const c = swingCandles([[0, 106], [5, 100.5], [9, 103.6], [13, 101], [17, 103.3], [21, 100.9], [24, 99.6], [27, 102], [31, 104.2], [34, 103.4], [38, 106]], {
      noise: 0.12,
      wick: 0.2,
      seed: 94,
    })
    return { type: "chart", chart: { candles: c, decimals: 1, annotations: [{ kind: "marker", index: 24, at: "low", text: "Spring", tone: "warn" }] } }
  },
}

const cache = new Map<VisualKey, GlossaryVisual>()

export function glossaryVisual(key: VisualKey): GlossaryVisual {
  let v = cache.get(key)
  if (!v) {
    v = BUILDERS[key]()
    cache.set(key, v)
  }
  return v
}

