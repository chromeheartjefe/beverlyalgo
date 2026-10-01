import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u13-fomo",
  sources: ["Trading psychology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Fear of missing out",
      body: [
        "**FOMO** is the panic of watching a move happen without you. It makes traders jump in late, chase price far from any level, skip their rules and use oversized positions.",
        "Chasing almost always means a poor entry: the stop is far away, or too tight to survive, and the move is already stretched.",
      ],
    },
    {
      kind: "choice",
      id: "fomo-sign",
      prompt: "Which of these is FOMO talking?",
      options: [
        "\"It's already up 3%, but I have to get in now before it goes higher\"",
        "\"Price is at my level in the killzone and my trigger just fired\"",
        "\"No setup today, so no trade\"",
        "\"I'll wait for the retrace into the gap\"",
      ],
      answer: 0,
      explain: "Entering because a move is running away, rather than because your setup appeared, is the classic FOMO trade.",
    },
    {
      kind: "learn",
      title: "Defences against FOMO",
      body: [
        "**Rules first**: no setup, no trade, however strong the move looks. **Alerts**: set price alerts at your levels and stop staring at the chart. **A missed-trade log**: write down moves you missed and check later whether they met your rules. Most didn't.",
        "Remember the numbers: the markets offer setups every single day. A missed trade costs nothing. A chased trade often costs 1R or more.",
      ],
    },
    {
      kind: "truefalse",
      id: "last-chance",
      statement: "If you miss a big move, the opportunity is gone for good.",
      answer: false,
      explain: "Markets produce new setups constantly. There is always another trade; there isn't always more capital.",
    },
    {
      kind: "choice",
      id: "missed-move",
      prompt: "A huge rally starts while you're waiting for your setup, and it never retraces to your entry. What is the right response?",
      options: [
        "Let it go and log it as a missed trade",
        "Buy at market immediately",
        "Short it because it went up too much",
        "Lower your standards for the rest of the day",
      ],
      answer: 0,
      explain: "Your edge comes from your entry location. Missing a move that didn't offer it is part of a good process.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "FOMO makes you chase late, with poor entries and too much size.",
        "No setup, no trade.",
        "Use alerts and a missed-trade log instead of staring at charts.",
        "A missed trade costs nothing; a chased one usually costs.",
      ],
    },
  ],
}
