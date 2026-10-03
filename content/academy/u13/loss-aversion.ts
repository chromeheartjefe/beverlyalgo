import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u13-loss-aversion",
  sources: [
    "Kahneman and Tversky, \"Prospect Theory: An Analysis of Decision under Risk\" (Econometrica, 1979)",
    "Tversky and Kahneman, \"Advances in Prospect Theory\" (1992): losses weigh roughly twice as much as gains",
  ],
  steps: [
    {
      kind: "learn",
      title: "Losses hurt twice as much",
      body: [
        "In 1979, psychologists Daniel Kahneman and Amos Tversky published **prospect theory**. One of its key findings: people feel a loss far more strongly than a gain of the same size. Later work estimated losses weigh roughly **twice** as much.",
        "Kahneman later won a Nobel prize for this work. For traders, it explains a lot of self-destructive behaviour.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "How strongly it is felt",
          max: 2,
          bars: [
            { label: "A gain", value: 1, display: "1x", tone: "up" },
            { label: "A loss of the same size", value: 2, display: "roughly 2x", tone: "down" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "coin-bet",
      prompt: "A fair coin flip: heads you win $150, tails you lose $100. Many people refuse it. Why?",
      options: [
        "The possible loss feels bigger than the larger possible gain",
        "The bet loses money on average",
        "Coins are never fair",
        "$150 is too small to matter",
      ],
      answer: 0,
      explain: "The bet is worth +$25 on average, but the $100 loss looms larger than the $150 gain. That is loss aversion.",
    },
    {
      kind: "learn",
      title: "How it shows up in trading",
      body: [
        "**Holding losers**: closing a losing trade makes the loss real, so we wait and hope. **Moving stops**: the stop is about to make the loss real, so it gets moved. **Cutting winners**: a profit could turn into a loss, so we grab it early.",
        "The result is exactly backwards: small wins and big losses.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Holding losers", icon: "hourglass", tone: "down", points: ["Closing makes the loss real", "So we wait and hope"] },
            { title: "Moving stops", icon: "flag", tone: "down", points: ["The stop would make it real", "So it gets moved"] },
            { title: "Cutting winners", icon: "trending-up", tone: "warn", points: ["A profit could turn into a loss", "So we grab it early"] },
          ],
        },
        caption: "The result is backwards: small wins and big losses.",
      },
    },
    {
      kind: "truefalse",
      id: "loss-real",
      statement: "A losing trade isn't really a loss until you close it.",
      answer: false,
      explain: "The money is already gone from your account's value. Waiting only adds the risk of a bigger loss.",
    },
    {
      kind: "learn",
      title: "Working with your brain",
      body: [
        "You can't switch off loss aversion, but you can design around it. Set the stop **before** entering and never move it away. Use bracket orders so the stop and target are placed automatically. Size small enough that a loss doesn't sting much.",
        "And think in R: a −1R loss is just one planned outcome among many.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Design around it",
          items: [
            { text: "Set the stop before entering", mark: "ok" },
            { text: "Never move it away", mark: "ok" },
            { text: "Use bracket orders", mark: "ok" },
            { text: "Size small enough that a loss doesn't sting much", mark: "ok" },
            { text: "Think in R: -1R is one planned outcome among many", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "best-defence",
      prompt: "Which habit best protects you from loss aversion?",
      options: [
        "Placing the stop and target as orders the moment you enter",
        "Watching every tick to decide when to get out",
        "Never looking at your open trades",
        "Trading bigger so losses feel normal",
      ],
      answer: 0,
      explain: "Decisions made before the trade, and placed as orders, can't be changed by fear in the moment.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Prospect theory: losses feel about twice as strong as equal gains.",
        "It drives holding losers, moving stops and cutting winners.",
        "Decide stops and targets before entering and place them as orders.",
        "Think in R and size small enough to stay calm.",
      ],
    },
  ],
}
