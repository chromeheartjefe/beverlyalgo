import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

const swing = candlesFromCloses(pathCloses([[0, 100], [8, 97.5], [18, 104], [26, 99.5], [30, 100.5]], { noise: 0.3, seed: 31 }), {
  wick: 0.4,
  seed: 31,
})

export const lesson: LessonContent = {
  id: "u2-going-long-and-going-short",
  sources: ["Investor.gov (U.S. SEC): short sales", "CFTC Learn & Protect: futures market basics"],
  steps: [
    {
      kind: "learn",
      title: "Two directions",
      body: [
        "**Going long** means buying first and selling later, hoping to sell higher. **Going short** means selling first and buying back later, hoping to buy back lower.",
        "Traders can make money in both directions. A falling market is just as much an opportunity as a rising one.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: swing,
          reveal: true,
          decimals: 2,
          annotations: [
            { kind: "marker", index: 8, at: "low", text: "Long: buy here", tone: "up" },
            { kind: "marker", index: 18, at: "high", text: "Short: sell here", tone: "down" },
          ],
          caption: "Illustrative. A long profits from the rise, a short from the fall.",
        },
      },
    },
    {
      kind: "learn",
      title: "How you can sell what you don't own",
      body: [
        "With **stocks**, your broker lends you shares. You sell them now, buy them back later and return them, usually paying a borrowing fee.",
        "In **futures, forex, CFDs and crypto perpetuals**, there is nothing to borrow. You simply open a position by selling. In forex every trade is both: buying EUR/USD means long euros and short dollars at the same time.",
      ],
    },
    {
      kind: "numeric",
      id: "short-profit",
      prompt: "You short 10 shares at $120 and buy them back at $112. What is your profit, before costs?",
      answer: 80,
      tolerance: 0,
      prefix: "$",
      explain: "You sold at 120 and bought back at 112: 8 per share × 10 shares = $80.",
    },
    {
      kind: "truefalse",
      id: "futures-borrow",
      statement: "To go short NQ futures, you first have to borrow a contract.",
      answer: false,
      explain: "A futures contract is an agreement, not an asset you borrow. You go short simply by selling it.",
    },
    {
      kind: "learn",
      title: "Why shorts need extra care",
      body: [
        "A long can lose at most what you paid: price can't go below zero. A short's loss has no ceiling, because price can keep rising.",
        "Sharp rallies against crowded shorts, called **short squeezes**, can be brutal as short sellers all rush to buy back at once. A stop-loss matters on every trade, and even more on shorts.",
      ],
    },
    {
      kind: "choice",
      id: "loses-if-rises",
      prompt: "Which position loses money if the price rises?",
      options: ["A short position", "A long position", "Both", "Neither"],
      answer: 0,
      explain: "A short sold first and needs to buy back lower. A rising price means buying back higher, which is a loss.",
    },
    {
      kind: "choice",
      id: "eurusd-long",
      prompt: "You buy EUR/USD. What are you doing?",
      options: [
        "Going long euros and short dollars",
        "Going long dollars and short euros",
        "Going long both currencies",
        "Lending euros to your broker",
      ],
      answer: 0,
      explain: "Buying a pair means buying the first currency and selling the second. You gain if the euro strengthens against the dollar.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Long: buy first, sell later higher. Short: sell first, buy back lower.",
        "Stock shorts borrow shares; futures, forex and CFDs just sell.",
        "Every forex trade is long one currency and short the other.",
        "A short's possible loss has no ceiling, so always use a stop.",
      ],
    },
  ],
}
