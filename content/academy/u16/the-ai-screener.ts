import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-the-ai-screener",
  sources: ["EntrixAlgo AI Screener"],
  steps: [
    {
      kind: "learn",
      title: "Finding what's moving",
      body: [
        "The **AI Screener** scans live market movers and ranks a shortlist: **five crypto** and **five stocks** that stand out right now. It is free for every account.",
        "Each pick gets a direction (**Bullish**, **Bearish** or **Watch**) and a **potential score** from 0 to 100. The scan refreshes roughly every hour.",
      ],
    },
    {
      kind: "learn",
      title: "A watchlist, not a signal",
      body: [
        "On purpose, the Screener gives **no entry, stop or target**. It tells you where to look, not what to do.",
        "Pick the one or two names that fit your market and style, open their charts, and do the work: structure, levels, liquidity. Or run a Chart Analysis on them.",
      ],
    },
    {
      kind: "choice",
      id: "screener-use",
      prompt: "A stock shows up as Bullish with a potential score of 92. What is the right next step?",
      options: [
        "Open its chart and analyse it with your own process before deciding",
        "Buy it immediately at market",
        "Short it because it moved too much",
        "Ignore all screeners forever",
      ],
      answer: 0,
      explain: "A high score says it is worth a look. Your setup, levels and risk decide whether it is worth a trade.",
    },
    {
      kind: "truefalse",
      id: "screener-levels",
      statement: "The AI Screener tells you exactly where to enter and where to put your stop.",
      answer: false,
      explain: "It deliberately gives no trade levels. It is a shortlist of candidates to analyse.",
    },
    {
      kind: "learn",
      title: "Fitting it into your day",
      body: [
        "Check it before your session for ideas, especially if you trade crypto or US stocks. Movers often have news behind them, so check the economic calendar and any earnings before you trade one.",
        "Remember Level 3: big movers often leave fair value gaps and swept liquidity behind. That is where your own analysis starts.",
      ],
    },
    {
      kind: "choice",
      id: "mover-risk",
      prompt: "A small stock is up 40% today and tops the Screener. What extra risk should you think about?",
      options: [
        "Thin liquidity, wide spreads and sharp reversals",
        "None, top movers are always safe",
        "It can't move any more today",
        "Screener picks can't be traded",
      ],
      answer: 0,
      explain: "Huge moves in small names come with thin books and violent reversals. Size down, or skip it.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The AI Screener ranks 5 crypto and 5 stock movers, roughly hourly.",
        "Each gets a direction and a 0 to 100 potential score.",
        "No trade levels by design: it's a watchlist.",
        "Analyse picks yourself, or with Chart Analysis, before trading.",
      ],
    },
  ],
}
