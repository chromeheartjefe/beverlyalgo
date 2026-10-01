import { swingCandles } from "@/lib/academy/candles"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// Swing high at 8, pullback to 12, then the rally that closes above it
const candles = swingCandles([[0, 100], [8, 103.5], [12, 101.6], [20, 106]], { noise: 0.2, wick: 0.35, seed: 56 })
const LEVEL = candles[8][1]
const BOS = candles.findIndex((c, i) => i > 12 && c[3] > LEVEL)

const chart: ChartSpec = { candles, decimals: 2 }

export const lesson: LessonContent = {
  id: "u4-break-of-structure",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Break of structure",
      body: [
        "In an uptrend, the last swing high is the line buyers need to beat. When price **closes above it**, the trend has made a new higher high. That moment is called a **break of structure (BOS)**.",
        "A BOS says: the trend is still alive. In a downtrend, the mirror is a close below the last swing low.",
      ],
      visual: { type: "figure", id: "structure-story" },
    },
    {
      kind: "learn",
      title: "Seeing it on candles",
      body: [
        "Draw a line from the last swing high. The first candle that **closes** above it confirms the BOS.",
      ],
      visual: {
        type: "chart",
        chart: {
          ...chart,
          annotations: [
            { kind: "line", from: [8, LEVEL], to: [BOS, LEVEL], label: "BOS", tone: "up", dashed: true },
            { kind: "marker", index: 8, at: "high", text: "Swing high", tone: "neutral" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "bos-candle",
      prompt: "Tap the candle that confirmed the break of structure: the first close above the old swing high.",
      chart: { ...chart, annotations: [{ kind: "line", from: [8, LEVEL], to: [candles.length - 1, LEVEL], tone: "neutral", dashed: true }] },
      targets: [BOS],
      explain: "This is the first candle whose body closed above the swing high's level. Wicks poking above it don't count yet.",
    },
    {
      kind: "learn",
      title: "Close or wick?",
      body: [
        "Traders argue about this, and it matters. A **wick** above the old high only shows that price visited it. A **close** above it shows that buyers held it there until the candle ended.",
        "This course uses the close. In Level 3 you will learn why a wick above a high that quickly falls back is often the opposite of a BOS: a **liquidity sweep**, where stops get taken and price reverses.",
      ],
    },
    {
      kind: "choice",
      id: "wick-only",
      prompt: "A candle's wick spikes above the last swing high, but the candle closes back below it. Is that a BOS?",
      options: [
        "No. Without a close above the level, structure hasn't broken",
        "Yes. Any touch above the high is a BOS",
        "Yes, but only on red candles",
        "It depends on the colour of the previous candle",
      ],
      answer: 0,
      explain: "Price visited the level but couldn't hold it. Using closes avoids calling a break that immediately fails.",
    },
    {
      kind: "truefalse",
      id: "bos-downtrend",
      statement: "In a downtrend, a break of structure is a close below the last swing low.",
      answer: true,
      explain: "Same idea, mirrored: a new lower low confirms the downtrend is continuing.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A BOS is a close beyond the last swing point in the direction of the trend.",
        "It confirms the trend is continuing.",
        "Use closes, not wicks, to confirm it.",
        "A wick through a level that falls back can be a liquidity sweep instead.",
      ],
    },
  ],
}
