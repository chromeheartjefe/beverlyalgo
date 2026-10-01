import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { Candle, LessonContent } from "@/lib/academy/types"

const F: Candle = [100, 100.15, 99.85, 100.05]
// Gallery: bullish engulfing (1-2), bearish engulfing (5-6), inside bar (9-10), morning star (13-15)
const gallery: Candle[] = [
  F,
  [100.6, 100.7, 99.6, 99.8],
  [99.7, 101.0, 99.6, 100.85],
  F,
  F,
  [99.4, 100.5, 99.3, 100.3],
  [100.45, 100.6, 99.0, 99.2],
  F,
  F,
  [99.0, 101.3, 98.8, 101.0],
  [100.3, 100.9, 99.6, 100.6],
  F,
  F,
  [101.2, 101.3, 99.4, 99.5],
  [99.4, 99.55, 98.9, 99.2],
  [99.3, 100.9, 99.2, 100.8],
  F,
]

// Steady rally, then a bearish engulfing on candle 15 and a drop.
const ENGULF = 15
const rally: Candle[] = candlesFromCloses(
  [...pathCloses([[0, 100], [14, 104.5]], { noise: 0.12, seed: 23 }), 103.75, 103.4, 103.0, 102.5, 102.6, 101.9],
  { wick: 0.2, seed: 23 },
).map((c, i) => (i === ENGULF ? ([104.65, 104.8, 103.6, 103.75] as Candle) : c))

export const lesson: LessonContent = {
  id: "u3-two-and-three-candle-patterns",
  sources: ["Investor.gov (U.S. SEC): reading price charts"],
  steps: [
    {
      kind: "learn",
      title: "When candles team up",
      body: [
        "Some of the most watched patterns use two or three candles. They show the fight changing hands from one candle to the next.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: gallery,
          highlight: [1, 2, 5, 6, 9, 10, 13, 14, 15],
          decimals: 1,
          annotations: [
            { kind: "marker", index: 2, at: "high", text: "Bull engulfing", tone: "up" },
            { kind: "marker", index: 6, at: "low", text: "Bear engulfing", tone: "down" },
            { kind: "marker", index: 10, at: "high", text: "Inside bar", tone: "neutral" },
            { kind: "marker", index: 14, at: "low", text: "Morning star", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Engulfing patterns",
      body: [
        "A **bullish engulfing** is a green candle whose body completely covers the previous red body. After a decline, it shows buyers overwhelming sellers in a single period.",
        "A **bearish engulfing** is the mirror: a red body that swallows the previous green one, usually after a rally.",
      ],
    },
    {
      kind: "tap",
      id: "find-engulfing",
      prompt: "After this rally, tap the bearish engulfing candle.",
      chart: { candles: rally, decimals: 2 },
      targets: [ENGULF],
      explain: "It opened above the previous close and closed below the previous open, swallowing the last green body. Sellers took over and price fell.",
    },
    {
      kind: "learn",
      title: "Inside bars",
      body: [
        "An **inside bar** is a candle whose entire range, high to low, fits inside the previous candle's range.",
        "It shows the market pausing and compressing. Traders watch for the breakout from the mother candle's high or low.",
      ],
    },
    {
      kind: "choice",
      id: "inside-bar",
      prompt: "What makes a candle an inside bar?",
      options: [
        "Its high and low are both within the previous candle's range",
        "It opens inside the previous candle's body",
        "It has no wicks",
        "It closes at the same price as the previous candle",
      ],
      answer: 0,
      explain: "The whole range, wicks included, sits inside the candle before it.",
    },
    {
      kind: "learn",
      title: "Stars and tweezers",
      body: [
        "A **morning star** has three candles: a strong red one, a small-bodied candle that shows the selling stalling, then a strong green one that closes well into the first candle's body. The **evening star** is the bearish mirror at a top.",
        "**Tweezer tops and bottoms** are two candles with (nearly) the same high or the same low. Smart Money traders pay close attention to those equal highs and lows, for reasons you will learn in Level 3.",
      ],
    },
    {
      kind: "match",
      id: "multi-match",
      prompt: "Match each pattern to its description.",
      pairs: [
        ["Bullish engulfing", "A green body that covers the previous red body"],
        ["Bearish engulfing", "A red body that covers the previous green body"],
        ["Inside bar", "A range within the previous candle's range"],
        ["Evening star", "Three candles that turn a rally down"],
      ],
      explain: "Engulfings flip control in one candle, inside bars compress, and stars turn a move over three candles.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Engulfing: one body swallows the previous one, showing a change of control.",
        "Inside bar: a pause inside the previous range, often before a breakout.",
        "Morning and evening stars turn a move over three candles.",
        "Tweezers form equal highs or lows, which Level 3 will make important.",
      ],
    },
  ],
}
