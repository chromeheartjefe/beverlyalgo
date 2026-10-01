import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u2-market-orders-and-slippage",
  sources: ["Investor.gov (U.S. SEC): market orders and types of orders"],
  steps: [
    {
      kind: "learn",
      title: "Market orders: fill me now",
      body: [
        "A **market order** says: fill this immediately, at the best price available.",
        "It guarantees the fill, but not the price. If there isn't enough size at the best price, the order keeps filling at the next levels until it is done.",
      ],
      visual: { type: "figure", id: "market-sweep" },
    },
    {
      kind: "learn",
      title: "Slippage",
      body: [
        "**Slippage** is the difference between the price you expected and the price you actually got.",
        "In a deep, calm market a small market order slips little or not at all. A big order, a thin market or a fast move can slip a lot. Slippage can occasionally work in your favour, but over many trades it is a cost.",
      ],
    },
    {
      kind: "numeric",
      id: "avg-fill",
      prompt: "You buy 300 at market. The book has 100 at 100.05 and 400 at 100.10. What is your average fill price? (two decimals is fine)",
      answer: 100.0833,
      tolerance: 0.006,
      explain: "100 × 100.05 = 10,005 and 200 × 100.10 = 20,020. Total 30,025 ÷ 300 = about 100.08.",
    },
    {
      kind: "truefalse",
      id: "market-guarantees-price",
      statement: "A market order guarantees you the price you see on the screen.",
      answer: false,
      explain: "It guarantees a fill, not a price. The screen shows the last trade or best quote, which can be gone by the time your order arrives.",
    },
    {
      kind: "learn",
      title: "When slippage gets ugly",
      body: [
        "Expect the most slippage:",
        "Right as **big news** hits (rate decisions, jobs reports, earnings). At the **open** of a session. In **thin markets** and quiet hours. When **many stops** trigger at once and everyone rushes for the same exit.",
      ],
    },
    {
      kind: "choice",
      id: "worst-slippage",
      prompt: "When is slippage on a market order usually worst?",
      options: [
        "The second a major news release comes out",
        "A calm, busy afternoon in a liquid market",
        "When you trade a very small size",
        "When the spread is at its tightest",
      ],
      answer: 0,
      explain: "During news, liquidity disappears and prices jump, so market orders fill far from the last price.",
    },
    {
      kind: "learn",
      title: "When a market order is the right tool",
      body: [
        "Market orders are right when getting in or out **now** matters more than the exact price. The classic case: getting out of a trade that is going against you.",
        "For small size in a liquid market, slippage is usually tiny. For big size, thin markets or news, consider a limit order instead. That is the next lesson.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A market order fills immediately at the best available prices.",
        "It guarantees the fill, not the price.",
        "Slippage is the gap between the expected and the actual price.",
        "News, opens, thin markets and big size make slippage worse.",
      ],
    },
  ],
}
