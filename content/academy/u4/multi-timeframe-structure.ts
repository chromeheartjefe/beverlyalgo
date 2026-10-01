import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// 4-hour: a clean uptrend
const htf = swingCandles([[0, 100], [5, 104], [9, 102.3], [15, 107], [19, 105.2], [25, 110]], { noise: 0.25, wick: 0.4, seed: 59 })

// 15-minute: one pullback inside that uptrend, ending with a CHoCH back up
const ltf = swingCandles([[0, 110], [4, 108.6], [6, 109.3], [10, 107.9], [12, 108.6], [16, 107.2], [19, 108.0], [21, 107.6], [26, 109.6]], {
  noise: 0.1,
  wick: 0.15,
  seed: 60,
})
const LTF_LEVEL = ltf[19][1]
const LTF_CHOCH = ltf.findIndex((c, i) => i > 21 && c[3] > LTF_LEVEL)

export const lesson: LessonContent = {
  id: "u4-multi-timeframe-structure",
  sources: ["Hamilton, The Stock Market Barometer (1922), public domain"],
  steps: [
    {
      kind: "learn",
      title: "The bigger picture first",
      body: [
        "Every timeframe has its own structure. The **higher timeframe (HTF)** sets the direction. The **lower timeframe (LTF)** shows the detail you use to time an entry.",
        "Here the 4-hour chart is a clean uptrend: higher highs, higher lows. That is the bias: look for buys.",
      ],
      visual: { type: "chart", chart: { candles: htf, decimals: 2, caption: "Illustrative 4-hour chart: uptrend" } },
    },
    {
      kind: "learn",
      title: "Then zoom in",
      body: [
        "Zoom into the latest 4-hour pullback on a 15-minute chart. On this timeframe the pullback is a small downtrend of its own, with lower highs and lower lows.",
        "When that small downtrend breaks, with a 15-minute CHoCH back up, the lower timeframe has turned back in line with the higher one. That alignment is one of the most common setups in all of trading.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: ltf,
          decimals: 2,
          annotations: [{ kind: "line", from: [19, LTF_LEVEL], to: [LTF_CHOCH, LTF_LEVEL], label: "15m CHoCH up", tone: "up", dashed: true }],
          caption: "Illustrative 15-minute chart: the pullback ends",
        },
      },
    },
    {
      kind: "numeric",
      id: "fifteens-in-four",
      prompt: "How many 15-minute candles fit inside one 4-hour candle?",
      answer: 16,
      tolerance: 0,
      suffix: "candles",
      explain: "4 hours is 240 minutes; 240 ÷ 15 = 16 candles. A single 4-hour pullback can hold a whole 15-minute trend.",
    },
    {
      kind: "choice",
      id: "aligned-setup",
      prompt: "The 4-hour chart is in an uptrend. Which 15-minute event fits a buy best?",
      options: [
        "A CHoCH up at the end of a 15-minute pullback",
        "A CHoCH down in the middle of a 15-minute rally",
        "Any red candle",
        "A 15-minute BOS down",
      ],
      answer: 0,
      explain: "It shows the small pullback turning back in the direction of the bigger trend, so both timeframes now agree.",
    },
    {
      kind: "truefalse",
      id: "ltf-overrides",
      statement: "A 1-minute downtrend usually outweighs a daily uptrend.",
      answer: false,
      explain: "Higher timeframes carry more weight. A 1-minute downtrend is often just a pause inside the daily move.",
    },
    {
      kind: "learn",
      title: "A simple top-down routine",
      body: [
        "1. Daily or 4-hour: what is the trend, and where are the big swing highs and lows?",
        "2. One step down (1-hour or 15-minute): wait for a pullback into a sensible area.",
        "3. Entry timeframe: wait for structure to turn back in the HTF direction.",
        "Level 3 adds where to look for those pullbacks (liquidity, imbalances, order blocks) and exactly how to enter.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Higher timeframes set the direction; lower ones time the entry.",
        "A HTF pullback is often a full trend on the LTF.",
        "A LTF CHoCH back in the HTF direction aligns both timeframes.",
        "Work top-down: direction, then area, then entry.",
      ],
    },
  ],
}
