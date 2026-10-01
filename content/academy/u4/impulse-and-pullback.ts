import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Fast impulses (4 candles) and slow pullbacks (7 candles)
const pts: [number, number][] = [[0, 100], [4, 104.5], [11, 102.6], [15, 107.4], [22, 105.4], [26, 110]]
const legs = swingCandles(pts, { noise: 0.2, wick: 0.3, seed: 55 })

export const lesson: LessonContent = {
  id: "u4-impulse-and-pullback",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Trends breathe",
      body: [
        "A trend is made of two kinds of legs. **Impulses** move with the trend: fast, with big candles, covering a lot of ground in a short time. **Pullbacks** (or corrections) move against it: slower, with smaller, overlapping candles.",
        "In a healthy uptrend, impulses are longer and quicker than the pullbacks between them.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: legs,
          decimals: 2,
          annotations: [
            { kind: "line", from: [0, 100], to: [4, 104.5], label: "Impulse", tone: "up" },
            { kind: "line", from: [4, 104.5], to: [11, 102.6], label: "Pullback", tone: "neutral", dashed: true },
            { kind: "line", from: [11, 102.6], to: [15, 107.4], label: "Impulse", tone: "up" },
            { kind: "line", from: [15, 107.4], to: [22, 105.4], label: "Pullback", tone: "neutral", dashed: true },
            { kind: "line", from: [22, 105.4], to: [26, 110], label: "Impulse", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "truefalse",
      id: "pullbacks-faster",
      statement: "In a healthy trend, pullbacks are usually faster and bigger than impulses.",
      answer: false,
      explain: "It is the other way round. When pullbacks start to look as strong as the impulses, the trend is losing steam.",
    },
    {
      kind: "learn",
      title: "Why pullbacks matter",
      body: [
        "Buying in the middle of an impulse means chasing a move that is already stretched. Many traders instead wait for the **pullback**, and enter when it shows signs of ending, to join the next impulse at a better price.",
        "The end of a pullback becomes the new higher low: exactly the point the trend has to hold.",
      ],
    },
    {
      kind: "tap",
      id: "pullback-end",
      prompt: "Tap the candle where the second pullback ended and the next impulse began.",
      chart: { candles: legs, decimals: 2 },
      targets: [22],
      explain: "The second pullback bottomed here, made a higher low, and the final impulse took off from it.",
    },
    {
      kind: "learn",
      title: "Reading the strength of a trend",
      body: [
        "Watch how the legs change. Bigger impulses and shallow pullbacks: a strong trend. Shrinking impulses and deeper, longer pullbacks: a trend running out of energy.",
        "Smart Money traders call a sudden, powerful impulse **displacement**. You will see in Level 3 why it often leaves important footprints behind.",
      ],
    },
    {
      kind: "choice",
      id: "weakening",
      prompt: "Which change suggests an uptrend is weakening?",
      options: [
        "Impulses get shorter while pullbacks get deeper",
        "Impulses get longer while pullbacks get shallower",
        "Every pullback holds well above the last higher low",
        "Volume rises on every impulse",
      ],
      answer: 0,
      explain: "When the moves with the trend shrink and the moves against it grow, the balance of power is shifting.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Impulses move with the trend: fast and large.",
        "Pullbacks move against it: slower and smaller.",
        "Entering after a pullback avoids chasing a stretched move.",
        "Shrinking impulses and deeper pullbacks warn that a trend is fading.",
      ],
    },
  ],
}
