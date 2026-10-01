import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Daily chart: an uptrend whose last swing high (the draw) hasn't been taken yet
const daily = swingCandles([[0, 100], [6, 106], [10, 103.4], [17, 109.5], [22, 106.2], [27, 108.4]], { noise: 0.25, wick: 0.4, seed: 95 })
const DRAW = daily[17][1]

export const lesson: LessonContent = {
  id: "u10-bias-and-draw-on-liquidity",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Where is price going?",
      body: [
        "Every ICT model starts with one question: **where is price likely to go next?** The answer is the **draw on liquidity (DOL)**: the pool of liquidity or imbalance price is most likely heading for.",
        "Typical draws: an old high or low that hasn't been taken yet (external liquidity), or a large unfilled fair value gap on the daily or 4-hour chart (internal liquidity).",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: daily,
          decimals: 2,
          annotations: [{ kind: "line", from: [17, DRAW], to: [daily.length - 1, DRAW], label: "Draw: the old high", tone: "up", dashed: true }],
          caption: "Illustrative daily chart",
        },
      },
    },
    {
      kind: "learn",
      title: "From draw to bias",
      body: [
        "Your **bias** is simply the direction towards the draw. If the daily trend is up and an untaken high sits above, the bias is bullish: you look for buys and ignore sells.",
        "A bias is a working assumption, not a prediction to defend. If price takes the opposite liquidity and breaks structure against you, the bias changes.",
      ],
    },
    {
      kind: "choice",
      id: "pick-draw",
      prompt: "The daily trend is up. Above price is an untaken swing high; below, a fair value gap that was already filled. What is the most likely draw?",
      options: ["The untaken swing high", "The filled gap below", "The middle of the last candle", "There is no draw"],
      answer: 0,
      explain: "The high still holds its buy-side liquidity and lines up with the trend. The filled gap has already done its job.",
    },
    {
      kind: "truefalse",
      id: "bias-fixed",
      statement: "Once you decide your bias for the week, you should never change it.",
      answer: false,
      explain: "A bias is an assumption. When structure and liquidity say otherwise, adapt.",
    },
    {
      kind: "choice",
      id: "bias-use",
      prompt: "Your bias is bullish. A clean bearish setup appears on the 5-minute chart. What does the ICT approach suggest?",
      options: [
        "Skip it and wait for buy setups in line with the bias",
        "Take it with double size",
        "Take both buys and sells to be safe",
        "Change your bias immediately",
      ],
      answer: 0,
      explain: "The bias filters out trades against the draw. One small bearish setup isn't enough to change it.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The draw on liquidity is where price is most likely heading.",
        "Draws: untaken highs and lows, large unfilled higher-timeframe gaps.",
        "Your bias is the direction towards the draw.",
        "Trade with the bias; update it when structure says so.",
      ],
    },
  ],
}
