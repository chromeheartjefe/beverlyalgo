import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u7-what-liquidity-means-in-smc",
  sources: [
    "Ozenbas, Pagano, Schwartz and Weber, Liquidity, Markets and Trading in Action (Springer, 2022, CC BY 4.0)",
    "Smart Money Concepts and ICT terminology as commonly taught; explained here in our own words",
  ],
  steps: [
    {
      kind: "learn",
      title: "Welcome to Level 3",
      body: [
        "This level teaches **Smart Money Concepts (SMC)** and the ideas popularised by the trader known as **ICT** (Inner Circle Trader). It is widely taught to retail traders today.",
        "Treat it the way this course treats everything: as a framework to understand and test, not as proven truth. There is little formal research on it. Your own honest backtests are the evidence that counts.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "How to treat Smart Money Concepts",
          nodes: [
            { label: "A framework", sub: "not proven truth", icon: "book", tone: "accent" },
            { label: "Understand it", icon: "brain" },
            { label: "Test it", sub: "honest backtests", icon: "search", tone: "warn" },
            { label: "Your evidence", sub: "the kind that counts", icon: "check", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Liquidity, the SMC way",
      body: [
        "In Unit 2, liquidity meant how easily you can trade. In SMC it also means **where orders are waiting**, especially stop orders.",
        "A fund that wants to buy a huge amount needs a huge amount of selling to buy from. Where can it find that? Wherever many traders' sell stops sit: just below obvious lows. That is why SMC traders say **price is drawn to liquidity**.",
      ],
      visual: { type: "figure", id: "liquidity-sweep" },
    },
    {
      kind: "choice",
      id: "why-need",
      prompt: "Why would a large buyer want price to dip below an obvious low first?",
      options: [
        "The sell stops below the low give it plenty of selling to buy from",
        "Exchanges give discounts below old lows",
        "It wants to lose money on purpose",
        "Old lows are always the cheapest prices of the year",
      ],
      answer: 0,
      explain: "Triggered sell stops are market sell orders. A big buyer can fill a large order against them without chasing price higher.",
    },
    {
      kind: "learn",
      title: "Where the stops are",
      body: [
        "Traders who are **long** usually put stop-losses just **below** a recent low. Traders who are **short** put them just **above** a recent high. Breakout traders add buy stops above highs and sell stops below lows.",
        "So every obvious high has a pool of buy orders sitting above it, and every obvious low a pool of sell orders below it. The more obvious the level, the bigger the pool.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "Orders sit beyond obvious highs and lows",
          points: [101, 104, 101.5, 103.2, 99.5, 102, 101],
          marks: [{ at: 1, label: "Buy orders above the high", tone: "up" }, { at: 4, label: "Sell orders below the low", tone: "down", side: "below" }],
        },
        caption: "The more obvious the level, the bigger the pool.",
      },
    },
    {
      kind: "truefalse",
      id: "long-stops",
      statement: "Traders who are long usually place their stop-losses just above recent highs.",
      answer: false,
      explain: "Longs protect themselves below recent lows. It is short sellers whose stops sit above highs.",
    },
    {
      kind: "learn",
      title: "Is someone hunting you?",
      body: [
        "SMC talks about \"smart money\" as if a single big player were moving price to trap retail traders. Reality is less personal: many large participants, algorithms and market makers simply go where the orders are, because that is where big size can be traded.",
        "You don't need to believe in a villain to use the idea. You only need to notice that obvious stop clusters often get taken before the real move.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "The story", icon: "user", tone: "warn", points: ["A single big player", "Moving price to trap retail traders"] },
            {
              title: "The reality",
              icon: "users",
              tone: "up",
              points: ["Many large participants, algorithms and market makers", "They go where the orders are", "That is where big size can trade"],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "most-liquidity",
      prompt: "Which level probably has the most stop orders resting beyond it?",
      options: [
        "A clean double bottom that everyone on social media is pointing at",
        "A random price in the middle of a range",
        "A level no one has ever traded at",
        "The current price",
      ],
      answer: 0,
      explain: "Obvious levels attract obvious stops. The more traders see the same low, the more sell orders pile up below it.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "SMC and ICT are frameworks to test, not proven laws.",
        "In SMC, liquidity means resting orders, especially stops.",
        "Longs' stops sit below lows; shorts' stops above highs.",
        "Large players need those orders to fill big size, so price is drawn to them.",
      ],
    },
  ],
}
