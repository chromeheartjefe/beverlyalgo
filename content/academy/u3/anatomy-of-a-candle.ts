import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { Candle, LessonContent } from "@/lib/academy/types"

// Calm drift with small wicks; candle 9 gets a long upper wick (a clear
// rejection of higher prices).
const REJECT = 9
const wicks: Candle[] = candlesFromCloses(pathCloses([[0, 100], [13, 101.5]], { noise: 0.3, seed: 14 }), {
  wick: 0.25,
  seed: 14,
}).map((c, i) => (i === REJECT ? ([c[0], Math.max(c[0], c[3]) + 2.1, c[2], c[3]] as Candle) : c))

export const lesson: LessonContent = {
  id: "u3-anatomy-of-a-candle",
  sources: ["Investor.gov (U.S. SEC): reading price charts"],
  steps: [
    {
      kind: "learn",
      title: "Body and wicks",
      body: [
        "The **body** runs from the open to the close. The thin lines above and below it are the **wicks** (also called shadows): they reach up to the high and down to the low.",
        "If the close is above the open, the candle is **bullish**, usually drawn green. If the close is below the open, it is **bearish**, usually red.",
      ],
      visual: { type: "figure", id: "candle-anatomy" },
    },
    {
      kind: "numeric",
      id: "upper-wick",
      prompt: "A candle opens at 100, closes at 104, has a high of 106 and a low of 99. How long is its upper wick?",
      answer: 2,
      tolerance: 0,
      explain: "It closed higher, so the body's top is the close, 104. The upper wick runs from 104 to the high of 106: 2.",
    },
    {
      kind: "learn",
      title: "Reading the fight inside a candle",
      body: [
        "A candle is a summary of a battle. **A long upper wick** means buyers pushed price up, but sellers drove it back down before the close: higher prices were rejected.",
        "**A long lower wick** means lower prices were rejected. **A big body with small wicks** means one side was in control all period. **A tiny body** means neither side won.",
      ],
    },
    {
      kind: "tap",
      id: "long-upper-wick",
      prompt: "Tap the candle where sellers clearly rejected higher prices.",
      chart: { candles: wicks, decimals: 2 },
      targets: [REJECT],
      explain: "That candle spiked far above its body and closed back down. The long upper wick is the rejection.",
    },
    {
      kind: "choice",
      id: "long-lower-wick",
      prompt: "A candle has a long lower wick and closes near its high. What happened during that period?",
      options: [
        "Sellers pushed price down, then buyers drove it back up",
        "Buyers were in control the whole time",
        "Nothing traded",
        "Price gapped down and stayed there",
      ],
      answer: 0,
      explain: "The low was reached during the period, but by the close buyers had pushed price all the way back up. Lower prices were rejected.",
    },
    {
      kind: "truefalse",
      id: "red-means-lower",
      statement: "A red candle always closes below the previous candle's close.",
      answer: false,
      explain:
        "Red only means the candle closed below its own open. If it opened well above the previous close, it can be red and still close higher than the candle before it.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The body spans open to close; wicks reach the high and the low.",
        "Bullish (green): close above open. Bearish (red): close below open.",
        "Long wicks show rejected prices.",
        "Big bodies show control; tiny bodies show indecision.",
      ],
    },
  ],
}
