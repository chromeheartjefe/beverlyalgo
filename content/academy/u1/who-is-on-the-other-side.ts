import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Sell-off, a long flat base where a big buyer quietly fills, then the rally
// once their buying has soaked up the sellers.
const absorption = candlesFromCloses(
  pathCloses([[0, 105], [10, 101.6], [14, 100.8], [17, 101.3], [20, 100.9], [23, 101.4], [33, 106.2]], { noise: 0.3, seed: 7 }),
  { wick: 0.5, seed: 7 },
)

export const lesson: LessonContent = {
  id: "u1-who-is-on-the-other-side",
  sources: [
    "Investor.gov (U.S. SEC): market makers and how trades are executed",
    "CFTC Learn & Protect: hedgers and speculators in futures markets",
    "Ozenbas, Pagano, Schwartz and Weber, Liquidity, Markets and Trading in Action (Springer, 2022, CC BY 4.0)",
  ],
  steps: [
    {
      kind: "learn",
      title: "Someone takes the other side",
      body: [
        "When you buy, someone sells to you. When you sell, someone buys from you.",
        "So who are those people? Knowing who you are trading against explains a lot about how and why price moves.",
      ],
      visual: { type: "figure", id: "market-participants" },
    },
    {
      kind: "learn",
      title: "Retail traders",
      body: [
        "**Retail traders** trade their own money through a broker or an app. That is you.",
        "There are millions of retail traders, but each one is small. Together they matter. Alone, a retail order barely moves the price.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Retail traders",
          columns: [
            { title: "One of them", icon: "user", tone: "neutral", points: ["Trades their own money", "A small order", "Barely moves the price"] },
            { title: "All of them", icon: "users", tone: "accent", points: ["Millions of traders", "Together they matter"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Institutions",
      body: [
        "**Institutions** manage huge pools of money: pension funds, mutual funds, hedge funds, banks and insurers. One of them can want to buy more in a day than thousands of retail traders combined.",
        "An order that big can't be filled all at once without pushing the price against itself. So institutions split it into pieces over hours or days, and they look for places where many other orders are waiting to take the other side.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: absorption,
          decimals: 2,
          annotations: [{ kind: "zone", from: 12, to: 23, top: 101.9, bottom: 100.3, label: "A fund buys quietly", tone: "accent" }],
          caption: "Illustrative. Each bar is one hour: green closed higher, red closed lower. Unit 3 teaches you to read them.",
        },
      },
      callout: {
        tone: "tip",
        text: "That need for lots of waiting orders is called liquidity. It sits at the heart of Smart Money Concepts, which you will study in depth in Level 3.",
      },
    },
    {
      kind: "choice",
      id: "split-orders",
      prompt: "Why does a large fund usually split a huge buy order into many smaller pieces?",
      options: [
        "Buying everything at once would push the price up against itself",
        "Exchanges only accept small orders",
        "Small orders have no fees",
        "To keep the trade off the chart",
      ],
      answer: 0,
      explain:
        "A huge order would eat through every seller at the current price and keep paying more. Splitting it up gets a better average price.",
    },
    {
      kind: "learn",
      title: "Market makers",
      body: [
        "**Market makers** (also called liquidity providers) are firms that post a price to buy and a price to sell at the same time, all day long. They earn the small gap between the two, called the **spread**.",
        "Thanks to them you can almost always buy or sell instantly, even when no other trader happens to be clicking at that exact second.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "How a market maker earns the spread",
          nodes: [
            { label: "A seller", sub: "sells at the lower price", icon: "user" },
            { label: "Market maker", sub: "quotes both prices all day", icon: "scale", tone: "accent" },
            { label: "A buyer", sub: "buys at the higher price", icon: "user" },
          ],
        },
        caption: "The small gap between the two prices is the market maker's income.",
      },
    },
    {
      kind: "truefalse",
      id: "mm-quotes",
      statement: "A market maker quotes both a price to buy and a price to sell.",
      answer: true,
      explain:
        "That is the job: always ready to buy a little lower and sell a little higher, and earn the spread between the two.",
    },
    {
      kind: "learn",
      title: "Algorithms and high-frequency traders",
      body: [
        "Much of today's trading is done by computer programs. **High-frequency traders** (HFT) send and cancel orders in millionths of a second, collecting tiny price differences many times over.",
        "You will never beat them on speed, and you don't need to. Human traders work on timeframes of minutes, hours and days, where a microsecond makes no difference.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Two different games",
          columns: [
            { title: "High-frequency", icon: "cpu", tone: "warn", points: ["Millionths of a second", "Tiny price differences", "Many times over"] },
            { title: "Human traders", icon: "user", tone: "up", points: ["Minutes, hours and days", "A microsecond makes no difference"] },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Hedgers and central banks",
      body: [
        "**Hedgers** use markets to reduce risk, not to bet. An airline buys oil futures to lock in next year's fuel cost. A farmer sells wheat futures to lock in a harvest price.",
        "**Central banks**, such as the US Federal Reserve, set interest rates, and some step into currency markets from time to time. Their decisions can move every market at once.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Hedgers",
              icon: "shield",
              tone: "up",
              points: ["Reduce risk, not bet", "An airline locks in fuel cost", "A farmer locks in a harvest price"],
            },
            { title: "Central banks", icon: "bank", tone: "accent", points: ["Set interest rates", "Can move every market at once"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "airline-role",
      prompt: "An airline buys oil futures to lock in its fuel price for next year. What role is it playing?",
      options: ["Hedger", "Market maker", "High-frequency trader", "Retail trader"],
      answer: 0,
      explain: "It is protecting its business against a rise in fuel prices, not betting on one. That is hedging.",
    },
    {
      kind: "learn",
      title: "Why this matters to you",
      body: [
        "The trader on the other side of your order often has more money, more information or more speed than you. After spreads and fees, short-term trading is a hard game.",
        "That is not a reason to quit. It is why this course spends so much time on **risk management**, and on understanding where the big orders sit.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "The other side of your order",
          items: [
            { text: "Often has more money", mark: "bad" },
            { text: "Often has more information", mark: "bad" },
            { text: "Often has more speed", mark: "bad" },
            { text: "Your answer: risk management, and knowing where the big orders sit", mark: "ok" },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "retail-moves",
      statement: "A single retail trader's order usually moves the price a lot.",
      answer: false,
      explain:
        "A typical retail order is tiny next to the orders of institutions and market makers. Price moves when large amounts of buying or selling hit the market.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Retail traders are many but small.",
        "Institutions trade huge size and must split their orders.",
        "Market makers quote both sides and earn the spread.",
        "Algorithms and HFT trade at speeds no human can match.",
        "Hedgers reduce risk; central banks can move everything at once.",
      ],
    },
  ],
}
