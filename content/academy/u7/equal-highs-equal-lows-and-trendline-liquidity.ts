import { R, REVERSAL } from "@/content/academy/l3/setups"
import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

const EQL1 = REVERSAL[R.eql1][2]
const EQL2 = REVERSAL[R.eql2][2]

// A clean rising trendline with three touches, then a drop through it
const trend = swingCandles([[0, 100], [3, 101.6], [5, 100.6], [8, 102.4], [10, 101.4], [13, 103.2], [15, 102.2], [18, 103.6], [23, 100.8]], {
  noise: 0.1,
  wick: 0.15,
  seed: 91,
})

export const lesson: LessonContent = {
  id: "u7-equal-highs-equal-lows-and-trendline-liquidity",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Equal highs and equal lows",
      body: [
        "Two or more highs at almost the same price are **equal highs** (ICT says relative equal highs). Classic traders call it a double top and put their stops just above it. Two lows at the same price are **equal lows**.",
        "To an SMC trader, equal highs and lows are not strong levels. They are **obvious pools of liquidity**, and obvious pools tend to get taken.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [{ kind: "line", from: [R.eql1, EQL1], to: [R.eql2, EQL2], label: "Equal lows", tone: "down", dashed: true }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "second-eql",
      prompt: "Tap the second of the two equal lows.",
      chart: { candles: REVERSAL.slice(0, 15), decimals: 2 },
      targets: [R.eql2],
      explain: "Its low stopped almost exactly at the earlier low. Together they created a clean pool of sell stops underneath.",
    },
    {
      kind: "learn",
      title: "Trendline liquidity",
      body: [
        "A clean trendline with three or more touches looks like strong support. Traders buy each touch and put their stops just under the line.",
        "So a long row of stops builds up beneath it. When price finally breaks the line, it often slices through fast as those stops trigger one after another.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: trend,
          decimals: 2,
          annotations: [
            { kind: "line", from: [5, trend[5][2]], to: [15, trend[15][2]], extend: true, tone: "up", label: "Stops sit under here" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Other obvious pools",
      body: [
        "The same logic applies to any high or low that lots of people watch: the **previous day's high and low**, the **previous week's high and low**, and the high and low of the **Asian session**.",
        "You will use those session and day levels constantly in Unit 9.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Highs and lows that lots of people watch",
          items: [
            { text: "The previous day's high and low", mark: "dot" },
            { text: "The previous week's high and low", mark: "dot" },
            { text: "The Asian session's high and low", mark: "dot" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "eqh-view",
      prompt: "How does an SMC trader usually see a clean double top?",
      options: [
        "As buy-side liquidity that price may run before reversing or continuing",
        "As an unbreakable ceiling",
        "As a guaranteed short signal",
        "As something to ignore",
      ],
      answer: 0,
      explain: "Everyone's stops sit just above it, so SMC traders expect price to be drawn to it rather than repelled forever.",
    },
    {
      kind: "truefalse",
      id: "trendline-strong",
      statement: "The more touches a trendline has, the more stops tend to build up just beyond it.",
      answer: true,
      explain: "Each touch convinces more traders to buy there and hide a stop just under the line.",
    },
    {
      kind: "choice",
      id: "pdh",
      prompt: "Which of these is a commonly watched liquidity pool?",
      options: ["The previous day's high", "The middle of today's candle", "A random intraday price", "The level of your last trade"],
      answer: 0,
      explain: "Previous day and week highs and lows are watched by almost everyone, so stops cluster around them.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Equal highs and lows are obvious pools of liquidity, not strong levels.",
        "Clean trendlines collect a row of stops just beyond them.",
        "Previous day, week and session highs and lows are liquidity too.",
      ],
    },
  ],
}
