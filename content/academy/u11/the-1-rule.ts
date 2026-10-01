import { equityCandles, equityPath } from "@/content/academy/l4/equity"
import type { LessonContent } from "@/lib/academy/types"

const small = equityCandles(equityPath(10000, 0.01))
const big = equityCandles(equityPath(10000, 0.25))

export const lesson: LessonContent = {
  id: "u11-the-1-rule",
  sources: ["CFTC Learn & Protect: understanding leverage and risk"],
  steps: [
    {
      kind: "learn",
      title: "Risk a small slice",
      body: [
        "The most common rule in professional trading: risk only a small, fixed percentage of your account on each trade, usually **0.5% to 2%**, with **1%** as the classic default.",
        "On a $10,000 account, 1% is $100. Your stop and position size are set so that if the stop is hit, you lose about $100. Never more.",
      ],
    },
    {
      kind: "numeric",
      id: "one-percent",
      prompt: "Your account is $25,000 and you risk 1% per trade. What is the most you should lose on one trade?",
      answer: 250,
      tolerance: 0,
      prefix: "$",
      explain: "1% of $25,000 = $250.",
    },
    {
      kind: "learn",
      title: "Same trades, different risk",
      body: [
        "These two charts replay **exactly the same 50 trades**: 20 winners of 2R and 30 losers of 1R, including an 8-loss streak near the start. That is a genuinely profitable strategy.",
        "At 1% risk per trade, the account grows steadily and the worst drawdown is under 8%. At 25% risk, the same winning strategy falls 90% at its worst and **ends with a loss**.",
      ],
      visual: {
        type: "charts",
        charts: [
          { candles: small, style: "line", decimals: 0, caption: "1% risk per trade: ends up about 10%" },
          { candles: big, style: "line", decimals: 0, caption: "25% risk per trade: same trades, ends down about 41%" },
        ],
      },
    },
    {
      kind: "truefalse",
      id: "edge-saves",
      statement: "If your strategy has a positive edge, risking more per trade always makes more money in the end.",
      answer: false,
      explain: "Big losses compound brutally. Past a point, more risk turns a winning strategy into a losing account, as the 25% chart shows.",
    },
    {
      kind: "numeric",
      id: "ten-losses",
      prompt: "You risk 1% of your current balance per trade and lose 10 trades in a row, starting from $10,000. Roughly how much is left? (nearest dollar)",
      answer: 9044,
      tolerance: 2,
      prefix: "$",
      explain: "$10,000 × 0.99^10 ≈ $9,044. Ten losses in a row cost under 10%. At 10% risk per trade, the same streak would leave about $3,487.",
    },
    {
      kind: "choice",
      id: "why-small",
      prompt: "What is the main reason to risk only about 1% per trade?",
      options: [
        "So a normal losing streak can't do serious damage",
        "Because brokers don't allow more",
        "So that every trade wins",
        "To avoid paying commissions",
      ],
      answer: 0,
      explain: "Losing streaks are guaranteed. Small risk keeps them survivable and keeps you thinking clearly.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Risk a small, fixed percentage per trade: 0.5% to 2%, often 1%.",
        "Ten 1% losses in a row cost under 10%.",
        "Too much risk can turn a winning strategy into a losing account.",
      ],
    },
  ],
}
