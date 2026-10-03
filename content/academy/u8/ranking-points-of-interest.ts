import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u8-ranking-points-of-interest",
  sources: ["ICT and Smart Money Concepts terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Too many zones",
      body: [
        "Once you know FVGs, order blocks, breakers and rejection blocks, you will see dozens on every chart. Every zone you might trade from is called a **point of interest (POI)**. Most of them don't matter.",
        "Professionals don't trade every zone. They rank them and only act at the best.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "From dozens of zones to a few",
          nodes: [
            { label: "Dozens of zones", sub: "on every chart", icon: "layers", tone: "warn" },
            { label: "Rank them", icon: "filter", tone: "accent" },
            { label: "Act only at the best", icon: "target", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "The ranking checklist",
      body: [
        "**Higher timeframe**: a 4-hour FVG beats a 1-minute one. **With the bias**: bullish zones in a higher-timeframe uptrend. **Liquidity taken first**: a sweep before the zone formed, or inducement taken before price reaches it. **Displacement**: the move away was strong and broke structure. **Fresh**: not touched since it formed. **Right side of the range**: bullish zones in discount, bearish zones in premium (Unit 9).",
        "The more boxes a zone ticks, the more seriously you take it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "A strong point of interest",
          items: [
            { text: "Higher timeframe", mark: "ok" },
            { text: "With the higher-timeframe bias", mark: "ok" },
            { text: "Liquidity taken first", mark: "ok" },
            { text: "Displacement away from it", mark: "ok" },
            { text: "Fresh: not touched since it formed", mark: "ok" },
            { text: "On the right side of the range", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "match",
      id: "poi-factors",
      prompt: "Match each factor to why it matters.",
      pairs: [
        ["Higher timeframe", "More money and more traders behind the level"],
        ["Liquidity swept first", "Stops were taken before the real move"],
        ["Fresh, untouched zone", "Its waiting orders haven't been used up"],
        ["With the bias", "You trade in the direction of the bigger trend"],
      ],
      explain: "Each factor adds a reason for the zone to hold. Together they separate the best zones from the noise.",
    },
    {
      kind: "choice",
      id: "best-poi",
      prompt: "The daily trend is up. Which bullish zone deserves the most attention?",
      options: [
        "A fresh 1-hour FVG in discount, left by displacement that followed a sell-side sweep",
        "A 1-minute order block in premium that has been tested four times",
        "A random gap on a 30-second chart",
        "A bearish order block in a downtrend on another market",
      ],
      answer: 0,
      explain: "It ticks almost every box: higher timeframe, with the bias, in discount, fresh, after a sweep, with displacement.",
    },
    {
      kind: "truefalse",
      id: "more-zones",
      statement: "Marking more zones on your chart makes you a better SMC trader.",
      answer: false,
      explain: "More zones means more noise. Ranking them and only trading the best few is what makes the framework useful.",
    },
    {
      kind: "choice",
      id: "mitigated",
      prompt: "A bullish order block has already been revisited three times. How should you rank it?",
      options: [
        "Lower: it is mitigated, and its waiting orders have probably been used up",
        "Higher: it is clearly very strong",
        "The same as a fresh one",
        "It becomes a bearish order block automatically",
      ],
      answer: 0,
      explain: "Each visit uses up some of the orders resting there. Fresh zones are preferred.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A point of interest (POI) is any zone you might trade from.",
        "Rank by timeframe, bias, liquidity taken, displacement, freshness and location.",
        "Trade only the best few zones, not every one you can draw.",
      ],
    },
  ],
}
