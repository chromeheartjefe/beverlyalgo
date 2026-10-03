import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-the-ai-indicator",
  sources: ["EntrixAlgo AI Trading Indicator"],
  steps: [
    {
      kind: "learn",
      title: "Signals on your own chart",
      body: [
        "An indicator such as the **EntrixAlgo AI Trading Indicator** runs on TradingView and paints signals directly on your chart. Ours is being rebuilt, so it is not available right now; the **AI Trading Indicator** page in your dashboard shows its status.",
        "This lesson applies to any indicator you put on a chart, ours included. Like everything in this course, it is a tool inside your process, not a replacement for it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "A tool inside your process",
          columns: [
            { title: "What an indicator does", icon: "candles", tone: "accent", points: ["Runs on your chart", "Paints signals directly on it"] },
            { title: "What it doesn't do", icon: "ban", tone: "warn", points: ["Replace your process"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Test it before you trust it",
      body: [
        "Before trading any indicator's signals with real money, use TradingView's bar replay on your own market and timeframe. Step through the past candle by candle and log every signal it gave, winners and losers, exactly as you did for your own model in Level 3.",
        "If the signals don't hold up on your market, they don't hold up. Every tool behaves differently on different markets and timeframes.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Before any real money",
          nodes: [
            { label: "Bar replay", sub: "your market, your timeframe", icon: "repeat" },
            { label: "Candle by candle", sub: "step through the past", icon: "candles" },
            { label: "Log every signal", sub: "winners and losers", icon: "pen", tone: "accent" },
            { label: "Do they hold up?", icon: "scale", tone: "warn" },
          ],
        },
      },
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
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "A signal is better when it is",
          items: [
            { text: "In line with the higher-timeframe bias", mark: "ok" },
            { text: "Inside a killzone", mark: "ok" },
            { text: "Away from big news", mark: "ok" },
            { text: "At a level where liquidity or an imbalance makes sense", mark: "ok" },
            { text: "Sized from its stop, and journaled", mark: "ok" },
          ],
        },
      },
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
        "An indicator paints signals on your chart; the EntrixAlgo one is being rebuilt.",
        "Any indicator is a tool inside your process, not a replacement for it.",
        "Backtest its signals on your market with bar replay first.",
        "Add context, size from the stop, and journal every signal you take.",
      ],
    },
  ],
}
