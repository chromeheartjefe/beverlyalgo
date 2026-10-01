import { swingCandles } from "@/lib/academy/candles"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// Rising lows at 4, 12 and 20 on one straight line (0.2 per candle)
const candles = swingCandles([[0, 101.2], [4, 100], [8, 102.6], [12, 101.6], [16, 104.2], [20, 103.2], [25, 105.8]], {
  noise: 0.15,
  wick: 0.25,
  seed: 64,
})
const L1: [number, number] = [4, candles[4][2]]
const L2: [number, number] = [12, candles[12][2]]
// Parallel line through the swing high between them makes the channel
const slope = (L2[1] - L1[1]) / (L2[0] - L1[0])
const H1: [number, number] = [8, candles[8][1]]
const H2: [number, number] = [16, H1[1] + slope * 8]

const plain: ChartSpec = { candles, decimals: 2 }

export const lesson: LessonContent = {
  id: "u5-trendlines-and-channels",
  sources: ["Wyckoff, Studies in Tape Reading (1910), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Support that slopes",
      body: [
        "In a trend, support and resistance move with price. A **trendline** connects the swing lows of an uptrend (or the swing highs of a downtrend) with a straight line.",
        "Two points make a line. The **third touch** is what makes it a trendline worth trusting.",
      ],
      visual: {
        type: "chart",
        chart: {
          ...plain,
          annotations: [{ kind: "line", from: L1, to: L2, extend: true, tone: "up", label: "Trendline" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "third-touch",
      prompt: "Tap the third touch: the swing low that confirmed this trendline.",
      chart: { ...plain, annotations: [{ kind: "line", from: L1, to: L2, extend: true, tone: "neutral", dashed: true }] },
      targets: [20],
      explain: "After two lows set the line, price came back down to it a third time and bounced. That third touch confirmed it.",
    },
    {
      kind: "learn",
      title: "Channels",
      body: [
        "Draw a parallel line through the swing highs and you have a **channel**. Price often travels between the two lines, bouncing from the lower one and stalling at the upper one.",
      ],
      visual: {
        type: "chart",
        chart: {
          ...plain,
          annotations: [
            { kind: "line", from: L1, to: L2, extend: true, tone: "up" },
            { kind: "line", from: H1, to: H2, extend: true, tone: "down", dashed: true, label: "Channel" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Drawing them honestly",
      body: [
        "**Use real swing points**, not random wicks. **Don't force it**: if you have to ignore half the candles to make a line fit, there is no line. And remember that a steeper line breaks sooner.",
        "A trendline break is a warning, not a reversal on its own. Structure (a CHoCH) is what confirms a trend has turned.",
      ],
    },
    {
      kind: "truefalse",
      id: "break-reversal",
      statement: "When price breaks a trendline, the trend has definitely reversed.",
      answer: false,
      explain: "Trends often just slow down or move sideways after a trendline break. Wait for structure to break before calling a reversal.",
    },
    {
      kind: "choice",
      id: "downtrend-line",
      prompt: "In a downtrend, which points does a trendline connect?",
      options: ["The swing highs", "The swing lows", "Every close", "The biggest candles"],
      answer: 0,
      explain: "In a downtrend, the line sits above price and connects the lower highs, acting as sloping resistance.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Trendlines connect swing lows in uptrends and swing highs in downtrends.",
        "A third touch confirms a trendline.",
        "A parallel line through the other side makes a channel.",
        "Don't force lines; a break is a warning, structure confirms.",
      ],
    },
  ],
}
