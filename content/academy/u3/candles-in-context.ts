import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { Candle, LessonContent } from "@/lib/academy/types"

// A: a decline into a support zone, a hammer there, then a turn.
const atSupport: Candle[] = candlesFromCloses(
  [...pathCloses([[0, 105], [13, 99.7]], { noise: 0.25, seed: 19 }), 99.9, 100.4, 101.1, 101.6, 102.0],
  { wick: 0.3, seed: 19 },
).map((c, i) => (i === 14 ? ([c[0], Math.max(c[0], c[3]) + 0.08, 98.4, c[3]] as Candle) : c))

// B: a choppy range with a hammer in the middle of it that goes nowhere.
const midRange: Candle[] = candlesFromCloses(
  pathCloses([[0, 100], [3, 101.6], [6, 100.2], [9, 101.4], [12, 100.4], [15, 101.5], [18, 100.6]], { noise: 0.2, seed: 41 }),
  { wick: 0.25, seed: 41 },
).map((c, i) => (i === 10 ? ([c[3] - 0.08, c[3] + 0.06, c[3] - 1.0, c[3]] as Candle) : c))

export const lesson: LessonContent = {
  id: "u3-candles-in-context",
  sources: ["Investor.gov (U.S. SEC): reading price charts"],
  steps: [
    {
      kind: "learn",
      title: "Location beats shape",
      body: [
        "A candle pattern is a word. Its meaning depends on the sentence around it.",
        "Patterns matter most when they form **at a level** that already matters (support, resistance, a zone), **after an extended move**, on a **meaningful timeframe**, ideally with **strong volume**.",
      ],
    },
    {
      kind: "learn",
      title: "A hammer that matters",
      body: [
        "Here the hammer forms after a long decline, right at a zone where buyers stepped in before. Sellers pushed into it, got rejected, and price turned.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: atSupport,
          decimals: 2,
          annotations: [
            { kind: "zone", from: 11, top: 99.2, bottom: 98.3, label: "Support zone", tone: "up" },
            { kind: "marker", index: 14, at: "low", text: "Hammer", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "A hammer that doesn't",
      body: [
        "This hammer has the same shape, but it sits in the middle of a choppy range, at no level, after no real move. It is just noise, and price carried on drifting sideways.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: midRange,
          decimals: 2,
          annotations: [{ kind: "marker", index: 10, at: "low", text: "Hammer, in the middle of nowhere", tone: "neutral" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "choice",
      id: "which-hammer",
      prompt: "Which hammer deserves more attention?",
      options: [
        "One at a support zone after a long decline",
        "One in the middle of a sideways range",
        "Any hammer, they are all equally important",
        "One on a 1-minute chart at a random price",
      ],
      answer: 0,
      explain: "A rejection at a level that already matters, after a real move, tells you far more than the same shape floating in a range.",
    },
    {
      kind: "learn",
      title: "Waiting for confirmation",
      body: [
        "Many traders wait for **confirmation**: the next candle closing in the pattern's direction, for example above the high of a bullish engulfing.",
        "The trade-off is real. Confirmation filters out some false signals, but it costs you a later entry and a worse price.",
      ],
    },
    {
      kind: "choice",
      id: "confirmation",
      prompt: "What would confirm a bullish engulfing for a trader who waits?",
      options: [
        "The next candle closing above the engulfing candle's high",
        "The next candle opening lower",
        "A doji anywhere on the chart",
        "The pattern appearing on a 1-second chart",
      ],
      answer: 0,
      explain: "A close beyond the pattern's high shows buyers following through, not just one strong candle.",
    },
    {
      kind: "truefalse",
      id: "pattern-anywhere",
      statement: "A bullish pattern right under strong resistance is just as reliable as one at support.",
      answer: false,
      explain: "Buying into a level where sellers have pushed price down before works against you. Context changes the odds.",
    },
    {
      kind: "learn",
      title: "How Smart Money traders see candles",
      body: [
        "In Level 3 you will see that Smart Money traders barely use pattern names at all. They ask: did price just sweep a pool of stops? Is it reacting at an imbalance or an order block?",
        "Candles are the language. Location is the meaning. That is the bridge from this unit to everything that comes later.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A pattern's meaning depends on where it forms.",
        "Look for levels, an extended move, a higher timeframe and volume.",
        "Confirmation filters signals but costs a later entry.",
        "Advanced methods focus on location first, shape second.",
      ],
    },
  ],
}
