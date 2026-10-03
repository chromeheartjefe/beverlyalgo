import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u1-trading-vs-investing-vs-gambling",
  sources: ["Investor.gov (U.S. SEC): Introduction to Investing"],
  steps: [
    {
      kind: "learn",
      title: "Investing: owning growth over years",
      body: [
        "**Investing** means buying assets you expect to grow in value over years: shares of good businesses, broad index funds, property.",
        "Investors make money because the thing they own grows: profits rise, dividends get paid, the economy expands. They mostly ignore day-to-day moves and let time do the work.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "An investor's years",
          points: [10, 11, 12, 11.4, 13, 14.5, 13.1, 15, 17, 16.2, 18.5, 21, 20, 23, 26],
          marks: [{ at: 6, label: "A bad stretch", tone: "down", side: "below" }, { at: 14, label: "Time did the work", tone: "up" }],
        },
      },
    },
    {
      kind: "learn",
      title: "Trading: profiting from price moves",
      body: [
        "**Trading** means buying and selling over shorter periods, from minutes to weeks, to profit from the moves themselves. Traders can profit when prices rise or fall.",
        "There is no slow growth carrying you along. Every trade has a cost, and you only come out ahead if your decisions are better than those of the people on the other side, often enough to beat those costs. That advantage is called an **edge**.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "What trading asks of you",
          items: [
            { text: "You can profit when prices rise or fall", mark: "ok" },
            { text: "No slow growth carries you along", mark: "bad" },
            { text: "Every trade has a cost", mark: "bad" },
            { text: "You need an edge to come out ahead", mark: "dot" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "spot-investing",
      prompt: "Buying an S&P 500 index fund every month for 20 years is an example of what?",
      options: ["Investing", "Day trading", "Scalping", "Gambling"],
      answer: 0,
      explain: "Regular buying of a broad fund for decades relies on long-term growth, not on short-term moves. That is investing.",
    },
    {
      kind: "learn",
      title: "Gambling: betting without an edge",
      body: [
        "In a casino, every game has a built-in house edge. The more you play, the more surely you lose. That is **negative expectancy**.",
        "Trading turns into gambling when there is no tested plan, the size is too big, and losses get chased with bigger bets. The market doesn't care what you call it. Without an edge and risk control, the maths works exactly like a casino's.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Investing", icon: "seed", tone: "up", points: ["Years", "Profit from growth", "Ignores daily moves"] },
            { title: "Trading", icon: "candles", tone: "accent", points: ["Minutes to weeks", "Profit from the moves", "Needs an edge"] },
            { title: "Gambling", icon: "dice", tone: "down", points: ["No tested plan", "Size too big", "Losses get chased"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Expectancy: the number that matters",
      body: [
        "**Expectancy** is what a strategy makes on average per trade over many trades. Traders measure it in **R**: 1R is the amount you risk on one trade.",
        "Expectancy = (win rate × average win) − (loss rate × average loss).",
        "Say you win 40% of trades and make 2R on each win, and lose 1R on each of the other 60%. Expectancy = 0.4 × 2 − 0.6 × 1 = **+0.2R per trade**. You lose more often than you win and still come out ahead.",
      ],
      visual: {
        type: "scene",
        scene: { kind: "rr", title: "Winning 4 trades in 10, with 2R winners", risk: 1, reward: 2, wins: 4, losses: 6 },
        caption: "+2R over 10 trades is +0.2R per trade, with more losers than winners.",
      },
    },
    {
      kind: "numeric",
      id: "expectancy-calc",
      prompt: "You win 50% of your trades. Wins average 1.5R and losses average 1R. What is your expectancy per trade, in R?",
      answer: 0.25,
      tolerance: 0.001,
      suffix: "R",
      explain: "0.5 × 1.5 − 0.5 × 1 = 0.75 − 0.5 = +0.25R per trade, before costs.",
    },
    {
      kind: "truefalse",
      id: "lose-most-still-win",
      statement: "A strategy can lose most of its trades and still make money.",
      answer: true,
      explain:
        "If the winners are much bigger than the losers, a 35% or 40% win rate can still have positive expectancy. Unit 11 goes deep into this.",
    },
    {
      kind: "choice",
      id: "gambling-behaviour",
      prompt: "Which of these turns trading into gambling?",
      options: [
        "Doubling your position size to win back a loss",
        "Risking the same small amount on every trade",
        "Writing down your plan before you enter",
        "Skipping a trade that doesn't match your rules",
      ],
      answer: 0,
      explain:
        "Raising the stakes to recover a loss is exactly what gamblers do. It turns one bad trade into a disaster. The other three are habits of disciplined traders.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Investing profits from long-term growth; trading profits from price moves.",
        "Traders need an edge to beat the costs and the people on the other side.",
        "Without an edge and risk control, trading behaves like a casino game.",
        "Expectancy = win rate × average win − loss rate × average loss.",
        "A low win rate can still be profitable if winners are big enough.",
      ],
    },
  ],
}
