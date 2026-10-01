import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// One big swing leg up, a pullback with small internal swings inside it, then
// the impulse that breaks the swing high. The low at 16 caused that break.
const candles = swingCandles([[0, 100], [6, 105], [9, 103.3], [11, 104.2], [16, 102], [22, 108], [25, 106.6]], {
  noise: 0.15,
  wick: 0.3,
  seed: 58,
})

export const lesson: LessonContent = {
  id: "u4-internal-vs-swing-structure",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Structure inside structure",
      body: [
        "Zoom into any pullback and you'll find a smaller zigzag with its own little highs and lows. Traders split structure in two:",
        "**Swing structure** is made of the big, obvious turning points that define the trend. **Internal structure** is the smaller zigzag inside one swing leg.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [
            { kind: "marker", index: 6, at: "high", text: "Swing high", tone: "neutral" },
            { kind: "marker", index: 9, at: "low", text: "int. low", tone: "accent" },
            { kind: "marker", index: 11, at: "high", text: "int. high", tone: "accent" },
            { kind: "marker", index: 16, at: "low", text: "Strong low", tone: "up" },
            { kind: "marker", index: 22, at: "high", text: "Weak high", tone: "warn" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Why the split matters",
      body: [
        "Internal breaks happen all the time and often mean little on their own. A CHoCH on internal structure can be just the end of a pullback, not the end of the trend.",
        "Swing breaks carry the weight. Many traders take direction from swing structure and use internal structure only to time entries.",
      ],
    },
    {
      kind: "learn",
      title: "Strong and weak highs and lows",
      body: [
        "In an uptrend, the swing low that launched the move which broke structure is a **strong low**. Buyers proved themselves there, and the trend is only in trouble if it breaks.",
        "The newest high, the one that hasn't been broken yet, is a **weak high**. It is the next level the trend is expected to take out, and it often attracts price like a magnet.",
      ],
    },
    {
      kind: "tap",
      id: "strong-low",
      prompt: "Tap the strong low: the swing low that launched the break of the swing high.",
      chart: { candles, decimals: 2 },
      targets: [16],
      explain: "From this low, price rallied and closed above the earlier swing high. That makes it the protected, strong low.",
    },
    {
      kind: "choice",
      id: "weak-high",
      prompt: "In an uptrend, why is the latest unbroken high called weak?",
      options: [
        "The trend is expected to break it, so it is a likely target",
        "It was made on low volume",
        "It is always a fake high",
        "Prices can never return to it",
      ],
      answer: 0,
      explain: "As long as the trend continues, that high is next in line to be broken. Stops above it also make it attractive for price.",
    },
    {
      kind: "truefalse",
      id: "internal-choch",
      statement: "An internal CHoCH always means the whole trend has reversed.",
      answer: false,
      explain: "Internal structure turns all the time inside pullbacks. Only a break of swing structure says the bigger trend has changed.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Swing structure: the big turning points that define the trend.",
        "Internal structure: the small zigzag inside one swing leg.",
        "Take direction from swing structure; use internal structure for timing.",
        "Strong lows are protected; weak highs are targets.",
      ],
    },
  ],
}
