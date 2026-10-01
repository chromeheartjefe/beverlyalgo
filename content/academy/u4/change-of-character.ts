import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Uptrend, last higher low at 16, top at 20, then the drop that closes below
// that higher low (the CHoCH), a lower high and a lower low.
const candles = swingCandles([[0, 102], [4, 104.2], [8, 102.8], [12, 105.6], [16, 103.8], [20, 106.4], [26, 102], [29, 103.4], [33, 101.2]], {
  noise: 0.15,
  wick: 0.3,
  seed: 57,
})
const LEVEL = candles[16][2]
const CHOCH = candles.findIndex((c, i) => i > 20 && c[3] < LEVEL)
// The tap chart stops before the later lower high, so it stays readable on phones
const tapCandles = candles.slice(0, 29)

export const lesson: LessonContent = {
  id: "u4-change-of-character",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "The first crack in a trend",
      body: [
        "A trend stays alive as long as it protects its last swing point. In an uptrend, that is the **last higher low**.",
        "When price closes below that higher low, the uptrend's structure is broken for the first time. That first break against the trend is called a **change of character (CHoCH)**.",
      ],
    },
    {
      kind: "learn",
      title: "CHoCH on a chart",
      body: [
        "Here the uptrend made a final high, then dropped and closed below the last higher low. The character of the market changed: buyers failed to defend their level.",
        "What followed was a lower high and a lower low: the new downtrend.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [
            { kind: "line", from: [16, LEVEL], to: [CHOCH, LEVEL], label: "CHoCH", tone: "warn", dashed: true },
            { kind: "marker", index: 16, at: "low", text: "Last HL", tone: "up" },
            { kind: "marker", index: 29, at: "high", text: "LH", tone: "down" },
            { kind: "marker", index: 33, at: "low", text: "LL", tone: "down" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "choch-candle",
      prompt: "The dashed line marks the last higher low. Tap the candle that confirmed the change of character.",
      chart: {
        candles: tapCandles,
        decimals: 2,
        annotations: [{ kind: "line", from: [16, LEVEL], to: [28, LEVEL], tone: "neutral", dashed: true }],
      },
      targets: [CHOCH],
      explain: "This is the first candle to close below the last higher low. Up to here every dip had held above it.",
    },
    {
      kind: "match",
      id: "bos-vs-choch",
      prompt: "Match each event to what it means.",
      pairs: [
        ["BOS in an uptrend", "A close above the last swing high"],
        ["CHoCH in an uptrend", "A close below the last higher low"],
        ["BOS in a downtrend", "A close below the last swing low"],
        ["CHoCH in a downtrend", "A close above the last lower high"],
      ],
      explain: "A BOS goes with the trend and confirms it. A CHoCH goes against it and is the first sign it may be turning.",
    },
    {
      kind: "learn",
      title: "CHoCH is a warning, not a guarantee",
      body: [
        "One CHoCH doesn't prove a new trend. Sometimes price breaks the higher low, then recovers and carries on up. Traders usually want more: a lower high that holds, then a BOS down.",
        "ICT traders use a stricter version called a **market structure shift (MSS)**: the break has to come with a strong, fast move (displacement), often right after price swept liquidity above a high. Level 3 builds whole entry models on it.",
      ],
    },
    {
      kind: "choice",
      id: "after-choch",
      prompt: "After a CHoCH down, what would confirm that a downtrend has really started?",
      options: [
        "A lower high, then a close below the latest low (a BOS down)",
        "Price instantly making a new all-time high",
        "One more green candle",
        "Nothing, a CHoCH alone is always enough",
      ],
      answer: 0,
      explain: "A lower high shows sellers now control the rallies, and a BOS down shows the new trend continuing.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A CHoCH is the first close against the trend through its last protected swing.",
        "In an uptrend, that is a close below the last higher low.",
        "A BOS confirms a trend; a CHoCH warns it may be turning.",
        "Look for a lower high and a BOS down before trusting a new downtrend.",
        "An MSS is a CHoCH with displacement, often after a liquidity sweep.",
      ],
    },
  ],
}
