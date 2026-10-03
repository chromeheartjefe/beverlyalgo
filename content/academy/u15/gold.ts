import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-gold",
  sources: ["CME Group: Gold (GC) and Micro Gold (MGC) futures contract specifications", "CFTC Learn & Protect: precious metals fraud advisories"],
  steps: [
    {
      kind: "learn",
      title: "The gold playbook",
      body: [
        "**What you trade**: spot gold as **XAU/USD** through forex and CFD brokers, or futures: **GC** (100 troy ounces, $10 per 0.10 move) and **MGC** (micro gold, 10 ounces).",
        "**When**: almost around the clock on weekdays, most active in the London and New York sessions.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Three ways to trade gold",
          columns: [
            { title: "XAU/USD", icon: "gold", tone: "warn", points: ["Spot gold", "Through forex and CFD brokers"] },
            { title: "GC", icon: "layers", tone: "accent", points: ["Futures", "100 troy ounces", "$10 per 0.10 move"] },
            { title: "MGC", icon: "layers", tone: "up", points: ["Micro gold futures", "10 ounces"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "What drives gold",
      body: [
        "**Real interest rates**: gold pays no interest, so it tends to suffer when rates after inflation rise, and shine when they fall. **The US dollar**: gold is priced in dollars and often moves opposite to it. **Fear**: a classic safe haven in crises. **Central bank buying**: a major source of demand in recent years.",
        "So CPI, jobs data and FOMC days are some of gold's biggest days.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Gold tends to shine",
              icon: "trending-up",
              tone: "up",
              points: ["Rates after inflation fall", "The dollar weakens", "Fear: a safe haven in crises", "Central banks are buying"],
            },
            { title: "Gold tends to suffer", icon: "trending-down", tone: "down", points: ["Rates after inflation rise", "The dollar strengthens"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "gold-rates",
      prompt: "Inflation comes in cooler than expected and markets price in rate cuts. How does gold usually react?",
      options: ["It tends to rise", "It tends to fall", "It can't move on economic data", "It always stays flat"],
      answer: 0,
      explain: "Expected lower rates and a weaker dollar both tend to support gold.",
    },
    {
      kind: "match",
      id: "gold-instruments",
      prompt: "Match each instrument to its description.",
      pairs: [
        ["XAU/USD", "Spot gold quoted against the dollar"],
        ["GC", "Gold futures, 100 ounces"],
        ["MGC", "Micro gold futures, 10 ounces"],
      ],
      explain: "Same underlying metal, different sizes and venues.",
    },
    {
      kind: "truefalse",
      id: "gold-quiet",
      statement: "Gold is a calm market that barely moves on news days.",
      answer: false,
      explain: "Gold can move sharply on CPI, jobs and FOMC releases. Treat it with the same news caution as indices.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "XAU/USD spot, GC and MGC futures.",
        "Driven by real rates, the dollar, fear and central bank demand.",
        "Most active in London and New York.",
        "US data and Fed days move it a lot.",
      ],
    },
  ],
}
