import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-sample-size-and-when-to-change",
  sources: ["Binomial probability: standard statistics, explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Twenty trades say very little",
      body: [
        "Flip a fair coin 20 times and you'll rarely get exactly 10 heads. Trading results are the same: short runs are noisy.",
        "A strategy that truly wins 50% of the time has about a **13% chance** of winning 7 or fewer of its next 20 trades. A good strategy can look broken over a few weeks, and a bad one can look brilliant.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "stat",
          title: "A strategy that truly wins half the time",
          stats: [{ value: 13, suffix: "%", label: "chance it wins 7 or fewer of its next 20 trades", tone: "warn" }],
        },
      },
    },
    {
      kind: "truefalse",
      id: "twenty-proof",
      statement: "Ten winning trades in a row prove a strategy has an edge.",
      answer: false,
      explain: "Streaks happen by chance. Only a large sample, judged against what you'd expect, says anything reliable.",
    },
    {
      kind: "learn",
      title: "How many is enough?",
      body: [
        "There is no magic number, but as a rule of thumb: under 30 trades, results are mostly noise. Around 50 to 100, you start to see the real shape of a strategy. More is better, especially for strategies with a low win rate and big winners.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "timeline",
          title: "How many trades?",
          events: [
            { time: "Under 30", label: "Mostly noise", tone: "down" },
            { time: "50 to 100", label: "The real shape starts to show", tone: "warn" },
            { time: "More", label: "Better still, above all with a low win rate", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "after-bad-week",
      prompt: "Your tested strategy loses 6 of 8 trades this week. What should you do?",
      options: [
        "Keep following it, check that you executed the rules correctly, and judge it on a bigger sample",
        "Abandon it and find a new one",
        "Double your size to recover faster",
        "Change three rules before Monday",
      ],
      answer: 0,
      explain: "Eight trades are noise. Check execution, keep risk small, and keep collecting data.",
    },
    {
      kind: "learn",
      title: "When to change",
      body: [
        "Change a strategy when the evidence is strong: a large sample that is clearly worse than the backtest, after costs, with correct execution. Or when the market itself has clearly changed, such as a big shift in volatility.",
        "When you change, change **one thing**, and test it again. Constant switching is one of the most common reasons traders never improve.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Good reasons to change a strategy",
          items: [
            { text: "A large sample, clearly worse than the backtest", mark: "ok" },
            { text: "After costs, with correct execution", mark: "ok" },
            { text: "Or the market itself has clearly changed", mark: "ok" },
            { text: "Then change one thing, and test again", mark: "dot" },
            { text: "Not: constant switching", mark: "bad" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "good-reason",
      prompt: "Which is the best reason to change your strategy?",
      options: [
        "After 120 well-executed live trades, results are far below the backtest",
        "You lost three trades in a row yesterday",
        "A new strategy looked exciting on social media",
        "You are bored",
      ],
      answer: 0,
      explain: "A large, well-executed sample that clearly disagrees with the backtest is real evidence. The rest is noise or emotion.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Small samples are noisy; streaks prove nothing.",
        "Under 30 trades is mostly noise; aim for 50 to 100 or more.",
        "Change only on strong evidence, one thing at a time.",
        "Constant strategy-hopping prevents improvement.",
      ],
    },
  ],
}
