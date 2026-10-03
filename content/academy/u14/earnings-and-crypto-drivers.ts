import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u14-earnings-and-crypto-drivers",
  sources: [
    "Investor.gov (U.S. SEC): reading earnings reports",
    "The Bitcoin protocol: block subsidy halving every 210,000 blocks",
  ],
  steps: [
    {
      kind: "learn",
      title: "Earnings season",
      body: [
        "Public companies report results every quarter. Most reports land in the few weeks after each quarter ends, a stretch called **earnings season**.",
        "Traders compare **earnings per share (EPS)** and **revenue** with analysts' estimates, but the **guidance** (what management expects next) often moves the stock most. Reports usually come before the open or after the close, so stocks often **gap**.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "What traders read in a report",
          columns: [
            { title: "EPS", icon: "coins", tone: "accent", points: ["Earnings per share", "Against analysts' estimates"] },
            { title: "Revenue", icon: "chart", tone: "accent", points: ["Against analysts' estimates"] },
            { title: "Guidance", icon: "eye", tone: "up", points: ["What management expects next", "Often moves the stock most"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "guidance",
      prompt: "A company beats EPS and revenue estimates but cuts its forecast for next year. What is a likely reaction?",
      options: ["The stock falls on the weak guidance", "The stock must rise because it beat", "Nothing, guidance doesn't matter", "Trading is halted for a month"],
      answer: 0,
      explain: "Markets look forward. A lower forecast can outweigh a good past quarter.",
    },
    {
      kind: "learn",
      title: "Big tech moves the indices",
      body: [
        "A handful of very large companies make up a big part of the Nasdaq-100 and S&P 500. Their earnings can move NQ and ES on their own, even after hours.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "A handful of very large companies", icon: "building" },
            { label: "A big part of the Nasdaq-100 and S&P 500", icon: "layers", tone: "accent" },
            { label: "Their earnings", icon: "news", tone: "warn" },
            { label: "Can move NQ and ES", sub: "even after hours", icon: "candles", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "What moves crypto",
      body: [
        "Crypto has no earnings, but it has its own drivers. **The halving**: roughly every four years (every 210,000 blocks), the new Bitcoin issued per block is cut in half. **Fund flows**, such as money moving into or out of spot Bitcoin ETFs. **Regulation** and enforcement news. **Exchange events**: hacks or collapses, like FTX in 2022. And the same **macro** forces as other risk assets, like interest rates.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Crypto's own drivers",
          items: [
            { text: "The halving: new Bitcoin per block is cut in half", mark: "dot" },
            { text: "Fund flows, such as spot Bitcoin ETFs", mark: "dot" },
            { text: "Regulation and enforcement news", mark: "dot" },
            { text: "Exchange events: hacks or collapses", mark: "dot" },
            { text: "Macro forces, like interest rates", mark: "dot" },
          ],
        },
      },
    },
    {
      kind: "match",
      id: "drivers",
      prompt: "Match each driver to its market.",
      pairs: [
        ["Quarterly guidance", "Stocks"],
        ["The halving", "Bitcoin"],
        ["ETF inflows and outflows", "Spot crypto"],
        ["Big tech earnings", "Nasdaq-100 futures"],
      ],
      explain: "Each market has its own calendar of scheduled shocks.",
    },
    {
      kind: "truefalse",
      id: "halving-yearly",
      statement: "The Bitcoin halving happens every year.",
      answer: false,
      explain: "It happens every 210,000 blocks, which works out to roughly every four years.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Earnings season follows each quarter; guidance often matters most.",
        "Reports outside market hours cause gaps.",
        "Big tech earnings can move the whole index.",
        "Crypto drivers: halving, ETF flows, regulation, exchange events, macro.",
      ],
    },
  ],
}
