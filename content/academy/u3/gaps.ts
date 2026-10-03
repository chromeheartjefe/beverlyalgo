import { candlesFromCloses } from "@/lib/academy/candles"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// Daily stock chart: a gap up on candle 8 and a gap down on candle 17. The
// three segments are built separately so the gaps are clean.
const GAP_UP = 8
const before = candlesFromCloses([100.2, 100.6, 100.3, 100.9, 100.7, 101.1, 100.8, 101.2], { start: 100, wick: 0.3, seed: 3 })
const after = candlesFromCloses([104.5, 104.9, 104.6, 105.2, 105.0, 105.6, 105.3, 104.9, 104.6], { start: 104.1, wick: 0.3, seed: 4 })
const fall = candlesFromCloses([101.3, 100.9, 101.2, 100.6, 100.8, 100.3], { start: 101.7, wick: 0.3, seed: 5 })

const chart: ChartSpec = { candles: [...before, ...after, ...fall], decimals: 2 }

export const lesson: LessonContent = {
  id: "u3-gaps",
  sources: [
    "Investor.gov (U.S. SEC): extended-hours trading and price gaps",
    "CME Group: 24/7 trading of cryptocurrency futures and options (2026)",
    "Gap types as commonly taught in classical chart analysis; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Empty space on the chart",
      body: [
        "A **gap** appears when price opens away from where the previous candle ended, leaving empty space where nothing traded.",
        "Gaps happen when a market closes and news arrives while it is shut. The next session opens at a new price, all at once.",
      ],
      visual: {
        type: "chart",
        chart: {
          ...chart,
          reveal: true,
          annotations: [
            { kind: "marker", index: GAP_UP, at: "low", text: "Gap up", tone: "up" },
            { kind: "marker", index: 17, at: "high", text: "Gap down", tone: "down" },
          ],
          caption: "Illustrative daily stock chart",
        },
      },
    },
    {
      kind: "tap",
      id: "find-gap",
      prompt: "Tap the candle that opened with a gap up.",
      chart,
      targets: [GAP_UP],
      explain: "It opened well above the previous day's high, leaving a gap underneath it where no trades happened.",
    },
    {
      kind: "learn",
      title: "Where gaps happen",
      body: [
        "**Stocks** gap often: they trade only part of the day, and earnings and news land overnight. **Futures** gap mostly over the weekend.",
        "**Spot forex** only gaps over the weekend. **Crypto** never closes, so its charts rarely gap. CME's Bitcoin futures used to gap every weekend, until CME moved its crypto futures to 24/7 trading in 2026.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "Which markets gap",
          corner: "",
          cols: ["How often"],
          rows: [
            { label: "Stocks", cells: ["Often: overnight news and earnings"], tones: ["warn"] },
            { label: "Futures", cells: ["Mostly over the weekend"], tones: ["accent"] },
            { label: "Spot forex", cells: ["Only over the weekend"], tones: ["accent"] },
            { label: "Spot crypto", cells: ["Rarely: it never closes"], tones: ["up"] },
            { label: "CME Bitcoin futures", cells: ["No longer: 24/7 since 2026"], tones: ["up"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "why-stocks-gap",
      prompt: "Why do stocks gap much more often than forex?",
      options: [
        "The main stock session shuts overnight, so news piles up until the open",
        "Stock exchanges create gaps on purpose",
        "Forex prices are fixed overnight",
        "Stocks have no order book",
      ],
      answer: 0,
      explain: "With the main session shut, the overnight news hits the opening price at once. Forex trades around the clock on weekdays, so it adjusts gradually.",
    },
    {
      kind: "learn",
      title: "Types of gaps",
      body: [
        "**Common gaps** happen inside ranges and often get filled. **Breakaway gaps** launch a new move out of a range. **Runaway gaps** appear mid-trend as it accelerates. **Exhaustion gaps** come late in a trend and can mark its end.",
        "Traders say gaps tend to get filled, meaning price comes back to the pre-gap level. That happens often, but not always, and it can take days, months or never.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "Four types of gap",
          corner: "",
          cols: ["Where it shows up"],
          rows: [
            { label: "Common", cells: ["Inside ranges, often filled"], tones: ["neutral"] },
            { label: "Breakaway", cells: ["Launches a new move out of a range"], tones: ["up"] },
            { label: "Runaway", cells: ["Mid-trend, as it accelerates"], tones: ["accent"] },
            { label: "Exhaustion", cells: ["Late in a trend, can mark its end"], tones: ["warn"] },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "gaps-fill-same-day",
      statement: "Every gap gets filled the same day.",
      answer: false,
      explain: "Many gaps fill, but plenty don't, especially breakaway gaps on big news. Treat gap fills as a tendency, never a rule.",
    },
    {
      kind: "learn",
      title: "Gaps vs fair value gaps",
      body: [
        "A gap is empty space between sessions. A **fair value gap** (FVG), which you will study in Level 3, is different: a three-candle pattern where price moved so fast in one direction that it left a one-sided imbalance, even with no market close.",
        "Same idea of 'price skipped something', very different setups. Don't mix them up.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Don't mix them up",
          columns: [
            { title: "Gap", icon: "door", tone: "accent", points: ["Empty space between sessions"] },
            {
              title: "Fair value gap",
              icon: "layers",
              tone: "warn",
              points: ["A three-candle pattern", "Price moved so fast it left a one-sided imbalance", "Needs no market close"],
            },
          ],
        },
      },
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A gap is price opening away from the previous candle, with no trades in between.",
        "Stocks gap often; forex and futures mostly over weekends; spot crypto rarely.",
        "Common, breakaway, runaway and exhaustion gaps mean different things.",
        "Gaps often fill, but not always.",
        "A fair value gap is a different, three-candle concept.",
      ],
    },
  ],
}
