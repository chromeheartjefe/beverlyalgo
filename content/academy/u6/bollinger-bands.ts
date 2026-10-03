import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { bollinger } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// A long quiet range (the squeeze), then a strong trend that walks the band
const candles = candlesFromCloses(
  pathCloses([[0, 100], [12, 100.6], [24, 100.1], [32, 100.5], [46, 107], [52, 105.8], [62, 109]], { noise: 0.2, seed: 85 }),
  { wick: 0.3, seed: 85 },
)
const bb = bollinger(candles, 20, 2)
// Where the bands were narrowest
const widths = bb.upper.map((u, i) => (u === null || bb.lower[i] === null ? Infinity : u - bb.lower[i]!))
const SQUEEZE = widths.indexOf(Math.min(...widths))

export const lesson: LessonContent = {
  id: "u6-bollinger-bands",
  sources: ["John Bollinger, Bollinger on Bollinger Bands (2001): 20-period, 2 standard deviation defaults"],
  steps: [
    {
      kind: "learn",
      title: "An envelope around price",
      body: [
        "**Bollinger Bands**, created by John Bollinger in the 1980s, draw three lines: a 20-period SMA in the middle, and bands 2 standard deviations above and below it.",
        "Standard deviation measures how spread out recent prices are. When price is calm, the bands squeeze together. When it gets volatile, they widen.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          overlays: [
            { values: bb.upper, tone: "accent", label: "Upper" },
            { values: bb.mid, tone: "neutral", dashed: true, label: "SMA 20" },
            { values: bb.lower, tone: "accent", label: "Lower" },
          ],
          annotations: [{ kind: "marker", index: SQUEEZE, at: "low", text: "Squeeze", tone: "warn" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "numeric",
      id: "upper-band",
      prompt: "The 20-period SMA is 100 and the standard deviation is 1.5. Where is the upper band at 2 standard deviations?",
      answer: 103,
      tolerance: 0,
      explain: "Upper band = SMA + 2 × standard deviation = 100 + 3 = 103. The lower band would be 97.",
    },
    {
      kind: "learn",
      title: "Squeeze, then expansion",
      body: [
        "Quiet periods don't last forever. A **squeeze**, the bands at their narrowest in a long while, often comes before a big move. The squeeze doesn't tell you the direction; structure and the breakout do.",
        "Once a move starts, the bands open up quickly, like in the chart above.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "A quiet period", icon: "moon" },
            { label: "The squeeze", sub: "bands at their narrowest in a long while", icon: "filter", tone: "warn" },
            { label: "Often a big move", icon: "zap", tone: "accent" },
            { label: "The bands open up quickly", icon: "trending-up", tone: "up" },
          ],
        },
        caption: "The squeeze doesn't tell you the direction. Structure and the breakout do.",
      },
    },
    {
      kind: "truefalse",
      id: "squeeze-direction",
      statement: "A Bollinger squeeze tells you which direction the next big move will go.",
      answer: false,
      explain: "It only says volatility is unusually low and a larger move is likely. The breakout itself shows the direction.",
    },
    {
      kind: "learn",
      title: "Touching a band is not a signal",
      body: [
        "A classic beginner mistake: selling every touch of the upper band. In a strong uptrend, price can **walk the band**, closing near the upper band candle after candle.",
        "In ranges, band touches do often mark the edges. In trends, they mark strength.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "What a band touch means",
          columns: [
            { title: "In ranges", icon: "repeat", tone: "accent", points: ["Touches often mark the edges"] },
            {
              title: "In trends",
              icon: "trending-up",
              tone: "up",
              points: ["Touches mark strength", "Price can walk the band", "Candle after candle near the upper band"],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "band-walk",
      prompt: "In a strong uptrend, price keeps closing at the upper band. What does that most likely show?",
      options: ["Strong upward momentum", "A guaranteed top", "An error in the indicator", "Low volatility"],
      answer: 0,
      explain: "Walking the upper band is what strong trends do. It is not, on its own, a reason to sell.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Bollinger Bands: a 20 SMA with bands 2 standard deviations away.",
        "Narrow bands (a squeeze) often come before big moves.",
        "The squeeze doesn't give the direction.",
        "Price can walk a band in a trend; touches are not automatic signals.",
      ],
    },
  ],
}
