import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { closes, rsi } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// A steep first rally, then a slow grind to a slightly higher high: price
// makes a higher high while RSI makes a lower high (bearish divergence).
const candles = candlesFromCloses(
  pathCloses([[0, 100], [14, 95], [24, 106], [30, 103], [44, 106.8], [52, 102.5]], { noise: 0.15, seed: 89 }),
  { wick: 0.3, seed: 89 },
)
const values = rsi(candles, 14)
const c = closes(candles)
const argmaxIn = (from: number, to: number) => {
  let best = from
  for (let i = from; i <= to; i++) if (c[i] > c[best]) best = i
  return best
}
const P1 = argmaxIn(20, 28)
const P2 = argmaxIn(38, 48)

export const lesson: LessonContent = {
  id: "u6-divergence-and-combining-tools",
  sources: ["J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978)"],
  steps: [
    {
      kind: "learn",
      title: "When price and momentum disagree",
      body: [
        "**Divergence** is when price and an oscillator like RSI tell different stories. In **bearish divergence**, price makes a higher high but RSI makes a lower high: the new high was reached with less momentum.",
        "**Bullish divergence** is the mirror: price makes a lower low while RSI makes a higher low.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          annotations: [{ kind: "line", from: [P1, candles[P1][1]], to: [P2, candles[P2][1]], tone: "up", label: "Higher high" }],
          pane: {
            label: "RSI 14",
            lines: [{ values, tone: "accent" }],
            levels: [30, 70],
            min: 0,
            max: 100,
            segments: [{ from: [P1, values[P1] ?? 50], to: [P2, values[P2] ?? 50], tone: "down" }],
          },
          caption: "Illustrative: price higher high, RSI lower high",
        },
      },
    },
    {
      kind: "match",
      id: "divergence-match",
      prompt: "Match each divergence to what you see.",
      pairs: [
        ["Bearish divergence", "Price higher high, RSI lower high"],
        ["Bullish divergence", "Price lower low, RSI higher low"],
      ],
      explain: "In both cases price pushed further than momentum, a sign the move is tiring.",
    },
    {
      kind: "learn",
      title: "Divergence warns, it doesn't time",
      body: [
        "Divergence shows a move is losing momentum. It can last a long time, with several divergences in a row while the trend keeps going.",
        "Treat it as a reason to be careful (tighten stops, skip new entries in the old direction), and wait for structure, like a CHoCH, before betting on a reversal.",
      ],
    },
    {
      kind: "truefalse",
      id: "divergence-instant",
      statement: "As soon as bearish divergence appears, price reverses.",
      answer: false,
      explain: "Momentum can fade for a long time before price turns. Wait for structure to confirm.",
    },
    {
      kind: "learn",
      title: "Don't stack the same tool",
      body: [
        "RSI, Stochastic, CCI and Williams %R are all **momentum** oscillators built from the same prices. Four of them agreeing is really one opinion repeated four times.",
        "Combine tools that measure **different things**: one for trend (a moving average), one for momentum (RSI or MACD), one for volatility (ATR), and volume or VWAP. Then let structure and levels make the decision.",
      ],
    },
    {
      kind: "choice",
      id: "good-combo",
      prompt: "Which combination gives the most independent information?",
      options: [
        "A 50 EMA, RSI and ATR",
        "RSI, Stochastic and CCI",
        "Three moving averages of different lengths",
        "MACD and a second MACD with slightly different settings",
      ],
      answer: 0,
      explain: "Trend, momentum and volatility each describe something different. The other options repeat one kind of measurement.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Bearish divergence: price higher high, RSI lower high. Bullish is the mirror.",
        "Divergence warns that momentum is fading; it doesn't time the turn.",
        "Confirm reversals with structure.",
        "Combine tools that measure different things, not several of the same kind.",
      ],
    },
  ],
}
