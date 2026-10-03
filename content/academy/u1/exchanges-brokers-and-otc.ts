import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u1-exchanges-brokers-and-otc",
  sources: [
    "Investor.gov (U.S. SEC): brokers, exchanges and how orders are executed",
    "CFTC Learn & Protect: retail foreign exchange dealers",
  ],
  steps: [
    {
      kind: "learn",
      title: "Exchanges: one central meeting place",
      body: [
        "An **exchange** is an organised marketplace where buy and sell orders meet in one central order book, under one set of rules. The NYSE and Nasdaq list stocks. CME lists futures such as NQ, ES and gold. Coinbase and Binance are crypto exchanges. Stock and futures exchanges are regulated; how far crypto exchanges are depends on the country.",
        "Everyone trading on the same exchange sees the same book and the same prices at the same moment. One asset can trade on several exchanges at once, each with its own book: a US stock on more than a dozen, Bitcoin on many crypto exchanges at slightly different prices.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Where things are listed",
          items: [
            { text: "NYSE and Nasdaq: stocks", mark: "dot" },
            { text: "CME: futures such as NQ, ES and gold", mark: "dot" },
            { text: "Coinbase and Binance: crypto", mark: "dot" },
            { text: "One order book per exchange, seen by everyone on it", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Brokers: your door to the market",
      body: [
        "You usually can't trade on an exchange directly. You open an account with a **broker**, and the broker sends your orders to the market for you.",
        "Some brokers pass your order on to an exchange or another firm. Others, common in forex and CFDs, take the other side of your trade themselves. That is legal when it is disclosed, but it means your broker can profit when you lose.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "The path of your order",
          nodes: [
            { label: "You", icon: "user" },
            { label: "Your broker", sub: "your door to the market", icon: "door", tone: "accent" },
            { label: "The market", sub: "an exchange or another firm", icon: "building" },
          ],
        },
        caption: "Some brokers pass the order on. Others take the other side of it themselves.",
      },
    },
    {
      kind: "truefalse",
      id: "broker-always-routes",
      statement: "A broker always just passes your order on to an exchange.",
      answer: false,
      explain:
        "Many do, but some brokers act as the dealer and take the other side of your trade themselves. Read how your broker executes orders before you fund an account.",
    },
    {
      kind: "learn",
      title: "OTC: trading without a central exchange",
      body: [
        "**Over the counter (OTC)** means trading directly between two parties, usually through dealers, without one central exchange. Spot forex is the biggest OTC market in the world.",
        "With no single central order book, each dealer streams its own prices. They are almost always very close, but they are not identical. That is why your EUR/USD chart and a friend's at another broker can differ by a fraction.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Exchange", icon: "building", tone: "up", points: ["One central order book", "Everyone on it sees the same price"] },
            {
              title: "OTC",
              icon: "globe",
              tone: "warn",
              points: ["No central exchange", "Each dealer streams its own prices", "Very close, not identical"],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "fx-price-differs",
      prompt: "Your EUR/USD price is slightly different from your friend's at another broker. What is the most likely reason?",
      options: [
        "Forex trades OTC, so each dealer quotes its own prices",
        "One of the charts is broken",
        "The exchange sends different prices to different people",
        "Prices are delayed by a full day at one broker",
      ],
      answer: 0,
      explain:
        "Spot forex has no single central exchange. Each broker or dealer quotes its own price, so small differences are normal.",
    },
    {
      kind: "learn",
      title: "Charting platforms are not brokers",
      body: [
        "Tools like TradingView show prices and let you draw and analyse. That is not where your money sits. The trade itself happens at your broker, even when you click Buy inside a charting app connected to it.",
        "The prices you analyse can also come from a different source than the prices you trade at. For forex and CFDs, check your broker's own chart before you rely on an exact level.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Charting platform",
              icon: "chart",
              tone: "neutral",
              points: ["Shows prices", "Lets you draw and analyse", "Your money is not there"],
            },
            {
              title: "Your broker",
              icon: "wallet",
              tone: "accent",
              points: ["Executes the trade", "Holds your money", "Its prices are the ones you get"],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "which-exchange",
      prompt: "Which of these is an exchange?",
      options: ["CME", "Your broker's mobile app", "TradingView", "A bank's currency desk"],
      answer: 0,
      explain:
        "CME is an exchange where futures trade in one central order book. A broker's app gives you access, TradingView is a charting platform, and a bank desk is a dealer.",
    },
    {
      kind: "learn",
      title: "A word on CFDs",
      body: [
        "A **CFD** (contract for difference) is a contract with your broker that pays out the change in an asset's price. You never own the asset. CFDs are popular in Europe, the UK and Australia, but they are not allowed for retail traders in the United States.",
        "Because the broker is often the other side of every CFD, regulators require brokers to publish how many of their clients lose money. You will see those numbers in the last lesson of this unit.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "A contract for difference",
          nodes: [
            { label: "You", icon: "user" },
            { label: "A contract with your broker", icon: "pen", tone: "accent" },
            { label: "Pays the change in price", sub: "you never own the asset", icon: "coins" },
          ],
        },
      },
      callout: {
        tone: "tip",
        text: "Before funding any broker, check that it is regulated where you live, that client money is held separately from the firm's own money, and that withdrawals are simple.",
      },
    },
    {
      kind: "truefalse",
      id: "cfd-ownership",
      statement: "When you buy a CFD on gold, you own gold.",
      answer: false,
      explain: "A CFD is only a contract with your broker about the price change. You never own the underlying asset.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "An exchange brings its orders into one central book that everyone on it can see.",
        "Brokers give you access; some take the other side of your trades.",
        "OTC markets like spot forex have no central exchange, so prices differ slightly by dealer.",
        "Charting platforms show prices; your broker executes the trade.",
        "CFDs are contracts with your broker, not ownership of the asset.",
      ],
    },
  ],
}
