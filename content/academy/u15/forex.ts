import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-forex",
  sources: [
    "CFTC Learn & Protect: foreign currency trading and forex fraud",
    "Bank for International Settlements, Triennial Central Bank Survey",
  ],
  steps: [
    {
      kind: "learn",
      title: "The forex playbook",
      body: [
        "**What you trade**: currency pairs. **Majors** pair the US dollar with another big currency (EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD). **Crosses** leave the dollar out (EUR/GBP, GBP/JPY). **Exotics** pair a major with an emerging-market currency, with much wider spreads.",
        "**When**: 24 hours on weekdays; busiest in the London and New York sessions and their overlap.",
      ],
    },
    {
      kind: "learn",
      title: "What drives it",
      body: [
        "Interest rate differences between the two countries, central bank decisions and guidance, inflation and jobs data, and risk appetite. The yen and Swiss franc often strengthen when markets are scared.",
        "Day to day, the US dollar side of each major moves on US data at 8:30 am New York time.",
      ],
    },
    {
      kind: "match",
      id: "pair-types",
      prompt: "Match each pair to its type.",
      pairs: [
        ["EUR/USD", "Major"],
        ["GBP/JPY", "Cross"],
        ["USD/TRY", "Exotic"],
      ],
      explain: "Majors include the dollar and another big currency; crosses skip the dollar; exotics include an emerging-market currency.",
    },
    {
      kind: "learn",
      title: "Watch-outs",
      body: [
        "**Leverage**: offshore brokers offer extreme leverage; use stop-based sizing regardless. **Swap**: holding past 5 pm New York time costs or earns interest. **Broker choice**: spot forex is OTC, so the broker matters a lot. In the US, check that it is registered with the CFTC and NFA; elsewhere, with your local regulator.",
      ],
    },
    {
      kind: "choice",
      id: "fx-spread",
      prompt: "Which pair will usually have the widest spread?",
      options: ["An exotic pair like USD/TRY", "EUR/USD", "USD/JPY", "GBP/USD"],
      answer: 0,
      explain: "Exotics trade far less, so liquidity is thin and spreads are wide.",
    },
    {
      kind: "truefalse",
      id: "fx-weekend",
      statement: "Spot forex trades through the weekend.",
      answer: false,
      explain: "It runs from Sunday evening to Friday evening, New York time, and pauses over the weekend.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Majors, crosses and exotics, from tightest to widest spreads.",
        "Busiest in London, New York and their overlap.",
        "Driven by rates, central banks, data and risk appetite.",
        "Mind swap costs, leverage and broker regulation.",
      ],
    },
  ],
}
