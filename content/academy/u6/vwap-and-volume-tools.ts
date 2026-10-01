import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { vwap } from "@/lib/academy/indicators"
import type { LessonContent } from "@/lib/academy/types"

// One trading session: an early drop, a recovery above VWAP, a dip back to it
const candles = candlesFromCloses(
  pathCloses([[0, 100], [6, 98.6], [18, 101.8], [26, 100.6], [38, 102.4]], { noise: 0.2, seed: 88 }),
  { wick: 0.25, seed: 88 },
)
// Busy open and close, quiet middle of the day
const volumes = candles.map((_, i) => Math.round(260 * Math.exp(-i / 5) + 220 * Math.exp((i - 38) / 5) + 70 + ((i * 37) % 23)))
const line = vwap(candles, volumes)

export const lesson: LessonContent = {
  id: "u6-vwap-and-volume-tools",
  sources: ["Investor.gov (U.S. SEC): trading volume and execution quality"],
  steps: [
    {
      kind: "learn",
      title: "The average price everyone paid",
      body: [
        "**VWAP** (volume-weighted average price) is the average price of every trade in the session, weighted by volume. It starts fresh at each session open.",
        "VWAP = total of (price × volume) ÷ total volume. Big funds are often judged on whether they bought below or sold above VWAP, so they watch it closely, and so do day traders.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          volumes,
          decimals: 1,
          overlays: [{ values: line, tone: "warn", label: "VWAP" }],
          caption: "Illustrative intraday session",
        },
      },
    },
    {
      kind: "numeric",
      id: "vwap-calc",
      prompt: "100 shares trade at $10 and 300 shares at $12. What is the VWAP?",
      answer: 11.5,
      tolerance: 0,
      prefix: "$",
      explain: "(100 × 10 + 300 × 12) ÷ 400 = (1,000 + 3,600) ÷ 400 = $11.50. The bigger trade pulls the average towards $12.",
    },
    {
      kind: "learn",
      title: "Using VWAP",
      body: [
        "**Above VWAP**, the average buyer today is in profit, and intraday bias leans bullish. **Below VWAP**, it leans bearish.",
        "In trending days, pullbacks to VWAP often attract buyers (or sellers in a downtrend). **Anchored VWAP** starts the calculation from a chosen candle, like a big swing low or a news event, instead of the session open.",
      ],
    },
    {
      kind: "choice",
      id: "vwap-bias",
      prompt: "Price has held above VWAP all morning and just dipped back to it. What does that suggest to a day trader?",
      options: [
        "A possible area for buyers to step back in",
        "A guaranteed crash",
        "VWAP no longer matters after the open",
        "The session is over",
      ],
      answer: 0,
      explain: "On a day where buyers are in control, the average price of the session often acts as dynamic support.",
    },
    {
      kind: "learn",
      title: "Volume profile",
      body: [
        "**Volume profile** turns volume sideways: it shows how much traded at each **price**, not at each time. The price with the most volume is the **point of control (POC)**; the band holding about 70% of volume is the **value area**.",
        "High-volume prices tend to act like magnets and support or resistance. Low-volume prices are often crossed quickly.",
      ],
    },
    {
      kind: "truefalse",
      id: "vwap-reset",
      statement: "Standard VWAP resets at the start of each trading session.",
      answer: true,
      explain: "Session VWAP starts again from the open each day. Anchored VWAP is the version that starts wherever you choose.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "VWAP is the volume-weighted average price of the session.",
        "Above VWAP leans bullish; below leans bearish.",
        "Anchored VWAP starts from a candle you choose.",
        "Volume profile shows volume by price: POC and value area.",
      ],
    },
  ],
}
