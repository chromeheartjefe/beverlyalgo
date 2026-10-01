import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { closes, sma } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// A sharp V: down for 20 candles, then straight back up. The 20 SMA keeps
// falling long after price has turned.
const candles = candlesFromCloses(pathCloses([[0, 110], [20, 100], [40, 110]], { noise: 0.4, seed: 81 }), { wick: 0.5, seed: 81 })
const ma = sma(closes(candles), 20)
const LOW = 20
// First candle after the low where the average finally turns up
const MA_TURN = ma.findIndex((v, i) => i > LOW && v !== null && ma[i - 1] !== null && v > ma[i - 1]!)

export const lesson: LessonContent = {
  id: "u6-why-indicators-lag",
  sources: ["J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978): indicator formulas"],
  steps: [
    {
      kind: "learn",
      title: "Indicators are made of the past",
      body: [
        "Every indicator is a formula applied to past prices (and sometimes volume). A moving average is an average of the last N closes. RSI compares recent gains with recent losses.",
        "That means an indicator can only react to what price has already done. It always arrives **after** the move it describes. That delay is called **lag**.",
      ],
    },
    {
      kind: "learn",
      title: "Lag on a chart",
      body: [
        "Price bottomed and turned sharply up. The 20-period moving average kept falling for several more candles, because it was still averaging the lower prices of the decline.",
        "By the time the average turned up, a big part of the new move was already over.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          overlays: [{ values: ma, tone: "warn", label: "SMA 20" }],
          annotations: [
            { kind: "marker", index: LOW, at: "low", text: "Price turns", tone: "up" },
            { kind: "marker", index: MA_TURN, at: "high", text: "Average turns", tone: "warn" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "truefalse",
      id: "leading",
      statement: "An indicator can tell you what price will do before price does it.",
      answer: false,
      explain: "Indicators are calculated from prices that already happened. Some react faster than others, but none can see the future.",
    },
    {
      kind: "learn",
      title: "Faster means noisier",
      body: [
        "You can reduce lag by using fewer candles in the formula. A 5-period average turns much sooner than a 50-period one. The cost is noise: it also turns on every small wiggle, giving more false signals.",
        "Every indicator setting is a trade-off between speed and reliability. There is no setting that is both.",
      ],
    },
    {
      kind: "choice",
      id: "speed-tradeoff",
      prompt: "You shorten a moving average from 50 periods to 10. What happens?",
      options: [
        "It reacts faster but gives more false signals",
        "It becomes both faster and more reliable",
        "It stops lagging completely",
        "Nothing changes",
      ],
      answer: 0,
      explain: "Fewer periods means less lag and more sensitivity to noise. You trade reliability for speed.",
    },
    {
      kind: "truefalse",
      id: "slow-turns-first",
      statement: "A 200-period moving average turns faster than a 20-period one.",
      answer: false,
      explain: "The 200-period average includes ten times more history, so it reacts far more slowly to a change in direction.",
    },
    {
      kind: "learn",
      title: "How to use them",
      body: [
        "Use indicators to **describe** the market, not to predict it: is momentum strong or fading? Is volatility high or low? Is price stretched far from its average?",
        "Structure and levels decide where you trade. Indicators can add confirmation and context. That is how the rest of this unit treats them.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Indicators are formulas on past prices, so they always lag.",
        "Faster settings lag less but give more false signals.",
        "Use indicators to describe conditions, not to predict.",
        "Structure and levels come first; indicators confirm.",
      ],
    },
  ],
}
