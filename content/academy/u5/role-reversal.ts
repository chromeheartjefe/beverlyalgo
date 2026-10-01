import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Rejected twice near 102, breaks out, comes back to retest 102 from above
// (low at 20), then rallies.
const candles = swingCandles([[0, 99.5], [4, 102], [7, 100.4], [10, 101.95], [16, 104.5], [20, 102.15], [26, 105.5]], {
  noise: 0.15,
  wick: 0.2,
  seed: 62,
})

export const lesson: LessonContent = {
  id: "u5-role-reversal",
  sources: ["Wyckoff, Studies in Tape Reading (1910), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Old ceiling, new floor",
      body: [
        "When price breaks through resistance, that old ceiling often becomes a new floor. Broken support often becomes new resistance. This is **role reversal**, sometimes called a flip.",
        "It is one of the most reliable behaviours in charting, and the idea behind the **retest** entry.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [
            { kind: "zone", from: 2, top: 102.3, bottom: 101.85, label: "Resistance, then support", tone: "accent" },
            { kind: "marker", index: 20, at: "low", text: "Retest", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Why it happens",
      body: [
        "Think about who is around when price comes back to the broken level. Sellers who shorted at resistance are now losing, and many buy back to get out near break-even. Buyers who missed the breakout are glad of a second chance at the same price.",
        "Both groups buy at the old resistance, so it turns into support.",
      ],
    },
    {
      kind: "tap",
      id: "retest",
      prompt: "Price broke above resistance. Tap the candle where it came back to retest the level from above.",
      chart: { candles, decimals: 2 },
      targets: [20],
      explain: "Price returned to the old ceiling, it held as a floor, and the next leg up started from there.",
    },
    {
      kind: "choice",
      id: "broken-support",
      prompt: "Support at 50 breaks and price drops to 46. When it rallies back to 50, what does role reversal suggest?",
      options: [
        "The old support may now act as resistance",
        "Price will definitely break back above 50",
        "50 no longer matters at all",
        "Support levels can only ever be support",
      ],
      answer: 0,
      explain: "Buyers who bought at 50 are now trapped and may sell to get out at break-even, so 50 can cap the rally.",
    },
    {
      kind: "truefalse",
      id: "retest-guaranteed",
      statement: "Every breakout comes back to retest the broken level before moving on.",
      answer: false,
      explain: "Many strong breakouts never look back. Waiting for a retest can mean missing the move. That trade-off is your choice to make.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Broken resistance often becomes support, and broken support resistance.",
        "Trapped traders and late buyers or sellers create the flip.",
        "A retest of the broken level is a classic entry.",
        "Not every breakout retests.",
      ],
    },
  ],
}
