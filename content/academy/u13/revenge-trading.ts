import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u13-revenge-trading",
  sources: ["Trading psychology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Trying to get it back",
      body: [
        "**Revenge trading** is trading to win back a loss, now. It usually comes with bigger size, worse setups and less patience. One planned −1R loss turns into −5R.",
        "It is not a strategy problem. It is an emotional one, and it is behind many blown accounts.",
      ],
    },
    {
      kind: "choice",
      id: "revenge-sign",
      prompt: "Which thought signals revenge trading?",
      options: [
        "\"I just lost $200, I need to make it back before lunch\"",
        "\"That loss was within my plan; next setup tomorrow\"",
        "\"I'll review that trade on Friday\"",
        "\"I've hit my two trades for today, done\"",
      ],
      answer: 0,
      explain: "A target to recover a specific loss on a deadline is revenge thinking. The market doesn't know or care what you lost.",
    },
    {
      kind: "learn",
      title: "Hard stops for you, not just the trade",
      body: [
        "**Daily loss limit**: hit it and you're done for the day. **Two-loss rule**: after two losses in a row, a mandatory break of at least 30 minutes. **Fixed size**: never increase size after a loss.",
        "Some traders physically walk away from the screen. The urge fades quickly once you're not looking at the chart.",
      ],
    },
    {
      kind: "numeric",
      id: "revenge-cost",
      prompt: "You lose 1R, then double your size on a weaker setup and lose again. If 1R was $100, what is your total loss?",
      answer: 300,
      tolerance: 0,
      prefix: "$",
      explain: "$100 for the first loss, then $200 at double size: $300, three times your planned risk in two trades.",
    },
    {
      kind: "truefalse",
      id: "increase-after-loss",
      statement: "Increasing your size after a loss helps you recover faster, so it is a sound idea.",
      answer: false,
      explain: "It increases risk exactly when your judgement is weakest. Losses snowball this way.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Revenge trading turns small planned losses into big unplanned ones.",
        "Use a daily loss limit and a two-loss break rule.",
        "Never raise size after a loss.",
        "Walk away from the screen when the urge hits.",
      ],
    },
  ],
}
