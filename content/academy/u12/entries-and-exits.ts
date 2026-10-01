import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-entries-and-exits",
  sources: ["Investor.gov (U.S. SEC): types of orders"],
  steps: [
    {
      kind: "learn",
      title: "Three ways in",
      body: [
        "**Limit entry**: wait for price to come to your level (a gap, a CE, an order block). Best price, but some trades never fill. **Market entry on confirmation**: enter when the trigger candle closes. Never miss the move, but a worse price. **Stop entry**: enter as price breaks a level. Catches momentum, but suffers on fakeouts.",
        "None is \"right\". Pick the one your strategy was tested with, and stick to it.",
      ],
    },
    {
      kind: "learn",
      title: "Ways out",
      body: [
        "**Fixed target** at liquidity or a level. **Partials**: take some profit at a first target, let the rest run. **Breakeven**: move the stop to entry after a certain gain. **Trailing stop**: move the stop behind new swing points or by an ATR multiple. **Time stop**: close a trade that hasn't worked by a set time, like the end of the killzone.",
      ],
    },
    {
      kind: "numeric",
      id: "partials",
      prompt: "You close half your position at +1R and the other half at +3R. What is the result for the whole trade, in R?",
      answer: 2,
      tolerance: 0.001,
      suffix: "R",
      explain: "Half at 1R and half at 3R averages (1 + 3) ÷ 2 = +2R.",
    },
    {
      kind: "learn",
      title: "The breakeven trap",
      body: [
        "Moving your stop to breakeven feels safe. But if you move it too early, normal pullbacks stop you out at 0R from trades that would have reached their target.",
        "Test it. Many strategies do better moving to breakeven only after 1.5R to 2R, or after a new break of structure in their favour.",
      ],
    },
    {
      kind: "choice",
      id: "be-early",
      prompt: "You move your stop to breakeven as soon as a trade is +0.3R. What usually happens?",
      options: [
        "Many trades get stopped at 0R before reaching their target",
        "Every trade becomes a winner",
        "Your win rate and R:R both rise",
        "Nothing changes",
      ],
      answer: 0,
      explain: "Normal noise often retraces 0.3R. Breakeven that early cuts losses but also kills many winners.",
    },
    {
      kind: "truefalse",
      id: "exit-rules",
      statement: "Exits deserve as much testing as entries.",
      answer: true,
      explain: "The same entries can be profitable or not depending on how you exit. Exits shape your average win.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Limit, market-on-confirmation and stop entries each have a trade-off.",
        "Exits: fixed targets, partials, breakeven, trailing and time stops.",
        "Half at 1R and half at 3R averages 2R.",
        "Moving to breakeven too early kills winners; test your exits.",
      ],
    },
  ],
}
