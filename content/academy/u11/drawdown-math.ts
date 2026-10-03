import { equityCandles, equityPath } from "@/content/academy/l4/equity"
import type { LessonContent } from "@/lib/academy/types"

const path = equityPath(10000, 0.1)
const candles = equityCandles(path)
// Peak before the deepest fall, and the trough of that fall
let peakIdx = 0
let troughIdx = 0
let best = 0
let runPeak = 0
path.forEach((v, i) => {
  if (v > path[runPeak]) runPeak = i
  const dd = (path[runPeak] - v) / path[runPeak]
  if (dd > best) {
    best = dd
    peakIdx = runPeak
    troughIdx = i
  }
})

export const lesson: LessonContent = {
  id: "u11-drawdown-math",
  sources: ["Percentage loss and recovery: standard arithmetic"],
  steps: [
    {
      kind: "learn",
      title: "Drawdown",
      body: [
        "A **drawdown** is a fall from your account's highest point to a later low. The **maximum drawdown** is the deepest such fall. It measures the pain a strategy puts you through.",
        "Here is the same 50-trade sequence at 10% risk per trade. It ends up well, but on the way it falls more than half from its peak. Few people keep following their rules through that.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          style: "line",
          decimals: 0,
          annotations: [
            { kind: "marker", index: peakIdx, at: "high", text: "Peak", tone: "up" },
            { kind: "marker", index: troughIdx, at: "low", text: `−${Math.round(best * 100)}%`, tone: "down" },
          ],
          caption: "Illustrative: 10% risk per trade",
        },
      },
    },
    {
      kind: "learn",
      title: "Losses need bigger gains",
      body: [
        "To recover a loss, you need a bigger percentage gain than the loss, because you are growing a smaller balance.",
        "Lose 10%: need +11%. Lose 20%: need +25%. Lose 30%: need +43%. Lose 50%: need +100%. Lose 75%: need +300%.",
        "Formula: **gain needed = loss ÷ (1 − loss)**.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "Gain needed to recover a loss",
          max: 300,
          bars: [
            { label: "Lose 10%", value: 11, display: "+11%", tone: "up" },
            { label: "Lose 20%", value: 25, display: "+25%", tone: "up" },
            { label: "Lose 30%", value: 43, display: "+43%", tone: "warn" },
            { label: "Lose 50%", value: 100, display: "+100%", tone: "warn" },
            { label: "Lose 75%", value: 300, display: "+300%", tone: "down" },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "recover-20",
      prompt: "Your account is down 20%. What gain do you need to get back to where you started?",
      answer: 25,
      tolerance: 0.01,
      suffix: "%",
      explain: "0.20 ÷ 0.80 = 0.25, a 25% gain. $10,000 down 20% is $8,000, and $8,000 needs $2,000 more: 25%.",
    },
    {
      kind: "numeric",
      id: "recover-40",
      prompt: "Your account is down 40%. What gain do you need to recover? (whole percent is fine)",
      answer: 66.67,
      tolerance: 0.5,
      suffix: "%",
      explain: "0.40 ÷ 0.60 ≈ 0.667, a 67% gain. Deep drawdowns become very hard to climb out of.",
    },
    {
      kind: "truefalse",
      id: "symmetric",
      statement: "After a 50% loss, a 50% gain gets you back to where you started.",
      answer: false,
      explain: "$10,000 − 50% = $5,000. +50% of $5,000 is only $7,500. You need +100%.",
    },
    {
      kind: "choice",
      id: "dd-rules",
      prompt: "What is a sensible response to a growing drawdown?",
      options: [
        "Cut your risk per trade until you are back near your peak",
        "Double your size to win it back faster",
        "Remove your stops",
        "Switch to a new strategy every day",
      ],
      answer: 0,
      explain: "Smaller risk slows the bleeding and protects your decision-making. Many professionals halve their size after a set drawdown.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Drawdown: the fall from a peak to a later low.",
        "Gain needed = loss ÷ (1 − loss).",
        "20% needs 25%, 50% needs 100%.",
        "Cut risk during drawdowns; never increase it.",
      ],
    },
  ],
}
