import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const LOW = REVERSAL[R.sweep][2]
const HIGH = REVERSAL[R.legHigh][1]

export const lesson: LessonContent = {
  id: "u9-dealing-ranges",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The range that matters now",
      body: [
        "A **dealing range** is the range between the swing low and swing high that define the current leg, usually the leg that just broke structure.",
        "In our setup, the dealing range runs from the sweep low up to the high the displacement reached. Everything that happens next is judged against that range.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "line", from: [R.sweep, LOW], to: [R.target, LOW], label: "Range low", tone: "up", dashed: true },
            { kind: "line", from: [R.legHigh, HIGH], to: [R.target, HIGH], label: "Range high", tone: "down", dashed: true },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Why define one",
      body: [
        "A dealing range tells you where you are. Near its low, buying is cheap relative to the leg. Near its high, buying is expensive. Its edges are also the external liquidity from Unit 7.",
        "When price breaks out of the range and makes a new leg, you draw a new dealing range from that leg.",
      ],
    },
    {
      kind: "choice",
      id: "which-range",
      prompt: "Which swing points usually define the current dealing range?",
      options: [
        "The low and high of the most recent leg that broke structure",
        "The all-time high and the all-time low",
        "The open and close of today's candle",
        "Any two random candles",
      ],
      answer: 0,
      explain: "The latest structure-breaking leg is the move price is currently trading within.",
    },
    {
      kind: "numeric",
      id: "range-size",
      prompt: "The dealing range runs from 102.35 to 105.30. How tall is it?",
      answer: 2.95,
      tolerance: 0.001,
      explain: "105.30 − 102.35 = 2.95. You'll split that height in half in the next lesson.",
    },
    {
      kind: "truefalse",
      id: "range-forever",
      statement: "Once you draw a dealing range, it stays the same forever.",
      answer: false,
      explain: "When price breaks out and forms a new leg, the dealing range moves to the new swing points.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A dealing range spans the swing low and high of the current leg.",
        "It tells you whether price is cheap or expensive within that leg.",
        "Its edges hold external liquidity.",
        "Redraw it when a new leg breaks structure.",
      ],
    },
  ],
}
