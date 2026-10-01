import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u3-timeframes",
  sources: ["Investor.gov (U.S. SEC): reading price charts"],
  steps: [
    {
      kind: "learn",
      title: "Each candle is a slice of time",
      body: [
        "On a 15-minute chart, each candle covers 15 minutes. On a daily chart, each covers a whole day. That length is the **timeframe**. Common ones: 1m, 5m, 15m, 1h, 4h, daily and weekly.",
        "Switching timeframes doesn't change the trades. It only changes how they are grouped.",
      ],
      visual: { type: "figure", id: "candle-merge" },
    },
    {
      kind: "numeric",
      id: "five-in-hour",
      prompt: "How many 5-minute candles make up one 1-hour candle?",
      answer: 12,
      tolerance: 0,
      suffix: "candles",
      explain: "60 minutes ÷ 5 minutes = 12 candles.",
    },
    {
      kind: "learn",
      title: "Same market, different stories",
      body: [
        "A daily chart can be in a clear uptrend while the 5-minute chart is falling. Both are true: the 5-minute chart is showing a small pullback inside the bigger move.",
        "**Higher timeframes** move slower, but they carry more weight: more traders and more money are behind a daily level than a 1-minute one. **Lower timeframes** show the detail and help with timing.",
      ],
    },
    {
      kind: "choice",
      id: "daily-up-5m-down",
      prompt: "The daily chart is in a strong uptrend, but the 5-minute chart has been falling all morning. What is most likely happening?",
      options: [
        "A short pullback inside the bigger uptrend",
        "The daily chart is wrong",
        "The uptrend is definitely over",
        "The two charts show different markets",
      ],
      answer: 0,
      explain: "Big trends are made of smaller up and down moves. A few hours of selling on the 5-minute chart is often just a dip within the daily trend.",
    },
    {
      kind: "learn",
      title: "Choosing your timeframes",
      body: [
        "Scalpers work on 1 to 5-minute charts. Day traders often use 5-minute to 1-hour charts. Swing traders use 4-hour and daily charts.",
        "Most traders pair two or three: a **higher timeframe for direction** and a **lower one for the entry**. That is called top-down analysis, and Level 3 builds whole entry models around it.",
      ],
    },
    {
      kind: "truefalse",
      id: "daily-open",
      statement: "A daily candle's open is the first price traded in that day's session.",
      answer: true,
      explain:
        "Yes. Just know that the day starts at different times by market: forex and many futures charts start the new day at 5 pm or 6 pm New York time, not at midnight.",
    },
    {
      kind: "choice",
      id: "most-weight",
      prompt: "A support level shows up on several timeframes. On which one does it usually carry the most weight?",
      options: ["Weekly", "15-minute", "5-minute", "1-minute"],
      answer: 0,
      explain: "Higher timeframes represent more trading and more money, so their levels tend to matter more.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The timeframe is how much time each candle covers.",
        "Higher-timeframe candles are made from lower-timeframe ones.",
        "Different timeframes can show different trends at the same time.",
        "Use a higher timeframe for direction and a lower one for timing.",
      ],
    },
  ],
}
