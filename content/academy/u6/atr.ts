import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { atr } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// Calm first half, wild second half: ATR climbs as candles get bigger
const calm = candlesFromCloses(pathCloses([[0, 100], [16, 101.5], [30, 100.8]], { noise: 0.15, seed: 86 }), { wick: 0.2, seed: 86 })
const wild = candlesFromCloses(pathCloses([[0, 101.6], [8, 98.5], [16, 103.5], [26, 99.8]], { noise: 1.1, seed: 87 }), {
  start: calm[calm.length - 1][3],
  wick: 0.9,
  seed: 87,
})
const candles = [...calm, ...wild]
const values = atr(candles, 14)

export const lesson: LessonContent = {
  id: "u6-atr",
  sources: ["J. Welles Wilder Jr., New Concepts in Technical Trading Systems (1978): Average True Range"],
  steps: [
    {
      kind: "learn",
      title: "How far does price usually move?",
      body: [
        "The **Average True Range (ATR)**, another Wilder indicator from 1978, measures **volatility**: how much price typically moves per candle. It says nothing about direction.",
        "When candles get bigger, ATR rises. When the market goes quiet, ATR falls.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 1,
          pane: { label: "ATR 14", lines: [{ values, tone: "warn" }], decimals: 1 },
          caption: "Illustrative: calm first, then volatile",
        },
      },
    },
    {
      kind: "learn",
      title: "True range",
      body: [
        "Each candle's **true range** is the largest of three distances: high − low, high − previous close, and previous close − low (as positive numbers). That way, gaps count too.",
        "ATR is a smoothed average of the true range, usually over 14 candles.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "True range: the largest of three distances",
          max: 4,
          bars: [
            { label: "High minus low", value: 2, display: "2", tone: "neutral" },
            { label: "High minus previous close", value: 4, display: "4", tone: "up" },
            { label: "Previous close minus low", value: 2, display: "2", tone: "neutral" },
          ],
        },
        caption: "Example: the previous close was 100, then a candle gapped up with a high of 104 and a low of 102. Its true range is 4.",
      },
    },
    {
      kind: "numeric",
      id: "true-range",
      prompt: "The previous close was 100. Today's high is 104 and low is 101. What is today's true range?",
      answer: 4,
      tolerance: 0,
      explain: "High − low = 3, high − previous close = 4, previous close − low = 1 (as a positive distance). The largest is 4: the gap up counts.",
    },
    {
      kind: "learn",
      title: "Stops that fit the market",
      body: [
        "ATR's most practical use is sizing stops. A stop tighter than the market's normal noise gets hit by random wiggles. Many traders place stops **1.5 to 2 ATR** beyond their entry or beyond the structure they are trading.",
        "Because ATR adapts, the same rule gives wider stops in volatile markets and tighter ones in calm markets. Unit 11 uses this for position sizing.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Tighter than the noise", icon: "alert", tone: "down", points: ["Hit by random wiggles"] },
            {
              title: "1.5 to 2 ATR",
              icon: "shield",
              tone: "up",
              points: ["Beyond your entry or the structure", "Wider in volatile markets", "Tighter in calm ones"],
            },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "atr-stop",
      prompt: "You buy NQ at 15,000. ATR is 20 points and you use a 1.5 ATR stop. Where does your stop go?",
      answer: 14970,
      tolerance: 0,
      explain: "1.5 × 20 = 30 points below entry: 15,000 − 30 = 14,970.",
    },
    {
      kind: "truefalse",
      id: "atr-direction",
      statement: "A rising ATR means price is going up.",
      answer: false,
      explain: "ATR only measures how big the moves are. A crash raises ATR just as much as a rally.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "ATR measures volatility, not direction.",
        "True range includes gaps from the previous close.",
        "Stops of 1.5 to 2 ATR adapt to the market's normal noise.",
        "High ATR means wider stops and usually smaller position size.",
      ],
    },
  ],
}
