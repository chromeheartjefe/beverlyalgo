import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { rsi } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// A strong rally that stays overbought, a pullback, then a slide that goes oversold
const candles = candlesFromCloses(
  pathCloses([[0, 100], [12, 99], [28, 110], [34, 108], [44, 109.5], [58, 101.5], [64, 103]], { noise: 0.35, seed: 83 }),
  { wick: 0.45, seed: 83 },
)
const values = rsi(candles, 14)

export const lesson: LessonContent = {
  id: "u6-rsi",
  sources: ["J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978): the Relative Strength Index"],
  steps: [
    {
      kind: "learn",
      title: "Measuring momentum",
      body: [
        "The **Relative Strength Index (RSI)**, created by J. Welles Wilder in 1978, compares the size of recent gains with recent losses. It moves between 0 and 100, usually over 14 candles.",
        "High RSI means gains have been dominating. Low RSI means losses have. It is drawn in its own panel under the chart.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          pane: { label: "RSI 14", lines: [{ values, tone: "accent" }], levels: [30, 70], min: 0, max: 100 },
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "The formula, in one line",
      body: [
        "RS = average gain ÷ average loss over the period. RSI = 100 − 100 ÷ (1 + RS).",
        "If average gains equal average losses, RS = 1 and RSI = 50. The bigger the gains compared with the losses, the closer RSI gets to 100.",
      ],
    },
    {
      kind: "numeric",
      id: "rsi-calc",
      prompt: "Over the last 14 candles the average gain is 2 and the average loss is 1. What is the RSI? (one decimal is fine)",
      answer: 66.67,
      tolerance: 0.1,
      explain: "RS = 2 ÷ 1 = 2. RSI = 100 − 100 ÷ (1 + 2) = 100 − 33.3 = 66.7.",
    },
    {
      kind: "learn",
      title: "Overbought is not a sell signal",
      body: [
        "RSI above **70** is called **overbought**, below **30** **oversold**. Beginners sell every 70 and buy every 30, and get run over.",
        "In a strong trend RSI can stay above 70 for a long time, as it did during the rally in the chart above. Overbought just means momentum is strong. Many traders use the **50 line** instead: above 50, bulls have the momentum; below, bears do.",
      ],
    },
    {
      kind: "truefalse",
      id: "overbought-sell",
      statement: "When RSI goes above 70, price is about to fall.",
      answer: false,
      explain: "Strong uptrends keep RSI above 70 for long stretches. Overbought describes strength; it doesn't time a top.",
    },
    {
      kind: "choice",
      id: "rsi-use",
      prompt: "Which use of RSI is most sensible?",
      options: [
        "Checking whether momentum supports a setup you already found from structure",
        "Selling every time RSI touches 70",
        "Buying every time RSI touches 30",
        "Ignoring price and trading RSI alone",
      ],
      answer: 0,
      explain: "RSI works best as confirmation. Structure and levels find the trade; RSI tells you whether momentum agrees.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "RSI compares recent gains with recent losses, on a 0 to 100 scale.",
        "RSI = 100 − 100 ÷ (1 + average gain ÷ average loss).",
        "Above 70 is overbought, below 30 oversold, but trends can stay there.",
        "The 50 line shows which side has momentum.",
      ],
    },
  ],
}
