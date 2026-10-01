import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-forward-testing",
  sources: ["CFTC Learn & Protect: practise before you trade real money"],
  steps: [
    {
      kind: "learn",
      title: "From the past to the present",
      body: [
        "A good backtest is a reason to keep going, not a reason to bet big. Next comes **forward testing**: trading the strategy in real time, on charts you can't see the end of.",
        "Start on a **demo** (paper) account, then move to **very small real size**. Only scale up once live results look like the backtest.",
      ],
    },
    {
      kind: "learn",
      title: "What live trading adds",
      body: [
        "Live markets add things no backtest has: real slippage, missed fills, spreads that widen on news, technical problems, and above all **your emotions** when real money is moving.",
        "Many traders discover their strategy works and they don't: they skip setups, close winners early, or move stops. Forward testing reveals that while it is still cheap.",
      ],
    },
    {
      kind: "choice",
      id: "next-step",
      prompt: "Your backtest over 100 trades shows +0.3R per trade after costs. What should you do next?",
      options: [
        "Forward test on demo, then with very small real size",
        "Trade it with your full account straight away",
        "Increase risk to 10% per trade to grow faster",
        "Stop, because 100 trades is too few to mean anything",
      ],
      answer: 0,
      explain: "The backtest earned the right to a real-time test, not to full size. Scale up step by step as live results confirm it.",
    },
    {
      kind: "truefalse",
      id: "demo-same",
      statement: "Results on a demo account are always identical to results with real money.",
      answer: false,
      explain: "Fills, slippage and especially your own behaviour change when real money is at stake. That is why small live size comes next.",
    },
    {
      kind: "learn",
      title: "How long?",
      body: [
        "Long enough to take a meaningful number of trades, often 30 to 50 at least, across different market conditions. For a strategy taking one trade a day, that is a couple of months.",
        "Compare live results with the backtest: similar win rate, average win and average loss? If they differ a lot, find out why before risking more.",
      ],
    },
    {
      kind: "choice",
      id: "gap",
      prompt: "Live, your average loss is 1.6R, but in the backtest it was 1R. What is the most likely cause?",
      options: [
        "Slippage, or you are moving or skipping stops",
        "The market changed its rules",
        "Averages don't apply to live trading",
        "Your broker is cheating, nothing else could explain it",
      ],
      answer: 0,
      explain: "Losses bigger than 1R come from slippage or from not respecting the stop. Both are fixable once you see them.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Forward test in real time: demo first, then tiny real size.",
        "Live trading adds slippage, missed fills and emotions.",
        "Collect 30 to 50 or more live trades before scaling up.",
        "Compare live numbers with the backtest and investigate differences.",
      ],
    },
  ],
}
