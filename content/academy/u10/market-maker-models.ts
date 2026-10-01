import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Market maker buy model: a consolidation at the top, a stair-step decline
// (sell-side curve), a reversal at the lows, and a stair-step rally back
// through the same levels (buy-side curve).
const PTS: [number, number][] = [
  [0, 110], [3, 110.6], [5, 109.8], [7, 110.4], // original consolidation
  [10, 107.6], [12, 108.3], [15, 105.4], [17, 106.1], [20, 103.0], // sell-side curve
  [22, 102.2], // smart money reversal
  [25, 104.6], [27, 104.0], [30, 106.8], [32, 106.2], [35, 109.4], [37, 108.9], [40, 111.5], // buy-side curve
]
const candles = candlesFromCloses(pathCloses(PTS, { noise: 0.12, seed: 97 }), { wick: 0.2, seed: 97 })
const REVERSAL_AT = 22

export const lesson: LessonContent = {
  id: "u10-market-maker-models",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The big-picture template",
      body: [
        "ICT's **market maker buy model (MMBM)** describes a full cycle on a higher timeframe:",
        "An **original consolidation**. A **sell-side curve**: price steps down in stages, each pause and drop engineering more sell-side liquidity. A **smart money reversal** at a higher-timeframe discount level, usually with a sweep. Then a **buy-side curve**: price climbs back through the same stages to the original consolidation and beyond.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          annotations: [
            { kind: "zone", from: 0, to: 7, top: 110.9, bottom: 109.5, label: "Original consolidation", tone: "neutral" },
            { kind: "marker", index: 14, at: "high", text: "Sell-side curve", tone: "down" },
            { kind: "marker", index: REVERSAL_AT, at: "low", text: "Reversal", tone: "warn" },
            { kind: "marker", index: 30, at: "low", text: "Buy-side curve", tone: "up" },
          ],
          caption: "Illustrative market maker buy model",
        },
      },
    },
    {
      kind: "tap",
      id: "smr",
      prompt: "Tap the smart money reversal, where the sell-side curve ended.",
      chart: { candles, decimals: 1 },
      targets: [REVERSAL_AT - 1, REVERSAL_AT, REVERSAL_AT + 1],
      explain: "The lowest point of the cycle, where the stair-step decline stopped and the climb back began.",
    },
    {
      kind: "match",
      id: "mm-parts",
      prompt: "Match each part of the buy model to what happens.",
      pairs: [
        ["Original consolidation", "Where the cycle starts and later returns to"],
        ["Sell-side curve", "A stair-step decline building sell-side liquidity"],
        ["Smart money reversal", "The turn at a higher-timeframe discount level"],
        ["Buy-side curve", "The climb back through the same stages"],
      ],
      explain: "Down in stages, a reversal at a key level, then back up through the stages.",
    },
    {
      kind: "learn",
      title: "How traders use it",
      body: [
        "The model is a map, not an entry. It helps you see where you are in a larger cycle: still in the sell-side curve (be careful buying), or already in the buy-side curve (look for buys at each new stage, targeting the levels the decline left behind).",
        "The **market maker sell model (MMSM)** is the mirror: a stair-step rally, a reversal at a premium level, and a decline back through the stages.",
      ],
    },
    {
      kind: "choice",
      id: "mm-target",
      prompt: "In the buy-side curve of a market maker buy model, what are natural targets?",
      options: [
        "The consolidation levels the decline left behind, up to the original consolidation",
        "New lows below the reversal",
        "The middle of the reversal candle",
        "There are no targets in this model",
      ],
      answer: 0,
      explain: "The climb tends to revisit the stages of the decline, with the original consolidation as the bigger draw.",
    },
    {
      kind: "truefalse",
      id: "mm-entry",
      statement: "The market maker model is a precise entry signal on its own.",
      answer: false,
      explain: "It is a big-picture template. Entries still come from your lower-timeframe model, like the MSS and FVG entry.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "MMBM: consolidation, sell-side curve, smart money reversal, buy-side curve.",
        "MMSM is the mirror image.",
        "Use it as a map of the larger cycle, not as an entry.",
        "Targets on the way back are the stages the move left behind.",
      ],
    },
  ],
}
