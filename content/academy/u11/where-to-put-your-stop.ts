import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const SWEEP_LOW = REVERSAL[R.sweep][2]

export const lesson: LessonContent = {
  id: "u11-where-to-put-your-stop",
  sources: ["J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978): Average True Range"],
  steps: [
    {
      kind: "learn",
      title: "Where the idea is wrong",
      body: [
        "A stop isn't a pain threshold. It is the price at which your **trade idea is proven wrong**.",
        "For a long after a liquidity sweep, the idea is: the low has been taken and buyers are in control. If price goes back below the sweep's low, that idea is wrong. So the stop goes just below it.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [{ kind: "line", from: [R.sweep, SWEEP_LOW - 0.05], to: [R.target, SWEEP_LOW - 0.05], label: "Stop below the sweep", tone: "down", dashed: true }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Three solid methods",
      body: [
        "**Structure**: beyond the swing point or sweep that your setup depends on. **Volatility**: 1.5 to 2 ATR from entry, so normal noise doesn't hit it. **Both**: beyond structure, with at least about 1 ATR of room.",
        "A stop based on a dollar amount you'd \"like\" to lose, with no link to the chart, is the one method that doesn't work.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Structure", icon: "flag", tone: "accent", points: ["Beyond the swing point or sweep the setup depends on"] },
            { title: "Volatility", icon: "candles", tone: "warn", points: ["1.5 to 2 ATR from entry", "Normal noise doesn't hit it"] },
            { title: "Both", icon: "shield", tone: "up", points: ["Beyond structure", "With about 1 ATR of room"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "stop-method",
      prompt: "Which stop placement makes the most sense for a long after a sweep of equal lows?",
      options: [
        "A little below the low of the sweep",
        "Exactly at the equal lows that just got swept",
        "Wherever it makes the loss exactly $50",
        "No stop, you'll watch it closely",
      ],
      answer: 0,
      explain: "If price goes back below the sweep's low, the reversal idea has failed. Right at the old equal lows is where everyone else's stops were just taken.",
    },
    {
      kind: "learn",
      title: "Never widen it",
      body: [
        "Once a trade is on, a stop may move **towards** profit (to breakeven, or trailing), never further away. Moving it away \"to give it room\" is how 1% losses become 5% losses.",
        "If you keep wanting a wider stop, the stop was in the wrong place to begin with. Fix it on the next trade, with a smaller size.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Moving a stop once the trade is on",
          columns: [
            { title: "Allowed", icon: "check", tone: "up", points: ["Towards profit", "To breakeven", "Trailing behind price"] },
            { title: "Never", icon: "ban", tone: "down", points: ["Further away", "To give it room", "1% losses become 5% losses"] },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "widen-stop",
      statement: "Moving your stop further away when price gets close to it is a sensible way to avoid losses.",
      answer: false,
      explain: "It doesn't avoid the loss, it makes it bigger. A stop can only move in the direction of profit.",
    },
    {
      kind: "numeric",
      id: "atr-stop",
      prompt: "You go long at 5,000.0. ATR is 6.0 and you use a 2 ATR stop. Where is the stop?",
      answer: 4988,
      tolerance: 0,
      explain: "2 × 6.0 = 12.0 below entry: 5,000.0 − 12.0 = 4,988.0.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Put the stop where the trade idea is proven wrong.",
        "Use structure, volatility (ATR), or both.",
        "Don't place it exactly at obvious liquidity.",
        "Stops move towards profit only, never further away.",
      ],
    },
  ],
}
