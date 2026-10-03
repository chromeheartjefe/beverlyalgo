import { B, BREAKER } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { LessonContent } from "@/lib/academy/types"

const ob = BREAKER[B.orderBlock]
const fvg = findFvgs(BREAKER).find((f) => f.index === B.fvg && f.dir === "bull")!
// The unicorn zone: where the breaker and the gap overlap
const U_TOP = Math.min(ob[1], fvg.top)
const U_BOTTOM = Math.max(ob[2], fvg.bottom)

export const lesson: LessonContent = {
  id: "u10-unicorn-model",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Two zones in one place",
      body: [
        "The **Unicorn** model looks for a **breaker block** and a **fair value gap** pointing the same way and **overlapping**. The overlap is the entry zone.",
        "Each one is a reason for price to react. When both sit in the same place, many traders consider the zone especially strong.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: BREAKER,
          decimals: 2,
          annotations: [
            { kind: "zone", from: B.orderBlock, to: BREAKER.length - 1, top: ob[1], bottom: ob[2], tone: "up" },
            { kind: "zone", from: fvg.index - 1, to: BREAKER.length - 1, top: fvg.top, bottom: fvg.bottom, tone: "accent" },
            { kind: "zone", from: fvg.index - 1, to: BREAKER.length - 1, top: U_TOP, bottom: U_BOTTOM, label: "Unicorn zone", tone: "warn" },
          ],
          caption: "Illustrative: green = breaker, purple = FVG, amber = their overlap",
        },
      },
    },
    {
      kind: "learn",
      title: "How it unfolds",
      body: [
        "Price sweeps an old low, then displaces up through the bearish order block at the swing high. That block becomes a bullish breaker, and the same displacement leaves a bullish fair value gap on top of it.",
        "Entry goes in the overlap, the stop below the sweep low, and the target at the next buy-side liquidity.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "A sweep of an old low", icon: "zap", tone: "warn" },
            { label: "A strong move up", sub: "displacement through the bearish order block", icon: "trending-up" },
            { label: "A breaker with an FVG on top", icon: "layers", tone: "accent" },
            { label: "Entry in the overlap", sub: "stop below the sweep low", icon: "target", tone: "up" },
          ],
        },
        caption: "The target is the next buy-side liquidity.",
      },
    },
    {
      kind: "tap",
      id: "unicorn-retest",
      prompt: "Tap the candle that retraced into the unicorn zone.",
      chart: { candles: BREAKER, decimals: 2, annotations: [{ kind: "zone", from: fvg.index - 1, to: BREAKER.length - 1, top: U_TOP, bottom: U_BOTTOM, tone: "warn" }] },
      targets: [B.retest],
      explain: "The pullback dipped into the overlap of the breaker and the gap, then the rally resumed.",
    },
    {
      kind: "numeric",
      id: "overlap",
      prompt: "A bullish breaker spans 100.7 to 101.6. A bullish FVG spans 100.2 to 101.6. Where is the bottom of the overlap?",
      answer: 100.7,
      tolerance: 0.001,
      explain: "The overlap is the higher of the two bottoms (100.7) up to the lower of the two tops (101.6).",
    },
    {
      kind: "choice",
      id: "unicorn-def",
      prompt: "What defines a Unicorn setup?",
      options: [
        "A breaker block and a same-direction FVG that overlap",
        "Two FVGs pointing in opposite directions",
        "Any order block on a daily chart",
        "A gap that forms on Monday",
      ],
      answer: 0,
      explain: "Breaker plus a gap in the same direction, overlapping. Opposite gaps overlapping would be a balanced price range.",
    },
    {
      kind: "truefalse",
      id: "unicorn-sure",
      statement: "Because it combines two zones, a Unicorn setup can't fail.",
      answer: false,
      explain: "Confluence improves the odds, it doesn't remove risk. The stop below the sweep is still required.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Unicorn: a breaker block overlapping a same-direction FVG.",
        "The overlap is the entry zone.",
        "Stop beyond the sweep; target the next liquidity.",
        "Confluence helps, but nothing is certain.",
      ],
    },
  ],
}
