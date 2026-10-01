import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-the-ai-indicator",
  sources: ["EntrixAlgo AI Trading Indicator"],
  steps: [
    {
      kind: "learn",
      title: "Signals on your own chart",
      body: [
        "The **EntrixAlgo AI Trading Indicator** runs on TradingView and paints its zones and signals directly on your chart. It is a Pro feature: you request access from the **AI Trading Indicator** page in your dashboard and follow the steps there.",
        "Like everything in this course, it is a tool inside your process, not a replacement for it.",
      ],
    },
    {
      kind: "learn",
      title: "Test it before you trust it",
      body: [
        "Before trading any indicator's signals with real money, use TradingView's bar replay on your own market and timeframe. Step through the past candle by candle and log every signal it gave, winners and losers, exactly as you did for your own model in Level 3.",
        "If the signals don't hold up on your market, they don't hold up. Every tool behaves differently on different markets and timeframes.",
      ],
    },
    {
      kind: "choice",
      id: "test-first",
      prompt: "You've just added a new indicator to your chart. What should come first?",
      options: [
        "Backtest its signals on your market with bar replay",
        "Trade every signal live with full size",
        "Remove your stops, the indicator handles it",
        "Add five more indicators",
      ],
      answer: 0,
      explain: "Signals are only as good as their results on your market. Measure that before risking money.",
    },
    {
      kind: "learn",
      title: "Signals plus context",
      body: [
        "Even a good signal is better in the right context: in line with the higher-timeframe bias, inside a killzone, away from big news, at a level where liquidity or an imbalance makes sense.",
        "Always size from the signal's stop with your normal risk per trade, and journal every signal you take.",
      ],
    },
    {
      kind: "truefalse",
      id: "signal-always",
      statement: "An indicator signal means the trade is certain to work.",
      answer: false,
      explain: "No signal is certain. That's why you test them, add context, and always use a stop and proper sizing.",
    },
    {
      kind: "choice",
      id: "news-signal",
      prompt: "A buy signal appears two minutes before CPI is released. What does your plan say?",
      options: [
        "Wait until the release and the first reaction are over",
        "Take it with double size before the news",
        "Take it and remove the stop",
        "Signals before news are always the best",
      ],
      answer: 0,
      explain: "Entering right before high-impact news turns a tested setup into a coin flip with wide spreads.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The AI Trading Indicator paints zones and signals on TradingView (Pro).",
        "Request access from the AI Trading Indicator page in your dashboard.",
        "Backtest its signals on your market with bar replay first.",
        "Add context, size from the stop, and journal every signal you take.",
      ],
    },
  ],
}
