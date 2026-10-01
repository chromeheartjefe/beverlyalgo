import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Three bounces from the 100 area (lows at 5, 14, 23), then a rally
const candles = swingCandles([[0, 103], [5, 100.2], [9, 102.6], [14, 100.1], [18, 102.9], [23, 100.25], [28, 103.4]], {
  noise: 0.15,
  wick: 0.25,
  seed: 61,
})

export const lesson: LessonContent = {
  id: "u5-support-and-resistance",
  sources: ["Wyckoff, Studies in Tape Reading (1910), public domain"],
  steps: [
    {
      kind: "learn",
      title: "Where price keeps turning",
      body: [
        "**Support** is a price area where falling prices have stopped before, because buyers stepped in. **Resistance** is an area where rising prices have stopped, because sellers did.",
        "They work because traders remember. People who missed the last bounce wait to buy there again; people who bought at the top wait to sell when price gets back to their entry.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [{ kind: "zone", from: 3, top: 100.4, bottom: 99.75, label: "Support", tone: "up" }],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "learn",
      title: "Zones, not lines",
      body: [
        "Price rarely turns at exactly the same cent. Treat support and resistance as **zones** a little wide, drawn around the area where candles keep turning, not as razor-thin lines.",
        "Higher-timeframe levels and levels with sharp, fast reactions tend to matter most.",
      ],
    },
    {
      kind: "tap",
      id: "third-touch",
      prompt: "Tap the third time price bounced from support.",
      chart: { candles, decimals: 2 },
      targets: [23],
      explain: "Three dips stopped in the same area. The third bounce launched the rally on the right.",
    },
    {
      kind: "learn",
      title: "More touches: stronger or weaker?",
      body: [
        "A level that has held several times is clearly watched. But every test also uses up some of the buy orders waiting there.",
        "So a level hit again and again, with weaker and weaker bounces, often breaks in the end. Smart Money traders add one more reason: the more obvious a level is, the more stop orders sit just beyond it, which makes it a target.",
      ],
    },
    {
      kind: "truefalse",
      id: "more-touches",
      statement: "A support level that has been tested many times can never break.",
      answer: false,
      explain: "Every test absorbs buy orders, and obvious levels collect stops beyond them. Repeated tests often come before a break.",
    },
    {
      kind: "choice",
      id: "why-sr-works",
      prompt: "Why does support often hold?",
      options: [
        "Buyers who missed earlier bounces wait to buy at the same area",
        "Exchanges stop prices from falling below old lows",
        "Brokers block sell orders at support",
        "Prices always go back up eventually",
      ],
      answer: 0,
      explain: "Support is collective memory: many buyers have orders or plans at a price where buying worked before.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Support: an area where falling prices stopped before. Resistance: where rises stopped.",
        "They work because traders remember and place orders there.",
        "Draw zones, not thin lines.",
        "Repeated tests weaken a level, and obvious levels attract stop hunts.",
      ],
    },
  ],
}
