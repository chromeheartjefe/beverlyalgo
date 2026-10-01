import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { Candle, LessonContent } from "@/lib/academy/types"

// Gallery: five patterns separated by small dimmed filler candles.
const F: Candle = [100, 100.15, 99.85, 100.05]
const gallery: Candle[] = [
  F,
  [100, 101.2, 98.8, 100.02], // doji
  F,
  F,
  [100.55, 100.85, 98.2, 100.8], // hammer
  F,
  F,
  [99.45, 101.9, 99.2, 99.3], // shooting star
  F,
  F,
  [98.8, 101.2, 98.8, 101.2], // marubozu
  F,
  F,
  [99.7, 101.0, 98.9, 100.15], // spinning top
  F,
  F,
]

// Downtrend that ends in a hammer on candle 14, then turns up.
const HAMMER = 14
const downtrend: Candle[] = candlesFromCloses(
  [...pathCloses([[0, 105], [13, 99.7]], { noise: 0.25, seed: 19 }), 99.9, 100.4, 101.1, 101.6, 102.0],
  { wick: 0.3, seed: 19 },
).map((c, i) => (i === HAMMER ? ([c[0], Math.max(c[0], c[3]) + 0.08, 98.4, c[3]] as Candle) : c))

export const lesson: LessonContent = {
  id: "u3-single-candle-patterns",
  sources: ["Investor.gov (U.S. SEC): reading price charts"],
  steps: [
    {
      kind: "learn",
      title: "Patterns are shorthand",
      body: [
        "Some candle shapes appear so often that traders gave them names. Each one is shorthand for what happened in the fight between buyers and sellers.",
        "On their own, they predict very little. Where they appear matters far more, and that is the lesson after next. First, learn to recognise them.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: gallery,
          highlight: [1, 4, 7, 10, 13],
          decimals: 1,
          annotations: [
            { kind: "marker", index: 1, at: "high", text: "Doji", tone: "neutral" },
            { kind: "marker", index: 4, at: "low", text: "Hammer", tone: "up" },
            { kind: "marker", index: 7, at: "high", text: "Shooting star", tone: "down" },
            { kind: "marker", index: 10, at: "low", text: "Marubozu", tone: "up" },
            { kind: "marker", index: 13, at: "high", text: "Spinning top", tone: "neutral" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Indecision: doji and spinning top",
      body: [
        "A **doji** opens and closes at (almost) the same price. Buyers and sellers fought to a draw.",
        "A **spinning top** has a small body with wicks on both sides. Also indecision, just slightly less extreme.",
        "After a strong move, indecision can be an early sign that the move is running out of steam.",
      ],
    },
    {
      kind: "learn",
      title: "Rejection: hammer and shooting star",
      body: [
        "A **hammer** has a small body near the top and a long lower wick, at least twice the body. It shows sellers pushed hard, and buyers took it all back. It matters most after a decline.",
        "A **shooting star** is the mirror image: a small body near the bottom and a long upper wick, after a rally. Buyers tried higher and were rejected.",
      ],
    },
    {
      kind: "learn",
      title: "Control: marubozu",
      body: [
        "A **marubozu** is a big body with little or no wick. It opened at one extreme and closed at the other: one side was in charge from start to finish.",
      ],
    },
    {
      kind: "match",
      id: "single-match",
      prompt: "Match each pattern to what it shows.",
      pairs: [
        ["Doji", "Open and close almost equal"],
        ["Hammer", "Long lower wick after a decline"],
        ["Shooting star", "Long upper wick after a rally"],
        ["Marubozu", "Big body, almost no wicks"],
      ],
      explain: "Doji = a draw. Hammer and shooting star = rejection. Marubozu = one side in control.",
    },
    {
      kind: "tap",
      id: "find-hammer",
      prompt: "This market has been falling. Tap the hammer.",
      chart: { candles: downtrend, decimals: 2 },
      targets: [HAMMER],
      explain: "At the bottom of the decline, one candle dipped far lower and closed near its high: a classic hammer, right before the turn.",
    },
    {
      kind: "truefalse",
      id: "hammer-guarantee",
      statement: "A hammer guarantees that price will go up next.",
      answer: false,
      explain: "No single candle guarantees anything. A hammer shows rejection of lower prices; whether that leads anywhere depends on context.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Doji and spinning top: indecision.",
        "Hammer: lower prices rejected, most meaningful after a decline.",
        "Shooting star: higher prices rejected, most meaningful after a rally.",
        "Marubozu: one side in control the whole time.",
        "No pattern is a guarantee on its own.",
      ],
    },
  ],
}
