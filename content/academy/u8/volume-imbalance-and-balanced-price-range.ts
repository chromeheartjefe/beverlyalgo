import { R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { Candle, LessonContent } from "@/lib/academy/types"

const all = findFvgs(REVERSAL)
const bear = all.find((f) => f.index === R.bearFvg && f.dir === "bear")!
const bull = all.find((f) => f.index === R.fvg && f.dir === "bull")!
const BPR_TOP = Math.min(bear.top, bull.top)
const BPR_BOTTOM = Math.max(bear.bottom, bull.bottom)

// Two candles whose bodies don't touch while their wicks overlap
const vi: Candle[] = [
  [100.0, 100.5, 99.8, 100.3],
  [100.3, 100.9, 100.2, 100.8],
  [100.95, 101.8, 100.7, 101.6],
  [101.6, 101.9, 101.3, 101.7],
  [101.7, 102.0, 101.4, 101.9],
]

export const lesson: LessonContent = {
  id: "u8-volume-imbalance-and-balanced-price-range",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Volume imbalance",
      body: [
        "A **volume imbalance** is a smaller cousin of the FVG. Two neighbouring candles' **bodies don't touch** (there is a gap between one close and the next open), even though their **wicks overlap**.",
        "It shows a jump in price between candles, often at a session open or on news. ICT traders watch these tiny gaps as levels price may come back to.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: vi,
          decimals: 2,
          height: 200,
          annotations: [{ kind: "zone", from: 1, to: 4, top: 100.95, bottom: 100.8, label: "Volume imbalance", tone: "accent" }],
          caption: "Illustrative: the close at 100.80 and the next open at 100.95 leave a gap between bodies",
        },
      },
    },
    {
      kind: "learn",
      title: "Balanced price range",
      body: [
        "When a bearish FVG and a later bullish FVG **overlap**, price has moved through the same area in both directions, fast. ICT calls the overlap a **balanced price range (BPR)**.",
        "It often acts as a strong reaction zone. In our setup, the bearish gap from the decline and the bullish gap from the displacement overlap, and the later pullback held right inside that overlap.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "zone", from: bear.index - 1, to: R.target, top: bear.top, bottom: bear.bottom, tone: "down" },
            { kind: "zone", from: bull.index - 1, to: R.target, top: bull.top, bottom: bull.bottom, tone: "up" },
            { kind: "zone", from: bull.index - 1, to: R.target, top: BPR_TOP, bottom: BPR_BOTTOM, label: "BPR", tone: "warn" },
          ],
          caption: "Illustrative: red = bearish FVG, green = bullish FVG, amber = their overlap",
        },
      },
    },
    {
      kind: "numeric",
      id: "bpr-bottom",
      prompt: "A bearish FVG spans 103.7 to 104.1. A later bullish FVG spans 103.2 to 104.1. Where is the bottom of the balanced price range?",
      answer: 103.7,
      tolerance: 0.001,
      explain: "The overlap runs from 103.7 to 104.1, so the BPR's bottom is 103.7.",
    },
    {
      kind: "match",
      id: "vi-bpr",
      prompt: "Match each term to its definition.",
      pairs: [
        ["Volume imbalance", "Bodies don't touch, wicks overlap"],
        ["Fair value gap", "Candle 1 and candle 3 wicks don't overlap"],
        ["Balanced price range", "Where a bullish and a bearish FVG overlap"],
      ],
      explain: "Three related ideas, from smallest (volume imbalance) to the overlap of two opposite gaps (BPR).",
    },
    {
      kind: "truefalse",
      id: "vi-wicks",
      statement: "In a volume imbalance, the two candles' wicks don't overlap either.",
      answer: false,
      explain: "If the wicks didn't overlap, it would be a real gap. In a volume imbalance only the bodies are apart.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Volume imbalance: a gap between bodies while wicks overlap.",
        "Balanced price range: the overlap of a bullish and a bearish FVG.",
        "Both are levels price often revisits and reacts to.",
      ],
    },
  ],
}
