import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-honest-backtesting",
  sources: ["Investor.gov (U.S. SEC): past performance does not guarantee future results"],
  steps: [
    {
      kind: "learn",
      title: "Testing on the past",
      body: [
        "**Backtesting** means applying your exact rules to past price data, trade by trade, and recording the results. It is the cheapest way to find out whether an idea has any edge.",
        "It is also the easiest place to fool yourself. A backtest is only useful if it is honest.",
      ],
    },
    {
      kind: "learn",
      title: "The classic traps",
      body: [
        "**Look-ahead bias**: using information you couldn't have had at the time, like a candle that hadn't closed yet. **Cherry-picking**: logging only the trades that look good. **Overfitting**: tweaking rules until they fit the past perfectly, so they fail on new data. **Survivorship bias**: testing only on stocks or coins that still exist today. **Ignoring costs**: no spreads, commissions or slippage.",
      ],
    },
    {
      kind: "match",
      id: "biases",
      prompt: "Match each trap to an example.",
      pairs: [
        ["Look-ahead bias", "Entering on a gap before its third candle had closed"],
        ["Overfitting", "Adding rules until the past looks perfect"],
        ["Survivorship bias", "Testing only on coins that are still listed today"],
        ["Cherry-picking", "Skipping the setups that obviously lost"],
      ],
      explain: "Each one makes the backtest look better than the strategy really is.",
    },
    {
      kind: "learn",
      title: "Keep some data back",
      body: [
        "Split your history. Build and adjust the rules on one period (**in-sample**), then test them once, unchanged, on a later period you haven't looked at (**out-of-sample**).",
        "If results collapse on the new data, the rules were fitted to noise.",
      ],
    },
    {
      kind: "choice",
      id: "overfit-sign",
      prompt: "Your strategy made +80R in-sample but −5R on the out-of-sample period. What is the most likely explanation?",
      options: [
        "The rules were overfitted to the in-sample data",
        "The out-of-sample period was unlucky; trade it with more size",
        "Backtesting never works",
        "The strategy is fine, ignore the second test",
      ],
      answer: 0,
      explain: "A real edge should hold up, at least roughly, on unseen data. A collapse means the rules learned noise.",
    },
    {
      kind: "truefalse",
      id: "include-costs",
      statement: "A backtest without spreads, commissions and slippage usually looks better than live results.",
      answer: true,
      explain: "Costs are paid on every trade. Leave them out and small edges look much bigger than they are.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Backtesting applies exact rules to past data.",
        "Avoid look-ahead, cherry-picking, overfitting, survivorship and missing costs.",
        "Build on in-sample data; confirm once on out-of-sample data.",
      ],
    },
  ],
}
