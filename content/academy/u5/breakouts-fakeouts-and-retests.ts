import { swingCandles } from "@/lib/academy/candles"
import type { Candle, ChartSpec, LessonContent } from "@/lib/academy/types"

// A range between ~100 and ~102. Candle 20 spikes well above the range high
// and closes back inside it (the fakeout), then price falls.
const FAKE = 20
const candles: Candle[] = swingCandles(
  [[0, 100.8], [4, 101.9], [8, 100.2], [12, 101.85], [16, 100.3], [20, 101.6], [26, 99.2]],
  { noise: 0.12, wick: 0.15, seed: 70 },
).map((c, i) => (i === FAKE ? ([c[0], 102.9, c[2], c[3]] as Candle) : c))
const RANGE_HIGH = Math.max(...candles.slice(0, FAKE).map((c) => c[1]))

const chart: ChartSpec = {
  candles,
  decimals: 2,
  annotations: [{ kind: "hline", price: RANGE_HIGH, label: "Range high", tone: "neutral", dashed: true }],
}

export const lesson: LessonContent = {
  id: "u5-breakouts-fakeouts-and-retests",
  sources: [
    "Classical chart analysis as commonly taught, first catalogued in Schabacker's Technical Analysis and Stock Market Profits (1932) and Edwards and Magee's Technical Analysis of Stock Trends (1948); explained here in our own words",
    "Smart Money Concepts terminology (liquidity sweep) as commonly taught; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Breakouts",
      body: [
        "A **breakout** is price leaving a range or pattern, ideally with a strong candle that **closes** beyond the level, on rising volume.",
        "Breakouts attract a crowd: breakout traders buy, and short sellers' stops above the range turn into more buying. That burst of orders is what pushes price away.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Why a breakout runs",
          nodes: [
            { label: "A close beyond the level", icon: "door" },
            { label: "Breakout traders buy", icon: "users", tone: "accent" },
            { label: "Short sellers' stops trigger", sub: "more buying", icon: "zap", tone: "warn" },
            { label: "Price is pushed away", icon: "trending-up", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Fakeouts",
      body: [
        "A **fakeout** (false breakout) pokes through the level, triggers all those orders, then fails and falls back inside the range. Breakout buyers are trapped, and price often runs hard the other way.",
        "Smart Money traders see this as a **liquidity sweep**: someone large used the burst of buy orders above the range to sell into.",
      ],
      visual: { type: "chart", chart: { ...chart, caption: "Illustrative" } },
    },
    {
      kind: "tap",
      id: "find-fakeout",
      prompt: "Tap the fakeout candle.",
      chart,
      targets: [FAKE],
      explain: "It spiked well above the range high, then closed back inside the range. Everyone who bought the breakout was trapped, and price dropped.",
    },
    {
      kind: "learn",
      title: "Three ways to trade a breakout",
      body: [
        "**On the break**: enter as it happens. You never miss a move, but you get caught by every fakeout.",
        "**On the close**: wait for a candle to close beyond the level. Fewer fakeouts, slightly worse price.",
        "**On the retest**: wait for price to come back and hold the broken level (role reversal). Best price and clearest stop, but some breakouts never come back.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "On the break", icon: "zap", tone: "warn", points: ["You never miss a move", "Caught by every fakeout"] },
            { title: "On the close", icon: "check", tone: "accent", points: ["Fewer fakeouts", "A slightly worse price"] },
            { title: "On the retest", icon: "repeat", tone: "up", points: ["Best price, clearest stop", "Some breakouts never come back"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "fakeout-sign",
      prompt: "Which candle best describes a fakeout above resistance?",
      options: [
        "A long upper wick above the level and a close back below it",
        "A large body closing well above the level",
        "A small candle far below the level",
        "A gap up that holds all day",
      ],
      answer: 0,
      explain: "Price went above the level but couldn't stay: the wick shows the rejection and the close shows the failure.",
    },
    {
      kind: "truefalse",
      id: "retest-safest",
      statement: "Waiting for a retest means you will never miss a breakout.",
      answer: false,
      explain: "Strong breakouts often don't come back. The retest entry trades missed moves for fewer fakeouts and a better price.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A real breakout closes beyond the level, ideally with volume.",
        "A fakeout breaks the level, fails and traps breakout traders.",
        "Smart Money traders read fakeouts as liquidity sweeps.",
        "Enter on the break, on the close, or on the retest: each has a trade-off.",
      ],
    },
  ],
}
