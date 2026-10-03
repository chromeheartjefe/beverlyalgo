import { R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { LessonContent } from "@/lib/academy/types"

const fvg = findFvgs(REVERSAL).find((f) => f.index === R.fvg && f.dir === "bull")!

export const lesson: LessonContent = {
  id: "u8-fair-value-gaps",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The three-candle gap",
      body: [
        "A **fair value gap (FVG)** is a three-candle pattern. When the middle candle moves so fast that **candle 1's wick and candle 3's wick don't overlap**, the space between them is the gap.",
        "Inside it, price only traded in one direction. ICT traders see it as an imbalance that price often comes back to rebalance.",
      ],
      visual: { type: "figure", id: "fvg-fill" },
    },
    {
      kind: "learn",
      title: "Bullish and bearish",
      body: [
        "**Bullish FVG**: candle 3's low is above candle 1's high. The gap runs from candle 1's high up to candle 3's low. ICT calls it **BISI**: buy-side imbalance, sell-side inefficiency.",
        "**Bearish FVG**: candle 3's high is below candle 1's low. ICT calls it **SIBI**: sell-side imbalance, buy-side inefficiency.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [{ kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, label: "Bullish FVG", tone: "accent" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "fvg-middle",
      prompt: "Tap the middle candle of the bullish FVG left by the move that broke structure.",
      chart: { candles: REVERSAL, decimals: 2 },
      targets: [fvg.index],
      explain: "The big displacement candle is the middle one: the candle before it and the candle after it don't overlap.",
    },
    {
      kind: "numeric",
      id: "fvg-size",
      prompt: "Candle 1's high is 100.9 and candle 3's low is 102.0. How tall is the bullish fair value gap?",
      answer: 1.1,
      tolerance: 0.001,
      explain: "102.0 − 100.9 = 1.1. The gap runs from candle 1's high up to candle 3's low.",
    },
    {
      kind: "match",
      id: "bisi-sibi",
      prompt: "Match each term to its meaning.",
      pairs: [
        ["BISI", "A bullish fair value gap"],
        ["SIBI", "A bearish fair value gap"],
        ["Bullish FVG edges", "Candle 1's high to candle 3's low"],
        ["Bearish FVG edges", "Candle 1's low to candle 3's high"],
      ],
      explain: "BISI is the bullish gap, SIBI the bearish one, and the edges always come from candles 1 and 3.",
    },
    {
      kind: "learn",
      title: "Using FVGs",
      body: [
        "In a bullish setup, traders wait for price to retrace into a bullish FVG and look for entries there, with the stop below the move's low. Many enter at the top of the gap or at its midpoint.",
        "Gaps that form with displacement, after a liquidity sweep, in the direction of the higher-timeframe bias, are taken far more seriously than random small gaps.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "A bullish setup",
          nodes: [
            { label: "A bullish FVG", icon: "layers", tone: "accent" },
            { label: "Price retraces into it", icon: "repeat" },
            { label: "Entry", sub: "the top of the gap or its midpoint", icon: "target", tone: "up" },
            { label: "Stop", sub: "below the move's low", icon: "shield", tone: "down" },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "fvg-any",
      statement: "Every small gap between candles is a high-quality trading level.",
      answer: false,
      explain: "Gaps appear constantly. Context makes them meaningful: displacement, a prior sweep, structure and the bigger trend.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "An FVG is a gap between candle 1's wick and candle 3's wick.",
        "Bullish (BISI): candle 1 high to candle 3 low. Bearish (SIBI): candle 1 low to candle 3 high.",
        "Price often returns to rebalance the gap.",
        "Context decides which gaps matter.",
      ],
    },
  ],
}
