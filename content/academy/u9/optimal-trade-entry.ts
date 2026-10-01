import { R, REVERSAL_DEEP } from "@/content/academy/l3/setups"
import type { ChartAnnotation, LessonContent } from "@/lib/academy/types"

const LOW = REVERSAL_DEEP[R.sweep][2]
const HIGH = REVERSAL_DEEP[R.legHigh][1]
const at = (r: number) => Number((HIGH - (HIGH - LOW) * r).toFixed(3))
const OTE_TOP = at(0.62)
const OTE_BOTTOM = at(0.79)

const ote: ChartAnnotation[] = [
  { kind: "zone", from: R.legHigh, to: R.target, top: OTE_TOP, bottom: OTE_BOTTOM, label: "OTE 62% to 79%", tone: "accent" },
  { kind: "line", from: [R.legHigh, at(0.705)], to: [R.target, at(0.705)], tone: "warn", dashed: true },
]

export const lesson: LessonContent = {
  id: "u9-optimal-trade-entry",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Deep in discount",
      body: [
        "ICT's **optimal trade entry (OTE)** is the zone between the **62% and 79%** retracement of a leg, drawn with the Fibonacci tool from Unit 5. The **70.5%** level in the middle is often called the sweet spot.",
        "It sits deep in discount (for longs), so entries there have small stops (just beyond the leg's start) and large potential reward.",
      ],
      visual: { type: "chart", chart: { candles: REVERSAL_DEEP, decimals: 2, annotations: ote, caption: "Illustrative" } },
    },
    {
      kind: "numeric",
      id: "ote-705",
      prompt: "A leg runs from 100 up to 110. Where is the 70.5% retracement?",
      answer: 102.95,
      tolerance: 0.001,
      explain: "70.5% of 10 is 7.05, and 110 − 7.05 = 102.95.",
    },
    {
      kind: "tap",
      id: "ote-touch",
      prompt: "Tap the candle that retraced into the OTE zone.",
      chart: { candles: REVERSAL_DEEP, decimals: 2, annotations: ote },
      targets: [R.retrace],
      explain: "Its low reached into the 62% to 79% zone, right around the order block, and price rallied from there.",
    },
    {
      kind: "learn",
      title: "OTE plus a reason",
      body: [
        "On its own, a Fibonacci zone is just a zone. ICT traders look for OTE that lines up with something else: a fair value gap, an order block, a breaker, and ideally a liquidity sweep before the leg.",
        "In this chart the OTE overlapped the order block from Unit 8. Those overlaps are what make a level worth acting on.",
      ],
    },
    {
      kind: "choice",
      id: "ote-why",
      prompt: "Why do traders like entering in the OTE zone of a bullish leg?",
      options: [
        "The stop can sit just below the leg's low, so risk is small compared with the target",
        "Price never goes below the 79% level",
        "It guarantees the highest win rate",
        "Exchanges give better fills there",
      ],
      answer: 0,
      explain: "A deep entry close to the leg's origin keeps risk small and leaves a lot of room to the target.",
    },
    {
      kind: "truefalse",
      id: "ote-always",
      statement: "Every pullback reaches the OTE zone.",
      answer: false,
      explain: "Strong trends often only retrace to the FVG or to 50%. Waiting for OTE means missing some moves.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "OTE is the 62% to 79% retracement of a leg; 70.5% is the sweet spot.",
        "It offers small risk and large reward.",
        "It is strongest when it overlaps an FVG, order block or breaker.",
        "Not every pullback reaches it.",
      ],
    },
  ],
}
