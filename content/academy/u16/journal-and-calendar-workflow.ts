import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-journal-and-calendar-workflow",
  sources: ["EntrixAlgo Trade Journal and Trade Calendar"],
  steps: [
    {
      kind: "learn",
      title: "The Trade Journal",
      body: [
        "The **Trade Journal** is free for every account. For each trade you log the **date**, **pair**, **direction**, **entry**, **exit** and **P&L**.",
        "It shows your win rate and totals, filters wins and losses, searches by pair, and can **export to CSV** so you can add your own columns in a spreadsheet: setup, result in R, whether you followed your plan, how you felt.",
      ],
    },
    {
      kind: "numeric",
      id: "win-rate",
      prompt: "Your journal shows 18 wins and 27 losses. What is your win rate?",
      answer: 40,
      tolerance: 0,
      suffix: "%",
      explain: "18 ÷ (18 + 27) = 18 ÷ 45 = 0.40, or 40%. On its own it says little; pair it with your average win and loss.",
    },
    {
      kind: "learn",
      title: "The Trade Calendar",
      body: [
        "The **Trade Calendar** shows the same journal day by day: green and red days, your average per trading day, your best and worst day, and a **monthly goal** you can set.",
        "Click any day to see its trades, or to add one for that date.",
      ],
    },
    {
      kind: "match",
      id: "where",
      prompt: "Match each task to the best place to do it.",
      pairs: [
        ["Log a trade right after closing it", "Trade Journal"],
        ["See which weekdays tend to go badly", "Trade Calendar"],
        ["Add setup and emotion columns", "CSV export in a spreadsheet"],
      ],
      explain: "Log in the Journal, review patterns in the Calendar, and extend the data in a spreadsheet when you need extra columns.",
    },
    {
      kind: "learn",
      title: "A simple workflow",
      body: [
        "**After every session**: log every trade in the Journal, the same day. **Every week**: open the Calendar for your weekly review from Unit 12. **Every month**: export the CSV, add your R and setup columns, and check which setups really pay.",
      ],
    },
    {
      kind: "truefalse",
      id: "log-later",
      statement: "It is fine to log your trades from memory at the end of the month.",
      answer: false,
      explain: "Memory quietly edits the bad trades. Log the same day, while the details are still true.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Journal: date, pair, direction, entry, exit, P&L; win rate, filters and CSV export.",
        "Calendar: daily results, best and worst days, monthly goal.",
        "Log daily, review weekly, deep-dive monthly with the CSV.",
      ],
    },
  ],
}
