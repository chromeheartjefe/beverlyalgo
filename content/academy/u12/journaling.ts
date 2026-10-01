import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-journaling",
  sources: ["Trading journal practice as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Your most honest coach",
      body: [
        "A **trading journal** records every trade with enough detail to learn from it later. Memory is selective: it remembers the big wins and forgets the rule breaks. A journal doesn't.",
        "Your EntrixAlgo dashboard has a **Trade Journal**, and the **Trade Calendar** shows the same data day by day.",
      ],
    },
    {
      kind: "learn",
      title: "What to record",
      body: [
        "**Facts**: market, date and time, direction, entry, stop, target, exit, size, result in R and in money. **Context**: which setup, which killzone, a screenshot before and after. **Behaviour**: did you follow your plan? What were you feeling?",
        "The behaviour column is the one most traders skip, and the one that teaches the most.",
      ],
    },
    {
      kind: "choice",
      id: "most-useful",
      prompt: "Which journal entry is most useful for improving?",
      options: [
        "\"NQ long, MSS + FVG setup, +2R, followed plan, felt calm\"",
        "\"Made money today\"",
        "\"Bad day\"",
        "Nothing, because the broker statement has the numbers",
      ],
      answer: 0,
      explain: "It records the setup, the result in R and whether the plan was followed, which is everything you need to find patterns later.",
    },
    {
      kind: "learn",
      title: "Patterns hide in the data",
      body: [
        "After 50 trades, a journal can answer questions your memory can't: Which setup actually makes money? Which time of day loses? Do you lose more after a winning streak? What do trades where you broke a rule cost you in total?",
        "Tag each trade by setup and by mistake, so you can filter later.",
      ],
    },
    {
      kind: "truefalse",
      id: "only-losers",
      statement: "You only need to journal your losing trades.",
      answer: false,
      explain: "Winners teach just as much: which setups work, and whether you're cutting them short. Record every trade.",
    },
    {
      kind: "numeric",
      id: "rule-cost",
      prompt: "Your journal shows 8 trades where you broke your rules, losing 11R in total. On average, how many R did each rule break cost you?",
      answer: 1.375,
      tolerance: 0.01,
      suffix: "R",
      explain: "11R ÷ 8 = about 1.38R lost per rule break. Numbers like this make discipline very concrete.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Journal every trade: facts, context and behaviour.",
        "Use the Trade Journal and Trade Calendar in your dashboard.",
        "Tag setups and mistakes so you can find patterns.",
        "The cost of rule breaks, in R, is a powerful motivator.",
      ],
    },
  ],
}
