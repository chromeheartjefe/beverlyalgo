import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u2-the-order-book-and-liquidity",
  sources: [
    "Ozenbas, Pagano, Schwartz and Weber, Liquidity, Markets and Trading in Action (Springer, 2022, CC BY 4.0)",
    "Investor.gov (U.S. SEC): types of orders",
  ],
  steps: [
    {
      kind: "learn",
      title: "Inside the order book",
      body: [
        "The **order book** is the list of every order waiting to be filled. Sellers' asks sit above, buyers' bids sit below, and each price level shows how much is waiting there.",
        "The best ask and the best bid face each other across the spread. Behind them are deeper levels, called **depth**.",
      ],
      visual: { type: "figure", id: "order-book" },
    },
    {
      kind: "learn",
      title: "What liquidity means",
      body: [
        "**Liquidity** is how much you can buy or sell without moving the price much.",
        "A **deep** book has large size at every level, close together. Orders get filled near the price you see. A **thin** book has little size and gaps between levels, so even a modest order pushes the price around.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Deep book",
              icon: "layers",
              tone: "up",
              points: ["Large size at every level", "Levels close together", "Fills near the price you see"],
            },
            { title: "Thin book", icon: "alert", tone: "warn", points: ["Little size", "Gaps between levels", "A modest order moves the price"] },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "fill-levels",
      prompt: "The book shows 150 for sale at 100.05 and 500 at 100.10. You buy 400 at market. How many fill at 100.10?",
      answer: 250,
      tolerance: 0,
      explain: "The first 150 fill at the best ask, 100.05. The remaining 250 fill at the next level, 100.10.",
    },
    {
      kind: "truefalse",
      id: "thin-market",
      statement: "In a thin market, a single large order can move the price a lot.",
      answer: true,
      explain: "With little size waiting at each level, a large order eats through several levels and the price jumps.",
    },
    {
      kind: "choice",
      id: "more-liquid",
      prompt: "Which order book is more liquid?",
      options: [
        "Thousands of contracts at every level, each level 0.25 apart",
        "A few contracts per level, with big gaps between levels",
        "Only one seller and one buyer",
        "An empty book",
      ],
      answer: 0,
      explain: "Lots of size, tightly packed, means you can trade big without moving the price. That is liquidity.",
    },
    {
      kind: "learn",
      title: "Liquidity you can't see",
      body: [
        "The visible book is only part of the story. Big traders hide their size, showing a little at a time (so-called iceberg orders).",
        "And a huge pool of orders isn't in the book at all yet: **stop orders**. Traders' stop-losses and breakout orders cluster just above old highs and just below old lows, waiting to be triggered.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "Where stop orders wait",
          points: [50, 56, 53, 60, 57, 62, 55, 58, 51, 54, 48, 52, 49, 55, 58],
          marks: [{ at: 5, label: "Old high" }, { at: 10, label: "Old low", side: "below" }],
          levels: [{ price: 64, label: "Stops cluster just above", tone: "warn" }, { price: 46, label: "Stops cluster just below", tone: "warn" }],
        },
      },
      callout: {
        tone: "tip",
        text: "Those clusters of stops are what Smart Money traders call liquidity pools. Large players need lots of orders to trade against, so price is often drawn to them. That idea is the core of Level 3.",
      },
    },
    {
      kind: "choice",
      id: "why-old-highs",
      prompt: "Why do Smart Money traders expect price to often reach just above an obvious old high?",
      options: [
        "Many stop orders and breakout buy orders are waiting there",
        "Exchanges move price to round numbers",
        "Old highs are always broken eventually",
        "Charts are drawn to make highs look important",
      ],
      answer: 0,
      explain:
        "Short sellers' stops and breakout traders' buy orders sit just above obvious highs. That cluster is liquidity that large traders can fill against.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "The order book lists every waiting order: asks above, bids below.",
        "Liquidity is how much you can trade without moving the price.",
        "Deep books absorb big orders; thin books jump.",
        "Stop orders clustered beyond highs and lows are hidden liquidity.",
      ],
    },
  ],
}
