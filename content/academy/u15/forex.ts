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
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Three kinds of pair",
          columns: [
            { title: "Majors", icon: "coins", tone: "up", points: ["The US dollar and another big currency", "EUR/USD, USD/JPY, GBP/USD"] },
            { title: "Crosses", icon: "repeat", tone: "accent", points: ["Leave the dollar out", "EUR/GBP, GBP/JPY"] },
            { title: "Exotics", icon: "globe", tone: "warn", points: ["A major and an emerging-market currency", "Much wider spreads"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "What drives it",
      body: [
        "Interest rate differences between the two countries, central bank decisions and guidance, inflation and jobs data, and risk appetite. The yen and Swiss franc often strengthen when markets are scared.",
        "Day to day, the US dollar side of each major moves on US data at 8:30 am New York time.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "What drives a pair",
              icon: "scale",
              tone: "accent",
              points: ["Interest rate differences", "Central bank decisions and guidance", "Inflation and jobs data", "Risk appetite"],
            },
            { title: "When markets are scared", icon: "shield", tone: "warn", points: ["The yen often strengthens", "So does the Swiss franc"] },
          ],
        },
      },
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
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Leverage", icon: "alert", tone: "down", points: ["Offshore brokers offer extreme leverage", "Size from your stop regardless"] },
            { title: "Swap", icon: "moon", tone: "warn", points: ["Holding past 5 pm New York time", "Costs or earns interest"] },
            { title: "Broker", icon: "bank", tone: "accent", points: ["Spot forex is OTC", "Check that it is regulated"] },
          ],
        },
      },
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
