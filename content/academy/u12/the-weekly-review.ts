import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-the-weekly-review",
  sources: ["Trading review practice as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Step back once a week",
      body: [
        "Day to day, you're too close to judge. Once a week, outside market hours, sit down with your journal for a **weekly review**.",
        "The Trade Calendar in your dashboard is built for this: the week's days, their results and trades in one view.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "cycle",
          center: "Once a week, outside market hours",
          nodes: [
            { label: "Trade the plan" },
            { label: "Journal every trade" },
            { label: "Weekly review", tone: "up" },
            { label: "One change", tone: "warn" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "A simple review routine",
      body: [
        "1. **Numbers**: trades taken, win rate, total R, average win and loss. 2. **Rules**: how many trades broke the plan, and what did they cost? 3. **Best and worst**: look at the screenshots of your best and worst trade. 4. **One change**: pick a single thing to improve next week.",
        "Only one. Changing five things at once means you'll never know what helped.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Four steps",
          nodes: [
            { label: "1. Numbers", sub: "trades, win rate, total R", icon: "calculator" },
            { label: "2. Rules", sub: "what did breaking them cost?", icon: "list" },
            { label: "3. Best and worst", sub: "look at the screenshots", icon: "eye" },
            { label: "4. One change", sub: "a single thing to improve", icon: "target", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "one-change",
      prompt: "Your weekly review finds three problems. What should you do?",
      options: [
        "Pick the most costly one and focus on it next week",
        "Change all three at once",
        "Ignore them until the month ends",
        "Switch to a completely new strategy",
      ],
      answer: 0,
      explain: "One focused change at a time lets you see what actually helps.",
    },
    {
      kind: "truefalse",
      id: "pnl-only",
      statement: "If the week was profitable, the review isn't needed.",
      answer: false,
      explain: "A profitable week can still hide rule breaks that got lucky. Those are the most dangerous habits of all.",
    },
    {
      kind: "match",
      id: "review-steps",
      prompt: "Match each review step to its question.",
      pairs: [
        ["Numbers", "What did the week produce, in R?"],
        ["Rules", "Where did I break my plan, and what did it cost?"],
        ["Best and worst", "What do my best and worst trades have in common?"],
        ["One change", "What single thing will I improve next week?"],
      ],
      explain: "From what happened, to why, to one concrete action.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Review once a week, outside market hours.",
        "Numbers, rules, best and worst trades, then one change.",
        "Use the Trade Calendar for the week at a glance.",
        "Profitable weeks need reviewing too.",
      ],
    },
  ],
}
