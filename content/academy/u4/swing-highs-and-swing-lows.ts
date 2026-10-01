import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Swing highs at 5, 14, 23; swing lows at 9, 18
const swings = swingCandles([[0, 100], [5, 103.5], [9, 101.2], [14, 105], [18, 102.4], [23, 106.2], [27, 103.8]], {
  noise: 0.2,
  wick: 0.3,
  seed: 51,
})

export const lesson: LessonContent = {
  id: "u4-swing-highs-and-swing-lows",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "The skeleton of every chart",
      body: [
        "Price never moves in a straight line. It zigzags: up, pause, down a little, up again. The turning points of that zigzag are **swing highs** and **swing lows**.",
        "Almost every method in this course, from classic support and resistance to Smart Money Concepts, starts by finding these points. They are the skeleton of the chart.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: swings,
          reveal: true,
          decimals: 2,
          annotations: [
            { kind: "marker", index: 5, at: "high", text: "Swing high", tone: "down" },
            { kind: "marker", index: 14, at: "high", text: "Swing high", tone: "down" },
            { kind: "marker", index: 23, at: "high", text: "Swing high", tone: "down" },
            { kind: "marker", index: 9, at: "low", text: "Swing low", tone: "up" },
            { kind: "marker", index: 18, at: "low", text: "Swing low", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "A simple definition",
      body: [
        "A **swing high** is a candle whose high is higher than the highs of the candles on both sides of it. A **swing low** is a candle whose low is lower than the lows on both sides.",
        "A common rule uses two candles on each side: five candles in total, with the middle one the highest (or lowest). Some traders use more candles to find only the bigger swings.",
      ],
    },
    {
      kind: "numeric",
      id: "fractal-size",
      prompt: "Using the rule of two lower highs on each side, how many candles does it take to confirm a swing high, including the swing candle itself?",
      answer: 5,
      tolerance: 0,
      suffix: "candles",
      explain: "Two candles before, the swing candle, and two candles after: five in total.",
    },
    {
      kind: "learn",
      title: "Swings are only confirmed later",
      body: [
        "A swing high can only be confirmed once the candles after it have formed. In the moment, the latest high might still be part of a move that keeps going.",
        "That delay is unavoidable. It is why traders talk about the swing structure of the past and react to it, instead of guessing every top as it happens.",
      ],
    },
    {
      kind: "tap",
      id: "latest-swing-high",
      prompt: "Tap the most recent swing high.",
      chart: { candles: swings, decimals: 2 },
      targets: [23],
      explain: "It is the last candle with lower highs on both sides. Price has turned down from it since.",
    },
    {
      kind: "truefalse",
      id: "every-high",
      statement: "Every candle's high is a swing high.",
      answer: false,
      explain: "Only the turning points count: a high with lower highs on both sides. Most candles sit in between.",
    },
    {
      kind: "choice",
      id: "swing-low-def",
      prompt: "What makes a candle a swing low?",
      options: [
        "Its low is lower than the lows of the candles on both sides",
        "It is a red candle",
        "It has the lowest close of the day",
        "It touches a round number",
      ],
      answer: 0,
      explain: "A swing low is a turning point: the lowest low in its neighbourhood, with higher lows on both sides.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Price moves in zigzags; the turning points are swing highs and swing lows.",
        "A swing high has lower highs on both sides; a swing low has higher lows on both sides.",
        "A common rule uses two candles on each side.",
        "Swings are confirmed only after the next candles form.",
      ],
    },
  ],
}
