import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-crypto",
  sources: ["CFTC Learn & Protect: understand the risks of virtual currency trading", "Investor.gov (U.S. SEC): crypto asset investor alerts"],
  steps: [
    {
      kind: "learn",
      title: "The crypto playbook",
      body: [
        "**What you trade**: Bitcoin, Ether and thousands of smaller coins, either **spot** (you own the coin) or through **perpetual futures** (perps), leveraged contracts with no expiry that use funding payments.",
        "**When**: 24/7. Activity peaks when Europe and the US are awake; weekends are often thinner and more prone to sudden moves.",
      ],
    },
    {
      kind: "learn",
      title: "Risks unique to crypto",
      body: [
        "**Volatility**: moves of 5% to 10% in a day are common for Bitcoin, much more for small coins. **Liquidation cascades**: with so much leverage in perps, a fast move triggers liquidations that push price further. **Exchange risk**: an exchange can freeze withdrawals or collapse, as FTX did in 2022. **Manipulation**: small coins are easy to pump and dump.",
      ],
    },
    {
      kind: "choice",
      id: "exchange-risk",
      prompt: "Which risk is specific to holding funds on a crypto exchange?",
      options: [
        "The exchange freezing withdrawals or failing",
        "The market closing for the weekend",
        "Quarterly contract expiry",
        "Earnings reports",
      ],
      answer: 0,
      explain: "Crypto exchanges have failed before, taking customer funds with them. Keep only what you need for trading on any exchange.",
    },
    {
      kind: "learn",
      title: "Making it workable",
      body: [
        "Trade the most liquid coins (BTC, ETH) while learning. Use low leverage and stop-based sizing; volatility already does the job leverage does elsewhere. Watch funding rates if you hold perps for days. And use regulated, reputable venues where available.",
      ],
    },
    {
      kind: "truefalse",
      id: "perp-expiry",
      statement: "Perpetual futures expire every quarter, like CME futures.",
      answer: false,
      explain: "Perps never expire. Funding payments between longs and shorts keep their price close to spot instead.",
    },
    {
      kind: "choice",
      id: "liquidation",
      prompt: "Why do crypto prices sometimes plunge in minutes with no news?",
      options: [
        "Leveraged positions get liquidated, and each forced sale pushes price into more liquidations",
        "Exchanges round prices down at night",
        "Bitcoin's supply suddenly doubles",
        "It never happens",
      ],
      answer: 0,
      explain: "Forced selling triggers more forced selling: a liquidation cascade. Small or no leverage keeps you out of it.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Spot or perps, trading 24/7.",
        "High volatility, liquidation cascades and exchange risk.",
        "Stick to liquid coins, low leverage and stop-based sizing.",
        "Perps don't expire; funding keeps them near spot.",
      ],
    },
  ],
}
