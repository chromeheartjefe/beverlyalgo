import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Double top: two peaks near 104 with a valley at 102 between them
const doubleTop = swingCandles([[0, 100], [6, 104], [10, 102], [15, 104.05], [22, 100.6]], { noise: 0.15, wick: 0.2, seed: 66 })
const DT_NECK = doubleTop[10][2]

// Head and shoulders: shoulders at 5 and 23, head at 14, neckline lows at 9 and 18
const hs = swingCandles([[0, 100], [5, 103.5], [9, 101.8], [14, 105.5], [18, 101.9], [23, 103.6], [30, 99.8]], {
  noise: 0.15,
  wick: 0.2,
  seed: 67,
})
const N1: [number, number] = [9, hs[9][2]]
const N2: [number, number] = [18, hs[18][2]]

export const lesson: LessonContent = {
  id: "u5-classic-reversal-patterns",
  sources: [
    "Classical chart analysis as commonly taught, first catalogued in Schabacker's Technical Analysis and Stock Market Profits (1932) and Edwards and Magee's Technical Analysis of Stock Trends (1948); explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Double top and double bottom",
      body: [
        "A **double top** forms when price rallies to a high, pulls back, rallies to roughly the same high again and fails. The low between the peaks is the **neckline**. A close below it completes the pattern.",
        "A **double bottom** is the mirror at a low. In structure terms, a completed double top is simply a failed higher high followed by a CHoCH.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: doubleTop,
          decimals: 2,
          annotations: [
            { kind: "hline", price: DT_NECK, label: "Neckline", tone: "down", dashed: true },
            { kind: "marker", index: 6, at: "high", text: "Top 1", tone: "down" },
            { kind: "marker", index: 15, at: "high", text: "Top 2", tone: "down" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Head and shoulders",
      body: [
        "**Head and shoulders** has three peaks: a left shoulder, a higher head, and a lower right shoulder. The neckline joins the two lows between them.",
        "The right shoulder failing to reach the head's height is a lower high: buyers are weakening. A close below the neckline completes it. The **inverse** version marks bottoms.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: hs,
          decimals: 2,
          annotations: [
            { kind: "line", from: N1, to: N2, extend: true, tone: "down", dashed: true, label: "Neckline" },
            { kind: "marker", index: 5, at: "high", text: "LS", tone: "neutral" },
            { kind: "marker", index: 14, at: "high", text: "Head", tone: "down" },
            { kind: "marker", index: 23, at: "high", text: "RS", tone: "neutral" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "find-head",
      prompt: "Tap the head of this head and shoulders pattern.",
      chart: { candles: hs, decimals: 2 },
      targets: [14],
      explain: "The head is the highest of the three peaks, with a lower shoulder on each side.",
    },
    {
      kind: "learn",
      title: "The measured move",
      body: [
        "Classic chartists project a target by measuring the pattern's height, from the head down to the neckline, and subtracting it from the neckline break.",
        "Treat it as a rough guide, not a promise. Many patterns overshoot it, and many never reach it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "Projecting a head and shoulders target",
          points: [100, 104, 102, 108, 102, 104.5, 102, 100.3, 100.2],
          marks: [{ at: 3, label: "Head", tone: "accent" }, { at: 7, label: "Neckline broken", tone: "down", side: "below" }],
          levels: [{ price: 102, label: "Neckline", tone: "neutral" }, { price: 96, label: "Target", tone: "down" }],
        },
        caption: "The head is 6 above the neckline, so the target sits 6 below the break. A rough guide, not a promise.",
      },
    },
    {
      kind: "numeric",
      id: "hs-target",
      prompt: "A head peaks at 105.5 and the neckline is at 101.8. Using the measured move, what is the target after the neckline breaks?",
      answer: 98.1,
      tolerance: 0.01,
      explain: "Height = 105.5 − 101.8 = 3.7. Target = 101.8 − 3.7 = 98.1.",
    },
    {
      kind: "choice",
      id: "complete-when",
      prompt: "When is a double top considered complete?",
      options: [
        "When price closes below the neckline",
        "As soon as the second top forms",
        "When price touches the first top",
        "When volume rises on any candle",
      ],
      answer: 0,
      explain: "Until the neckline breaks, the second top might just be a pause before a breakout higher.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Double top: two failed attempts at the same high, completed by a neckline break.",
        "Head and shoulders: a lower right shoulder shows buyers weakening.",
        "Both are completed by a close through the neckline.",
        "The measured move gives a rough target, not a promise.",
      ],
    },
  ],
}
