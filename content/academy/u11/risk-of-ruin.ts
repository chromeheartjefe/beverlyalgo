import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u11-risk-of-ruin",
  sources: ["Losing-streak probabilities: standard probability, explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Streaks are guaranteed",
      body: [
        "If you win 40% of the time, the chance that any given run of 5 trades are all losers is 0.6 × 0.6 × 0.6 × 0.6 × 0.6, about **7.8%**. Over hundreds of trades, that happens again and again.",
        "With a 40% win rate, a run of 8 or 9 losses in a row somewhere in 100 trades is normal, not bad luck. Plan for it.",
      ],
    },
    {
      kind: "numeric",
      id: "streak-prob",
      prompt: "Your win rate is 50%. What is the chance that the next 4 trades all lose? (percent)",
      answer: 6.25,
      tolerance: 0.01,
      suffix: "%",
      explain: "0.5 × 0.5 × 0.5 × 0.5 = 0.0625, or 6.25%.",
    },
    {
      kind: "learn",
      title: "Risk of ruin",
      body: [
        "**Risk of ruin** is the chance that a strategy loses so much that you can't, or won't, continue. It depends on your edge, and above all on your **risk per trade**.",
        "With a small edge, risking 1% per trade gives a tiny chance of ruin. Risking 10% or 20% makes ruin likely, even with the same edge, because one ordinary losing streak wipes out most of the account.",
      ],
    },
    {
      kind: "learn",
      title: "Circuit breakers",
      body: [
        "Professionals add hard limits so that bad days stay small:",
        "A **daily loss limit** (for example 2% or 3R): hit it and you stop for the day. A **weekly loss limit**. A **maximum number of trades** per day. And a **drawdown rule**: halve your risk after, say, a 10% drawdown.",
        "Funded-trader (prop firm) programs enforce exactly these limits for the same reason.",
      ],
    },
    {
      kind: "choice",
      id: "daily-limit",
      prompt: "You hit your daily loss limit by 10 am. What should you do?",
      options: [
        "Stop trading for the day, however good the next setup looks",
        "Take one more trade with double size to recover",
        "Lower your standards and take smaller setups",
        "Switch to a different market",
      ],
      answer: 0,
      explain: "The limit only works if it is absolute. Its whole purpose is to stop decisions made in frustration.",
    },
    {
      kind: "truefalse",
      id: "streak-means-broken",
      statement: "Six losses in a row prove your strategy no longer works.",
      answer: false,
      explain: "With a 40% win rate, six losses in a row happen regularly. Judge a strategy on large samples, not on one streak.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Losing streaks are a mathematical certainty.",
        "A 40% win rate means 8 or 9 losses in a row will happen.",
        "Risk per trade is the main driver of risk of ruin.",
        "Use daily, weekly and drawdown limits as circuit breakers.",
      ],
    },
  ],
}
