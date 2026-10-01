import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u2-bid-ask-and-spread",
  sources: [
    "Investor.gov (U.S. SEC): bid, ask and spread",
    "Ozenbas, Pagano, Schwartz and Weber, Liquidity, Markets and Trading in Action (Springer, 2022, CC BY 4.0)",
  ],
  steps: [
    {
      kind: "learn",
      title: "There are always two prices",
      body: [
        "At any moment a market has two prices, not one.",
        "The **bid** is the highest price a buyer is willing to pay right now. The **ask** (also called the offer) is the lowest price a seller is willing to accept right now.",
        "When you buy straight away, you pay the ask. When you sell straight away, you get the bid.",
      ],
    },
    {
      kind: "choice",
      id: "which-price-buy",
      prompt: "You tap Buy at market. Which price do you pay?",
      options: ["The ask", "The bid", "The average of the two", "The last price on the chart"],
      answer: 0,
      explain: "Buying right now means paying what the cheapest seller asks. Selling right now means accepting what the best buyer bids.",
    },
    {
      kind: "learn",
      title: "The spread",
      body: [
        "The gap between the two is the **spread**: ask minus bid.",
        "The spread is a cost. Buy at the ask and sell a second later at the bid, and you lose the spread even though the price didn't move. Market makers earn it in return for always being there.",
      ],
      visual: { type: "figure", id: "order-book", caption: "Best bid 100.00, best ask 100.05: a spread of 0.05." },
    },
    {
      kind: "numeric",
      id: "spread-calc",
      prompt: "A stock shows bid 50.10 and ask 50.14. What is the spread?",
      answer: 0.04,
      tolerance: 0.0001,
      explain: "Spread = ask − bid = 50.14 − 50.10 = 0.04.",
    },
    {
      kind: "truefalse",
      id: "instant-round-trip",
      statement: "If you buy at the ask and immediately sell at the bid, you break even.",
      answer: false,
      explain: "You buy at the higher price and sell at the lower one, so you lose the spread on every instant round trip.",
    },
    {
      kind: "numeric",
      id: "spread-cost",
      prompt: "You buy 100 shares with a spread of 0.05, then sell straight back. How much did the spread cost you?",
      answer: 5,
      tolerance: 0,
      prefix: "$",
      explain: "100 shares × 0.05 = $5, paid just for getting in and out, before any commission.",
    },
    {
      kind: "learn",
      title: "What makes spreads tight or wide",
      body: [
        "**Liquidity:** busy markets with many traders, like EUR/USD, ES or Bitcoin, have tight spreads. Small stocks, exotic currency pairs and new tokens can have wide ones.",
        "**Time of day:** spreads tighten in the busiest sessions and widen in quiet ones, especially around the daily forex rollover at 5 pm New York time.",
        "**News:** right before and after big announcements, market makers pull back and spreads can jump to many times their normal size.",
      ],
    },
    {
      kind: "choice",
      id: "tightest-spread",
      prompt: "Which of these will usually have the tightest spread?",
      options: [
        "EUR/USD during the London and New York overlap",
        "An exotic currency pair at 5 pm New York time",
        "A tiny stock in after-hours trading",
        "A brand new token on a small crypto exchange",
      ],
      answer: 0,
      explain: "EUR/USD is the most traded pair, and the overlap is its busiest time. The others are thin markets or quiet hours.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The bid is the best price to sell at; the ask is the best price to buy at.",
        "You buy at the ask and sell at the bid.",
        "The spread is ask minus bid, and it is a cost on every trade.",
        "Liquid markets and busy hours have tight spreads; news and quiet hours widen them.",
      ],
    },
  ],
}
