import { D, DAY, dayTimeLabels } from "@/content/academy/l3/setups"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// The candle that traded furthest below the midnight open
const FURTHEST = DAY.reduce((best, c, i) => (i > D.midnight && c[2] < DAY[best][2] ? i : best), D.midnight + 1)

const chart: ChartSpec = {
  candles: DAY,
  decimals: 2,
  timeLabels: dayTimeLabels(3),
  annotations: [{ kind: "line", from: [D.midnight, D.midnightOpen], to: [DAY.length - 1, D.midnightOpen], label: "Midnight open", tone: "warn", dashed: true }],
}

export const lesson: LessonContent = {
  id: "u9-opening-prices-and-opening-gaps",
  sources: [
    "CME Group: Globex trading hours and the daily maintenance break",
    "ICT terminology as commonly taught; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Opening prices as anchors",
      body: [
        "ICT traders mark a few opening prices every day. The most important is the **midnight open**: the price at 12:00 am New York time, which ICT treats as the true start of the trading day.",
        "The same premium and discount logic applies: on a bullish day, buying below the midnight open is buying at a discount for the day. On a bearish day, selling above it is selling at a premium.",
      ],
      visual: { type: "chart", chart: { ...chart, caption: "Illustrative, New York time" } },
    },
    {
      kind: "tap",
      id: "below-open",
      prompt: "On this bullish day, tap the candle that traded furthest below the midnight open.",
      chart,
      targets: [FURTHEST],
      explain: "That London drop was the best discount of the day relative to the midnight open, just before New York rallied.",
    },
    {
      kind: "learn",
      title: "Opening gaps in futures",
      body: [
        "CME futures like NQ and ES pause every weekday from 5 pm to 6 pm New York time, and close from Friday 5 pm to Sunday 6 pm. Price can reopen at a different level.",
        "The gap between the 5 pm close and the 6 pm reopen is the **new day opening gap (NDOG)**. The gap between Friday's close and Sunday's open is the **new week opening gap (NWOG)**. ICT traders mark both as levels price often comes back to.",
      ],
    },
    {
      kind: "match",
      id: "gaps-match",
      prompt: "Match each term to what it is.",
      pairs: [
        ["Midnight open", "The price at 12:00 am New York time"],
        ["NDOG", "The gap between the 5 pm close and the 6 pm reopen"],
        ["NWOG", "The gap between Friday's close and Sunday's open"],
      ],
      explain: "Three anchors: the start of the trading day, the daily futures break, and the weekend gap.",
    },
    {
      kind: "choice",
      id: "bullish-buy",
      prompt: "You expect a bullish day. Relative to the midnight open, where would ICT prefer to buy?",
      options: ["Below the midnight open", "Far above the midnight open", "Exactly at the day's high", "It never matters"],
      answer: 0,
      explain: "Below the midnight open is a discount for the day, the cheap side for buyers.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The midnight open (12 am New York) anchors the trading day.",
        "Bullish days: buy below it. Bearish days: sell above it.",
        "NDOG: the daily 5 to 6 pm futures gap. NWOG: the weekend gap.",
        "Both gaps are levels price often revisits.",
      ],
    },
  ],
}
