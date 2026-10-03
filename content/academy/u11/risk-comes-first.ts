import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u11-risk-comes-first",
  sources: ["CFTC Learn & Protect: understanding leverage and risk", "Investor.gov (U.S. SEC): understanding investment risk"],
  steps: [
    {
      kind: "learn",
      title: "Welcome to Level 4",
      body: [
        "You can now read a chart better than most people who trade. That alone doesn't make money. What decides whether you last is how you handle **risk**, how you **test** your ideas, and how you handle **yourself**.",
        "This level is the least exciting part of trading and the most important one.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "What decides whether you last",
          nodes: [
            { label: "Risk", sub: "how you handle it", icon: "shield", tone: "up" },
            { label: "Testing", sub: "how you test your ideas", icon: "search", tone: "accent" },
            { label: "Yourself", sub: "how you handle you", icon: "brain", tone: "warn" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Amateurs and professionals",
      body: [
        "Beginners ask: **how much can I make** on this trade? Professionals ask: **how much can I lose**, and is that acceptable?",
        "Every trade's risk is decided before you enter: the distance from your entry to your stop, multiplied by your position size. If you can't say that number, you don't have a trade, you have a hope.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "The first question before a trade",
          columns: [
            { title: "Beginners", icon: "user", tone: "warn", points: ["How much can I make?"] },
            { title: "Professionals", icon: "shield", tone: "up", points: ["How much can I lose?", "Is that acceptable?", "Decided before entry"] },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "trade-risk",
      prompt: "You buy 2 MNQ contracts ($2 per point each) with a stop 25 points below your entry. How much do you lose if the stop is hit?",
      answer: 100,
      tolerance: 0,
      prefix: "$",
      explain: "25 points × $2 × 2 contracts = $100, before costs and any slippage.",
    },
    {
      kind: "learn",
      title: "Survival is the edge",
      body: [
        "Even a strategy that works will have long losing streaks. Your first job is to make sure no streak can knock you out of the game.",
        "If you survive, a real edge has time to show itself. If you don't, it never matters how good the edge was.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Why survival comes first",
          nodes: [
            { label: "A strategy that works", icon: "check", tone: "up" },
            { label: "Still has long losing streaks", icon: "trending-down", tone: "warn" },
            { label: "Survive them", icon: "shield", tone: "accent" },
            { label: "The edge has time to show", icon: "trending-up", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "first-question",
      prompt: "Which question should you answer before every trade?",
      options: [
        "Where is my stop, and how much do I lose if it is hit?",
        "How rich will this trade make me?",
        "What are other traders on social media doing?",
        "Can I skip the stop this time?",
      ],
      answer: 0,
      explain: "The loss is the only part of a trade you control. Decide it before you enter.",
    },
    {
      kind: "truefalse",
      id: "good-strategy-safe",
      statement: "A strategy with a real edge can't have long losing streaks.",
      answer: false,
      explain: "Even good strategies lose many times in a row now and then. Risk management is what lets you survive those streaks.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Ask how much you can lose before asking how much you can make.",
        "Risk = distance to the stop × position size, known before entry.",
        "Every strategy has losing streaks; surviving them is the first job.",
      ],
    },
  ],
}
