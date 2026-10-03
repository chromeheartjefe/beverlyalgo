import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u10-build-and-backtest-your-own-model",
  sources: ["Investor.gov (U.S. SEC): understanding investment risk and past performance"],
  steps: [
    {
      kind: "learn",
      title: "Your model, written down",
      body: [
        "You now know the pieces. A **model** is your fixed recipe for combining them, written so precisely that two people would take the same trades from it:",
        "**Market and timeframes.** **Bias rule** (how you find the draw). **Time window** (which killzone). **Setup** (which sweep, which POI). **Trigger** (MSS with displacement). **Entry** (gap top or CE). **Stop** and **target** rules. **Limits** (maximum trades and losses per day).",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "What a written model fixes",
          items: [
            { text: "Market and timeframes", mark: "dot" },
            { text: "Bias rule", mark: "dot" },
            { text: "Time window", mark: "dot" },
            { text: "Setup", mark: "dot" },
            { text: "Trigger", mark: "dot" },
            { text: "Entry", mark: "dot" },
            { text: "Stop and target rules", mark: "dot" },
            { text: "Daily limits", mark: "dot" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "precise-rule",
      prompt: "Which rule is precise enough to backtest?",
      options: [
        "Enter at the CE of the first 5-minute FVG after a sweep of the Asian low, between 7 and 10 am",
        "Buy when the chart looks bullish",
        "Enter when it feels like smart money is buying",
        "Trade the best setup of the day",
      ],
      answer: 0,
      explain: "Only a rule with exact conditions can be tested. The others change with your mood.",
    },
    {
      kind: "learn",
      title: "Backtesting without lying to yourself",
      body: [
        "Go back through months of charts candle by candle (bar replay), and log **every** setup your rules produce, not just the beautiful ones.",
        "The biggest trap in SMC backtesting is **hindsight**: on a finished chart, the perfect FVG is obvious. In real time, a gap only exists once its third candle has closed, and several gaps compete. Hide the right side of the chart and decide as if it were live.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Honest backtest",
              icon: "check",
              tone: "up",
              points: ["Candle by candle", "Every setup logged", "Right side of the chart hidden"],
            },
            {
              title: "Hindsight",
              icon: "eye",
              tone: "down",
              points: ["A finished chart", "Only the beautiful setups", "The perfect gap looks obvious"],
            },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "skip-losers",
      statement: "When backtesting, it is fine to skip setups that you can see would have lost.",
      answer: false,
      explain: "That is exactly how traders fool themselves. Every setup that meets the rules goes in the log.",
    },
    {
      kind: "learn",
      title: "What the numbers must show",
      body: [
        "After at least **50 to 100 trades**, measure: win rate, average win and loss in R, **expectancy** (Unit 1), biggest losing streak and deepest drawdown.",
        "If expectancy after costs isn't positive, change one rule and test again, or drop the model. If it is, forward test on a demo or very small size before trusting it with real money.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "After 50 to 100 trades, measure",
          items: [
            { text: "Win rate", mark: "dot" },
            { text: "Average win and loss, in R", mark: "dot" },
            { text: "Expectancy after costs", mark: "dot" },
            { text: "Biggest losing streak", mark: "dot" },
            { text: "Deepest drawdown", mark: "dot" },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "model-expectancy",
      prompt: "Out of 40 backtested trades, 16 won with an average of 2.5R and 24 lost 1R each. What is the expectancy per trade, in R?",
      answer: 0.4,
      tolerance: 0.001,
      suffix: "R",
      explain: "Wins: 16 × 2.5 = 40R. Losses: 24 × 1 = 24R. Net 16R over 40 trades = +0.4R per trade, before costs.",
    },
    {
      kind: "learn",
      title: "The honest truth about SMC",
      body: [
        "There is very little independent research proving that SMC or ICT concepts give an edge, and many traders who use them still lose. Some of the ideas are old, well-understood market behaviour with new names; others are unproven.",
        "That is fine. You don't need anyone's proof. You need your own: a precise model, an honest backtest, a forward test, and the risk management of Level 4.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Your own proof",
          nodes: [
            { label: "A precise model", icon: "pen" },
            { label: "An honest backtest", icon: "search" },
            { label: "A forward test", icon: "hourglass" },
            { label: "Risk management", sub: "Level 4", icon: "shield", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "evidence",
      prompt: "What is the best evidence that your SMC model works?",
      options: [
        "Your own honest backtest and forward test, with positive expectancy after costs",
        "A famous trader saying it works",
        "A few great trades you remember",
        "The number of followers of the person who taught it",
      ],
      answer: 0,
      explain: "Only your own complete, honest results on your own rules tell you whether the model has an edge for you.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Write your model so precisely that anyone would take the same trades.",
        "Backtest every setup, candle by candle, without hindsight.",
        "Need 50 to 100 trades and positive expectancy after costs.",
        "Forward test small before trusting it.",
        "Your own evidence beats anyone's claims, SMC included.",
      ],
    },
  ],
}
