import { R, REVERSAL } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

const OLD_HIGH = REVERSAL[R.oldHigh][1]
const EQL = Math.min(REVERSAL[R.eql1][2], REVERSAL[R.eql2][2])

export const lesson: LessonContent = {
  id: "u7-buy-side-and-sell-side-liquidity",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Two pools",
      body: [
        "**Buy-side liquidity (BSL)** is the pool of buy orders resting **above** highs: short sellers' stop-losses and breakout traders' buy stops. When price trades up through it, those orders all become market buys.",
        "**Sell-side liquidity (SSL)** is the pool of sell orders resting **below** lows: long traders' stop-losses and breakdown sell stops.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: REVERSAL,
          decimals: 2,
          annotations: [
            { kind: "hline", price: OLD_HIGH, label: "BSL above the old high", tone: "up", dashed: true },
            { kind: "hline", price: EQL, label: "SSL below the equal lows", tone: "down", dashed: true },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "match",
      id: "bsl-ssl",
      prompt: "Match each term to where it sits.",
      pairs: [
        ["Buy-side liquidity", "Above old highs"],
        ["Sell-side liquidity", "Below old lows"],
        ["Short sellers' stops", "Part of buy-side liquidity"],
        ["Long traders' stops", "Part of sell-side liquidity"],
      ],
      explain: "A short seller's stop is a buy order, so it adds to buy-side liquidity above highs. A long's stop is a sell order below lows.",
    },
    {
      kind: "learn",
      title: "Liquidity as a destination",
      body: [
        "ICT traders often describe price as moving from one pool to the other: sweep the sell-side, then run to the buy-side (or the reverse).",
        "In the chart, price first dropped below the equal lows, taking the sell-side liquidity there, and later rallied all the way through the old high, taking the buy-side.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "From one pool to the other",
          points: [104.5, 102, 100.4, 101.4, 100.4, 99.6, 101.6, 103.4, 105.6, 105.8],
          marks: [
            { at: 0, label: "The old high" },
            { at: 5, label: "Sell-side taken", tone: "down", side: "below" },
            { at: 9, label: "Buy-side taken", tone: "up" },
          ],
          levels: [{ price: 104.5, label: "Buy-side", tone: "up" }, { price: 100.4, label: "Sell-side", tone: "down" }],
        },
        caption: "Price drops below the equal lows first, then rallies through the old high.",
      },
    },
    {
      kind: "tap",
      id: "took-ssl",
      prompt: "Tap the candle that took the sell-side liquidity below the equal lows.",
      chart: { candles: REVERSAL, decimals: 2, annotations: [{ kind: "hline", price: EQL, tone: "neutral", dashed: true }] },
      targets: [R.sweep],
      explain: "Its wick dropped below both equal lows, triggering the sell stops there, and it closed back above them.",
    },
    {
      kind: "choice",
      id: "what-happens",
      prompt: "Price rises through an old high full of buy stops. What do those stops turn into?",
      options: ["Market buy orders", "Market sell orders", "Limit sell orders", "Nothing, they are cancelled"],
      answer: 0,
      explain: "A buy stop becomes a market buy when triggered. That sudden burst of buying is what large sellers can fill against.",
    },
    {
      kind: "truefalse",
      id: "ssl-location",
      statement: "Sell-side liquidity sits below old lows.",
      answer: true,
      explain: "That is where long traders' stop-losses and breakdown sell stops wait.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Buy-side liquidity: buy orders resting above highs.",
        "Sell-side liquidity: sell orders resting below lows.",
        "Triggered stops become market orders.",
        "Price often travels from one pool of liquidity to the other.",
      ],
    },
  ],
}
