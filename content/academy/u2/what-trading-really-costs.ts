import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u2-what-trading-really-costs",
  sources: [
    "Investor.gov (U.S. SEC): fees and commissions",
    "CFTC Learn & Protect: retail forex and futures costs",
  ],
  steps: [
    {
      kind: "learn",
      title: "Every trade has a price tag",
      body: [
        "Trading costs come in several layers:",
        "The **spread** you cross on every entry and exit. **Commissions** charged per trade or per contract. **Slippage** on market and stop orders. **Financing costs** for holding leveraged positions overnight. Plus platform, data and withdrawal fees at some brokers.",
      ],
    },
    {
      kind: "learn",
      title: "Overnight financing",
      body: [
        "In forex and CFDs, positions still open at the daily rollover (5 pm New York time) are charged or credited **swap**, based on the interest rate difference between the two currencies. Many brokers charge three days' swap on Wednesday to cover the weekend.",
        "Crypto **perpetual futures** use **funding**: regular payments between longs and shorts, often every 8 hours, that keep the contract's price close to the spot price.",
      ],
    },
    {
      kind: "choice",
      id: "funding",
      prompt: "In crypto perpetual futures, what is funding?",
      options: [
        "Regular payments between longs and shorts that keep the price near spot",
        "The money you deposit to open an account",
        "A bonus the exchange pays for trading",
        "The fee for withdrawing to your bank",
      ],
      answer: 0,
      explain: "When the perpetual trades above spot, longs usually pay shorts, and the other way round. It is a real cost if you hold on the paying side.",
    },
    {
      kind: "learn",
      title: "Small costs add up fast",
      body: [
        "One commission looks tiny. Multiplied by every trade, every day, it becomes a big number.",
        "The more often you trade, the larger the share of your results that goes to costs.",
      ],
    },
    {
      kind: "numeric",
      id: "monthly-commission",
      prompt: "You pay $4 in commission per round trip and make 10 trades a day for 20 trading days. What do you pay in a month?",
      answer: 800,
      tolerance: 0,
      prefix: "$",
      explain: "$4 × 10 × 20 = $800 a month, before spreads and slippage.",
    },
    {
      kind: "numeric",
      id: "cost-share",
      prompt: "Your average winning trade makes $50, and each trade costs $10 in spread and commission. What percentage of an average win goes to costs?",
      answer: 20,
      tolerance: 0,
      suffix: "%",
      explain: "$10 ÷ $50 = 20%. A swing trader making $500 per winner with the same $10 cost gives up only 2%.",
    },
    {
      kind: "truefalse",
      id: "frequency-costs",
      statement: "Trading more often makes costs a bigger share of your results.",
      answer: true,
      explain: "Costs are paid on every trade. Many small, quick trades pay the same costs as a few large moves, for less profit each time.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Costs include spread, commission, slippage and financing.",
        "Forex and CFDs charge swap overnight; crypto perpetuals use funding.",
        "Costs scale with how often you trade.",
        "Small targets and frequent trading hand a big share to costs.",
      ],
    },
  ],
}
