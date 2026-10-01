import type { Candle, LessonContent } from "@/lib/academy/types"

// One-minute candles around an 8:30 am release: calm, then a spike up that
// runs the highs, an immediate reversal, and the real move down.
const NEWS = 10
const candles: Candle[] = [
  [100.0, 100.1, 99.95, 100.05],
  [100.05, 100.12, 100.0, 100.1],
  [100.1, 100.15, 100.02, 100.04],
  [100.04, 100.1, 99.98, 100.08],
  [100.08, 100.16, 100.05, 100.12],
  [100.12, 100.18, 100.06, 100.1],
  [100.1, 100.14, 100.0, 100.03],
  [100.03, 100.1, 99.97, 100.06],
  [100.06, 100.12, 100.02, 100.09],
  [100.09, 100.13, 100.04, 100.08],
  [100.08, 101.05, 99.7, 99.85], // 10  8:30 release: spike up, then crash
  [99.85, 99.95, 99.3, 99.4],
  [99.4, 99.55, 99.1, 99.2],
  [99.2, 99.45, 99.15, 99.35],
  [99.35, 99.4, 98.9, 98.95],
  [98.95, 99.1, 98.7, 98.8],
  [98.8, 99.0, 98.75, 98.9],
  [98.9, 98.95, 98.5, 98.55],
  [98.55, 98.7, 98.4, 98.6],
  [98.6, 98.65, 98.3, 98.35],
]
const labels = candles.map((_, i) => ({ index: i, text: `8:${String(20 + i).padStart(2, "0")}` })).filter((t) => t.index % 5 === 0)

export const lesson: LessonContent = {
  id: "u14-trading-around-news",
  sources: ["CFTC Learn & Protect: volatility and slippage risk", "Investor.gov (U.S. SEC): market orders in fast markets"],
  steps: [
    {
      kind: "learn",
      title: "What happens at 8:30",
      body: [
        "In the seconds around a big release, liquidity providers pull their orders, **spreads widen** and price can jump several levels at once. **Stops slip**, and market orders fill far from the screen price.",
        "The first move is often a **liquidity grab**: a spike that runs the stops on one side, then a reversal into the real move.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          timeLabels: labels,
          annotations: [{ kind: "marker", index: NEWS, at: "high", text: "8:30 release", tone: "warn" }],
          caption: "Illustrative 1-minute chart around a news release",
        },
      },
    },
    {
      kind: "tap",
      id: "news-candle",
      prompt: "Tap the candle where the news hit and the liquidity grab happened.",
      chart: { candles, decimals: 2, timeLabels: labels },
      targets: [NEWS],
      explain: "At 8:30 price spiked up through the morning's highs, then reversed and closed lower. The real move followed down.",
    },
    {
      kind: "learn",
      title: "Your options",
      body: [
        "**Be flat**: close or avoid positions a few minutes before high-impact news. **Reduce size** if you must hold through it. **Wait**: let the first 5 to 15 minutes play out, then trade the structure that forms (often a sweep and an MSS). **Avoid stops right at obvious levels** during news, where slippage is worst.",
      ],
    },
    {
      kind: "choice",
      id: "before-cpi",
      prompt: "CPI comes out in 5 minutes and you have no open trade. What does a cautious plan say?",
      options: [
        "Don't open a new trade until the release and the first reaction are over",
        "Enter a big position right before the number",
        "Place market orders in both directions",
        "Remove all stops from future trades",
      ],
      answer: 0,
      explain: "Entering just before a coin-flip event with widening spreads is gambling. Let the market show its hand first.",
    },
    {
      kind: "truefalse",
      id: "stops-safe",
      statement: "During high-impact news, your stop is always filled exactly at its price.",
      answer: false,
      explain: "Stops become market orders. In a fast market they can fill well past your price.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "News brings wide spreads, jumps and slippage.",
        "The first spike is often a liquidity grab.",
        "Be flat, size down, or wait for the first reaction to finish.",
        "Expect stops to slip during news.",
      ],
    },
  ],
}
