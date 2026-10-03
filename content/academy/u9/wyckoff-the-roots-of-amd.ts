import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Accumulation range: selling climax at 5, automatic rally at 9, secondary
// test at 13, spring below the range at 24, sign of strength at 31, last
// point of support at 34, then markup.
const candles = swingCandles(
  [[0, 106], [5, 100.5], [9, 103.6], [13, 101], [17, 103.3], [21, 100.9], [24, 99.6], [27, 102], [31, 104.2], [34, 103.4], [38, 106]],
  { noise: 0.12, wick: 0.2, seed: 94 },
)
const SPRING = 24

export const lesson: LessonContent = {
  id: "u9-wyckoff-the-roots-of-amd",
  sources: [
    "Wyckoff, Studies in Tape Reading (1910), public domain",
    "Richard D. Wyckoff's course material on accumulation and distribution (early 1930s), as summarised here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "A century-old idea",
      body: [
        "**Richard Wyckoff** (1873 to 1934) traded and taught in the early 1900s. He described markets as if one large operator, the **Composite Man**, were accumulating positions quietly, shaking out weak hands, then marking price up.",
        "Swap \"Composite Man\" for \"smart money\" and you have the core of SMC. ICT's Power of 3 is the same story told on a single candle.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Wyckoff's Composite Man",
          nodes: [
            { label: "Accumulates quietly", icon: "layers" },
            { label: "Shakes out weak hands", icon: "zap", tone: "warn" },
            { label: "Marks price up", icon: "trending-up", tone: "up" },
          ],
        },
        caption: "Richard Wyckoff, 1873 to 1934. Swap Composite Man for smart money and you have the core of SMC.",
      },
    },
    {
      kind: "learn",
      title: "The accumulation schematic",
      body: [
        "After a decline, a **selling climax (SC)** marks panic lows. An **automatic rally (AR)** sets the top of a range. A **secondary test (ST)** revisits the lows. Then the key event: the **spring**, a drop below the range low that runs the stops and fails.",
        "A **sign of strength (SOS)** breaks above the range, a **last point of support (LPS)** retests it, and **markup** begins.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [
            { kind: "marker", index: 5, at: "low", text: "SC", tone: "neutral" },
            { kind: "marker", index: 9, at: "high", text: "AR", tone: "neutral" },
            { kind: "marker", index: 13, at: "low", text: "ST", tone: "neutral" },
            { kind: "marker", index: SPRING, at: "low", text: "Spring", tone: "warn" },
            { kind: "marker", index: 31, at: "high", text: "SOS", tone: "up" },
            { kind: "marker", index: 34, at: "low", text: "LPS", tone: "up" },
          ],
          caption: "Illustrative Wyckoff accumulation",
        },
      },
    },
    {
      kind: "tap",
      id: "find-spring",
      prompt: "Tap the spring.",
      chart: { candles, decimals: 2 },
      targets: [SPRING],
      explain: "It broke below the whole range, ran the stops under the lows, and failed straight back inside. Markup followed.",
    },
    {
      kind: "match",
      id: "wyckoff-smc",
      prompt: "Match each Wyckoff event to its SMC or ICT equivalent.",
      pairs: [
        ["Spring", "A sweep of sell-side liquidity"],
        ["Sign of strength", "Displacement that breaks structure"],
        ["Last point of support", "The retrace entry after the shift"],
        ["Composite Man", "Smart money"],
      ],
      explain: "Different words, same sequence: take the stops, show strength, retrace, then trend.",
    },
    {
      kind: "learn",
      title: "Watch the word distribution",
      body: [
        "One naming trap: in **Wyckoff**, distribution is a topping range where large players sell before a markdown. In ICT's **AMD**, distribution means the expansion phase, the real move of the day, which can be up or down.",
        "Same word, different meaning. Always check which framework you are reading.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Same word, different meaning",
          columns: [
            { title: "In Wyckoff", icon: "book", tone: "warn", points: ["A topping range", "Large players sell before a markdown"] },
            {
              title: "In ICT's AMD",
              icon: "zap",
              tone: "accent",
              points: ["The expansion phase", "The real move of the day", "It can be up or down"],
            },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "distribution-same",
      statement: "Distribution means exactly the same thing in Wyckoff and in ICT's AMD.",
      answer: false,
      explain: "In Wyckoff it is a topping range before a decline. In AMD it is the real move of the session, in either direction.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Wyckoff described accumulation by a large operator a century ago.",
        "The spring is a sweep of the range low that fails: the SSL sweep of SMC.",
        "Sign of strength and last point of support match displacement and the retrace entry.",
        "Distribution means different things in Wyckoff and in AMD.",
      ],
    },
  ],
}
