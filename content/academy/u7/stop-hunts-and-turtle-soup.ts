import { R, REVERSAL_BEAR } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

// The bearish mirror of the reversal setup: equal highs at 7 and 11, swept at 15
const EQH = Math.max(REVERSAL_BEAR[R.eql1][1], REVERSAL_BEAR[R.eql2][1])

export const lesson: LessonContent = {
  id: "u7-stop-hunts-and-turtle-soup",
  sources: [
    "Linda Bradford Raschke and Laurence Connors, Street Smarts (1995): the original Turtle Soup setup",
    "ICT terminology as commonly taught; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Where the name comes from",
      body: [
        "In the 1980s the famous **Turtle traders** bought breakouts to new 20-day highs. In their 1995 book Street Smarts, Linda Raschke and Laurence Connors published a setup that did the opposite: when a new 20-day high quickly failed, fade it. They called it **Turtle Soup**.",
        "ICT borrowed the name for any **stop hunt**: price runs an obvious high or low, takes the stops, and reverses.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "timeline",
          events: [
            { time: "1980s", label: "Turtle traders buy breakouts to 20-day highs", tone: "accent" },
            { time: "1995", label: "Street Smarts: fade the breakout that fails", tone: "warn" },
            { time: "Since then", label: "ICT borrows the name for any stop hunt", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "A bearish turtle soup",
      body: [
        "Here an uptrend built equal highs. Price spiked above them, triggering the buy stops, closed back below, and then dropped hard.",
        "Every trader who bought the breakout above the highs was trapped, and their exits added fuel to the drop.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL_BEAR,
          decimals: 2,
          annotations: [
            { kind: "hline", price: EQH, label: "Equal highs", tone: "neutral", dashed: true },
            { kind: "marker", index: R.sweep, at: "high", text: "Stop hunt", tone: "down" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "find-hunt",
      prompt: "Tap the candle that hunted the stops above the equal highs.",
      chart: { candles: REVERSAL_BEAR, decimals: 2, annotations: [{ kind: "hline", price: EQH, tone: "neutral", dashed: true }] },
      targets: [R.sweep],
      explain: "Its wick ran above both equal highs and it closed back below them. The next candle displaced down.",
    },
    {
      kind: "learn",
      title: "Not every new high is a stop hunt",
      body: [
        "Strong trends make new highs all the time, and most of them are real. A turtle soup needs the failure: a quick rejection back inside, ideally followed by displacement and a structure shift the other way.",
        "Without that confirmation, fading every new high is just fighting the trend.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "A real new high",
              icon: "trending-up",
              tone: "up",
              points: ["Strong trends make them all the time", "Most of them are real", "Fading them fights the trend"],
            },
            {
              title: "A turtle soup",
              icon: "repeat",
              tone: "warn",
              points: ["A quick rejection back inside", "Ideally displacement", "And a structure shift the other way"],
            },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "every-high",
      statement: "Every new high in a trend is a stop hunt you should sell.",
      answer: false,
      explain: "Most new highs in a trend are genuine. Only a fast failure back inside the range, with confirmation, makes a turtle soup.",
    },
    {
      kind: "choice",
      id: "soup-trigger",
      prompt: "Which sequence describes a bearish turtle soup?",
      options: [
        "Price runs above an obvious high, closes back below it, then breaks structure down",
        "Price closes above an obvious high and keeps rising",
        "Price drifts sideways under a high for days",
        "Price gaps up and holds all day",
      ],
      answer: 0,
      explain: "Run the stops, fail back inside, confirm with a break of structure the other way.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Turtle Soup began as a 1990s setup for fading failed 20-day breakouts.",
        "ICT uses it for stop hunts at obvious highs and lows.",
        "It needs a failure back inside, plus confirmation.",
        "Most new highs in a strong trend are real, not hunts.",
      ],
    },
  ],
}
