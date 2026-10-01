import { R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs, midpoint } from "@/lib/academy/smc"
import type { ChartAnnotation, LessonContent } from "@/lib/academy/types"

const fvg = findFvgs(REVERSAL).find((f) => f.index === R.fvg && f.dir === "bull")!
const ENTRY = midpoint(fvg.top, fvg.bottom)
const STOP = Number((REVERSAL[R.sweep][2] - 0.05).toFixed(2))
const TARGET = REVERSAL[R.oldHigh][1]
const LH = REVERSAL[R.lastLowerHigh][1]

const plan: ChartAnnotation[] = [
  { kind: "line", from: [R.lastLowerHigh, LH], to: [R.displacement, LH], label: "MSS", tone: "warn", dashed: true },
  { kind: "line", from: [R.displacement, ENTRY], to: [R.target, ENTRY], label: "Entry (CE)", tone: "accent" },
  { kind: "line", from: [R.displacement, STOP], to: [R.target, STOP], label: "Stop", tone: "down", dashed: true },
  { kind: "line", from: [R.displacement, TARGET], to: [R.target, TARGET], label: "Target: BSL", tone: "up", dashed: true },
]

export const lesson: LessonContent = {
  id: "u10-the-mss-and-fvg-entry",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The core model",
      body: [
        "Almost every ICT model is a variation of one sequence. For a long:",
        "1. Price **sweeps sell-side liquidity** (in your POI, ideally in a killzone). 2. It **displaces** up and makes a **market structure shift**. 3. The displacement leaves a **fair value gap**. 4. Enter with a **limit order** in the gap (its top or its CE). 5. **Stop** below the sweep low. 6. **Target** the opposite liquidity.",
      ],
      visual: { type: "chart", chart: { candles: REVERSAL, decimals: 2, annotations: plan, caption: "Illustrative: the full long setup" } },
    },
    {
      kind: "match",
      id: "steps",
      prompt: "Match each part of the plan to where it goes.",
      pairs: [
        ["Trigger", "A sweep, then an MSS with displacement"],
        ["Entry", "A limit order in the fair value gap"],
        ["Stop", "Just beyond the sweep's extreme"],
        ["Target", "The opposite pool of liquidity"],
      ],
      explain: "Each part has a reason: the sweep shows the stops were taken, the gap gives a precise entry, and the target is where price is drawn.",
    },
    {
      kind: "tap",
      id: "entry-fill",
      prompt: "Tap the candle where the limit order at the gap's midpoint got filled.",
      chart: { candles: REVERSAL, decimals: 2, annotations: [plan[1]] },
      targets: [R.retrace],
      explain: "The retrace reached the CE of the gap. The order filled there and price ran to the target.",
    },
    {
      kind: "numeric",
      id: "rr",
      prompt: "Entry 103.65, stop 102.30, target 106.45. What is the reward-to-risk ratio? (one decimal)",
      answer: 2.07,
      tolerance: 0.06,
      suffix: ": 1",
      explain: "Risk = 103.65 − 102.30 = 1.35. Reward = 106.45 − 103.65 = 2.80. 2.80 ÷ 1.35 ≈ 2.1.",
    },
    {
      kind: "learn",
      title: "When to skip it",
      body: [
        "Skip the setup if the MSS came **without displacement** (weak, overlapping candles), if it goes **against the higher-timeframe bias**, if the gap sits in **premium** for a long, or if the target leaves less than about 2R.",
        "And if price never comes back to your limit order, let it go. Chasing the move breaks the model.",
      ],
    },
    {
      kind: "choice",
      id: "missed",
      prompt: "Price shifts structure and runs away without retracing to your limit order in the gap. What should you do?",
      options: [
        "Let it go and wait for the next setup",
        "Buy at market wherever price is",
        "Move the entry up to the current price and keep the same stop",
        "Short it out of frustration",
      ],
      answer: 0,
      explain: "The model's edge comes from the entry location. Chasing gives worse reward-to-risk and breaks your rules.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Sweep, displacement with MSS, FVG, limit entry, stop beyond the sweep, target opposite liquidity.",
        "Enter at the gap's top or its CE.",
        "Skip weak shifts, counter-bias setups and poor reward-to-risk.",
        "Never chase a setup that didn't come back to you.",
      ],
    },
  ],
}
