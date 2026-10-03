import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u8-displacement",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "When price moves with intent",
      body: [
        "**Displacement** is a fast, powerful move in one direction: large candle bodies, small wicks, closes near the extremes. It looks nothing like the slow, overlapping candles around it.",
        "In SMC it is the footprint of large orders. Displacement is what turns a liquidity sweep into a real reversal, and it is what leaves fair value gaps behind.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          highlight: [R.displacement, R.displacement + 1],
          annotations: [{ kind: "marker", index: R.displacement, at: "low", text: "Displacement", tone: "up" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "find-displacement",
      prompt: "Tap the candle that displaced upward after the sweep.",
      chart: { candles: REVERSAL, decimals: 2 },
      targets: [R.displacement],
      explain: "The biggest body on the chart, closing near its high and straight through the last lower high. That is displacement.",
    },
    {
      kind: "learn",
      title: "What makes it count",
      body: [
        "SMC traders look for displacement that **breaks structure** (a BOS or MSS) and **leaves a fair value gap**. A big candle that stays inside the range and leaves no gap is just volatility.",
        "Displacement right after a liquidity sweep is the strongest version: the stops were taken, then price showed its hand.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Displacement that counts",
          items: [
            { text: "It breaks structure: a BOS or MSS", mark: "ok" },
            { text: "It leaves a fair value gap", mark: "ok" },
            { text: "Strongest right after a liquidity sweep", mark: "ok" },
            { text: "A big candle inside the range with no gap: just volatility", mark: "bad" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "displacement-signs",
      prompt: "Which candle best fits displacement?",
      options: [
        "A large body closing near its high, breaking the last swing high",
        "A small doji in the middle of a range",
        "A candle with long wicks on both sides and a tiny body",
        "Several small overlapping candles drifting up",
      ],
      answer: 0,
      explain: "Big body, little wick, close near the extreme, structure broken: intent.",
    },
    {
      kind: "truefalse",
      id: "big-candle",
      statement: "Any big candle counts as displacement, even if it stays inside the range.",
      answer: false,
      explain: "SMC traders want displacement that breaks structure and leaves an imbalance. A big candle going nowhere is just noise.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Displacement is a fast, large-bodied move with little wick.",
        "It shows intent and leaves fair value gaps.",
        "It matters most when it breaks structure, ideally right after a sweep.",
      ],
    },
  ],
}
