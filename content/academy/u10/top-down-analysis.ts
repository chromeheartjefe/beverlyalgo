import { R, REVERSAL } from "@/content/academy/l3/setups"
import { swingCandles } from "@/lib/academy/candles"
import { findFvgs } from "@/lib/academy/smc"
import type { LessonContent } from "@/lib/academy/types"

const htf = swingCandles([[0, 100], [5, 104], [9, 102.3], [15, 107], [19, 104.6], [23, 105.5]], { noise: 0.2, wick: 0.35, seed: 96 })
const fvg = findFvgs(REVERSAL).find((f) => f.index === R.fvg && f.dir === "bull")!

export const lesson: LessonContent = {
  id: "u10-top-down-analysis",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Three timeframes, three jobs",
      body: [
        "ICT entry models all follow the same top-down routine, building on Unit 4:",
        "**Daily or 4-hour**: decide the bias and the draw on liquidity. **1-hour or 15-minute**: find a point of interest in discount (for longs) where price could turn. **5-minute or 1-minute**: wait inside that area for the trigger, usually a sweep and an MSS, and enter.",
      ],
    },
    {
      kind: "learn",
      title: "From the big picture to the entry",
      body: [
        "Top: the 4-hour chart is trending up and pulling back. Bottom: zoomed into that pullback on a 5-minute chart, price sweeps sell-side liquidity, shifts structure up and leaves a fair value gap: the entry.",
      ],
      visual: {
        type: "charts",
        charts: [
          { candles: htf, decimals: 2, caption: "4-hour: bullish bias, pullback underway" },
          {
            candles: REVERSAL,
            decimals: 2,
            annotations: [
              { kind: "marker", index: R.sweep, at: "low", text: "Sweep", tone: "down" },
              { kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, label: "Entry FVG", tone: "accent" },
            ],
            caption: "5-minute: the trigger inside the pullback",
          },
        ],
      },
    },
    {
      kind: "match",
      id: "tf-jobs",
      prompt: "Match each timeframe to its job.",
      pairs: [
        ["Daily or 4-hour", "Bias and draw on liquidity"],
        ["1-hour or 15-minute", "Point of interest"],
        ["5-minute or 1-minute", "Entry trigger"],
      ],
      explain: "Direction from the top, location from the middle, timing from the bottom.",
    },
    {
      kind: "choice",
      id: "skip-step",
      prompt: "A trader takes every 1-minute MSS without checking higher timeframes. What is the main risk?",
      options: [
        "Many entries will fight the bigger trend and run into opposing liquidity",
        "Their stops will be too wide",
        "They will trade too rarely",
        "Nothing, the 1-minute chart is enough",
      ],
      answer: 0,
      explain: "Low-timeframe shifts happen constantly. Without the higher-timeframe filter, half of them point the wrong way.",
    },
    {
      kind: "truefalse",
      id: "entry-tf",
      statement: "In top-down analysis, the entry timeframe decides the bias.",
      answer: false,
      explain: "The bias comes from the higher timeframe. The entry timeframe only times the trade.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Higher timeframe: bias and draw.",
        "Middle timeframe: the point of interest.",
        "Lower timeframe: the trigger and entry.",
        "Never let the entry timeframe overrule the bias.",
      ],
    },
  ],
}
