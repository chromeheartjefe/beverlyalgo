import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u13-overconfidence-and-overtrading",
  sources: ["Barber and Odean, \"Trading Is Hazardous to Your Wealth\" (Journal of Finance, 2000)"],
  steps: [
    {
      kind: "learn",
      title: "Trading more, earning less",
      body: [
        "Researchers Brad Barber and Terrance Odean studied tens of thousands of US household brokerage accounts in the 1990s. The households that traded the most earned an annual return of about **11.4%**, while the market returned about **17.9%** over the same period.",
        "Their conclusion fit their paper's title: trading is hazardous to your wealth. The main culprits were costs and overconfidence.",
      ],
    },
    {
      kind: "learn",
      title: "Where overconfidence comes from",
      body: [
        "A winning streak feels like skill, even when it is luck. Traders then raise size, loosen their rules and trade more often, right before the streak ends.",
        "Overtrading shows up as taking B and C setups, trading outside your hours, and opening trades out of boredom.",
      ],
    },
    {
      kind: "choice",
      id: "after-streak",
      prompt: "You've won five trades in a row. What is the most disciplined response?",
      options: [
        "Keep the same size and the same rules",
        "Double your size, you're clearly on fire",
        "Trade every setup you see today",
        "Skip your stop on the next trade",
      ],
      answer: 0,
      explain: "Five wins is a small sample. Your edge didn't change, so neither should your size or rules.",
    },
    {
      kind: "truefalse",
      id: "more-trades",
      statement: "More trades always means more profit if your strategy has an edge.",
      answer: false,
      explain: "Extra trades are usually lower-quality setups and add costs. A few A-grade trades often beat many mediocre ones.",
    },
    {
      kind: "learn",
      title: "Defences",
      body: [
        "Cap your trades per day. Grade every setup A, B or C in your journal and check which grades actually make money; many traders find only their A setups do. Keep size fixed through winning and losing streaks alike.",
      ],
    },
    {
      kind: "choice",
      id: "grade",
      prompt: "Your journal shows A setups at +0.6R per trade and C setups at −0.3R. What should you do?",
      options: ["Stop taking C setups", "Take more C setups to make up the numbers", "Ignore the grades", "Take C setups with bigger size"],
      answer: 0,
      explain: "The C setups are losing you money. Cutting them raises your average result immediately.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Studies show the most active traders tend to earn the least.",
        "Winning streaks breed overconfidence and overtrading.",
        "Cap trades per day and keep size fixed through streaks.",
        "Grade setups and drop the grades that lose.",
      ],
    },
  ],
}
