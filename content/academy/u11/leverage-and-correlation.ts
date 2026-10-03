import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u11-leverage-and-correlation",
  sources: ["CFTC Learn & Protect: understanding leverage", "ESMA, product intervention measures on CFDs (2018): retail leverage limits"],
  steps: [
    {
      kind: "learn",
      title: "Leverage is not your risk",
      body: [
        "In Unit 2 you saw how leverage magnifies gains and losses. Here is the twist: if you size every trade from your stop, **your risk is set by the stop and the size**, not by the leverage your broker offers.",
        "A 1% stop-based position at a broker offering 50:1 leverage is safer than a position with no stop at 10:1. Leverage only becomes deadly when it tempts you into oversized positions.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Which one is safer?",
          columns: [
            {
              title: "50:1 leverage",
              icon: "shield",
              tone: "up",
              points: ["A stop is in place", "Position sized for 1% risk", "The safer of the two"],
            },
            { title: "10:1 leverage", icon: "alert", tone: "down", points: ["No stop", "Nothing limits the loss"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "leverage-safe",
      prompt: "Which trader is taking less risk?",
      options: [
        "High leverage available, but 1% risk set by a stop and position size",
        "Low leverage, but no stop and a position worth five times the account",
        "They are the same",
        "Whoever has the bigger account",
      ],
      answer: 0,
      explain: "The amount you can lose decides the risk. The first trader's loss is capped at 1%; the second's has no limit.",
    },
    {
      kind: "learn",
      title: "Correlation: one bet in disguise",
      body: [
        "NQ and ES usually move together. So do EUR/USD and GBP/USD, and gold and silver. Being long two markets that move together is roughly **one bigger bet**, not two separate ones.",
        "If both stop out together, which they often do, you lose 2% instead of 1%.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Two trades, one bet",
          nodes: [
            { label: "Long NQ", sub: "1% risk", icon: "trending-up" },
            { label: "Long ES", sub: "1% risk", icon: "trending-up" },
            { label: "They move together", icon: "repeat", tone: "warn" },
            { label: "Really one bet", sub: "2% if both stop out", icon: "alert", tone: "down" },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "combined-risk",
      prompt: "You go long NQ risking 1% and long ES risking 1% at the same time. They usually move together. Roughly how much of your account is really at risk?",
      answer: 2,
      tolerance: 0,
      suffix: "%",
      explain: "Highly correlated positions tend to win and lose together, so treat them as one 2% position.",
    },
    {
      kind: "learn",
      title: "A total risk cap",
      body: [
        "Set a cap on the **total open risk** across all your trades at once, for example 2% to 3%. Correlated trades count fully towards it.",
        "When you want to take a second trade in a related market, either skip it or split your usual risk between the two.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "bars",
          title: "Open risk against an example cap of 3%",
          max: 3,
          bars: [
            { label: "Trade 1", value: 1, display: "1%", tone: "accent" },
            { label: "Trade 2, a related market", value: 1, display: "1%", tone: "accent" },
            { label: "Total open risk", value: 2, display: "2% of the 3% cap", tone: "warn" },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "fx-hedge",
      statement: "Being long EUR/USD and short USD/CHF at the same time spreads your risk over two different bets.",
      answer: false,
      explain: "Both positions profit if the dollar weakens, and both lose if it strengthens. It is mostly one bet against the dollar.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "With stop-based sizing, your risk comes from stop and size, not leverage.",
        "Leverage is dangerous when it tempts oversized positions.",
        "Correlated positions are one bigger bet.",
        "Cap your total open risk across all trades.",
      ],
    },
  ],
}
