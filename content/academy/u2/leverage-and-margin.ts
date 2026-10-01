import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u2-leverage-and-margin",
  sources: [
    "CFTC Learn & Protect: leverage and margin in futures and forex",
    "CME Group: E-mini and Micro E-mini Nasdaq-100 contract specifications",
    "ESMA, product intervention measures on CFDs (2018): retail leverage limits",
  ],
  steps: [
    {
      kind: "learn",
      title: "Leverage: a big position from a small deposit",
      body: [
        "**Leverage** lets you control a position much bigger than the cash you put up. The deposit is called **margin**.",
        "At 20:1 leverage, $1,000 of margin controls a $20,000 position. Futures, forex, CFDs and crypto derivatives all work this way.",
      ],
    },
    {
      kind: "numeric",
      id: "position-size",
      prompt: "You put up $500 of margin at 30:1 leverage. How large a position do you control?",
      answer: 15000,
      tolerance: 0,
      prefix: "$",
      explain: "$500 × 30 = $15,000.",
    },
    {
      kind: "learn",
      title: "Gains and losses are magnified",
      body: [
        "Profit and loss are calculated on the **full position**, not on your margin.",
        "At 20:1, a 1% move in price is a 20% change in your margin. A 5% move against you wipes out 100% of it. Leverage doesn't change how far price moves. It changes how much each move costs you.",
      ],
    },
    {
      kind: "numeric",
      id: "leveraged-loss",
      prompt: "At 10:1 leverage, price moves 3% against you. What percentage of your margin have you lost?",
      answer: 30,
      tolerance: 0,
      suffix: "%",
      explain: "3% × 10 = 30% of your margin.",
    },
    {
      kind: "learn",
      title: "A futures example",
      body: [
        "One E-mini Nasdaq-100 contract (**NQ**) gains or loses **$20 per index point**. The Micro contract (**MNQ**) is a tenth of that: **$2 per point**.",
        "The Nasdaq-100 often moves 100 points or more in a day. That is $2,000 on one NQ contract, from a margin deposit that can be a fraction of the contract's full value.",
      ],
    },
    {
      kind: "numeric",
      id: "mnq-pnl",
      prompt: "You are long 1 MNQ contract and the price rises 50 points. What is your profit?",
      answer: 100,
      tolerance: 0,
      prefix: "$",
      explain: "MNQ is worth $2 per point: 50 × $2 = $100. The same move on one full NQ contract is $1,000.",
    },
    {
      kind: "learn",
      title: "Margin calls and liquidation",
      body: [
        "If losses eat your margin below the required level, your broker issues a **margin call**: add money or your position gets closed. Many platforms, especially crypto exchanges, simply close it automatically. That is **liquidation**.",
        "Regulators cap retail leverage in some places. In the EU, retail CFD leverage is limited to 30:1 on major currency pairs and as low as 2:1 on crypto.",
      ],
      callout: {
        tone: "warn",
        text: "High leverage is the fastest way beginners blow up accounts. Using less than the maximum is not timid. It is how you survive long enough to get good.",
      },
    },
    {
      kind: "truefalse",
      id: "leverage-free-lunch",
      statement: "Leverage increases your potential profit without increasing your risk.",
      answer: false,
      explain: "Leverage magnifies losses exactly as much as gains. More leverage means more risk on every move.",
    },
    {
      kind: "choice",
      id: "margin-call",
      prompt: "What is a margin call?",
      options: [
        "A demand to add money because losses pushed your margin below the required level",
        "A bonus your broker pays for trading often",
        "A phone call when your trade hits its take-profit",
        "The fee for opening a leveraged position",
      ],
      answer: 0,
      explain: "When your losses shrink your margin below the minimum, the broker asks for more funds or closes your position.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Leverage controls a large position with a small margin deposit.",
        "Profit and loss come from the full position size.",
        "At 20:1, a 5% move against you wipes out your margin.",
        "NQ is $20 per point; MNQ is $2 per point.",
        "Margin calls and liquidations close positions when margin runs out.",
      ],
    },
  ],
}
