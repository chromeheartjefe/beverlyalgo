import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u1-market-sessions-and-hours",
  sources: [
    "Investor.gov (U.S. SEC): extended-hours trading",
    "CME Group: Globex trading hours",
    "Bank for International Settlements, Triennial Central Bank Survey (forex turnover by trading centre)",
  ],
  steps: [
    {
      kind: "learn",
      title: "Forex follows the sun",
      body: [
        "Forex trades around the clock on weekdays because the trading day moves around the world: Sydney, then Tokyo, then London, then New York.",
        "London is the biggest forex centre and New York the second. When both are open at the same time, roughly 8 am to 12 pm New York time, the market is usually at its busiest.",
      ],
      visual: { type: "figure", id: "sessions-timeline" },
    },
    {
      kind: "numeric",
      id: "overlap-hours",
      prompt: "New York opens at 8 am and London closes at 12 pm (both New York time). How many hours do the two sessions overlap?",
      answer: 4,
      tolerance: 0,
      suffix: "hours",
      explain: "From 8 am to 12 pm is 4 hours. That window often has the most volume and the tightest spreads in EUR/USD and GBP/USD.",
    },
    {
      kind: "learn",
      title: "Why the session matters",
      body: [
        "More traders active means more liquidity: tighter spreads and smoother fills. Fewer traders means thinner books, wider spreads and sudden jumps.",
        "Many pairs drift in a narrow range during the Asian session, then move hard when London opens and again when New York opens. Smart Money traders build whole models around these windows, called **killzones**. You will study them in Level 3.",
      ],
    },
    {
      kind: "choice",
      id: "busiest-eurusd",
      prompt: "When is EUR/USD usually most active?",
      options: ["When London and New York are both open", "During the Sydney session", "Late Friday evening", "Saturday morning"],
      answer: 0,
      explain: "The London and New York overlap brings together the two largest forex centres, so volume and movement peak there.",
    },
    {
      kind: "learn",
      title: "Stocks: a main session plus extended hours",
      body: [
        "US stocks have a regular session from **9:30 am to 4:00 pm** New York time. Many brokers also offer pre-market trading from as early as 4:00 am and after-hours trading until 8:00 pm.",
        "Extended hours have far fewer participants. Spreads are wider, prices can jump on small orders, and big news (like earnings) often hits during these hours.",
      ],
    },
    {
      kind: "truefalse",
      id: "premarket-spreads",
      statement: "Pre-market stock trading usually has tighter spreads than the regular session.",
      answer: false,
      explain: "Fewer traders means less liquidity, so pre-market and after-hours spreads are usually wider, not tighter.",
    },
    {
      kind: "learn",
      title: "Futures and crypto",
      body: [
        "CME futures like NQ, ES and gold trade almost around the clock: from Sunday evening to Friday afternoon, with a short daily break around 5 pm New York time. The busiest hours still line up with the New York stock session.",
        "Crypto never closes, but it has rhythms too. Activity usually picks up when US and European traders are awake, and weekends are often quieter and thinner.",
      ],
    },
    {
      kind: "choice",
      id: "us-open",
      prompt: "What time does the regular US stock session open, New York time?",
      options: ["9:30 am", "8:00 am", "4:00 am", "10:00 am"],
      answer: 0,
      explain: "The regular session runs from 9:30 am to 4:00 pm New York time. 4:00 am is when some brokers start pre-market trading.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Forex runs 24 hours on weekdays: Sydney, Tokyo, London, New York.",
        "The London and New York overlap is usually the busiest window.",
        "More participants means tighter spreads and smoother prices.",
        "US stocks: 9:30 am to 4:00 pm New York, with thinner extended hours.",
        "CME futures trade nearly 24 hours on weekdays; crypto never stops.",
      ],
    },
  ],
}
