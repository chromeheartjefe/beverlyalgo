import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { macd } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

const candles = candlesFromCloses(
  pathCloses([[0, 104], [20, 98], [45, 110], [58, 106], [70, 111]], { noise: 0.35, seed: 84 }),
  { wick: 0.45, seed: 84 },
)
const m = macd(candles)

export const lesson: LessonContent = {
  id: "u6-macd",
  sources: ["Gerald Appel, MACD (late 1970s): standard 12, 26, 9 settings"],
  steps: [
    {
      kind: "learn",
      title: "Two averages, one story",
      body: [
        "**MACD** (moving average convergence divergence), developed by Gerald Appel in the late 1970s, tracks the gap between a fast and a slow EMA.",
        "**MACD line** = 12-period EMA − 26-period EMA. **Signal line** = 9-period EMA of the MACD line. **Histogram** = MACD line − signal line.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          pane: {
            label: "MACD 12 26 9",
            lines: [
              { values: m.line, tone: "accent" },
              { values: m.signal, tone: "warn" },
            ],
            histogram: m.histogram,
            decimals: 1,
          },
          caption: "Illustrative. Purple: MACD line. Amber: signal line. Bars: histogram.",
        },
      },
    },
    {
      kind: "match",
      id: "macd-parts",
      prompt: "Match each part of MACD to how it is calculated.",
      pairs: [
        ["MACD line", "12 EMA minus 26 EMA"],
        ["Signal line", "9 EMA of the MACD line"],
        ["Histogram", "MACD line minus signal line"],
      ],
      explain: "Everything comes from two EMAs of price, then an average of their difference.",
    },
    {
      kind: "learn",
      title: "Reading it",
      body: [
        "**Above zero**, the fast EMA is above the slow one: upward momentum. **Below zero**, downward momentum.",
        "**Crossovers**: the MACD line crossing above the signal line shows momentum improving; crossing below shows it fading. The **histogram** shrinking towards zero shows a move losing steam, often before the crossover happens.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "Reading MACD",
          corner: "",
          cols: ["What it shows"],
          rows: [
            { label: "Above zero", cells: ["Upward momentum"], tones: ["up"] },
            { label: "Below zero", cells: ["Downward momentum"], tones: ["down"] },
            { label: "Cross above the signal line", cells: ["Momentum improving"], tones: ["up"] },
            { label: "Cross below the signal line", cells: ["Momentum fading"], tones: ["down"] },
            { label: "Histogram shrinking", cells: ["A move losing steam"], tones: ["warn"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "macd-cross",
      prompt: "The MACD line crosses above its signal line while both are below zero. What does that suggest?",
      options: [
        "Downward momentum is fading, though the bigger trend is still down",
        "A guaranteed new uptrend",
        "The market is closed",
        "Volume is about to spike",
      ],
      answer: 0,
      explain: "The cross shows momentum improving, but below zero the fast average is still under the slow one. It is an early sign, not a confirmed reversal.",
    },
    {
      kind: "truefalse",
      id: "histogram-shrinking",
      statement: "A shrinking MACD histogram shows the current move is losing momentum.",
      answer: true,
      explain: "The bars measure the gap between MACD and signal. As it narrows, the move is slowing down.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "MACD line: 12 EMA − 26 EMA. Signal: 9 EMA of MACD. Histogram: the difference.",
        "Above zero: upward momentum. Below zero: downward.",
        "Crossovers show momentum turning; a shrinking histogram warns earlier.",
        "Like every indicator, it lags and works best as confirmation.",
      ],
    },
  ],
}
