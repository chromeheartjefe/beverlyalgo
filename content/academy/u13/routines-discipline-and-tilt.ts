import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u13-routines-discipline-and-tilt",
  sources: ["Trading psychology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Discipline is a system, not willpower",
      body: [
        "Willpower runs out, especially after a loss or a long day. Disciplined traders don't rely on it. They build **routines** that make the right action the easy one.",
      ],
    },
    {
      kind: "learn",
      title: "A simple daily routine",
      body: [
        "**Before**: check the news calendar, mark higher-timeframe levels and liquidity, decide your bias and what would make you wrong. **During**: trade only your killzone and only your setups, with a checklist before each entry. **After**: journal every trade, note your state of mind, close the platform.",
      ],
    },
    {
      kind: "match",
      id: "routine-parts",
      prompt: "Match each task to when it belongs.",
      pairs: [
        ["Mark levels and check the news", "Before the session"],
        ["Run the entry checklist", "During the session"],
        ["Journal trades and emotions", "After the session"],
      ],
      explain: "Preparation, execution, then reflection: every day, the same order.",
    },
    {
      kind: "learn",
      title: "Tilt",
      body: [
        "**Tilt** is a poker word for the state where emotions have taken over decisions. Signs: trading faster, bigger or more often, feeling angry or desperate, ignoring your plan, wanting to win back losses.",
        "Once you notice tilt, the only good trade is no trade. Close the platform. Sleep, exercise and food matter more to decision-making than most traders admit.",
      ],
    },
    {
      kind: "choice",
      id: "tilt-response",
      prompt: "You notice you're clicking faster, sizing up and feeling angry at the market. What do you do?",
      options: ["Stop trading for the day", "Trade through it to get your rhythm back", "Switch to a faster timeframe", "Remove your stops"],
      answer: 0,
      explain: "That is tilt. Every decision from here is likely to be worse. Walking away protects your account.",
    },
    {
      kind: "truefalse",
      id: "willpower",
      statement: "Strong traders rely mainly on willpower to follow their rules.",
      answer: false,
      explain: "They rely on routines, checklists, pre-placed orders and hard limits, so they need as little willpower as possible.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Build routines instead of relying on willpower.",
        "Before: prepare. During: checklist and setups only. After: journal.",
        "Tilt: emotions running your decisions.",
        "When you notice tilt, stop for the day.",
      ],
    },
  ],
}
