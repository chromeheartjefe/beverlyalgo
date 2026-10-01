import type { Candle, LessonContent } from "@/lib/academy/types"

// Doubles every 4 candles: about 1,000 to 64,000, with a small dip every
// fifth candle. Wicks are a fixed percentage, so the move looks steady on a
// log scale and like a hockey stick on linear.
const closes = Array.from({ length: 25 }, (_, i) => 1000 * Math.pow(2, i / 4) * (i % 5 === 3 ? 0.93 : 1))
const growth: Candle[] = closes.map((close, i) => {
  const open = i === 0 ? 900 : closes[i - 1]
  return [Math.round(open), Math.round(Math.max(open, close) * 1.04), Math.round(Math.min(open, close) * 0.96), Math.round(close)]
})

export const lesson: LessonContent = {
  id: "u3-log-vs-linear-scale",
  sources: ["Investor.gov (U.S. SEC): reading price charts"],
  steps: [
    {
      kind: "learn",
      title: "Linear scale: equal amounts",
      body: [
        "On a normal **linear** chart, every price step takes the same height. A move from 1,000 to 2,000 looks just as tall as a move from 50,000 to 51,000.",
        "For something that grew from 1,000 to 64,000, the early years look flat, and only the end seems to move.",
      ],
      visual: { type: "chart", chart: { candles: growth, decimals: 0, caption: "Illustrative, linear scale: price doubles every 4 candles" } },
    },
    {
      kind: "learn",
      title: "Log scale: equal percentages",
      body: [
        "On a **logarithmic** (log) chart, equal heights mean equal **percentage** moves. Doubling from 1,000 to 2,000 looks exactly as tall as doubling from 32,000 to 64,000.",
        "The same data now shows what really happened: steady growth at the same pace all along.",
      ],
      visual: {
        type: "chart",
        chart: { candles: growth, scale: "log", decimals: 0, caption: "The same candles on a log scale" },
      },
    },
    {
      kind: "numeric",
      id: "pct-move",
      prompt: "Price goes from 10 to 20. What percentage move is that?",
      answer: 100,
      tolerance: 0,
      suffix: "%",
      explain: "It doubled: (20 − 10) ÷ 10 = 100%. A move from 1,000 to 2,000 is also 100%, so on a log chart they look the same height.",
    },
    {
      kind: "truefalse",
      id: "log-equal",
      statement: "On a log chart, a move from 100 to 200 looks the same height as a move from 1,000 to 2,000.",
      answer: true,
      explain: "Both are +100%, and a log scale gives equal percentage moves equal height.",
    },
    {
      kind: "learn",
      title: "When it matters",
      body: [
        "Use log scale for **long-term charts** and for assets that made **huge percentage moves**, like Bitcoin over the years. Trendlines drawn on long-term charts can look very different on the two scales.",
        "On intraday charts, where price only moves a few percent, the two scales look almost identical, so it rarely matters.",
      ],
    },
    {
      kind: "choice",
      id: "which-scale",
      prompt: "Bitcoin rose from about $1,000 to over $60,000 across several years. Which scale shows the early moves fairly?",
      options: ["Log scale", "Linear scale", "Both look the same", "Neither, use a line chart"],
      answer: 0,
      explain: "On linear, a 100% move at $1,000 is a tiny wiggle next to later moves. Log scale shows each percentage move at its true size.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Linear scale: equal heights for equal price amounts.",
        "Log scale: equal heights for equal percentage moves.",
        "Use log for long-term charts and big percentage moves.",
        "Intraday, the difference is tiny.",
      ],
    },
  ],
}
