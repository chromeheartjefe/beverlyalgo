import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u1-the-honest-numbers",
  sources: [
    "ESMA, product intervention measures on CFDs (2018): 74% to 89% of retail accounts lose money",
    "Chague, De-Losso and Giovannetti, \"Day Trading for a Living?\" (2019)",
    "Barber, Lee, Liu and Odean, \"The Cross-Section of Speculator Skill: Evidence from Day Trading\" (2014)",
  ],
  steps: [
    {
      kind: "learn",
      title: "Most traders lose. Here is the data.",
      body: [
        "Before you risk real money, you deserve the real numbers. Not to scare you off, but so you can avoid joining the majority.",
        "When the European regulator ESMA studied CFD trading in 2018, national regulators found that **74% to 89%** of retail accounts typically lost money. Today, brokers in Europe must show their own loss rate on their website. Most still report well over half of clients losing.",
      ],
    },
    {
      kind: "learn",
      title: "Day trading for a living",
      body: [
        "Researchers in Brazil followed everyone who started day trading index futures between 2013 and 2015 and kept going for at least 300 days. **97% lost money.** Only about 1.1% earned more than the minimum wage.",
        "A study of Taiwan's market over 15 years found that **less than 1%** of day traders could predictably make money, year after year, after fees.",
      ],
    },
    {
      kind: "truefalse",
      id: "most-lose",
      statement: "Most retail traders using leveraged products lose money.",
      answer: true,
      explain: "Regulators and academic studies agree: a clear majority lose, and only a small minority profit consistently.",
    },
    {
      kind: "learn",
      title: "Why they lose",
      body: [
        "The same mistakes show up again and again:",
        "**Risking too much** on each trade, so a normal losing streak wipes them out. **Too much leverage.** **No tested plan**, just gut feel. **Overtrading**, so costs eat everything. **Breaking their own rules** after a loss.",
        "Every one of these has its own unit in this course. None of them needs genius to fix. They need knowledge and discipline.",
      ],
    },
    {
      kind: "choice",
      id: "not-a-reason",
      prompt: "Which of these is NOT a common reason traders lose money?",
      options: [
        "Keeping a detailed trade journal",
        "Risking too much per trade",
        "Trading without a tested plan",
        "Overtrading until costs eat the profits",
      ],
      answer: 0,
      explain: "A journal is one of the habits that separates improving traders from the rest. The other three are classic ways to lose.",
    },
    {
      kind: "learn",
      title: "The maths of losing",
      body: [
        "Losses hurt more than they look. If you lose 10%, you need about an 11% gain to get back. Lose 25% and you need 33%. Lose 50%, and you need to **double** what is left just to break even.",
        "That is why the traders who last focus first on not losing big, and only then on winning.",
      ],
    },
    {
      kind: "numeric",
      id: "recover-50",
      prompt: "Your account drops 50%. What percentage gain do you need to get back to where you started?",
      answer: 100,
      tolerance: 0,
      suffix: "%",
      explain: "$10,000 down 50% is $5,000. To get back to $10,000, the $5,000 must grow by another $5,000: a 100% gain.",
    },
    {
      kind: "learn",
      title: "What this course will and won't do",
      body: [
        "No course can make you profitable on its own, and anyone who promises that is selling something. What this course does is teach how markets really work, help you avoid the classic ways to lose, and show you how to test whether you have an edge before betting real money on it.",
        "The winners in those studies did exist. They were patient, they risked little per trade, and they treated trading like a skill to practise, not a lottery ticket.",
      ],
      callout: {
        tone: "note",
        text: "Practise on a demo account or with very small size until you have a written plan and a few months of honest results.",
      },
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Regulators found 74% to 89% of retail CFD accounts lose money.",
        "In long-term studies, only about 1% of day traders profit consistently.",
        "The main causes: too much risk, too much leverage, no plan, overtrading.",
        "A 50% loss needs a 100% gain to recover, so protect your capital first.",
        "Knowledge, small risk and honest testing are how you join the minority.",
      ],
    },
  ],
}
