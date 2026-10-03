import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u1-what-can-you-trade",
  sources: [
    "Investor.gov (U.S. SEC): stocks, ETFs and options",
    "CFTC Learn & Protect: futures market basics",
    "Bank for International Settlements, Triennial Central Bank Survey (forex turnover)",
  ],
  steps: [
    {
      kind: "learn",
      title: "Six big markets",
      body: [
        "Traders mostly deal in six big markets: stocks, indices, forex, commodities, crypto and futures. The first five are groups of assets, called **asset classes**. Futures are contracts that follow those assets, and they trade as a market of their own.",
        "Each behaves a little differently: when it trades, how far it moves in a day and what pushes it around. Picking the right one for your schedule and temperament matters more than most beginners think.",
      ],
      visual: { type: "figure", id: "asset-classes" },
    },
    {
      kind: "learn",
      title: "Stocks",
      body: [
        "A **stock** (or share) is a small piece of ownership in a company, such as Apple, Tesla or Nvidia.",
        "Its price moves with the company's results, news about it and the mood of the whole market.",
        "The big US exchanges, the NYSE and Nasdaq, hold their main session from 9:30 am to 4:00 pm New York time on weekdays. There are thinner pre-market and after-hours sessions around it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "timeline",
          title: "A US stock day, New York time",
          events: [
            { time: "Early", label: "Pre-market: thin", tone: "neutral" },
            { time: "9:30 am", label: "Main session opens", tone: "up" },
            { time: "4:00 pm", label: "Main session closes", tone: "down" },
            { time: "Late", label: "After-hours: thin", tone: "neutral" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Indices",
      body: [
        "An **index** tracks a basket of stocks as one number. The S&P 500 follows 500 large US companies. The Nasdaq-100 follows 100 of the largest non-financial companies listed on Nasdaq.",
        "You can't buy an index itself. Traders use funds (ETFs) or futures contracts that follow it, such as **NQ**, the E-mini Nasdaq-100 future, and its smaller sibling MNQ.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "From many stocks to one number",
          nodes: [
            { label: "A basket of stocks", sub: "S&P 500: 500 large US companies", icon: "layers" },
            { label: "One number", sub: "the index", icon: "chart", tone: "up" },
            { label: "Traded through", sub: "ETFs or futures like NQ and MNQ", icon: "candles" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "nq-index",
      prompt: "NQ is a futures contract that follows which index?",
      options: ["Nasdaq-100", "S&P 500", "Dow Jones Industrial Average", "Russell 2000"],
      answer: 0,
      explain: "NQ is the E-mini Nasdaq-100 future. The S&P 500 version is ES, and the micro versions are MNQ and MES.",
    },
    {
      kind: "learn",
      title: "Forex",
      body: [
        "**Forex** (foreign exchange, or FX) is trading one currency against another. Prices are quoted in pairs: EUR/USD at 1.0850 means 1 euro costs 1.0850 US dollars.",
        "It is the largest market in the world, with trillions of dollars changing hands every day, mostly between banks. It runs around the clock from Sunday evening to Friday evening, New York time.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "Reading a currency pair",
          nodes: [
            { label: "1 euro", icon: "coins" },
            { label: "EUR/USD at 1.0850", sub: "the quoted pair", tone: "up" },
            { label: "1.0850 US dollars", icon: "wallet" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "eurusd-quote",
      prompt: "EUR/USD is quoted at 1.1000. What does that mean?",
      options: [
        "1 euro costs 1.10 US dollars",
        "1 US dollar costs 1.10 euros",
        "The euro rose 1.1% today",
        "1,100 euros buy 1 US dollar",
      ],
      answer: 0,
      explain:
        "The first currency in the pair is the one being priced. EUR/USD at 1.1000 means one euro costs 1.10 dollars.",
    },
    {
      kind: "learn",
      title: "Commodities",
      body: [
        "**Commodities** are raw materials: gold, silver, oil, natural gas, wheat.",
        "Gold (XAU/USD) is one of the most traded, partly because investors buy it as a safe haven when they are worried about the economy.",
        "Most traders never touch a gold bar. They trade futures or other contracts that follow its price.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "How commodities are traded",
          nodes: [
            { label: "Raw materials", sub: "gold, silver, oil, gas, wheat", icon: "gold" },
            { label: "Contracts follow the price", sub: "futures and others", icon: "candles", tone: "up" },
            { label: "Traders trade the contract", sub: "not the gold bar", icon: "user" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Crypto",
      body: [
        "**Crypto** assets such as Bitcoin (BTC) and Ethereum (ETH) trade on exchanges that never close: 24 hours a day, 7 days a week, weekends and holidays included.",
        "They can move much more in a day than most stocks or currencies. That attracts traders, and it also wipes many of them out.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "When the market is open",
          columns: [
            { title: "US stocks", icon: "building", tone: "neutral", points: ["Main session 9:30 am to 4:00 pm", "Weekdays only"] },
            { title: "Crypto", icon: "bitcoin", tone: "warn", points: ["24 hours a day", "7 days a week", "Weekends and holidays too"] },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "crypto-weekends",
      statement: "Bitcoin stops trading on weekends, like the stock market.",
      answer: false,
      explain: "Crypto exchanges run 24/7, so Bitcoin trades on Saturdays and Sundays too.",
    },
    {
      kind: "learn",
      title: "Futures (and a word on options)",
      body: [
        "A **futures contract** is an agreement to buy or sell something at a set price on a future date. Traders rarely hold one until that date. They buy and sell the contract itself to profit from price moves.",
        "Futures exist on indices (NQ, ES), gold (GC), oil (CL), currencies and even Bitcoin. They trade on exchanges such as CME almost 24 hours a day on weekdays, and CME's crypto futures now trade through the weekend too.",
        "**Options** give the right, but not the obligation, to buy or sell at a set price. They are powerful and complex, and this course only touches on them.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "What a futures contract is",
          nodes: [
            { label: "A set price", sub: "agreed today", icon: "pen" },
            { label: "A future date", sub: "when the deal is due", icon: "calendar" },
            { label: "Traders trade the contract", sub: "to profit from price moves", icon: "candles", tone: "up" },
          ],
        },
      },
      callout: {
        tone: "warn",
        text: "Futures use leverage: a small deposit controls a large position, so gains and losses are both magnified. Unit 2 shows exactly how.",
      },
    },
    {
      kind: "truefalse",
      id: "futures-ownership",
      statement: "Buying a gold futures contract means you own physical gold right now.",
      answer: false,
      explain:
        "You hold an agreement about a future date, not the metal. Almost all traders close the contract before it expires and never take delivery.",
    },
    {
      kind: "choice",
      id: "saturday-market",
      prompt: "You want to practise on a Saturday afternoon. Which market is open?",
      options: ["Crypto", "US stocks", "Forex", "Index futures like NQ"],
      answer: 0,
      explain: "Stocks, forex and index futures all pause for the weekend. Crypto keeps trading.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Stocks are ownership in a company; indices track baskets of them.",
        "Forex trades one currency against another, around the clock on weekdays.",
        "Commodities are raw materials like gold and oil.",
        "Crypto trades 24/7 and moves fast.",
        "Futures are leveraged contracts on indices, commodities, currencies and crypto.",
      ],
    },
  ],
}
