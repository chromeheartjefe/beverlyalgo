import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Rises to a single clear top at candle 20, then fades. Noise is small enough
// that candle 20 is always the highest close (the tap question relies on it).
const story = candlesFromCloses(
  pathCloses([[0, 100], [8, 101.2], [12, 100.8], [20, 103.4], [28, 101.6], [34, 102.4]], { noise: 0.15, seed: 3 }),
  { wick: 0.2, seed: 3 },
)

export const lesson: LessonContent = {
  id: "u1-what-is-a-market",
  sources: [
    "Investor.gov (U.S. SEC): Introduction to Investing",
    "Ozenbas, Pagano, Schwartz and Weber, Liquidity, Markets and Trading in Action (Springer, 2022, CC BY 4.0)",
  ],
  steps: [
    {
      kind: "learn",
      title: "A market is a meeting place",
      body: [
        "A market is anywhere buyers and sellers meet to swap one thing for another. A farmers' market swaps vegetables for cash. A **financial market** swaps cash for financial assets: shares of companies, currencies, gold, Bitcoin, contracts.",
        "Today almost all of it happens on computers. When you tap Buy in a trading app, your order travels to an exchange or a dealer, where it is matched with someone who wants to sell.",
      ],
      visual: {
        type: "figure",
        id: "order-matching",
        caption: "A trade happens only when a buyer and a seller agree on a price.",
      },
    },
    {
      kind: "truefalse",
      id: "two-sides",
      statement: "Every trade has a buyer and a seller.",
      answer: true,
      explain:
        "A trade only happens when both sides agree on a price. If you buy 1 Bitcoin, someone sold you that exact Bitcoin at that moment.",
    },
    {
      kind: "learn",
      title: "The price is the last trade",
      body: [
        "The price you see is not set by the exchange or by your broker. In most markets it is simply the price of the **most recent trade**.",
        "If the last trade happened at 100.25, the screen shows 100.25. A second later someone pays 100.50, and the price ticks to 100.50.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "timeline",
          title: "The price follows the latest trade",
          events: [
            { time: "Trade", label: "A buyer and a seller agree at 100.25" },
            { time: "Screen", label: "Price shows 100.25", tone: "neutral" },
            { time: "A second later", label: "Someone pays 100.50", tone: "up" },
            { time: "Screen", label: "Price ticks to 100.50", tone: "up" },
          ],
        },
      },
      callout: {
        tone: "note",
        text: "Forex has no single central exchange, so forex charts show the latest price quoted by your broker. Same idea: the price people are dealing at right now.",
      },
    },
    {
      kind: "numeric",
      id: "last-trade",
      prompt: "Trades print at 100.00, then 100.25, then 100.50, then 100.25. What price does the chart show now?",
      answer: 100.25,
      tolerance: 0,
      explain:
        "The chart shows the last trade: 100.25. The earlier print at 100.50 is history now, even though it was higher.",
    },
    {
      kind: "learn",
      title: "Why prices move",
      body: [
        "Prices move when one side is **more eager** than the other.",
        "If buyers are in a hurry and sellers are not, buyers must offer more to get filled, so trades print at higher and higher prices. If sellers are in a hurry, they accept less, and the price falls.",
        "That eagerness can come from news, a big fund placing a large order, fear, greed or traders reacting to a level on the chart. The reason changes every day. The mechanism never does.",
      ],
      visual: { type: "figure", id: "price-tug" },
    },
    {
      kind: "choice",
      id: "eager-buyers",
      prompt: "Lots of traders suddenly want to buy gold, but few want to sell. What usually happens to the price?",
      options: [
        "It rises, because buyers have to pay more to find sellers",
        "It falls, because the exchange lowers it to calm things down",
        "It stays the same, because prices are fixed for the day",
        "It rises, because the exchange raises it",
      ],
      answer: 0,
      explain:
        "Buyers compete for the few sellers, so they keep paying a little more. Each of those trades prints higher, and that is the price going up. No exchange sets it.",
    },
    {
      kind: "learn",
      title: "A chart is the story of those trades",
      body: [
        "A price chart is a record of those agreements over time. Every point on it is a price that a buyer and a seller agreed on.",
        "Where the line climbs, buyers were the more eager side. Where it falls, sellers were. Learning to read that story is what the rest of this course is about.",
      ],
      visual: {
        type: "chart",
        chart: { candles: story, style: "line", reveal: true, decimals: 2, caption: "Illustrative price path" },
      },
    },
    {
      kind: "tap",
      id: "tap-peak",
      prompt: "Tap the point where buyers finally ran out of steam and price peaked.",
      chart: { candles: story, style: "line", decimals: 2 },
      targets: [19, 20, 21],
      explain:
        "The peak is the highest point of the line. After it, sellers were the more eager side and price drifted lower.",
    },
    {
      kind: "truefalse",
      id: "who-sets-price",
      statement: "Your broker or the exchange decides the price you see.",
      answer: false,
      explain:
        "Exchanges and brokers run the meeting place and pass on the prices. The price itself comes from buyers and sellers agreeing on trades.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A market is where buyers and sellers meet to trade assets.",
        "Every trade has two sides that agree on one price.",
        "The price on your chart is the latest trade (or the latest quote, in forex).",
        "Price rises when buyers are more eager and falls when sellers are.",
        "A chart is the history of those agreements.",
      ],
    },
  ],
}
