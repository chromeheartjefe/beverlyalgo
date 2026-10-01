import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { closes, ema, sma } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// Decline, base, then an uptrend: the fast EMA crosses above the slow SMA
const candles = candlesFromCloses(
  pathCloses([[0, 108], [18, 100], [28, 101.5], [34, 100.6], [60, 112], [66, 110.5]], { noise: 0.45, seed: 82 }),
  { wick: 0.55, seed: 82 },
)
const fast = ema(closes(candles), 9)
const slow = sma(closes(candles), 30)
const CROSS = fast.findIndex((v, i) => i > 30 && v !== null && slow[i] !== null && fast[i - 1] !== null && slow[i - 1] !== null && v > slow[i]! && fast[i - 1]! <= slow[i - 1]!)

export const lesson: LessonContent = {
  id: "u6-moving-averages",
  sources: ["J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978): indicator formulas"],
  steps: [
    {
      kind: "learn",
      title: "Smoothing the noise",
      body: [
        "A **moving average** is the average closing price of the last N candles, recalculated at every new candle. It smooths out the noise so the direction of the trend is easier to see.",
        "The **simple moving average (SMA)** weights every candle equally. The **exponential moving average (EMA)** gives more weight to recent candles, so it reacts faster.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          overlays: [
            { values: fast, tone: "accent", label: "EMA 9" },
            { values: slow, tone: "warn", label: "SMA 30" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "numeric",
      id: "sma-calc",
      prompt: "The last five closes are 10, 12, 14, 16 and 18. What is the 5-period SMA?",
      answer: 14,
      tolerance: 0,
      explain: "(10 + 12 + 14 + 16 + 18) ÷ 5 = 70 ÷ 5 = 14.",
    },
    {
      kind: "learn",
      title: "Three common uses",
      body: [
        "**Trend filter:** price above a rising average favours longs; below a falling one favours shorts. The 50 and 200-period averages on the daily chart are watched by almost everyone.",
        "**Dynamic support and resistance:** in a trend, pullbacks often stall near a moving average.",
        "**Crossovers:** a fast average crossing above a slow one signals momentum turning up (on the daily 50 and 200, the famous **golden cross**); crossing below is a **death cross**.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          overlays: [
            { values: fast, tone: "accent", label: "EMA 9" },
            { values: slow, tone: "warn", label: "SMA 30" },
          ],
          annotations: [{ kind: "marker", index: CROSS, at: "low", text: "Bullish cross", tone: "up" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "choice",
      id: "whipsaw",
      prompt: "Where do moving average crossovers tend to fail most?",
      options: [
        "In sideways, choppy ranges",
        "In strong, clean trends",
        "On daily charts only",
        "When volume is high",
      ],
      answer: 0,
      explain: "In a range the averages cross back and forth on every swing, giving signal after signal that goes nowhere. Traders call it whipsaw.",
    },
    {
      kind: "truefalse",
      id: "ema-faster",
      statement: "With the same number of periods, an EMA reacts to new prices faster than an SMA.",
      answer: true,
      explain: "The EMA weights recent closes more heavily, so it turns sooner, at the cost of a little more noise.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A moving average smooths price to show the trend.",
        "SMA weights every candle equally; EMA favours recent ones.",
        "Uses: trend filter, dynamic support and resistance, crossovers.",
        "Crossovers whipsaw in ranges.",
      ],
    },
  ],
}
