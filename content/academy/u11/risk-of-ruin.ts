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
        "With a 40% win rate, there is about an even chance of 8 losses in a row somewhere in 100 trades, and over 300 trades it is very likely. That is normal, not bad luck. Plan for it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "stat",
          title: "Winning 40% of the time",
          stats: [{ value: 7.8, decimals: 1, suffix: "%", label: "chance that any given run of 5 trades are all losers", tone: "warn" }],
        },
      },
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
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "Account left after 8 losses in a row",
          max: 100,
          bars: [
            { label: "Risking 1% a trade", value: 92.3, display: "about 92%", tone: "up" },
            { label: "Risking 10% a trade", value: 43, display: "about 43%", tone: "warn" },
            { label: "Risking 20% a trade", value: 16.8, display: "about 17%", tone: "down" },
          ],
        },
        caption: "The same ordinary losing streak, at three different sizes of risk.",
      },
    },
    {
      kind: "learn",
      title: "Circuit breakers",
      body: [
        "Professionals add hard limits so that bad days stay small:",
        "A **daily loss limit** (for example 2% or 3R): hit it and you stop for the day. A **weekly loss limit**. A **maximum number of trades** per day. And a **drawdown rule**: halve your risk after, say, a 10% drawdown.",
        "Funded-trader (prop firm) programs enforce exactly these limits for the same reason.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Hard limits that keep bad days small",
          items: [
            { text: "A daily loss limit, for example 2% or 3R", mark: "ok" },
            { text: "A weekly loss limit", mark: "ok" },
            { text: "A maximum number of trades per day", mark: "ok" },
            { text: "Halve your risk after a drawdown of, say, 10%", mark: "ok" },
          ],
        },
      },
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
        "At a 40% win rate, 8 losses in a row within 100 trades is about a coin flip.",
        "Risk per trade is the main driver of risk of ruin.",
        "Use daily, weekly and drawdown limits as circuit breakers.",
      ],
    },
  ],
}
