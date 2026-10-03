import { R, REVERSAL_BEAR } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { ChartAnnotation, LessonContent } from "@/lib/academy/types"

// The bearish mirror: equal highs swept at 15, displacement down at 16 with a
// bearish FVG, retrace into it at 20, then the drop to the old low.
const fvg = findFvgs(REVERSAL_BEAR).find((f) => f.index === R.fvg && f.dir === "bear")!
const EQH = Math.max(REVERSAL_BEAR[R.eql1][1], REVERSAL_BEAR[R.eql2][1])
const STOP = Number((REVERSAL_BEAR[R.sweep][1] + 0.05).toFixed(2))

const plan: ChartAnnotation[] = [
  { kind: "line", from: [R.eql1, EQH], to: [R.sweep, EQH], label: "Equal highs", tone: "neutral", dashed: true },
  { kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, label: "Bearish FVG", tone: "accent" },
  { kind: "line", from: [R.displacement, STOP], to: [R.target, STOP], label: "Stop", tone: "down", dashed: true },
]

export const lesson: LessonContent = {
  id: "u10-turtle-soup-reversal",
  sources: [
    "Linda Bradford Raschke and Laurence Connors, Street Smarts (1995): the original Turtle Soup setup",
    "ICT terminology as commonly taught; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Turtle soup as an entry model",
      body: [
        "In Unit 7 you learned turtle soup as a stop hunt. As an entry model, it adds the trigger and the trade:",
        "1. An **obvious high** (equal highs, the previous day's high, the Asian high) gets **run**. 2. Price **closes back below** it. 3. A **displacement down** makes an MSS and leaves a **bearish FVG**. 4. **Sell** the retrace into the gap, **stop** above the sweep high, **target** the sell-side liquidity below.",
      ],
      visual: { type: "chart", chart: { candles: REVERSAL_BEAR, decimals: 2, annotations: plan, caption: "Illustrative bearish turtle soup" } },
    },
    {
      kind: "tap",
      id: "ts-entry",
      prompt: "Tap the candle where a short entry in the bearish gap would have filled.",
      chart: { candles: REVERSAL_BEAR, decimals: 2, annotations: [plan[1]] },
      targets: [R.retrace],
      explain: "After the sweep and the displacement down, price retraced up into the bearish gap. That was the entry, before the drop.",
    },
    {
      kind: "choice",
      id: "ts-stop",
      prompt: "Where does the stop go in a bearish turtle soup?",
      options: ["Just above the high of the sweep", "Just below the entry", "At the old low", "No stop is needed"],
      answer: 0,
      explain: "If price goes back above the sweep's high, the stop run wasn't a failure after all, and the idea is wrong.",
    },
    {
      kind: "learn",
      title: "Best places for it",
      body: [
        "Turtle soup works best at highs and lows that **everyone** sees: the previous day's high or low, the previous week's, equal highs and lows, and the edges of the Asian range during the London or New York killzone.",
        "It works worst against a strong higher-timeframe trend. Fading a real breakout is expensive.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Highs and lows that everyone sees",
          items: [
            { text: "The previous day's high or low", mark: "ok" },
            { text: "The previous week's high or low", mark: "ok" },
            { text: "Equal highs and lows", mark: "ok" },
            { text: "The edges of the Asian range, in a killzone", mark: "ok" },
            { text: "Worst against a strong higher-timeframe trend", mark: "bad" },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "ts-any-high",
      statement: "Turtle soup works just as well against a strong higher-timeframe trend.",
      answer: false,
      explain: "In a strong trend, most new highs are real. Turtle soup fits best at obvious levels where the bigger picture supports a reversal.",
    },
    {
      kind: "choice",
      id: "ts-level",
      prompt: "Which level is the best candidate for a turtle soup short during the London killzone?",
      options: ["The previous day's high", "A random intraday price", "The midpoint of the last candle", "A level no one has seen"],
      answer: 0,
      explain: "The previous day's high is watched by almost everyone, so its stop pool is large and obvious.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Turtle soup: run an obvious level, fail back inside, then MSS with displacement.",
        "Enter on the retrace into the gap; stop beyond the sweep.",
        "Best at widely watched highs and lows, in a killzone.",
        "Avoid it against a strong higher-timeframe trend.",
      ],
    },
  ],
}
