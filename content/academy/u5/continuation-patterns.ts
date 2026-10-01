import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Bull flag: a pole up to 5, a small down-sloping flag (5 to 13), breakout
const flag = swingCandles([[0, 100], [5, 105], [8, 104.1], [10, 104.6], [13, 103.7], [18, 108]], { noise: 0.1, wick: 0.15, seed: 68 })

// Ascending triangle: flat highs near 104, rising lows, breakout
const tri = swingCandles([[0, 100], [4, 104], [7, 101.2], [11, 104], [14, 102.2], [18, 104], [21, 103], [25, 106.5]], {
  noise: 0.12,
  wick: 0.15,
  seed: 69,
})

export const lesson: LessonContent = {
  id: "u5-continuation-patterns",
  sources: ["Wyckoff, Studies in Tape Reading (1910), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Pauses inside trends",
      body: [
        "Trends rest before they continue. Some of those rests take recognisable shapes. They are called **continuation patterns** because, more often than not, the trend resumes afterwards.",
      ],
    },
    {
      kind: "learn",
      title: "Flags and pennants",
      body: [
        "A **flag** forms after a sharp move (the pole): price drifts back in a small, tight channel sloping against the trend, then breaks out in the trend's direction.",
        "A **pennant** is the same idea, but the pause forms a small converging triangle instead of a channel.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: flag,
          decimals: 2,
          annotations: [
            { kind: "line", from: [5, flag[5][1]], to: [10, flag[10][1]], tone: "accent" },
            { kind: "line", from: [8, flag[8][2]], to: [13, flag[13][2]], tone: "accent", label: "Flag" },
            { kind: "line", from: [0, 100], to: [5, 105], tone: "up", label: "Pole" },
          ],
          caption: "Illustrative bull flag",
        },
      },
    },
    {
      kind: "learn",
      title: "Triangles",
      body: [
        "An **ascending triangle** has flat highs and rising lows: buyers keep stepping in higher while sellers defend one price. It usually breaks upward.",
        "A **descending triangle** is the mirror: flat lows, falling highs, usually breaking down. A **symmetrical triangle** has both lines converging and can break either way.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: tri,
          decimals: 2,
          annotations: [
            { kind: "line", from: [4, tri[4][1]], to: [18, tri[18][1]], tone: "down", label: "Flat highs" },
            { kind: "line", from: [7, tri[7][2]], to: [21, tri[21][2]], tone: "up" },
          ],
          caption: "Illustrative ascending triangle",
        },
      },
    },
    {
      kind: "match",
      id: "continuation-match",
      prompt: "Match each pattern to its shape.",
      pairs: [
        ["Bull flag", "A sharp rally, then a small channel sloping down"],
        ["Ascending triangle", "Flat highs and rising lows"],
        ["Descending triangle", "Flat lows and falling highs"],
        ["Symmetrical triangle", "Highs falling and lows rising"],
      ],
      explain: "Flags slope against the trend; triangles squeeze price between two lines until it breaks out.",
    },
    {
      kind: "choice",
      id: "spot-flag",
      prompt: "Price rallies sharply, then drifts slightly lower in a small, tight channel. What is most likely forming?",
      options: ["A bull flag", "A head and shoulders top", "A double bottom", "A descending triangle"],
      answer: 0,
      explain: "A strong pole followed by a small channel sloping against the trend is the classic bull flag.",
    },
    {
      kind: "learn",
      title: "Wedges",
      body: [
        "A **rising wedge** has both lines sloping up but converging: price keeps making new highs with less and less energy. It often breaks down, even in an uptrend. A **falling wedge** is the mirror and often breaks up.",
      ],
    },
    {
      kind: "truefalse",
      id: "rising-wedge",
      statement: "A rising wedge often breaks to the downside.",
      answer: true,
      explain: "Each push higher covers less ground, showing buyers tiring. When the lower line breaks, sellers often take over.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Continuation patterns are pauses that usually resolve with the trend.",
        "Flags and pennants follow a sharp pole.",
        "Ascending triangles lean up; descending lean down; symmetrical can go either way.",
        "Rising wedges often break down; falling wedges often break up.",
      ],
    },
  ],
}
