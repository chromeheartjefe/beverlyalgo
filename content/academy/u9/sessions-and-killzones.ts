import { D, DAY, dayTimeLabels } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u9-sessions-and-killzones",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Time matters as much as price",
      body: [
        "ICT's big addition to price action is **time**. Big moves tend to happen when the big centres open: London and New York. ICT calls these windows **killzones**.",
        "The commonly taught killzones, in New York time: **Asian** about 8 to 10 pm, **London open** 2 to 5 am, **New York open** 7 to 10 am, **London close** 10 am to 12 pm.",
      ],
      visual: { type: "figure", id: "killzones" },
    },
    {
      kind: "learn",
      title: "A day, hour by hour",
      body: [
        "Here is a typical day on an hourly chart. Asia drifts in a tight range. The London killzone makes a sharp move, here a drop below the Asian range. The New York killzone delivers the big expansion.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: DAY,
          decimals: 2,
          timeLabels: dayTimeLabels(3),
          sessions: [
            { from: D.asianFrom, to: D.asianTo, label: "Asia", tone: "neutral" },
            { from: 8, to: 10, label: "London KZ", tone: "accent" },
            { from: 13, to: 15, label: "NY KZ", tone: "warn" },
          ],
          caption: "Illustrative, New York time",
        },
      },
    },
    {
      kind: "choice",
      id: "london-kz",
      prompt: "What is the commonly taught London open killzone, in New York time?",
      options: ["2:00 am to 5:00 am", "7:00 pm to 9:00 pm", "11:00 am to 2:00 pm", "4:00 pm to 6:00 pm"],
      answer: 0,
      explain: "London opens around 3 am New York time, and the killzone brackets that open.",
    },
    {
      kind: "learn",
      title: "Why traders limit themselves to killzones",
      body: [
        "Outside the killzones, markets often chop in small ranges, which is where many traders lose money to spreads and false signals. Restricting setups to killzones cuts that noise.",
        "It also helps your life: you only need to be at the screen for a couple of hours, not all day.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Outside the killzones",
              icon: "ban",
              tone: "down",
              points: ["Markets often chop in small ranges", "Money lost to spreads and false signals"],
            },
            { title: "Inside them", icon: "clock", tone: "up", points: ["That noise is cut", "A couple of hours at the screen, not all day"] },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "trade-all-day",
      statement: "ICT traders aim to trade every hour of the day.",
      answer: false,
      explain: "The whole point of killzones is to focus on the few hours when big moves are most likely.",
    },
    {
      kind: "choice",
      id: "ny-kz",
      prompt: "Which window usually brings the biggest moves in US index futures like NQ and ES?",
      options: ["The New York open killzone", "The Asian killzone", "Late Friday evening", "Sunday afternoon"],
      answer: 0,
      explain: "US data releases at 8:30 am and the stock market open at 9:30 am both fall inside the New York killzone.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Killzones are the hours when big moves are most likely.",
        "Asian about 8 to 10 pm, London 2 to 5 am, New York 7 to 10 am, London close 10 am to 12 pm (NY time).",
        "London often makes the first big move, New York the expansion.",
        "Trading only killzones cuts noise and screen time.",
      ],
    },
  ],
}
