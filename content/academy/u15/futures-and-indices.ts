import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-futures-and-indices",
  sources: [
    "CME Group: equity index futures contract specifications and expiration calendar",
    "CFTC Learn & Protect: futures market basics",
  ],
  steps: [
    {
      kind: "learn",
      title: "The futures playbook",
      body: [
        "**What you trade**: standardised contracts on a central exchange. The most popular with day traders are the equity index futures: **ES** (S&P 500, $50 a point), **NQ** (Nasdaq-100, $20 a point) and their micros, **MES** and **MNQ**, at a tenth of the size.",
        "**When**: nearly 24 hours, Sunday evening to Friday afternoon, with a daily break from 5 to 6 pm New York time. The busiest hours match the US stock session.",
      ],
    },
    {
      kind: "learn",
      title: "Expiry and rollover",
      body: [
        "Index futures expire **quarterly**: March, June, September and December. About a week before expiry, volume moves to the next contract, and traders **roll** their positions forward.",
        "Charting platforms offer continuous charts that join the contracts together; just make sure you trade the active one.",
      ],
    },
    {
      kind: "match",
      id: "contracts",
      prompt: "Match each contract to its value per point.",
      pairs: [
        ["ES", "$50 per point"],
        ["NQ", "$20 per point"],
        ["MNQ", "$2 per point"],
        ["MES", "$5 per point"],
      ],
      explain: "Micros are a tenth of the full-size contracts, which makes proper position sizing possible on smaller accounts.",
    },
    {
      kind: "learn",
      title: "Why traders like them, and the catches",
      body: [
        "Central exchange, transparent prices and real volume, nearly round-the-clock trading, and margin requirements that let small accounts trade micros. US futures accounts are also not subject to the stock market's pattern day trader rule.",
        "Catches: leverage is high, so size from your stop. Many traders try **prop firm evaluations** (pay a fee, pass a test, trade a funded account); read the rules carefully, since most participants don't pass.",
      ],
    },
    {
      kind: "choice",
      id: "expiry",
      prompt: "In which months do the main US equity index futures expire?",
      options: ["March, June, September and December", "Every month", "Only December", "They never expire"],
      answer: 0,
      explain: "Quarterly expiry, with the roll to the next contract about a week before.",
    },
    {
      kind: "truefalse",
      id: "micros",
      statement: "Micro contracts let traders with smaller accounts size positions more precisely.",
      answer: true,
      explain: "At a tenth of the size, micros let you match your stop and risk without being forced into a position that is too big.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "ES $50, NQ $20, MES $5, MNQ $2 per point.",
        "Nearly 24 hours, with a daily 5 to 6 pm New York break.",
        "Quarterly expiry: roll about a week before.",
        "High leverage: always size from your stop.",
      ],
    },
  ],
}
