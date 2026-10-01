import { R, REVERSAL, REVERSAL_NO_SWEEP } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const EQL = Math.min(REVERSAL[R.eql1][2], REVERSAL[R.eql2][2])
// Both charts end at the same candle so they line up
const LEN = R.target + 1

export const lesson: LessonContent = {
  id: "u10-smt-divergence",
  sources: [
    "Hamilton, The Stock Market Barometer (1922), public domain: confirmation between related averages",
    "ICT terminology as commonly taught; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "When twins disagree",
      body: [
        "Some markets usually move together: **NQ and ES** (Nasdaq and S&P futures), **EUR/USD and GBP/USD**. Some move opposite: the **dollar index (DXY)** against EUR/USD.",
        "**SMT divergence** (smart money technique) is when correlated markets **disagree at a key level**: one makes a lower low, the other doesn't. It echoes Dow theory's confirmation rule from Unit 4.",
      ],
    },
    {
      kind: "learn",
      title: "Reading it",
      body: [
        "Below: at the same moment, NQ swept its equal lows to a lower low, while ES only made a higher low. ES refused to follow. ICT reads that as hidden strength: the sweep on NQ was a stop run, not real selling.",
        "Bullish SMT: one market makes a lower low, the other a higher low. Bearish SMT: one makes a higher high, the other a lower high.",
      ],
      visual: {
        type: "charts",
        charts: [
          {
            candles: REVERSAL.slice(0, LEN),
            decimals: 2,
            annotations: [
              { kind: "hline", price: EQL, tone: "neutral", dashed: true },
              { kind: "marker", index: R.sweep, at: "low", text: "Lower low", tone: "down" },
            ],
            caption: "NQ: sweeps the equal lows",
          },
          {
            candles: REVERSAL_NO_SWEEP.slice(0, LEN),
            decimals: 2,
            annotations: [
              { kind: "hline", price: EQL, tone: "neutral", dashed: true },
              { kind: "marker", index: R.sweep, at: "low", text: "Higher low", tone: "up" },
            ],
            caption: "ES: holds above them",
          },
        ],
      },
    },
    {
      kind: "choice",
      id: "smt-read",
      prompt: "EUR/USD makes a lower low while GBP/USD makes a higher low at the same time. What does ICT read from that?",
      options: [
        "Bullish SMT: hidden strength, the lower low may be a stop run",
        "Bearish SMT: both are about to crash",
        "The two pairs are no longer related",
        "Nothing, divergence never matters",
      ],
      answer: 0,
      explain: "One market failing to confirm the other's new low hints that the sell-off lacks real force.",
    },
    {
      kind: "match",
      id: "smt-types",
      prompt: "Match each SMT to its pattern.",
      pairs: [
        ["Bullish SMT", "One market lower low, the other higher low"],
        ["Bearish SMT", "One market higher high, the other lower high"],
      ],
      explain: "The divergence always appears at a key high or low, where one market takes liquidity and the other doesn't.",
    },
    {
      kind: "truefalse",
      id: "smt-dxy",
      statement: "Because DXY moves opposite to EUR/USD, a bullish SMT between them is EUR/USD making a lower low while DXY fails to make a higher high.",
      answer: true,
      explain: "With inversely related markets, you compare a low on one with a high on the other.",
    },
    {
      kind: "learn",
      title: "Using it",
      body: [
        "SMT is a **confirmation**, not an entry. It adds weight to a sweep at your point of interest. You still wait for the MSS and the entry gap.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "SMT divergence: correlated markets disagree at a key high or low.",
        "Bullish: one lower low, one higher low. Bearish: one higher high, one lower high.",
        "Inversely related markets are compared low against high.",
        "Use it to confirm a sweep, then follow your entry model.",
      ],
    },
  ],
}
