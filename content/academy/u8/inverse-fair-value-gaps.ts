import { R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { LessonContent } from "@/lib/academy/types"

// The bearish gap left during the decline (around candle 6)...
const bear = findFvgs(REVERSAL).find((f) => f.index === R.bearFvg && f.dir === "bear")!
// ...is closed through by the displacement, which flips it
const FLIP = REVERSAL.findIndex((c, i) => i > R.bearFvg + 1 && c[3] > bear.top)

export const lesson: LessonContent = {
  id: "u8-inverse-fair-value-gaps",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "When a gap fails",
      body: [
        "A bearish fair value gap should push price down when price returns to it. Sometimes it doesn't: a candle **closes straight through** the top of the gap.",
        "That failed gap becomes an **inverse fair value gap (IFVG)**. It flips roles: the old bearish gap now acts as support from above.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "zone", from: bear.index - 1, to: R.target, top: bear.top, bottom: bear.bottom, label: "Bearish FVG, then IFVG", tone: "warn" },
            { kind: "marker", index: FLIP, at: "high", text: "Closes through", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "flip-candle",
      prompt: "Tap the candle that closed through the bearish gap and turned it into an inverse FVG.",
      chart: {
        candles: REVERSAL,
        decimals: 2,
        annotations: [{ kind: "zone", from: bear.index - 1, to: R.target, top: bear.top, bottom: bear.bottom, tone: "warn" }],
      },
      targets: [FLIP],
      explain: "The displacement candle closed above the top of the old bearish gap. From that moment the gap counts as inverted.",
    },
    {
      kind: "learn",
      title: "Trading the flip",
      body: [
        "After the flip, a retrace back into the inverted gap often holds. In this chart, the later pullback dipped into the old bearish gap and bounced: it had become support.",
        "Notice that this also happened right after a liquidity sweep and an MSS. IFVGs, like everything in this level, work best when several pieces agree.",
      ],
    },
    {
      kind: "choice",
      id: "ifvg-def",
      prompt: "What turns a bearish fair value gap into an inverse FVG?",
      options: [
        "A candle closing above the top of the gap",
        "A wick touching the bottom of the gap",
        "The gap staying untouched for a week",
        "A second bearish gap forming below it",
      ],
      answer: 0,
      explain: "A close through the gap shows it failed. The failed bearish gap then acts as bullish support.",
    },
    {
      kind: "truefalse",
      id: "ifvg-role",
      statement: "A bullish FVG that price closes below can become resistance.",
      answer: true,
      explain: "The same flip works in reverse: a failed bullish gap becomes a bearish inverse FVG.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "An inverse FVG is a fair value gap that price closed through.",
        "It flips roles: failed bearish gaps become support, failed bullish gaps resistance.",
        "Retraces into a fresh IFVG often react, especially after a sweep and MSS.",
      ],
    },
  ],
}
