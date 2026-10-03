import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u14-rates-and-central-banks",
  sources: ["Federal Reserve Board: monetary policy and the FOMC", "Federal Reserve Board: FOMC calendar and Summary of Economic Projections"],
  steps: [
    {
      kind: "learn",
      title: "The most important price in the world",
      body: [
        "Central banks set short-term **interest rates**: the price of money. In the US, the Federal Reserve's **Federal Open Market Committee (FOMC)** meets eight times a year to decide.",
        "Rates affect everything: what companies pay to borrow, what savings earn, what a currency is worth, and how much investors will pay for future profits.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Interest rates: the price of money",
          columns: [
            { title: "Who decides", icon: "bank", tone: "accent", points: ["Central banks", "In the US, the FOMC", "It meets eight times a year"] },
            {
              title: "What it reaches",
              icon: "globe",
              tone: "up",
              points: ["What companies pay to borrow", "What savings earn", "What a currency is worth", "What investors pay for future profits"],
            },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "How markets tend to react",
      body: [
        "**Higher rates** (or the expectation of them) usually strengthen the currency, because it earns more interest, and weigh on stocks and gold. **Lower rates** usually do the opposite.",
        "As always, it is the **surprise** that matters. A hike everyone expected may barely move the market; a hint about future cuts in the press conference may move it a lot.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "The usual reaction",
          corner: "",
          cols: ["Currency", "Stocks", "Gold"],
          rows: [
            { label: "Higher rates", cells: ["Stronger", "Weighed on", "Weighed on"], tones: ["up", "down", "down"] },
            { label: "Lower rates", cells: ["Weaker", "Supported", "Supported"], tones: ["down", "up", "up"] },
          ],
        },
        caption: "Tendencies, not rules. It is the surprise that matters.",
      },
    },
    {
      kind: "choice",
      id: "hike-usd",
      prompt: "The Fed unexpectedly raises rates. How does the US dollar usually react?",
      options: ["It strengthens", "It weakens", "It doesn't change", "It stops trading"],
      answer: 0,
      explain: "Higher rates make dollar deposits and bonds more attractive, so demand for dollars rises.",
    },
    {
      kind: "learn",
      title: "Reading the Fed",
      body: [
        "The decision comes at 2:00 pm New York time, followed by the chair's press conference at 2:30 pm. Four times a year, the Fed also publishes projections, including the famous **dot plot** of where officials expect rates to go.",
        "The first move at 2:00 pm is often reversed during the press conference. Many traders stay out until the dust settles.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "A common FOMC afternoon",
          points: [100, 100.1, 99.9, 100, 101.5, 102, 101.6, 101.8, 100.6, 99.4, 98.8],
          marks: [
            { at: 3, label: "2:00 pm decision", side: "below" },
            { at: 5, label: "First move", tone: "warn" },
            { at: 6, label: "2:30 pm", side: "below" },
            { at: 10, label: "Often reversed", tone: "down", side: "below" },
          ],
        },
        caption: "The press conference starts at 2:30 pm.",
      },
    },
    {
      kind: "truefalse",
      id: "fed-meetings",
      statement: "The FOMC meets to set interest rates every week.",
      answer: false,
      explain: "It holds eight scheduled meetings a year, roughly every six weeks, plus emergency meetings in a crisis.",
    },
    {
      kind: "match",
      id: "banks",
      prompt: "Match each central bank to its currency.",
      pairs: [
        ["Federal Reserve", "US dollar"],
        ["European Central Bank", "Euro"],
        ["Bank of England", "British pound"],
        ["Bank of Japan", "Japanese yen"],
      ],
      explain: "Forex pairs move a lot on the decisions of the two central banks behind them.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Central banks set interest rates; the Fed decides eight times a year.",
        "Higher rates tend to lift the currency and weigh on stocks and gold.",
        "The surprise and the guidance matter more than the decision.",
        "FOMC: 2:00 pm decision, 2:30 pm press conference.",
      ],
    },
  ],
}
