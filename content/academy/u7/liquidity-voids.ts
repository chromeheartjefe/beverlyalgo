import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const d = REVERSAL[R.displacement]

export const lesson: LessonContent = {
  id: "u7-liquidity-voids",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Price that moved too fast",
      body: [
        "A **liquidity void** is a stretch of price covered by one or a few big, one-directional candles, with almost no trading back and forth. Price went through it so fast that few orders were filled along the way.",
        "Because the market barely traded there, ICT traders expect price to come back through the void later to rebalance it, much like a fair value gap but bigger.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [{ kind: "zone", from: R.displacement, to: R.target, top: d[3], bottom: d[0], label: "Liquidity void", tone: "accent" }],
          caption: "Illustrative: the displacement candle's body",
        },
      },
    },
    {
      kind: "learn",
      title: "Void vs fair value gap",
      body: [
        "A fair value gap is the precise three-candle gap between candle 1's wick and candle 3's wick. A liquidity void is the broader stretch covered by the big candle bodies themselves.",
        "Many traders use the void's **midpoint** as a key level: a retrace often reacts around the middle of a large displacement candle.",
      ],
    },
    {
      kind: "numeric",
      id: "void-mid",
      prompt: "A displacement candle opens at 103.0 and closes at 104.4. What is the midpoint of its body?",
      answer: 103.7,
      tolerance: 0.01,
      explain: "(103.0 + 104.4) ÷ 2 = 103.7.",
    },
    {
      kind: "choice",
      id: "void-what",
      prompt: "What is a liquidity void?",
      options: [
        "A range price crossed so fast, in one direction, that little trading happened there",
        "A price level with lots of resting stop orders",
        "A period when the market is closed",
        "A candle with no volume at all",
      ],
      answer: 0,
      explain: "It is about speed and one-sidedness: price skipped through without the usual two-way trade.",
    },
    {
      kind: "truefalse",
      id: "void-always-filled",
      statement: "Price always comes back to fill a liquidity void immediately.",
      answer: false,
      explain: "Voids are often revisited, but sometimes days or weeks later, and sometimes never. Treat it as a tendency.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A liquidity void is a fast, one-sided stretch of price with little trading.",
        "Price often returns to rebalance it, sometimes much later.",
        "The midpoint of a big displacement candle is a common reaction level.",
      ],
    },
  ],
}
