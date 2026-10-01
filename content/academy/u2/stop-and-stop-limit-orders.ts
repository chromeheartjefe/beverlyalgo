import { candlesFromCloses } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Long from 100, chops lower and breaks the 98.80 stop on candle 12. Earlier
// lows all stay above it.
const stopped = candlesFromCloses(
  [99.6, 99.9, 100.2, 100.0, 100.4, 100.1, 99.7, 99.9, 99.4, 99.6, 99.1, 99.3, 98.5, 98.2, 98.4, 97.9, 98.1],
  { start: 99.5, wick: 0.22, seed: 5 },
)

export const lesson: LessonContent = {
  id: "u2-stop-and-stop-limit-orders",
  sources: ["Investor.gov (U.S. SEC): stop orders and stop-limit orders"],
  steps: [
    {
      kind: "learn",
      title: "Stop orders: wake up at a price",
      body: [
        "A **stop order** (or stop-market order) sleeps until price reaches your stop price. Then it wakes up and becomes a market order.",
        "A **sell stop** sits below the current price. It is how a stop-loss on a long trade works. A **buy stop** sits above the current price: a stop-loss for a short, or an entry when price breaks out higher.",
      ],
    },
    {
      kind: "learn",
      title: "A stop-loss in action",
      body: [
        "This trader bought at 100.00 and placed a sell stop at 98.80. When the sell-off reached 98.80, the stop triggered and closed the trade, limiting the loss to roughly 1.20 per unit.",
        "Without the stop, they would still be holding as price kept falling.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: stopped,
          reveal: true,
          decimals: 2,
          annotations: [
            { kind: "hline", price: 100, label: "Long entry 100.00", tone: "neutral" },
            { kind: "hline", price: 98.8, label: "Sell stop 98.80", tone: "down", dashed: true },
            { kind: "marker", index: 12, at: "low", text: "Stopped out", tone: "down" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "choice",
      id: "stop-loss-long",
      prompt: "You are long from 100 and want out automatically if price falls to 97. Which order?",
      options: ["A sell stop at 97", "A sell limit at 97", "A buy stop at 97", "A buy limit at 97"],
      answer: 0,
      explain: "A sell stop below price triggers when price falls to 97 and sells at market. A sell limit at 97 would sell immediately, since 100 is already better than 97.",
    },
    {
      kind: "learn",
      title: "Stops can slip",
      body: [
        "Once triggered, a stop is a market order, so it fills at the next available price. In a fast move or a **gap** (price jumps over your level, for example overnight), the fill can be well past your stop.",
        "That still beats no stop. A stop is a seatbelt, not a guarantee.",
      ],
    },
    {
      kind: "truefalse",
      id: "stop-can-slip",
      statement: "A stop-loss order can fill at a worse price than the stop level.",
      answer: true,
      explain: "When the stop triggers it becomes a market order, and in a fast market or gap the next available price can be worse.",
    },
    {
      kind: "learn",
      title: "Stop-limit orders",
      body: [
        "A **stop-limit** order has two prices. When the stop price is hit, it places a limit order at your limit price instead of a market order.",
        "That protects you from a terrible fill, but if price races straight through your limit, the order **doesn't fill at all** and you are still in the trade. That makes stop-limits risky as stop-losses.",
      ],
    },
    {
      kind: "choice",
      id: "may-not-fill",
      prompt: "In a sudden crash, which exit order might not fill at all?",
      options: ["A stop-limit order", "A stop-market order", "A market order", "Closing the position by hand at market"],
      answer: 0,
      explain: "If price gaps below the limit part of a stop-limit, the limit order just sits there unfilled while price keeps falling.",
    },
    {
      kind: "match",
      id: "order-types-match",
      prompt: "Match each order to what it does.",
      pairs: [
        ["Buy limit", "Buys at a price below the current price"],
        ["Buy stop", "Buys once price rises to a level above"],
        ["Sell limit", "Sells at a price above the current price"],
        ["Sell stop", "Sells once price falls to a level below"],
      ],
      explain:
        "Limits wait for a better price (buy lower, sell higher). Stops trigger when price moves through a level (buy higher, sell lower).",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A stop order becomes a market order when price hits the stop.",
        "Sell stops below price protect longs; buy stops above price protect shorts.",
        "Stops can slip in fast markets and gaps, but they cap the damage.",
        "Stop-limits avoid bad fills but may not fill at all.",
      ],
    },
  ],
}
