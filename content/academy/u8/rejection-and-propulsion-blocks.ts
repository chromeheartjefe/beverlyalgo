import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const k = REVERSAL[R.sweep]
const BODY_BOTTOM = Math.min(k[0], k[3])

export const lesson: LessonContent = {
  id: "u8-rejection-and-propulsion-blocks",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Rejection blocks",
      body: [
        "A **rejection block** forms at a swing high or low with a **long wick**. The zone runs from the wick's extreme to the body: everything price visited and rejected in that candle.",
        "The thinking: price tried that area and was pushed away hard. If it comes back, the same rejection may happen again, especially at the wick's 50%.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [{ kind: "zone", from: R.sweep, to: R.target, top: BODY_BOTTOM, bottom: k[2], label: "Rejection block", tone: "up" }],
          caption: "Illustrative: the sweep candle's long lower wick",
        },
      },
    },
    {
      kind: "tap",
      id: "find-rejection",
      prompt: "Tap the candle whose long lower wick forms a rejection block.",
      chart: { candles: REVERSAL, decimals: 2 },
      targets: [R.sweep],
      explain: "The sweep candle dropped far below its body and closed back up. Its lower wick is the rejection block.",
    },
    {
      kind: "numeric",
      id: "wick-mid",
      prompt: "A candle's body bottom is 103.0 and its wick reaches down to 102.35. Where is the 50% of the wick?",
      answer: 102.675,
      tolerance: 0.006,
      explain: "(103.0 + 102.35) ÷ 2 = 102.675. ICT traders watch that midpoint of a long wick.",
    },
    {
      kind: "learn",
      title: "Propulsion blocks",
      body: [
        "A **propulsion block** is an order block that forms **after** price trades into an older order block. The older block supports price; the new candle there becomes a launch pad, and the next move takes off from it.",
        "Think of it as an order block sitting on top of another one. Price often only needs to reach the propulsion block, not the older block below it, before moving on.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "An older order block", sub: "supports price", icon: "layers" },
            { label: "A new candle forms there", sub: "the propulsion block", icon: "candles", tone: "accent" },
            { label: "The next move takes off from it", icon: "trending-up", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "propulsion",
      prompt: "What makes a candle a propulsion block?",
      options: [
        "It is an order block that formed while price was trading into an older order block",
        "It has no wicks at all",
        "It is the first candle of the trading day",
        "It formed on a weekend",
      ],
      answer: 0,
      explain: "It builds on an older block's support, and price tends to launch from it.",
    },
    {
      kind: "truefalse",
      id: "rejection-zone",
      statement: "A bullish rejection block runs from the low of the wick up to the bottom of the candle's body.",
      answer: true,
      explain: "That wick area is everything price visited and rejected in that candle.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Rejection block: the long wick at a swing point, from the wick's extreme to the body.",
        "The 50% of the wick is a key level.",
        "Propulsion block: an order block formed while trading into an older one.",
      ],
    },
  ],
}
