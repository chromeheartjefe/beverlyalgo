import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u4-where-it-came-from-dow-theory",
  sources: [
    "Hamilton, The Stock Market Barometer (1922), public domain, archive.org",
    "Charles H. Dow's Wall Street Journal editorials (1899 to 1902), as summarised by Hamilton",
  ],
  steps: [
    {
      kind: "learn",
      title: "An idea from 1900",
      body: [
        "Everything in this unit goes back to **Charles Dow**, co-founder of Dow Jones and the Wall Street Journal. Around 1900 he wrote a series of editorials about how the market moves. After his death, editor **William Peter Hamilton** developed them into what became known as **Dow theory**, in his 1922 book The Stock Market Barometer.",
        "The charts and markets have changed completely. The core ideas are still in every modern method.",
      ],
    },
    {
      kind: "learn",
      title: "Three trends at once",
      body: [
        "Dow said the market always has three movements going on at the same time, like the tide, waves and ripples on the sea:",
        "The **primary trend**, the big move that can last a year or more. **Secondary reactions**, corrections against it lasting weeks to months. And **minor** day-to-day fluctuations, which mean little on their own.",
        "That is multi-timeframe analysis, a century before trading apps.",
      ],
    },
    {
      kind: "match",
      id: "dow-trends",
      prompt: "Match each Dow theory movement to its description.",
      pairs: [
        ["Primary trend", "The main move, often lasting a year or more"],
        ["Secondary reaction", "A correction against it, weeks to months"],
        ["Minor movement", "Day-to-day noise"],
      ],
      explain: "Tide, waves and ripples: the bigger the movement, the more it matters.",
    },
    {
      kind: "learn",
      title: "Highs, lows and confirmation",
      body: [
        "Dow and Hamilton judged trends exactly as you learned in this unit: a bull market makes successively higher highs and higher lows, and a trend is assumed to continue until it gives a clear signal that it has reversed.",
        "They also insisted on **confirmation**: the industrial average and the railroad average had to agree before a new trend was trusted. Modern traders echo this when they compare related markets, and ICT traders use it in SMT divergence.",
      ],
    },
    {
      kind: "truefalse",
      id: "trend-persists",
      statement: "Dow theory assumes a trend continues until there is a clear signal that it has reversed.",
      answer: true,
      explain: "Don't guess tops and bottoms. Follow the trend until structure clearly breaks.",
    },
    {
      kind: "learn",
      title: "The three phases",
      body: [
        "Dow theory describes a big bull market in three phases. **Accumulation**: informed buyers quietly buy while news is still gloomy. **Public participation**: the trend becomes obvious and most traders join. **Distribution**: late, excited buyers pile in while the early buyers sell to them.",
        "Keep this in mind. Wyckoff turned it into his accumulation and distribution schematics, and ICT's Power of 3 (accumulation, manipulation, distribution) is a direct descendant. You will meet both in Level 3.",
      ],
    },
    {
      kind: "choice",
      id: "phases",
      prompt: "In which phase do informed buyers quietly build positions while the news is still bad?",
      options: ["Accumulation", "Public participation", "Distribution", "Capitulation of the averages"],
      answer: 0,
      explain: "Accumulation happens early, when the crowd is still pessimistic and prices are low.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Dow theory comes from Charles Dow's editorials, developed by Hamilton in 1922.",
        "Three trends at once: primary, secondary and minor.",
        "Trends are defined by highs and lows and continue until clearly reversed.",
        "Related averages should confirm each other.",
        "Accumulation, public participation and distribution lead to Wyckoff and Power of 3.",
      ],
    },
  ],
}
