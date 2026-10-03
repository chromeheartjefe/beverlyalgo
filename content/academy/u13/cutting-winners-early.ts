import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u13-cutting-winners-early",
  sources: [
    "Odean, \"Are Investors Reluctant to Realize Their Losses?\" (Journal of Finance, 1998)",
    "Lefèvre, Reminiscences of a Stock Operator (1923), public domain, Project Gutenberg #60979",
  ],
  steps: [
    {
      kind: "learn",
      title: "The disposition effect",
      body: [
        "Terrance Odean's 1998 study of thousands of trading accounts found that investors sold winning positions far more readily than losing ones, and that the winners they sold went on to do better than the losers they kept.",
        "This is the **disposition effect**: we lock in small gains to feel good, and hold losses to avoid feeling bad.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "What Odean's study found",
          columns: [
            { title: "Winners", icon: "trending-up", tone: "up", points: ["Sold far more readily", "Went on to do better"] },
            { title: "Losers", icon: "trending-down", tone: "down", points: ["Kept", "Did worse than the winners that were sold"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Sitting tight",
      body: [
        "About a century ago, the narrator of Reminiscences of a Stock Operator (a character based on the trader Jesse Livermore) put it like this:",
        "\"It never was my thinking that made the big money for me. It always was my sitting. Got that? My sitting tight!\"",
        "Being right about direction is common. Staying in long enough to be paid for it is rare.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "quote",
          text: "It never was my thinking that made the big money for me. It always was my sitting. Got that? My sitting tight!",
          author: "Edwin Lefèvre",
          source: "Reminiscences of a Stock Operator (1923)",
        },
      },
    },
    {
      kind: "numeric",
      id: "cut-cost",
      prompt: "Your strategy targets 3R with a 30% win rate, but you keep closing winners at 1R. What is your expectancy now, in R? (losses still −1R)",
      answer: -0.4,
      tolerance: 0.001,
      suffix: "R",
      explain: "0.3 × 1 − 0.7 × 1 = −0.4R. At the planned 3R it would be 0.3 × 3 − 0.7 = +0.2R. Cutting winners turned an edge into a loss.",
    },
    {
      kind: "learn",
      title: "Tools to stay in",
      body: [
        "**Set the target before entry** as an order, and let it work. **Partials**: take some off at a first target to calm the nerves, let the rest run. **Trail the stop** behind structure instead of closing manually. **Look away**: alerts at your target and stop, rather than watching every tick.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Tools to stay in a winner",
          items: [
            { text: "Set the target as an order before entry", mark: "ok" },
            { text: "Take partials at a first target", mark: "ok" },
            { text: "Trail the stop behind structure", mark: "ok" },
            { text: "Use alerts, and look away", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "take-quick",
      statement: "Taking profits as soon as a trade is green is a safe habit that improves results.",
      answer: false,
      explain: "It shrinks your average win until a positive strategy becomes a losing one. Winners have to pay for the losers.",
    },
    {
      kind: "choice",
      id: "winner-tool",
      prompt: "Which approach best lets winners reach their target?",
      options: [
        "A target order placed at entry, plus a stop trailed behind structure",
        "Watching every tick and closing when it feels right",
        "Closing as soon as the trade shows any profit",
        "Removing the target so it can run forever",
      ],
      answer: 0,
      explain: "Pre-placed orders and rule-based trailing take the in-the-moment emotion out of the exit.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "People sell winners too early and hold losers too long.",
        "Cutting winners can turn a winning strategy into a losing one.",
        "Place targets as orders; use partials and structure-based trailing.",
        "\"It always was my sitting.\"",
      ],
    },
  ],
}
