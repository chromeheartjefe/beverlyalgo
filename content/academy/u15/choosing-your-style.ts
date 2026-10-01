import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-choosing-your-style",
  sources: ["Trading styles as commonly described; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Four styles",
      body: [
        "**Scalping**: seconds to minutes per trade, many trades a day, tiny targets. **Day trading**: minutes to hours, flat by the end of the day. **Swing trading**: days to a few weeks, using 4-hour and daily charts. **Position trading**: weeks to months, following big trends.",
      ],
    },
    {
      kind: "match",
      id: "styles",
      prompt: "Match each style to its typical holding time.",
      pairs: [
        ["Scalping", "Seconds to minutes"],
        ["Day trading", "Minutes to hours, flat by the close"],
        ["Swing trading", "Days to a few weeks"],
        ["Position trading", "Weeks to months"],
      ],
      explain: "Shorter styles need more screen time and pay more in costs relative to their targets.",
    },
    {
      kind: "learn",
      title: "The trade-offs",
      body: [
        "Shorter styles give more trades and faster feedback, but costs eat a bigger share of each small target, and they demand intense focus during market hours.",
        "Longer styles need less screen time and pay less in costs, but positions sit through overnight gaps and news, and feedback is slow: it takes months to build a sample of trades.",
      ],
    },
    {
      kind: "choice",
      id: "fit-style",
      prompt: "You work full time and can only look at charts for 20 minutes each evening. Which style fits best?",
      options: ["Swing trading on 4-hour and daily charts", "Scalping the New York open", "Day trading the London session", "Scalping crypto all night"],
      answer: 0,
      explain: "Swing trading only needs a short daily check, and its setups play out over days, not minutes.",
    },
    {
      kind: "truefalse",
      id: "scalp-easier",
      statement: "Scalping is the easiest style for beginners because trades are so short.",
      answer: false,
      explain: "Scalping needs fast decisions, very low costs and intense focus. Small mistakes and costs add up quickly.",
    },
    {
      kind: "learn",
      title: "Where to go from here",
      body: [
        "You've now covered everything from what a market is to building and testing your own model. Pick a market and a style, write your plan, backtest it honestly, and forward test it small.",
        "The last level shows how to use EntrixAlgo's tools inside that process.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Scalping, day, swing and position trading differ in holding time and screen time.",
        "Shorter styles: more trades, more costs, more focus needed.",
        "Longer styles: less screen time, overnight risk, slower feedback.",
        "Choose the style that fits your life, then plan, test and practise.",
      ],
    },
  ],
}
