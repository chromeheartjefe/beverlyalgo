import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u14-why-news-moves-price",
  sources: ["Investor.gov (U.S. SEC): how markets react to information"],
  steps: [
    {
      kind: "learn",
      title: "Surprise moves markets",
      body: [
        "Markets don't react to whether news is good or bad. They react to whether it is **better or worse than expected**.",
        "Before every big release, economists publish a **forecast** (the consensus). Prices already reflect that expectation. When the actual number comes out, the **surprise**, the gap between actual and forecast, is what moves price.",
      ],
    },
    {
      kind: "choice",
      id: "good-news-down",
      prompt: "A company reports record profits, but the stock falls 8%. What is the most likely reason?",
      options: [
        "Investors expected even more, so the result disappointed",
        "Record profits are always bad news",
        "The exchange made a mistake",
        "Stocks always fall on earnings day",
      ],
      answer: 0,
      explain: "Good isn't enough if the market priced in great. The surprise was negative, so the stock fell.",
    },
    {
      kind: "learn",
      title: "Priced in, and sell the news",
      body: [
        "When everyone expects something, it is **priced in** before it happens. Hence the saying \"buy the rumour, sell the news\": price rises on the expectation, then falls when the event actually arrives because there's no one left to buy.",
        "The first reaction to news is also often a liquidity grab: a spike that runs stops on one side before the real move goes the other way.",
      ],
    },
    {
      kind: "truefalse",
      id: "bad-news-down",
      statement: "Bad economic news always makes stock indices fall.",
      answer: false,
      explain: "If the news was less bad than expected, or makes rate cuts more likely, indices can rally on it.",
    },
    {
      kind: "choice",
      id: "surprise",
      prompt: "Inflation was forecast at 3.0% and comes in at 3.4%. What is the surprise?",
      options: ["Higher than expected (a hot reading)", "Lower than expected", "No surprise", "It can't be known"],
      answer: 0,
      explain: "Actual above forecast is a hot reading. Markets usually price in higher interest rates as a result.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Markets react to surprises versus expectations, not good or bad news.",
        "Expected events are priced in before they happen.",
        "\"Buy the rumour, sell the news.\"",
        "The first spike on news is often a liquidity grab.",
      ],
    },
  ],
}
