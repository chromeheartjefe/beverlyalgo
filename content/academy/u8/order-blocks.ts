import { R, REVERSAL, REVERSAL_DEEP } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const ob = REVERSAL[R.orderBlock]
const OB_TOP = ob[1]
const OB_BOTTOM = ob[2]

export const lesson: LessonContent = {
  id: "u8-order-blocks",
  sources: ["ICT and Smart Money Concepts terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The last candle before the move",
      body: [
        "In ICT's definition, a **bullish order block** is the **last down-close candle** before a displacement up that breaks structure. A **bearish order block** is the last up-close candle before a displacement down.",
        "The idea: that candle is where large buyers were still filling their orders before price took off. Some of those orders may be left, so price often reacts when it comes back.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [{ kind: "zone", from: R.orderBlock, to: R.target, top: OB_TOP, bottom: OB_BOTTOM, label: "Bullish order block", tone: "up" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "find-ob",
      prompt: "Tap the bullish order block: the last down-close candle before the displacement.",
      chart: { candles: REVERSAL, decimals: 2 },
      targets: [R.orderBlock],
      explain: "It closed lower than it opened, it swept the equal lows, and the very next candle displaced up through structure.",
    },
    {
      kind: "learn",
      title: "The SMC checklist",
      body: [
        "Most SMC traders only trust an order block that ticks extra boxes:",
        "It **took liquidity** (swept a high or low). The move away **left an FVG**. The move **broke structure**. It is **unmitigated**: price hasn't come back to it yet.",
        "The candle in this chart ticks all four, which is why it is a textbook example.",
      ],
    },
    {
      kind: "learn",
      title: "Returning to the block",
      body: [
        "Many traders use the whole candle (high to low) as the zone. Others use only the body, or the 50% of the body, called the **mean threshold**.",
        "Here the pullback went deeper than in the other lessons: through the fair value gap and right down to the top of the order block, where it held.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL_DEEP,
          decimals: 2,
          annotations: [{ kind: "zone", from: R.orderBlock, to: R.target, top: OB_TOP, bottom: OB_BOTTOM, label: "Order block", tone: "up" }],
          caption: "Illustrative: a deeper pullback into the order block",
        },
      },
    },
    {
      kind: "match",
      id: "ob-def",
      prompt: "Match each order block to its candle.",
      pairs: [
        ["Bullish order block", "The last down-close candle before a move up"],
        ["Bearish order block", "The last up-close candle before a move down"],
        ["Mean threshold", "The 50% level of the order block's body"],
      ],
      explain: "Order blocks are the opposite-coloured candle right before the displacement.",
    },
    {
      kind: "choice",
      id: "best-ob",
      prompt: "Which bullish order block is most convincing?",
      options: [
        "One that swept a low, then a displacement left an FVG and broke structure",
        "Any red candle in a downtrend",
        "One that price has already returned to three times",
        "A red candle in the middle of a quiet range",
      ],
      answer: 0,
      explain: "Liquidity taken, imbalance left, structure broken, still fresh: the full SMC checklist.",
    },
    {
      kind: "truefalse",
      id: "every-red",
      statement: "Every red candle before a green candle is a bullish order block.",
      answer: false,
      explain: "It has to come right before displacement that breaks structure. Otherwise it is just an ordinary candle.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Bullish OB: the last down-close candle before a displacement up that breaks structure.",
        "Bearish OB: the last up-close candle before a displacement down.",
        "Best: took liquidity, left an FVG, broke structure, still unmitigated.",
        "Zones: full candle, body, or the body's 50% (mean threshold).",
      ],
    },
  ],
}
