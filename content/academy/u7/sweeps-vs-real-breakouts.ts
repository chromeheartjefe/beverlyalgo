import { R, REVERSAL } from "@/content/academy/l3/setups"
import { candlesFromCloses } from "@/lib/academy/candles"
import type { Candle, LessonContent } from "@/lib/academy/types"

const EQL = Math.min(REVERSAL[R.eql1][2], REVERSAL[R.eql2][2])

// The same equal lows, but this time price closes below and keeps going
const breakdown: Candle[] = [
  ...REVERSAL.slice(0, 15),
  ...candlesFromCloses([102.5, 102.1, 102.3, 101.7, 101.2, 101.4, 100.8], { start: 103.1, wick: 0.15, seed: 92 }),
]
const BREAK = breakdown.findIndex((c, i) => i > R.eql2 + 2 && c[3] < EQL)

export const lesson: LessonContent = {
  id: "u7-sweeps-vs-real-breakouts",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Two ways through a level",
      body: [
        "When price trades through an obvious low, one of two things is happening. A **sweep** (also called a raid or a run) takes the stops below the low and then reverses. A **real breakdown** takes the stops and keeps going.",
        "Telling them apart is one of the most valuable skills in SMC trading.",
      ],
      visual: {
        type: "charts",
        charts: [
          {
            candles: REVERSAL.slice(0, 21),
            decimals: 2,
            annotations: [
              { kind: "hline", price: EQL, tone: "neutral", dashed: true },
              { kind: "marker", index: R.sweep, at: "low", text: "Sweep", tone: "up" },
            ],
            caption: "A sweep: wick below, close back above, then displacement up",
          },
          {
            candles: breakdown,
            decimals: 2,
            annotations: [
              { kind: "hline", price: EQL, tone: "neutral", dashed: true },
              { kind: "marker", index: BREAK, at: "low", text: "Breakdown", tone: "down" },
            ],
            caption: "A breakdown: closes below and keeps going",
          },
        ],
      },
    },
    {
      kind: "learn",
      title: "Signs of a sweep",
      body: [
        "A **wick** through the level, with the candle **closing back** on the original side. Then a strong move the other way, ideally a **displacement** that breaks structure (an MSS).",
        "The sweep candle often has a long wick: everything below the old low was rejected within one candle.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "candles",
          groups: [
            {
              label: "A sweep",
              note: "A wick through the level, a close back, then a strong move the other way",
              tone: "up",
              candles: [[102, 102.4, 100.6, 101], [101, 101.3, 98.6, 100.8], [100.8, 104, 100.6, 103.8]],
              lines: [{ price: 100, label: "Old low" }],
            },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Signs of a real breakout",
      body: [
        "Candles **close** beyond the level and keep closing there: price is **accepted** on the new side. Follow-through comes fast, and if price comes back to the broken level, it holds as resistance (role reversal).",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "candles",
          groups: [
            {
              label: "A real breakdown",
              note: "Closes beyond the level, keeps closing there, and the retest holds",
              tone: "down",
              candles: [[102, 102.3, 100.4, 100.8], [100.8, 101, 98.8, 99], [99, 99.4, 97.6, 97.9], [97.9, 99.9, 97.7, 99.6], [99.6, 99.95, 97, 97.2]],
              lines: [{ price: 100, label: "Old low" }],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "which-sweep",
      prompt: "A candle's wick drops below equal lows, the candle closes back above them, and the next candle rallies hard. What is this most likely?",
      options: ["A sweep of sell-side liquidity", "A confirmed breakdown", "A bearish BOS", "Nothing meaningful"],
      answer: 0,
      explain: "Wick through, close back inside, then strength the other way: the classic sweep.",
    },
    {
      kind: "truefalse",
      id: "close-below",
      statement: "Several candles closing below the old low and staying there points to a real breakdown, not a sweep.",
      answer: true,
      explain: "Acceptance below the level shows sellers are in control. A sweep spends very little time beyond the level.",
    },
    {
      kind: "choice",
      id: "wait-for",
      prompt: "Price just wicked below a key low. What should an SMC trader wait for before treating it as a sweep?",
      options: [
        "A close back above the low and a displacement that breaks structure upward",
        "Nothing, every wick below a low is a buy",
        "A second wick even lower",
        "The end of the trading week",
      ],
      answer: 0,
      explain: "The wick only shows stops were taken. Confirmation comes from price reclaiming the level and showing real strength.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A sweep takes the liquidity and reverses; a breakout takes it and continues.",
        "Sweep: wick through, close back, then displacement the other way.",
        "Breakout: closes beyond the level and acceptance there.",
        "Wait for confirmation before calling either.",
      ],
    },
  ],
}
