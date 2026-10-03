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
      visual: {
        type: "scene",
        scene: {
          kind: "cycle",
          center: "Every trading day",
          nodes: [{ label: "Before the session", tone: "accent" }, { label: "During the session", tone: "warn" }, { label: "After the session", tone: "up" }],
        },
      },
    },
    {
      kind: "learn",
      title: "Before the session",
      body: [
        "Check the **economic calendar** for high-impact news. Glance at the **AI Screener** if you trade crypto or stocks. Mark the higher-timeframe bias, draw on liquidity and key levels on your own chart. Decide what would prove your bias wrong.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          items: [
            { text: "Economic calendar: any high-impact news?", mark: "ok" },
            { text: "AI Screener, if you trade crypto or stocks", mark: "ok" },
            { text: "Mark the higher-timeframe bias", mark: "ok" },
            { text: "Draw on liquidity and key levels", mark: "ok" },
            { text: "Decide what would prove your bias wrong", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "During the session",
      body: [
        "Trade only your killzone and only your written setups. When one appears, use **Chart Analysis** as a second opinion if you like, then size it from the stop with the **Risk Calculator**. Respect your daily loss limit and maximum trades.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "Your killzone", sub: "your written setups only", icon: "clock" },
            { label: "Chart Analysis", sub: "a second opinion, if you like", icon: "search", tone: "accent" },
            { label: "Risk Calculator", sub: "size from the stop", icon: "calculator", tone: "up" },
            { label: "Your limits", sub: "daily loss and maximum trades", icon: "shield", tone: "warn" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "After the session, and every week",
      body: [
        "Log every trade in the **Trade Journal** the same day. Spend five minutes on **Practice** in the Academy to keep the concepts fresh. Once a week, open the **Trade Calendar** for your review and pick one thing to improve. Ask the **AI Trading Bot** about anything that confused you.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "After every session",
              icon: "pen",
              tone: "accent",
              points: ["Log every trade in the Trade Journal", "Five minutes of Practice", "Ask the AI Trading Bot what confused you"],
            },
            { title: "Once a week", icon: "calendar", tone: "up", points: ["Open the Trade Calendar for your review", "Pick one thing to improve"] },
          ],
        },
      },
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
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "The final exam", sub: "on the Academy page", icon: "pen", tone: "accent" },
            { label: "Your certificate", icon: "star", tone: "up" },
            { label: "The real work", sub: "plan, test, risk small, keep practising", icon: "seed", tone: "warn" },
          ],
        },
      },
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
