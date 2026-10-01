import { swingCandles } from "@/lib/academy/candles"
import type { ChartAnnotation, LessonContent } from "@/lib/academy/types"

// Impulse 100 -> 110, retrace into the 61.8% level at candle 16, then a new high
const candles = swingCandles([[0, 100], [10, 110], [16, 103.95], [24, 112]], { noise: 0.25, wick: 0.3, seed: 71 })
const LOW = candles[0][2]
const HIGH = candles[10][1]
const level = (r: number) => Number((HIGH - (HIGH - LOW) * r).toFixed(2))

const fib: ChartAnnotation[] = [
  { kind: "hline", price: level(0.382), label: "38.2%", tone: "neutral", dashed: true },
  { kind: "hline", price: level(0.5), label: "50%", tone: "neutral", dashed: true },
  { kind: "hline", price: level(0.618), label: "61.8%", tone: "warn", dashed: true },
  { kind: "hline", price: level(0.786), label: "78.6%", tone: "neutral", dashed: true },
]

export const lesson: LessonContent = {
  id: "u5-fibonacci-retracements-and-extensions",
  sources: ["Leonardo of Pisa (Fibonacci), Liber Abaci (1202): the sequence behind the ratios"],
  steps: [
    {
      kind: "learn",
      title: "How deep will the pullback go?",
      body: [
        "After an impulse, traders want to know where the pullback might end. **Fibonacci retracements** divide the impulse into levels based on ratios from the Fibonacci sequence: **23.6%, 38.2%, 61.8%** and **78.6%**, with **50%** added by tradition.",
        "In an uptrend, draw it from the swing low to the swing high. Each level shows how much of the move has been given back.",
      ],
      visual: {
        type: "chart",
        chart: { candles, decimals: 2, annotations: fib, caption: "Illustrative: retracement drawn from the swing low to the swing high" },
      },
    },
    {
      kind: "numeric",
      id: "fib-price",
      prompt: "An impulse runs from 50 up to 150. At what price is the 61.8% retracement?",
      answer: 88.2,
      tolerance: 0.01,
      explain: "The move is 100. 61.8% of it is 61.8, and 150 − 61.8 = 88.2.",
    },
    {
      kind: "tap",
      id: "fib-touch",
      prompt: "Tap the candle where the pullback reached the 61.8% level.",
      chart: { candles, decimals: 2, annotations: fib },
      targets: [16],
      explain: "The pullback bottomed right at the 61.8% level, then the next impulse began.",
    },
    {
      kind: "learn",
      title: "Why traders watch them",
      body: [
        "There is no proof that nature makes markets obey 61.8%. Fibonacci levels work mostly because so many traders watch them, and because they line up with a sensible idea: healthy pullbacks give back a third to two thirds of the move.",
        "They are strongest when they line up with something else: a support zone, an old swing point, or (in Level 3) a fair value gap or order block. ICT's **optimal trade entry** uses the area between roughly 62% and 79%.",
      ],
    },
    {
      kind: "learn",
      title: "Extensions: where might it go?",
      body: [
        "**Fibonacci extensions** project beyond the old high to estimate targets for the next leg. The common ones are **127.2%** and **161.8%** of the previous swing.",
        "Like the measured move, they are rough guides for taking profit, not destinations.",
      ],
    },
    {
      kind: "choice",
      id: "fib-confluence",
      prompt: "Which Fibonacci level deserves the most attention?",
      options: [
        "A 61.8% level that lines up with an old support zone",
        "A 23.6% level in the middle of nowhere",
        "Any level, they are all equally strong",
        "A level drawn from two random candles",
      ],
      answer: 0,
      explain: "When a Fibonacci level agrees with other evidence, more traders are likely to act there.",
    },
    {
      kind: "truefalse",
      id: "fib-50",
      statement: "50% is a true Fibonacci ratio.",
      answer: false,
      explain: "50% doesn't come from the Fibonacci sequence. Traders include it because halfway pullbacks are so common.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Retracements: 23.6%, 38.2%, 50%, 61.8%, 78.6% of the last impulse.",
        "Draw from swing low to swing high in an uptrend.",
        "They work best when they line up with other levels.",
        "Extensions (127.2%, 161.8%) estimate targets for the next leg.",
      ],
    },
  ],
}
