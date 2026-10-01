import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u2-pips-points-ticks-and-lots",
  sources: [
    "CME Group: E-mini Nasdaq-100, E-mini S&P 500 and Gold futures contract specifications",
    "CFTC Learn & Protect: foreign currency trading",
  ],
  steps: [
    {
      kind: "learn",
      title: "Pips: the forex unit",
      body: [
        "Forex moves are counted in **pips**. For most pairs a pip is the fourth decimal place: **0.0001**. For pairs with the Japanese yen it is the second: **0.01**.",
        "Most brokers show one extra decimal, a fraction of a pip called a **pipette**. EUR/USD at 1.08503 has 3 pipettes on top of 1.0850.",
      ],
    },
    {
      kind: "numeric",
      id: "count-pips",
      prompt: "EUR/USD rises from 1.0850 to 1.0875. How many pips is that?",
      answer: 25,
      tolerance: 0,
      suffix: "pips",
      explain: "1.0875 − 1.0850 = 0.0025, and each 0.0001 is one pip: 25 pips.",
    },
    {
      kind: "learn",
      title: "Lots: the forex size",
      body: [
        "Forex size is measured in **lots**. A standard lot is **100,000** units of the first currency, a mini lot 10,000, and a micro lot 1,000.",
        "For pairs priced in US dollars, like EUR/USD, one pip on a standard lot is worth about **$10**. On a mini lot it is $1, and on a micro lot $0.10.",
      ],
    },
    {
      kind: "numeric",
      id: "lot-profit",
      prompt: "You buy 1 standard lot of EUR/USD and it rises 25 pips. What is your profit, before costs?",
      answer: 250,
      tolerance: 0,
      prefix: "$",
      explain: "25 pips × $10 per pip = $250.",
    },
    {
      kind: "learn",
      title: "Points and ticks: the futures units",
      body: [
        "Futures move in **ticks**, the smallest step the price can take, and traders also talk in **points**.",
        "**NQ** ticks in 0.25 points, worth $5 a tick or $20 a point. **ES** also ticks in 0.25 points, worth $12.50 a tick or $50 a point. **Gold (GC)** ticks in $0.10, worth $10 a tick on its 100-ounce contract.",
      ],
    },
    {
      kind: "numeric",
      id: "count-ticks",
      prompt: "NQ moves 10 points. How many ticks is that?",
      answer: 40,
      tolerance: 0,
      suffix: "ticks",
      explain: "Each tick is 0.25 points, so there are 4 ticks per point: 10 × 4 = 40 ticks (worth $200 on one NQ).",
    },
    {
      kind: "match",
      id: "units-match",
      prompt: "Match each unit to its size.",
      pairs: [
        ["1 pip on EUR/USD", "0.0001"],
        ["1 pip on USD/JPY", "0.01"],
        ["1 NQ tick", "0.25 points, $5"],
        ["1 standard lot", "100,000 units"],
      ],
      explain: "Yen pairs use two decimals for a pip, other pairs four. NQ ticks in quarter points, and a standard lot is 100,000 units.",
    },
    {
      kind: "learn",
      title: "Why this matters",
      body: [
        "Stocks and crypto simply move in dollars and cents, and indices in points. Whatever you trade, always know one thing: **how much one unit of movement is worth at your size**.",
        "Without it you can't set a stop or size a position properly. Unit 11 turns this into a precise position sizing method.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A pip is 0.0001 on most pairs and 0.01 on yen pairs.",
        "Standard lot 100,000 units, mini 10,000, micro 1,000.",
        "On EUR/USD, a standard lot makes about $10 per pip.",
        "NQ: $5 a tick, $20 a point. ES: $12.50 a tick, $50 a point.",
        "Always know what one unit of movement is worth at your size.",
      ],
    },
  ],
}
