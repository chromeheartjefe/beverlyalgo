import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u12-setup-trigger-and-management",
  sources: ["Trading strategy structure as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Three parts of every trade",
      body: [
        "Every complete strategy answers three questions.",
        "**Setup**: when is the market in a condition worth trading? **Trigger**: what exact event makes you enter, right now? **Management**: once you're in, where are the stop and targets, and what do you do as price moves?",
      ],
    },
    {
      kind: "learn",
      title: "An example",
      body: [
        "Using the model from Level 3:",
        "**Setup**: 4-hour bias bullish, price pulls back into a 1-hour bullish FVG in discount during the New York killzone. **Trigger**: a 5-minute sweep of a low, then an MSS with displacement; limit order at the new gap's CE. **Management**: stop below the sweep low; take half at 2R, move the stop to breakeven, let the rest run to the old high.",
      ],
    },
    {
      kind: "match",
      id: "parts",
      prompt: "Match each part to its example.",
      pairs: [
        ["Setup", "Bullish bias and price in a discount FVG during the killzone"],
        ["Trigger", "A 5-minute MSS with displacement after a sweep"],
        ["Management", "Half off at 2R, stop to breakeven, rest to the old high"],
      ],
      explain: "Setup says when to pay attention, trigger says when to act, management says what to do once in.",
    },
    {
      kind: "choice",
      id: "missing-part",
      prompt: "A trader has a great setup and a clear trigger, but decides their exit by feel on each trade. What is missing?",
      options: ["Defined management rules", "A setup", "A trigger", "Nothing, feel works best"],
      answer: 0,
      explain: "Without fixed management rules, results depend on mood, and the strategy can't be tested.",
    },
    {
      kind: "truefalse",
      id: "setup-is-entry",
      statement: "When a setup appears, you should enter immediately.",
      answer: false,
      explain: "A setup only means conditions are right. You wait for the trigger, and some setups never trigger.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Setup: the conditions worth trading.",
        "Trigger: the exact event that gets you in.",
        "Management: stop, targets, and what you do as price moves.",
        "All three must be written down before you trade.",
      ],
    },
  ],
}
