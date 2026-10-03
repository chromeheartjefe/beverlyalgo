import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u11-win-rate-r-r-and-expectancy",
  sources: ["Expectancy and breakeven win rate: standard probability, explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Two numbers, one result",
      body: [
        "A strategy's results come from two numbers working together: how often it wins (**win rate**) and how much it wins compared with what it loses (**R:R**).",
        "A 70% win rate with tiny winners can lose money. A 35% win rate with big winners can make a lot. Neither number means anything alone.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Neither number means anything alone",
          columns: [
            { title: "70% win rate", icon: "percent", tone: "warn", points: ["With tiny winners", "Can lose money"] },
            { title: "35% win rate", icon: "percent", tone: "up", points: ["With big winners", "Can make a lot"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "The breakeven win rate",
      body: [
        "For a given R:R, the win rate where you neither make nor lose money is: **breakeven win rate = 1 ÷ (1 + R:R)**.",
        "At 1:1 you need to win 50%. At 2:1, about 33%. At 3:1, just 25%. Anything above the breakeven rate, after costs, is your edge.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "Win rate needed just to break even",
          max: 100,
          bars: [
            { label: "R:R of 1:1", value: 50, display: "50%", tone: "warn" },
            { label: "R:R of 2:1", value: 33.3, display: "about 33%", tone: "accent" },
            { label: "R:R of 3:1", value: 25, display: "25%", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "breakeven",
      prompt: "Your trades target 2R and risk 1R. What win rate do you need just to break even, before costs? (whole percent is fine)",
      answer: 33.3,
      tolerance: 0.5,
      suffix: "%",
      explain: "1 ÷ (1 + 2) = 0.333, about 33%. Win more often than that and the strategy makes money.",
    },
    {
      kind: "numeric",
      id: "expectancy",
      prompt: "You win 45% of trades at +2R and lose 55% at −1R. What is the expectancy per trade, in R?",
      answer: 0.35,
      tolerance: 0.001,
      suffix: "R",
      explain: "0.45 × 2 − 0.55 × 1 = 0.90 − 0.55 = +0.35R per trade, before costs.",
    },
    {
      kind: "learn",
      title: "Costs come off the top",
      body: [
        "Spreads, commissions and slippage are paid on every trade, win or lose. If they average 0.1R per trade, a +0.2R strategy is really a +0.1R strategy.",
        "Always calculate expectancy **after costs**. Small edges vanish quickly when you trade often.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "Expectancy per trade",
          max: 0.25,
          bars: [
            { label: "Before costs", value: 0.2, display: "+0.2R", tone: "up" },
            { label: "Costs", value: 0.1, display: "0.1R", tone: "down" },
            { label: "What is really left", value: 0.1, display: "+0.1R", tone: "warn" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "which-better",
      prompt: "Which strategy has the better expectancy before costs?",
      options: [
        "40% win rate at 3R winners and 1R losers",
        "70% win rate at 0.4R winners and 1R losers",
        "They are exactly equal",
        "There is no way to tell",
      ],
      answer: 0,
      explain: "First: 0.4 × 3 − 0.6 × 1 = +0.6R. Second: 0.7 × 0.4 − 0.3 × 1 = −0.02R. The high win rate one actually loses.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Win rate and R:R only mean something together.",
        "Breakeven win rate = 1 ÷ (1 + R:R).",
        "Expectancy = win rate × average win − loss rate × average loss.",
        "Always judge it after costs.",
      ],
    },
  ],
}
