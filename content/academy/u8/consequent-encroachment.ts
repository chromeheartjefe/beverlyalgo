import { R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs, midpoint } from "@/lib/academy/smc"
import type { LessonContent } from "@/lib/academy/types"

const fvg = findFvgs(REVERSAL).find((f) => f.index === R.fvg && f.dir === "bull")!
const CE = midpoint(fvg.top, fvg.bottom)

export const lesson: LessonContent = {
  id: "u8-consequent-encroachment",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The middle of the gap",
      body: [
        "**Consequent encroachment (CE)** is ICT's name for the **50% level** of a fair value gap. It is the line many traders watch most closely inside a gap.",
        "A healthy bullish gap often sees price dip to around its midpoint and hold. If candles start closing below the midpoint, the gap is weakening.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, label: "FVG", tone: "accent" },
            { kind: "line", from: [fvg.index - 1, CE], to: [R.target, CE], label: "CE (50%)", tone: "warn", dashed: true },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "numeric",
      id: "ce-calc",
      prompt: "A bullish FVG runs from 103.2 to 104.1. Where is its consequent encroachment?",
      answer: 103.65,
      tolerance: 0.001,
      explain: "(103.2 + 104.1) ÷ 2 = 103.65.",
    },
    {
      kind: "tap",
      id: "ce-test",
      prompt: "Tap the candle that retraced to the gap's midpoint and held.",
      chart: {
        candles: REVERSAL,
        decimals: 2,
        annotations: [{ kind: "line", from: [fvg.index - 1, CE], to: [R.target, CE], tone: "warn", dashed: true }],
      },
      targets: [R.retrace],
      explain: "Its wick reached the midpoint exactly and the candle closed back above it. The next candles continued higher.",
    },
    {
      kind: "learn",
      title: "Wicks have a midpoint too",
      body: [
        "ICT applies the same idea to long wicks: the 50% of a big wick is often revisited and respected.",
        "Many traders use CE in their rules: \"enter at the top of the gap, stop out if a candle closes beyond CE\", or \"only enter at CE\". Pick one, write it down, and test it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "candles",
          groups: [
            {
              label: "The 50% of a big wick",
              note: "Often revisited and respected",
              candles: [[100, 101, 90, 99.5], [99.5, 100.5, 97, 98], [98, 98.5, 94.75, 97.2]],
              lines: [{ price: 94.75, label: "Midpoint of the wick", tone: "accent" }],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "ce-weak",
      prompt: "In a bullish FVG, several candles close below the consequent encroachment. What does that suggest?",
      options: [
        "The gap is weakening and may not hold",
        "The gap is stronger than ever",
        "A guaranteed bounce",
        "Nothing, closes don't matter",
      ],
      answer: 0,
      explain: "Buyers were expected to defend the middle of the gap. Closes below it show they aren't.",
    },
    {
      kind: "truefalse",
      id: "ce-only-fvg",
      statement: "Consequent encroachment can be applied to wicks as well as fair value gaps.",
      answer: true,
      explain: "ICT uses the 50% of a long wick in exactly the same way.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Consequent encroachment is the 50% level of a fair value gap.",
        "Healthy gaps tend to hold their midpoint.",
        "Closes beyond CE show weakness.",
        "The idea also applies to long wicks.",
      ],
    },
  ],
}
