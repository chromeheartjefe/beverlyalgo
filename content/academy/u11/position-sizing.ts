import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u11-position-sizing",
  sources: ["CME Group: Micro E-mini Nasdaq-100 contract specifications", "CFTC Learn & Protect: foreign currency trading"],
  steps: [
    {
      kind: "learn",
      title: "The stop sets the size",
      body: [
        "Beginners pick a size first, then squeeze the stop to fit. Professionals do the opposite: they put the stop where the trade idea is wrong, then work out the size that makes that stop cost exactly their planned risk.",
        "**Position size = money at risk ÷ (stop distance × value of one unit of movement)**.",
      ],
    },
    {
      kind: "numeric",
      id: "stock-size",
      prompt: "Account $20,000, risk 1% ($200). You buy a stock at $50 with a stop at $48. How many shares?",
      answer: 100,
      tolerance: 0,
      suffix: "shares",
      explain: "Stop distance is $2 per share. $200 ÷ $2 = 100 shares.",
    },
    {
      kind: "numeric",
      id: "futures-size",
      prompt: "Account $25,000, risk 0.5% ($125). Your MNQ stop is 25 points away, and MNQ is $2 per point. How many contracts, rounded down?",
      answer: 2,
      tolerance: 0,
      suffix: "contracts",
      explain: "One contract risks 25 × $2 = $50. $125 ÷ $50 = 2.5, rounded down to 2. Always round down, never up.",
    },
    {
      kind: "numeric",
      id: "forex-size",
      prompt: "Account $10,000, risk 1% ($100). Your EUR/USD stop is 25 pips away. A standard lot is about $10 per pip. How many lots?",
      answer: 0.4,
      tolerance: 0.001,
      suffix: "lots",
      explain: "One standard lot risks 25 × $10 = $250. $100 ÷ $250 = 0.4 lots, which is 4 mini lots.",
    },
    {
      kind: "learn",
      title: "Wide stops, small size",
      body: [
        "A wider stop isn't more risky if you size down to match. A trade with a 50-point stop at 1 contract risks the same as a 25-point stop at 2 contracts.",
        "That is why the stop should go where the market says, at structure or beyond the sweep, never where your account size says.",
      ],
      callout: {
        tone: "tip",
        text: "The Risk Calculator in your dashboard does this maths for you. Enter your account, risk and stop, and it gives you the size.",
      },
    },
    {
      kind: "choice",
      id: "stop-too-tight",
      prompt: "Your size is fixed at 3 contracts, so you put your stop only 8 points away to keep the risk small. What is the problem?",
      options: [
        "The stop is set by your size, not by the market, so normal noise will hit it",
        "Nothing, tight stops are always better",
        "3 contracts is illegal",
        "The stop should be at a round number",
      ],
      answer: 0,
      explain: "Put the stop where the idea is wrong, then reduce the size. Squeezing the stop just guarantees getting stopped out.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Place the stop first, then calculate the size.",
        "Size = money at risk ÷ (stop distance × value per unit).",
        "Wider stop, smaller size: the money at risk stays the same.",
        "Round down, never up.",
      ],
    },
  ],
}
