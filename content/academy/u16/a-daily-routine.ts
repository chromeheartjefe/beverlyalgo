import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-a-daily-routine",
  sources: ["EntrixAlgo dashboard tools"],
  steps: [
    {
      kind: "learn",
      title: "Putting it all together",
      body: [
        "Here is one way to turn everything in this course into a daily routine with your EntrixAlgo tools. Adapt the times to your market and session.",
      ],
    },
    {
      kind: "learn",
      title: "Before the session",
      body: [
        "Check the **economic calendar** for high-impact news. Glance at the **AI Screener** if you trade crypto or stocks. Mark the higher-timeframe bias, draw on liquidity and key levels on your own chart. Decide what would prove your bias wrong.",
      ],
    },
    {
      kind: "learn",
      title: "During the session",
      body: [
        "Trade only your killzone and only your written setups. When one appears, use **Chart Analysis** as a second opinion if you like, then size it from the stop with the **Risk Calculator**. Respect your daily loss limit and maximum trades.",
      ],
    },
    {
      kind: "learn",
      title: "After the session, and every week",
      body: [
        "Log every trade in the **Trade Journal** the same day. Spend five minutes on **Practice** in the Academy to keep the concepts fresh. Once a week, open the **Trade Calendar** for your review and pick one thing to improve. Ask the **AI Trading Bot** about anything that confused you.",
      ],
    },
    {
      kind: "match",
      id: "tools",
      prompt: "Match each step to the tool for it.",
      pairs: [
        ["Find movers worth a look", "AI Screener"],
        ["Get a second opinion on a setup", "Chart Analysis"],
        ["Work out position size", "Risk Calculator"],
        ["Record what happened", "Trade Journal"],
      ],
      explain: "Each tool covers one step of the routine. Your rules connect them.",
    },
    {
      kind: "choice",
      id: "order",
      prompt: "A setup appears in your killzone. Which order of steps is right?",
      options: [
        "Check it fits your plan, size it from the stop, enter, then journal it",
        "Enter first, decide the stop later",
        "Journal it before deciding whether to take it",
        "Ask a friend, then double the size",
      ],
      answer: 0,
      explain: "Plan, size, execute, record. The same order every time.",
    },
    {
      kind: "truefalse",
      id: "tools-enough",
      statement: "Having good tools means you don't need a written plan.",
      answer: false,
      explain: "Tools speed up each step, but the plan decides which steps you take. Without it, tools just help you make mistakes faster.",
    },
    {
      kind: "learn",
      title: "One last thing",
      body: [
        "You've reached the end of the lessons. The final exam is waiting on the Academy page: pass it to earn your Entrix Academy certificate.",
        "After that, the real work starts: write your plan, test it honestly, risk small, and keep practising.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Before: news calendar, Screener, bias and levels.",
        "During: killzone, setups only, Chart Analysis as a second opinion, Risk Calculator for size.",
        "After: Journal, Practice, and a weekly Calendar review.",
        "Next: the final exam and your certificate.",
      ],
    },
  ],
}
