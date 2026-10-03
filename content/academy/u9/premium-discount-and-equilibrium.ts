import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const LOW = REVERSAL[R.sweep][2]
const HIGH = REVERSAL[R.legHigh][1]
const EQ = Number(((LOW + HIGH) / 2).toFixed(3))

export const lesson: LessonContent = {
  id: "u9-premium-discount-and-equilibrium",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Cheap and expensive",
      body: [
        "Split the dealing range in half. The 50% line is **equilibrium**. Above it is **premium**: expensive. Below it is **discount**: cheap.",
        "ICT's rule of thumb: **buy in discount, sell in premium**. In a bullish setup, wait for price to retrace below equilibrium before looking for a long.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "zone", from: R.legHigh, to: R.target, top: HIGH, bottom: EQ, label: "Premium", tone: "down" },
            { kind: "zone", from: R.legHigh, to: R.target, top: EQ, bottom: LOW, label: "Discount", tone: "up" },
            { kind: "line", from: [R.legHigh, EQ], to: [R.target, EQ], tone: "warn", dashed: true },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "numeric",
      id: "eq-calc",
      prompt: "A dealing range runs from 100 to 110. Where is equilibrium?",
      answer: 105,
      tolerance: 0,
      explain: "(100 + 110) ÷ 2 = 105. Above 105 is premium, below is discount.",
    },
    {
      kind: "tap",
      id: "into-discount",
      prompt: "After the rally, tap the candle that retraced into discount.",
      chart: {
        candles: REVERSAL,
        decimals: 2,
        annotations: [{ kind: "line", from: [R.legHigh, EQ], to: [R.target, EQ], label: "Equilibrium", tone: "warn", dashed: true }],
      },
      targets: [R.retrace],
      explain: "Its low dipped below the 50% line: price was cheap relative to the leg, and the move continued from there.",
    },
    {
      kind: "learn",
      title: "Stacking it with zones",
      body: [
        "Premium and discount are a filter, not a signal. A bullish FVG or order block that sits **in discount** is stronger than the same zone in premium.",
        "In our chart, most of the fair value gap, its midpoint and the retrace all sat below equilibrium. Several reasons in one place.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          points: [100, 104, 110, 107, 103.5, 107, 108.5],
          marks: [{ at: 4, label: "A bullish zone in discount", tone: "up", side: "below" }],
          levels: [
            { price: 110, label: "Range high", tone: "neutral" },
            { price: 105, label: "Equilibrium", tone: "accent" },
            { price: 100, label: "Range low", tone: "neutral" },
          ],
        },
        caption: "Premium and discount are a filter, not a signal.",
      },
    },
    {
      kind: "choice",
      id: "short-where",
      prompt: "In a bearish setup, where does ICT prefer to look for short entries?",
      options: ["In premium, above equilibrium", "In discount, below equilibrium", "Exactly at the range low", "Anywhere, location doesn't matter"],
      answer: 0,
      explain: "Sell when price is expensive relative to the leg: in premium.",
    },
    {
      kind: "truefalse",
      id: "eq-signal",
      statement: "Price reaching discount is a buy signal on its own.",
      answer: false,
      explain: "Discount only says price is cheap within the range. You still need a reason to enter, like a zone and a structure shift.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Equilibrium is the 50% of the dealing range.",
        "Premium above it, discount below it.",
        "Buy in discount, sell in premium.",
        "Use it as a filter on top of zones and structure.",
      ],
    },
  ],
}
