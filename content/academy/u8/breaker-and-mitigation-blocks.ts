import { B, BREAKER } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const ob = BREAKER[B.orderBlock]

export const lesson: LessonContent = {
  id: "u8-breaker-and-mitigation-blocks",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "When an order block fails",
      body: [
        "Order blocks don't always hold. When price **breaks straight through** one with displacement, the block has failed, and the traders who acted on it are now trapped.",
        "ICT calls the failed block a **breaker block**. It flips: a failed bearish order block becomes bullish support, and a failed bullish one becomes bearish resistance.",
      ],
    },
    {
      kind: "learn",
      title: "How a bullish breaker forms",
      body: [
        "1. Price rallies to a swing high. The last up candle before the drop is a **bearish order block**.",
        "2. Price drops and **sweeps an old low** (sell-side liquidity).",
        "3. Price displaces back up and **closes above the swing high**, straight through the bearish order block (an MSS).",
        "4. That failed bearish block is now a **bullish breaker**. Price often retests it before continuing up.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: BREAKER,
          decimals: 2,
          annotations: [
            { kind: "zone", from: B.orderBlock, top: ob[1], bottom: ob[2], label: "Bearish OB, then bullish breaker", tone: "up" },
            { kind: "marker", index: B.sweep, at: "low", text: "Sweep", tone: "down" },
            { kind: "marker", index: B.retest, at: "low", text: "Retest", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "find-breaker",
      prompt: "Tap the candle that became the bullish breaker.",
      chart: { candles: BREAKER, decimals: 2 },
      targets: [B.orderBlock],
      explain: "It was the last up candle before the drop: a bearish order block. Price later closed through it after sweeping the low, so it flipped into a bullish breaker.",
    },
    {
      kind: "learn",
      title: "Mitigation blocks",
      body: [
        "A **mitigation block** forms the same way, with one difference: **no liquidity sweep**. Price fails to make a new low (it makes a higher low instead), then breaks above the swing high through the failed block.",
        "The sweep makes the breaker the stronger of the two: stops were taken before the reversal.",
      ],
    },
    {
      kind: "choice",
      id: "breaker-vs-mitigation",
      prompt: "What separates a breaker block from a mitigation block?",
      options: [
        "A breaker forms after a liquidity sweep; a mitigation block forms without one",
        "A breaker is always bigger",
        "A mitigation block only appears on daily charts",
        "There is no difference",
      ],
      answer: 0,
      explain: "Both are failed order blocks. The breaker comes after price took the stops beyond the old low (or high).",
    },
    {
      kind: "truefalse",
      id: "breaker-flip",
      statement: "A failed bullish order block can become a bearish breaker.",
      answer: true,
      explain: "Same logic in reverse: price sweeps a high, then closes down through the bullish block, which then acts as resistance.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A breaker is an order block that failed and flipped.",
        "Bullish breaker: sweep a low, then close up through the bearish order block.",
        "A mitigation block is the same idea without the sweep.",
        "Price often retests the breaker before continuing.",
      ],
    },
  ],
}
