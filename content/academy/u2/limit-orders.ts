import { candlesFromCloses } from "@/lib/academy/candles"
import type { Candle, ChartSpec, LessonContent } from "@/lib/academy/types"

// Drifts down from ~101, wicks through the 99.40 buy limit on candle 12 only,
// then rallies. Every earlier low stays above 99.65, so candle 12 is clearly
// the first fill.
const LIMIT = 99.4
const FILL = 12
const dip: Candle[] = candlesFromCloses(
  [101.0, 100.8, 100.9, 100.6, 100.7, 100.4, 100.5, 100.2, 100.3, 100.0, 100.1, 99.9, 99.8, 100.3, 100.6, 100.5, 100.9, 101.2, 101.0, 101.4, 101.7, 101.6],
  { start: 101.1, wick: 0.22, seed: 21 },
).map((c, i) => (i === FILL ? [c[0], c[1], 99.15, c[3]] : c))

const chart: ChartSpec = {
  candles: dip,
  decimals: 2,
  annotations: [{ kind: "hline", price: LIMIT, label: "Buy limit 99.40", tone: "up", dashed: true }],
}

export const lesson: LessonContent = {
  id: "u2-limit-orders",
  sources: ["Investor.gov (U.S. SEC): limit orders and types of orders"],
  steps: [
    {
      kind: "learn",
      title: "Limit orders: my price or better",
      body: [
        "A **limit order** sets the worst price you'll accept. A buy limit fills at your price or lower. A sell limit fills at your price or higher.",
        "Until price reaches it, the order rests in the order book. A limit order guarantees the price, but not the fill.",
      ],
    },
    {
      kind: "learn",
      title: "Waiting for price to come to you",
      body: [
        "Most of the time, traders place a buy limit **below** the current price to buy a dip, or a sell limit **above** it to sell into a rally.",
        "Here, price was around 101 when a trader placed a buy limit at 99.40. Nothing happens until a sell-off reaches that level.",
      ],
      visual: { type: "chart", chart: { ...chart, reveal: true, caption: "Illustrative. The dashed line is the resting buy limit." } },
    },
    {
      kind: "tap",
      id: "limit-fill",
      prompt: "Tap the candle where the buy limit at 99.40 got filled.",
      chart,
      targets: [FILL],
      explain: "The first candle whose low reached 99.40 filled the order. Everything before it stayed above the limit.",
    },
    {
      kind: "choice",
      id: "buy-dip-order",
      prompt: "Price is 100. You want to buy only if it drops to 98. Which order do you place?",
      options: ["A buy limit at 98", "A market buy now", "A buy stop at 98", "A sell limit at 98"],
      answer: 0,
      explain: "A buy limit at 98 waits in the book and fills only at 98 or lower.",
    },
    {
      kind: "truefalse",
      id: "limit-always-fills",
      statement: "A limit order always gets filled eventually.",
      answer: false,
      explain: "If price never reaches your limit, or only touches it briefly, your order may never fill. That is the trade-off for controlling the price.",
    },
    {
      kind: "learn",
      title: "Queues, partial fills and fees",
      body: [
        "Orders at the same price fill in the order they arrived. If price only touches your level for a moment, the orders ahead of you may use up all the selling, and yours fills partly or not at all.",
        "A resting limit order adds liquidity to the book, so it is called a **maker** order. Orders that take liquidity, like market orders, are **taker** orders. Many crypto and futures venues charge makers lower fees than takers.",
      ],
    },
    {
      kind: "choice",
      id: "maker-fee",
      prompt: "On many crypto exchanges, which order usually pays the lower fee?",
      options: ["A limit order resting in the book (maker)", "A market order (taker)", "Both pay exactly the same", "Neither pays a fee"],
      answer: 0,
      explain: "Makers add liquidity, so venues reward them with lower fees. Takers remove liquidity and usually pay more.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A limit order fills at your price or better, never worse.",
        "Buy limits usually sit below price; sell limits above it.",
        "It guarantees the price, not the fill.",
        "Same-price orders fill first come, first served.",
        "Resting limit orders are maker orders and often pay lower fees.",
      ],
    },
  ],
}
