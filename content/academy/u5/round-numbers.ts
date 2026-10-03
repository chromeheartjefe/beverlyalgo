import { swingCandles } from "@/lib/academy/candles"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// EUR/USD stalls under 1.1000 twice, then closes through it
const candles = swingCandles([[0, 1.0935], [6, 1.0988], [9, 1.0962], [14, 1.0991], [17, 1.0968], [23, 1.1046]], {
  noise: 0.0004,
  wick: 0.0005,
  seed: 63,
  decimals: 4,
})
const BREAK = candles.findIndex((c, i) => i > 17 && c[3] > 1.1)

const chart: ChartSpec = {
  candles,
  decimals: 4,
  annotations: [{ kind: "hline", price: 1.1, label: "1.1000", tone: "warn", dashed: true }],
}

export const lesson: LessonContent = {
  id: "u5-round-numbers",
  sources: ["Investor.gov (U.S. SEC): how orders are placed and executed"],
  steps: [
    {
      kind: "learn",
      title: "Humans love round numbers",
      body: [
        "People place orders at round prices: 1.1000 on EUR/USD, 100,000 on Bitcoin, any whole hundred or thousand on a stock or an index. Take-profits, limit orders and stops all cluster there.",
        "So round numbers, especially big ones, often act like support and resistance even when nothing else happened at that price before.",
      ],
      visual: { type: "chart", chart: { ...chart, caption: "Illustrative EUR/USD" } },
    },
    {
      kind: "tap",
      id: "round-break",
      prompt: "Price stalled under 1.1000 twice. Tap the candle that finally closed above it.",
      chart,
      targets: [BREAK],
      explain: "After two stalls just below the round number, this candle closed above 1.1000 and the move continued.",
    },
    {
      kind: "learn",
      title: "Just short, just beyond",
      body: [
        "Because so many orders sit at the exact number, price often turns a little **before** it (take-profits fill early), or runs a little **beyond** it (stops just past the number get triggered) before reversing.",
        "Experienced traders avoid putting their own stop exactly at, or just past, an obvious round number.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          points: [96, 98.2, 99.6, 98.4, 97.8, 99.2, 100.5, 99.4, 97.6],
          marks: [{ at: 2, label: "Turns just before it" }, { at: 6, label: "Runs just beyond, then reverses", tone: "warn" }],
          levels: [{ price: 100, label: "Round number", tone: "accent" }],
        },
        caption: "Take-profits fill early, and stops just past the number get triggered.",
      },
    },
    {
      kind: "choice",
      id: "stop-placement",
      prompt: "You are long a stock at 103.20. Which stop placement is most likely to get hunted?",
      options: ["99.90, just below the round 100", "Below the last swing low at 98.40", "A stop based on your position size and structure", "No stop at all"],
      answer: 0,
      explain: "A stop just under an obvious round number sits with everyone else's. Price often dips through it before turning. (No stop at all is worse, for other reasons.)",
    },
    {
      kind: "truefalse",
      id: "round-magic",
      statement: "Round numbers work because there is something special about the number itself.",
      answer: false,
      explain: "There is nothing magic about the number. It works only because so many people place orders there.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Orders cluster at round numbers, so they act like support and resistance.",
        "Price often turns just before them or runs just beyond them.",
        "Don't hide your stop right next to an obvious round number.",
      ],
    },
  ],
}
