import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-writing-a-trading-plan",
  sources: ["Trading plan structure as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "A plan you can follow under pressure",
      body: [
        "A **trading plan** is a short written document you follow every day. It is written when you are calm, so that you don't have to make big decisions when you are excited or scared.",
        "If it doesn't fit on one or two pages, it is too complicated to follow live.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "When you write it", icon: "pen", tone: "up", points: ["You are calm", "One or two pages", "The big decisions get made here"] },
            { title: "When you use it", icon: "flame", tone: "warn", points: ["You are excited or scared", "No big decisions left to make"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "What goes in it",
      body: [
        "**Markets and hours**: what you trade and when. **Setups**: your strategy's exact setup, trigger and management. **Risk**: % per trade, daily and weekly loss limits, maximum trades per day. **Routine**: what you do before, during and after the session. **Review**: how and when you journal and review.",
        "Add **if-then rules** for situations that usually go wrong: \"If I lose two trades in a row, I take a 30-minute break.\" \"If big news is due within 15 minutes, I don't open a new trade.\"",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "A trading plan",
          items: [
            { text: "Markets and hours", mark: "dot" },
            { text: "Setups: setup, trigger and management", mark: "dot" },
            { text: "Risk: % per trade, loss limits, maximum trades", mark: "dot" },
            { text: "Routine: before, during and after the session", mark: "dot" },
            { text: "Review: how and when you journal", mark: "dot" },
            { text: "If-then rules for what usually goes wrong", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "good-rule",
      prompt: "Which rule belongs in a trading plan?",
      options: [
        "If I hit a 2% daily loss, I stop trading until tomorrow",
        "I'll trade more when I feel lucky",
        "I'll figure out my risk on each trade as I go",
        "I'll follow whatever my favourite influencer posts",
      ],
      answer: 0,
      explain: "It is specific, measurable and decided in advance. The others leave decisions to emotion or other people.",
    },
    {
      kind: "truefalse",
      id: "plan-change",
      statement: "You can change your trading plan in the middle of a trading session if a trade feels different.",
      answer: false,
      explain: "Change the plan only outside market hours, after reviewing evidence. Mid-session changes are emotions dressed up as decisions.",
    },
    {
      kind: "match",
      id: "plan-sections",
      prompt: "Match each plan section to an example.",
      pairs: [
        ["Markets and hours", "NQ only, 7 to 11 am New York time"],
        ["Risk", "0.5% per trade, 3 trades a day maximum"],
        ["Routine", "Mark levels and check the news calendar before the open"],
        ["Review", "Journal every trade; review every Friday"],
      ],
      explain: "Each section answers a question you shouldn't be deciding on the fly.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "A trading plan is written when calm and followed when not.",
        "Cover markets, setups, risk, routine and review.",
        "Add if-then rules for your usual mistakes.",
        "Only change it outside trading hours, based on evidence.",
      ],
    },
  ],
}
