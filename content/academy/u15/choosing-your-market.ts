import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-choosing-your-market",
  sources: ["Investor.gov (U.S. SEC): choosing investments that fit your situation"],
  steps: [
    {
      kind: "learn",
      title: "Fit the market to your life",
      body: [
        "There is no best market, only the best one **for you**. Four questions decide it:",
        "**When can you trade?** Mornings in New York, evenings in Asia, weekends? **How much capital?** It decides which contract sizes work. **How much volatility can you stomach?** **What costs and rules apply where you live?**",
      ],
    },
    {
      kind: "match",
      id: "fit",
      prompt: "Match each situation to a market that fits.",
      pairs: [
        ["Free only on weekends", "Crypto"],
        ["Free 9:30 to 11:30 am New York time, small account", "MNQ or MES micros"],
        ["Free early mornings in Europe", "Forex in the London session"],
      ],
      explain: "Pick a market that is active and liquid during the hours you can actually focus.",
    },
    {
      kind: "learn",
      title: "Start with one",
      body: [
        "Every market has its own rhythm: when it moves, how far, and how it reacts to news. Learning that takes months of screen time on one chart.",
        "Specialise first. Many consistently profitable traders trade only one or two instruments their whole career.",
      ],
    },
    {
      kind: "choice",
      id: "one-market",
      prompt: "What is the best approach for a new trader?",
      options: [
        "Master one liquid market before adding others",
        "Trade ten markets to catch every move",
        "Switch markets every week",
        "Pick whichever market moved most yesterday",
      ],
      answer: 0,
      explain: "Depth beats breadth while you're learning. You'll recognise patterns in one market far sooner.",
    },
    {
      kind: "truefalse",
      id: "liquid-matters",
      statement: "A highly liquid market is usually a better place to learn than a thin one.",
      answer: true,
      explain: "Tighter spreads, smoother fills and fewer manipulation risks make results reflect your skill rather than the market's quirks.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Choose by schedule, capital, temperament and local rules.",
        "Pick a market that's active during your free hours.",
        "Specialise in one liquid market first.",
      ],
    },
  ],
}
