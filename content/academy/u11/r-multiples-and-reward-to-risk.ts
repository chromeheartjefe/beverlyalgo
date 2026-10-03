import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u11-r-multiples-and-reward-to-risk",
  sources: ["Van K. Tharp popularised R-multiples in trading education; the concept is explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Measure trades in R",
      body: [
        "**1R** is the amount you risk on a trade: the distance from entry to stop, times your size. Measuring every result in R instead of dollars makes trades comparable, whatever the market or account size.",
        "Lose the full stop: **−1R**. Make twice your risk: **+2R**. Exit at breakeven: **0R**.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "Every result, in R",
          corner: "",
          cols: ["Full stop hit", "Breakeven exit", "Twice your risk"],
          signed: true,
          suffix: "R",
          rows: [{ label: "Result", cells: [-1, 0, 2] }],
        },
      },
    },
    {
      kind: "numeric",
      id: "result-r",
      prompt: "You buy at 100 with a stop at 98. You exit at 103. What was the result in R?",
      answer: 1.5,
      tolerance: 0.001,
      suffix: "R",
      explain: "Risk was 2 points (1R). You made 3 points: 3 ÷ 2 = +1.5R.",
    },
    {
      kind: "learn",
      title: "Planned reward to risk",
      body: [
        "Before you enter, the **reward-to-risk ratio (R:R)** compares the distance to your target with the distance to your stop. Entry 100, stop 98, target 106: you risk 2 to make 6, which is **3:1** (a 3R target).",
        "Most traders want at least 2:1 on their setups. A great entry location, like the OTE or a fair value gap after a sweep, is what makes high R:R possible.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "Risk 2 to make 6",
          points: [100, 99.3, 100.6, 101.5, 100.9, 102.4, 103.6, 103, 104.8, 106],
          marks: [{ at: 0, label: "Entry" }, { at: 9, label: "A 3R target", tone: "up" }],
          levels: [
            { price: 106, label: "Target 106", tone: "up" },
            { price: 100, label: "Entry 100", tone: "neutral" },
            { price: 98, label: "Stop 98", tone: "down" },
          ],
        },
        caption: "6 of reward for 2 of risk is 3:1.",
      },
    },
    {
      kind: "numeric",
      id: "planned-rr",
      prompt: "Short entry at 250, stop at 254, target at 238. What is the reward-to-risk ratio?",
      answer: 3,
      tolerance: 0.001,
      suffix: ": 1",
      explain: "Risk is 4 points (254 − 250). Reward is 12 points (250 − 238). 12 ÷ 4 = 3:1.",
    },
    {
      kind: "match",
      id: "r-results",
      prompt: "Match each outcome to its R result, for a trade risking 2 points.",
      pairs: [
        ["Stopped out", "−1R"],
        ["Closed at entry", "0R"],
        ["Made 4 points", "+2R"],
        ["Made 1 point", "+0.5R"],
      ],
      explain: "Divide the points won or lost by the 2 points risked.",
    },
    {
      kind: "truefalse",
      id: "rr-alone",
      statement: "A high reward-to-risk ratio on its own guarantees a profitable strategy.",
      answer: false,
      explain: "A 5:1 target that is almost never reached can still lose money. R:R only matters together with win rate, which is the next lesson.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "1R is what you risk on a trade.",
        "Record every result in R: −1R, 0R, +2R...",
        "Reward to risk = target distance ÷ stop distance.",
        "R:R only matters together with win rate.",
      ],
    },
  ],
}
