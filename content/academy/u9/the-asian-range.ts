import { D, DAY, dayTimeLabels } from "@/content/academy/l3/setups"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

const SWEEP = DAY.findIndex((c, i) => i > D.asianTo && c[2] < D.asianLow)

const chart: ChartSpec = {
  candles: DAY,
  decimals: 2,
  timeLabels: dayTimeLabels(3),
  sessions: [{ from: D.asianFrom, to: D.asianTo, label: "Asian range", tone: "neutral" }],
  annotations: [
    { kind: "line", from: [D.asianFrom, D.asianHigh], to: [12, D.asianHigh], label: "Asian high", tone: "up", dashed: true },
    { kind: "line", from: [D.asianFrom, D.asianLow], to: [12, D.asianLow], label: "Asian low", tone: "down", dashed: true },
  ],
}

export const lesson: LessonContent = {
  id: "u9-the-asian-range",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The quiet before London",
      body: [
        "During the Asian session, many markets (especially EUR/USD, GBP/USD and US index futures) drift in a narrow range. Its high and low become the **Asian range**.",
        "Traders on both sides put stops just outside it. By the time London opens, there is a pool of liquidity above the Asian high and another below the Asian low.",
      ],
      visual: { type: "chart", chart: { ...chart, caption: "Illustrative, New York time" } },
    },
    {
      kind: "learn",
      title: "London takes one side",
      body: [
        "A common pattern: London **sweeps one side** of the Asian range, often the side against the day's real direction, then reverses. New York then pushes the day's main move.",
        "In this chart, London dropped below the Asian low, took the sell stops, and the day went on to rally hard.",
      ],
    },
    {
      kind: "tap",
      id: "asian-sweep",
      prompt: "Tap the London candle that first swept the Asian low.",
      chart,
      targets: [SWEEP],
      explain: "At 2 am, the London killzone pushed below the Asian low, triggered the stops there, and set up the reversal.",
    },
    {
      kind: "choice",
      id: "asian-why",
      prompt: "Why does the Asian range matter to London and New York traders?",
      options: [
        "Stops cluster just above its high and below its low, so they are obvious liquidity",
        "Prices can't leave the Asian range until the next day",
        "It is when the biggest moves of the day happen",
        "Exchanges are closed during Asia",
      ],
      answer: 0,
      explain: "A tight, obvious range collects stops on both sides, ready for London to take.",
    },
    {
      kind: "truefalse",
      id: "asian-always",
      statement: "London always sweeps the Asian low, never the high.",
      answer: false,
      explain: "It can take either side, and some days it takes neither. The side it sweeps is often against the day's eventual direction.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The Asian range is the high and low of the quiet Asian session.",
        "Stops cluster just outside it on both sides.",
        "London often sweeps one side, then the real move follows.",
      ],
    },
  ],
}
