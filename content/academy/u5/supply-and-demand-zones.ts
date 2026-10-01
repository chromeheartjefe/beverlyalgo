import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Decline, a tight base (6 to 13), an explosive rally out of it, then a return
// to the base at 24 and a bounce.
const candles = swingCandles(
  [[0, 104], [6, 101], [8, 101.4], [10, 100.9], [13, 101.2], [17, 105.5], [21, 104.2], [24, 101.4], [28, 104.8]],
  { noise: 0.12, wick: 0.2, seed: 65 },
)

export const lesson: LessonContent = {
  id: "u5-supply-and-demand-zones",
  sources: ["Wyckoff, Studies in Tape Reading (1910), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Where price left in a hurry",
      body: [
        "Sometimes price sits quietly in a tight area, then explodes away from it. That explosion means one side placed far more orders than the other could absorb.",
        "Traders mark the quiet area, the **base**, as a zone. A base before a strong rally is a **demand zone**. A base before a strong drop is a **supply zone**.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [{ kind: "zone", from: 6, top: 101.65, bottom: 100.6, label: "Demand zone", tone: "up" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Why price comes back",
      body: [
        "The idea: large buyers couldn't fill everything during the base, so some of their orders are still waiting there. When price returns, those leftover orders can push it away again.",
        "A **fresh** zone, never revisited, is usually considered stronger than one that has already been tested a few times.",
      ],
    },
    {
      kind: "tap",
      id: "zone-return",
      prompt: "Tap the candle where price came back to the demand zone for the first time.",
      chart: { candles, decimals: 2, annotations: [{ kind: "zone", from: 6, top: 101.65, bottom: 100.6, tone: "up" }] },
      targets: [24],
      explain: "Price dropped back into the base it had exploded out of, found buyers again, and bounced.",
    },
    {
      kind: "choice",
      id: "good-zone",
      prompt: "Which makes a demand zone look strongest?",
      options: [
        "A tight base followed by a fast, powerful rally, and no return since",
        "A slow, choppy drift upward from a wide area",
        "A zone that has already been tested five times",
        "Any area where a red candle closed",
      ],
      answer: 0,
      explain: "A sharp exit shows a strong imbalance, and a fresh zone still has its unfilled orders.",
    },
    {
      kind: "learn",
      title: "The bridge to order blocks",
      body: [
        "Supply and demand trading is the direct ancestor of the Smart Money **order block**: the last opposite candle before a strong move. Same idea, sharper definition.",
        "Level 3 adds what classic supply and demand misses: whether the move took liquidity first, and whether it left a fair value gap behind.",
      ],
    },
    {
      kind: "truefalse",
      id: "supply-def",
      statement: "A supply zone is the base that comes before a strong drop.",
      answer: true,
      explain: "Sellers overwhelmed buyers from that area. When price returns, leftover sell orders may push it down again.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A base followed by an explosive move marks a zone.",
        "Base before a rally: demand. Base before a drop: supply.",
        "Price often reacts on its first return to a fresh zone.",
        "Order blocks are a sharper version of the same idea.",
      ],
    },
  ],
}
