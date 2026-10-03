import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-the-ai-trading-bot",
  sources: ["EntrixAlgo AI Trading Bot"],
  steps: [
    {
      kind: "learn",
      title: "A trading tutor that's always on",
      body: [
        "The **AI Trading Bot** is a chat assistant for trading questions: strategy, risk management, order types and psychology. It is a Pro feature.",
        "It is a great companion to this course: ask it to explain a concept again in different words, or to walk through an example with your own numbers.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Ask it about", icon: "message", tone: "accent", points: ["Strategy", "Risk management", "Order types", "Psychology"] },
            {
              title: "Alongside this course",
              icon: "book",
              tone: "up",
              points: ["A concept explained again in different words", "An example with your own numbers"],
            },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Good ways to use it",
      body: [
        "**Explain**: \"Explain consequent encroachment like I'm new to trading.\" **Calculate**: \"Size a position: $15,000 account, 1% risk, 30-point stop on MNQ.\" **Quiz**: \"Ask me five questions about fair value gaps.\" **Review**: paste your trading plan and ask what's missing or vague.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "cycle",
          title: "Four good ways to use it",
          center: "Ask the AI Trading Bot to",
          nodes: [
            { label: "Explain a concept", tone: "accent" },
            { label: "Calculate a position size", tone: "up" },
            { label: "Quiz you", tone: "warn" },
            { label: "Review your plan", tone: "accent" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "best-prompt",
      prompt: "Which request makes the best use of the AI Trading Bot?",
      options: [
        "\"Here is my trading plan. Which rules are vague or missing?\"",
        "\"Which coin will go up 100% next week?\"",
        "\"Tell me exactly what to buy right now with my whole account.\"",
        "\"Guarantee me a profitable month.\"",
      ],
      answer: 0,
      explain: "It shines at explaining, checking and teaching. Nobody, human or AI, can reliably predict next week's winners.",
    },
    {
      kind: "truefalse",
      id: "bot-signals",
      statement: "The AI Trading Bot replaces your own analysis and risk management.",
      answer: false,
      explain: "It helps you understand and plan. Decisions, risk and responsibility stay with you.",
    },
    {
      kind: "learn",
      title: "Trust, but verify",
      body: [
        "AI assistants can be wrong, especially with specific numbers, rules or very recent events. Double-check anything you'll act on: contract specs with the exchange, rules with your broker, calculations by hand or with the Risk Calculator.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "Double-check anything you'll act on",
          corner: "",
          cols: ["Check it with"],
          rows: [
            { label: "Contract specs", cells: ["The exchange"], tones: ["accent"] },
            { label: "Rules", cells: ["Your broker"], tones: ["accent"] },
            { label: "Calculations", cells: ["By hand, or the Risk Calculator"], tones: ["up"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "verify",
      prompt: "The bot tells you a futures contract's value per point. You're about to size a real trade on it. What should you do?",
      options: [
        "Confirm the contract specs with the exchange or your broker first",
        "Trust it completely",
        "Double your size to be safe",
        "Skip the stop",
      ],
      answer: 0,
      explain: "A wrong value per point means a wrong position size. Check facts that your money depends on.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The AI Trading Bot answers questions on strategy, risk, orders and psychology.",
        "Use it to explain, calculate, quiz you and review your plan.",
        "It doesn't predict markets or replace your process.",
        "Verify any number you will act on.",
      ],
    },
  ],
}
