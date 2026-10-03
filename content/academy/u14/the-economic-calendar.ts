import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u14-the-economic-calendar",
  sources: ["U.S. Bureau of Labor Statistics: release schedules", "Federal Reserve: FOMC meeting calendar"],
  steps: [
    {
      kind: "learn",
      title: "Your weekly map of volatility",
      body: [
        "An **economic calendar** lists upcoming data releases and events with their date, time, expected impact, the **previous** value, the **forecast** and, once released, the **actual** value.",
        "Free calendars are easy to find. Most mark impact as low, medium or high. High-impact events are the ones that can move every market at once.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Three numbers on every release",
          nodes: [
            { label: "Previous", sub: "the last reading", icon: "clock" },
            { label: "Forecast", sub: "what is expected", icon: "target", tone: "accent" },
            { label: "Actual", sub: "filled in once released", icon: "check", tone: "up" },
          ],
        },
        caption: "Each row also shows the date, the time and the expected impact: low, medium or high.",
      },
    },
    {
      kind: "learn",
      title: "The big ones for US markets",
      body: [
        "**CPI** (inflation), monthly at 8:30 am New York time. **Non-farm payrolls** (jobs), usually the first Friday of the month at 8:30 am. **FOMC** interest rate decisions, eight times a year at 2:00 pm, with a press conference at 2:30 pm. Plus GDP, retail sales and PCE inflation.",
        "For forex, add the other central banks: the ECB, the Bank of England and the Bank of Japan.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "grid",
          title: "The big US releases",
          corner: "New York time",
          cols: ["What", "How often", "Time"],
          rows: [
            { label: "CPI", cells: ["Inflation", "Monthly", "8:30 am"], tones: ["neutral", "neutral", "accent"] },
            { label: "NFP", cells: ["Jobs", "First Friday", "8:30 am"], tones: ["neutral", "neutral", "accent"] },
            { label: "FOMC", cells: ["Rate decision", "8 times a year", "2:00 pm"], tones: ["neutral", "neutral", "warn"] },
          ],
        },
        caption: "Non-farm payrolls usually land on the first Friday of the month.",
      },
    },
    {
      kind: "match",
      id: "events",
      prompt: "Match each event to its usual time (New York).",
      pairs: [
        ["CPI release", "8:30 am, monthly"],
        ["Non-farm payrolls", "8:30 am, usually the first Friday"],
        ["FOMC decision", "2:00 pm, eight times a year"],
      ],
      explain: "Most US data lands at 8:30 am, inside the New York killzone. The Fed decides in the afternoon.",
    },
    {
      kind: "choice",
      id: "routine",
      prompt: "When should you check the economic calendar?",
      options: [
        "Every day before trading, and at the start of each week",
        "Only after a big move surprises you",
        "Once a year",
        "Never, charts already include everything",
      ],
      answer: 0,
      explain: "Knowing what is scheduled tells you when spreads will widen and when to stand aside.",
    },
    {
      kind: "truefalse",
      id: "all-equal",
      statement: "Every event on the economic calendar moves markets equally.",
      answer: false,
      explain: "Most releases barely register. A handful of high-impact events, like CPI, jobs and the FOMC, do most of the damage.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The calendar shows time, impact, previous, forecast and actual.",
        "US biggies: CPI and NFP at 8:30 am, FOMC at 2:00 pm.",
        "Check it daily and weekly.",
        "Only a few events really move markets.",
      ],
    },
  ],
}
