import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

const up = swingCandles([[0, 100], [4, 103], [8, 101.4], [13, 105.2], [17, 103.3], [22, 107.4], [26, 105.6], [30, 108.8]], {
  noise: 0.2,
  wick: 0.3,
  seed: 52,
})
const down = swingCandles([[0, 108], [4, 104.6], [8, 106.4], [13, 102.5], [17, 104.3], [22, 100.6], [26, 102.2], [30, 99]], {
  noise: 0.2,
  wick: 0.3,
  seed: 53,
})
const range = swingCandles([[0, 100.6], [4, 102.6], [8, 100.2], [12, 102.7], [16, 100.1], [20, 102.5], [24, 100.3], [27, 101.5]], {
  noise: 0.15,
  wick: 0.2,
  seed: 54,
})

export const lesson: LessonContent = {
  id: "u4-trend-vs-range",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Uptrend: higher highs, higher lows",
      body: [
        "In an **uptrend**, each swing high is higher than the last: a **higher high (HH)**. Each swing low is also higher than the last: a **higher low (HL)**.",
        "Buyers keep pushing to new highs, and on every dip they step in earlier than before.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: up,
          decimals: 2,
          annotations: [
            { kind: "marker", index: 13, at: "high", text: "HH", tone: "up" },
            { kind: "marker", index: 22, at: "high", text: "HH", tone: "up" },
            { kind: "marker", index: 8, at: "low", text: "HL", tone: "up" },
            { kind: "marker", index: 17, at: "low", text: "HL", tone: "up" },
            { kind: "marker", index: 26, at: "low", text: "HL", tone: "up" },
          ],
          caption: "Illustrative uptrend",
        },
      },
    },
    {
      kind: "learn",
      title: "Downtrend: lower highs, lower lows",
      body: [
        "A **downtrend** is the mirror: each rally peaks lower than the last, a **lower high (LH)**, and each drop goes further down, a **lower low (LL)**.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: down,
          decimals: 2,
          annotations: [
            { kind: "marker", index: 8, at: "high", text: "LH", tone: "down" },
            { kind: "marker", index: 17, at: "high", text: "LH", tone: "down" },
            { kind: "marker", index: 26, at: "high", text: "LH", tone: "down" },
            { kind: "marker", index: 13, at: "low", text: "LL", tone: "down" },
            { kind: "marker", index: 22, at: "low", text: "LL", tone: "down" },
          ],
          caption: "Illustrative downtrend",
        },
      },
    },
    {
      kind: "learn",
      title: "Range: going nowhere",
      body: [
        "In a **range**, price bounces between roughly the same high and the same low. Neither side manages to push structure in its favour.",
        "Markets spend a lot of their time in ranges. Trend-following tools struggle there, and range edges become the levels everyone watches.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: range,
          decimals: 2,
          annotations: [
            { kind: "hline", price: 102.9, label: "Range high", tone: "down", dashed: true },
            { kind: "hline", price: 99.9, label: "Range low", tone: "up", dashed: true },
          ],
          caption: "Illustrative range",
        },
      },
    },
    {
      kind: "match",
      id: "structure-terms",
      prompt: "Match each label to its meaning.",
      pairs: [
        ["HH", "A swing high above the previous swing high"],
        ["HL", "A swing low above the previous swing low"],
        ["LH", "A swing high below the previous swing high"],
        ["LL", "A swing low below the previous swing low"],
      ],
      explain: "Uptrends print HH and HL; downtrends print LH and LL.",
    },
    {
      kind: "choice",
      id: "name-the-trend",
      prompt: "The last swings were: HL, HH, HL, HH. What is the trend?",
      options: ["Uptrend", "Downtrend", "Range", "There is no way to tell"],
      answer: 0,
      explain: "Higher highs and higher lows, one after another, define an uptrend.",
    },
    {
      kind: "tap",
      id: "latest-hl",
      prompt: "In this uptrend, tap the most recent higher low.",
      chart: { candles: up, decimals: 2 },
      targets: [26],
      explain: "The last pullback bottomed above the one before it. That is the newest higher low, the level buyers must defend to keep the uptrend intact.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Uptrend: higher highs and higher lows.",
        "Downtrend: lower highs and lower lows.",
        "Range: similar highs and lows, no side in control.",
        "The latest higher low (or lower high) is the level that keeps a trend alive.",
      ],
    },
  ],
}
