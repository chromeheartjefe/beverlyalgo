import { R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { LessonContent } from "@/lib/academy/types"

const fvg = findFvgs(REVERSAL).find((f) => f.index === R.fvg && f.dir === "bull")!
const OLD_HIGH = REVERSAL[R.oldHigh][1]

export const lesson: LessonContent = {
  id: "u7-internal-vs-external-range-liquidity",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Two kinds of targets",
      body: [
        "ICT splits liquidity into two kinds. **External range liquidity (ERL)** sits at the edges of the current range: beyond the swing highs and lows, where the stops are.",
        "**Internal range liquidity (IRL)** sits inside the range: mostly **fair value gaps**, the imbalances price left behind (next unit).",
      ],
    },
    {
      kind: "learn",
      title: "Price alternates between them",
      body: [
        "The idea: after price takes external liquidity, it tends to come back into the range to rebalance internal liquidity, and from there it heads for the external liquidity on the other side.",
        "In the chart: price swept the external low, rallied, retraced into the fair value gap (internal), then ran to the old high (external).",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, label: "IRL: fair value gap", tone: "accent" },
            { kind: "marker", index: R.sweep, at: "low", text: "ERL taken", tone: "down" },
            { kind: "hline", price: OLD_HIGH, label: "ERL: old high", tone: "up", dashed: true },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "match",
      id: "irl-erl",
      prompt: "Match each term to an example.",
      pairs: [
        ["External range liquidity", "Stops beyond the range's swing high"],
        ["Internal range liquidity", "A fair value gap inside the range"],
      ],
      explain: "External sits at the edges, beyond swing points. Internal sits within, in the gaps price left behind.",
    },
    {
      kind: "tap",
      id: "irl-touch",
      prompt: "After the sweep and the rally, tap the candle where price came back into internal range liquidity.",
      chart: {
        candles: REVERSAL,
        decimals: 2,
        annotations: [{ kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, tone: "accent" }],
      },
      targets: [R.retrace],
      explain: "Price dipped back into the fair value gap left by the displacement, rebalanced it, and continued to the old high.",
    },
    {
      kind: "choice",
      id: "next-target",
      prompt: "Price just swept a range low and displaced upward, leaving a fair value gap. In ICT's framing, what comes next most often?",
      options: [
        "A retrace into the gap, then a run towards the highs",
        "A straight drop back below the swept low",
        "Price stops moving",
        "A gap down at the next open",
      ],
      answer: 0,
      explain: "External taken, then internal (the gap), then external on the other side. A tendency to look for, not a certainty.",
    },
    {
      kind: "truefalse",
      id: "erl-inside",
      statement: "External range liquidity sits inside the range, in fair value gaps.",
      answer: false,
      explain: "That is internal range liquidity. External sits beyond the range's highs and lows.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "External range liquidity: beyond the range's highs and lows.",
        "Internal range liquidity: fair value gaps inside the range.",
        "Price often moves external, then internal, then external again.",
      ],
    },
  ],
}
