import { fiveMinuteLabels, R, REVERSAL } from "@/content/academy/l3/setups"
import { findFvgs } from "@/lib/academy/smc"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// REVERSAL read as a 5-minute chart from 9:00 to 11:00 am New York time:
// candle 12 is 10:00, candle 23 is 10:55.
const fvg = findFvgs(REVERSAL).find((f) => f.index === R.fvg && f.dir === "bull")!

const chart: ChartSpec = {
  candles: REVERSAL,
  decimals: 2,
  timeLabels: fiveMinuteLabels,
  sessions: [{ from: 12, to: 23, label: "Silver Bullet 10 to 11 am", tone: "warn" }],
  annotations: [{ kind: "zone", from: fvg.index - 1, to: R.target, top: fvg.top, bottom: fvg.bottom, tone: "accent" }],
}

export const lesson: LessonContent = {
  id: "u10-silver-bullet",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "A one-hour model",
      body: [
        "ICT's **Silver Bullet** is a time-based version of the core model. It only looks for setups inside three one-hour windows, New York time: **3 to 4 am**, **10 to 11 am** and **2 to 3 pm**.",
        "Inside the window, wait for a fair value gap that forms in the direction of the draw on liquidity (usually after a sweep), enter on the retrace into it, and target the nearest liquidity.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "timeline",
          title: "Silver Bullet windows, New York time",
          events: [
            { time: "3 to 4 am", label: "First window", tone: "accent" },
            { time: "10 to 11 am", label: "Second window", tone: "accent" },
            { time: "2 to 3 pm", label: "Third window", tone: "accent" },
          ],
        },
        caption: "Inside a window: a fair value gap in the direction of the draw, an entry on the retrace, a target at the nearest liquidity.",
      },
    },
    {
      kind: "learn",
      title: "A 10 am Silver Bullet",
      body: [
        "Here is the setup on a 5-minute chart. Inside the 10 to 11 am window, price swept the equal lows at 10:15, displaced up and left a fair value gap at 10:20. The retrace into the gap came at 10:40, and price reached the old high before 11.",
      ],
      visual: { type: "chart", chart: { ...chart, caption: "Illustrative 5-minute chart, New York time" } },
    },
    {
      kind: "tap",
      id: "sb-entry",
      prompt: "Tap the candle where a Silver Bullet entry in the gap would have filled.",
      chart,
      targets: [R.retrace],
      explain: "Inside the window, price retraced into the fair value gap at 10:40. That fill sits well within the 10 to 11 am hour.",
    },
    {
      kind: "match",
      id: "sb-windows",
      prompt: "Match each Silver Bullet window to its session.",
      pairs: [
        ["3 to 4 am", "London"],
        ["10 to 11 am", "New York morning"],
        ["2 to 3 pm", "New York afternoon"],
      ],
      explain: "One hour in each of the three main sessions, all in New York time.",
    },
    {
      kind: "truefalse",
      id: "sb-outside",
      statement: "A Silver Bullet setup can form at any time of day.",
      answer: false,
      explain: "The model is defined by its windows. The same pattern at another hour is just the core model, not a Silver Bullet.",
    },
    {
      kind: "choice",
      id: "sb-direction",
      prompt: "Your draw on liquidity is an old high above. Inside the 10 am window, which gap do you trade?",
      options: [
        "A bullish FVG pointing towards the high",
        "A bearish FVG pointing away from it",
        "Any gap, direction doesn't matter",
        "None, the window is only for watching",
      ],
      answer: 0,
      explain: "The gap must point towards the draw. That keeps the trade in line with where liquidity is pulling price.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Silver Bullet windows: 3 to 4 am, 10 to 11 am, 2 to 3 pm New York time.",
        "Look for an FVG towards the draw on liquidity, usually after a sweep.",
        "Enter on the retrace into the gap; target the nearest liquidity.",
        "Outside the windows, it isn't a Silver Bullet.",
      ],
    },
  ],
}
