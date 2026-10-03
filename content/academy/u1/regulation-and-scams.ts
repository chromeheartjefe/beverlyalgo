import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u1-regulation-and-scams",
  sources: [
    "CFTC Learn & Protect: forex fraud and relationship investment scam advisories",
    "Investor.gov (U.S. SEC): investor alerts and bulletins",
    "FINRA BrokerCheck and NFA BASIC (registration lookups)",
  ],
  steps: [
    {
      kind: "learn",
      title: "Who watches the markets",
      body: [
        "Regulators license firms, set rules and go after fraud. In the United States, the **SEC** oversees stocks and the **CFTC** oversees futures and forex, with the **NFA** and **FINRA** registering the firms and people who serve customers.",
        "Other countries have their own: the FCA in the UK, ASIC in Australia, and national regulators across the EU coordinated by ESMA.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "Regulators",
          columns: [
            {
              title: "United States",
              icon: "bank",
              tone: "accent",
              points: ["SEC: stocks", "CFTC: futures and forex", "NFA and FINRA register firms"],
            },
            { title: "United Kingdom", icon: "bank", tone: "accent", points: ["FCA"] },
            {
              title: "Australia, EU",
              icon: "bank",
              tone: "accent",
              points: ["ASIC in Australia", "National regulators in the EU, coordinated by ESMA"],
            },
          ],
        },
      },
      callout: {
        tone: "tip",
        text: "Before you send money, look the firm up on its regulator's register: FINRA BrokerCheck or NFA BASIC in the US, the FCA register in the UK, ASIC in Australia.",
      },
    },
    {
      kind: "choice",
      id: "where-to-check",
      prompt: "A forex dealer says it serves US customers. Where can you check that it is registered?",
      options: ["NFA BASIC", "The firm's own Instagram page", "A Telegram group run by the firm", "Its customer reviews on its own website"],
      answer: 0,
      explain:
        "NFA BASIC is the public lookup for firms registered with the CFTC and NFA. A firm's own pages and groups prove nothing.",
    },
    {
      kind: "learn",
      title: "The classic red flags",
      body: [
        "Regulators publish the same warning signs again and again:",
        "**Guaranteed returns** or \"risk-free\" profits. **Pressure to act now.** An unregistered firm, often offshore. Payment asked in crypto or gift cards. A friendly \"account manager\" who found you on social media. Withdrawals that are suddenly blocked or slow.",
        "No real trader can guarantee returns. Markets don't allow it.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "checklist",
          title: "Red flags regulators keep warning about",
          items: [
            { text: "Guaranteed or \"risk-free\" returns", mark: "bad" },
            { text: "Pressure to act now", mark: "bad" },
            { text: "An unregistered firm, often offshore", mark: "bad" },
            { text: "Payment asked in crypto or gift cards", mark: "bad" },
            { text: "An \"account manager\" from social media", mark: "bad" },
            { text: "Withdrawals suddenly blocked or slow", mark: "bad" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "biggest-red-flag",
      prompt: "Which offer is the clearest sign of a scam?",
      options: [
        "\"Guaranteed 10% profit every week\"",
        "\"Past results don't guarantee future returns\"",
        "\"Trading involves risk of loss\"",
        "\"You can withdraw at any time\"",
      ],
      answer: 0,
      explain: "Guaranteed returns are impossible in real markets. Any firm or person promising them is either lying or taking risks it isn't telling you about.",
    },
    {
      kind: "learn",
      title: "Relationship scams and fake platforms",
      body: [
        "A fast-growing fraud starts with a friendly message from a stranger, sometimes a romance. After weeks of chatting they share a \"secret\" trading platform. The app shows big, fake profits.",
        "When you try to withdraw, you are told to pay a \"tax\" or \"release fee\" first. The money is gone, and so is the platform. US regulators have warned about this pattern repeatedly.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "How the fake-platform scam runs",
          nodes: [
            { label: "A friendly message", sub: "from a stranger", icon: "message" },
            { label: "Weeks of chatting", icon: "heart" },
            { label: "A \"secret\" platform", icon: "phone", tone: "warn" },
            { label: "Big profits on screen", sub: "all fake", icon: "trending-up", tone: "warn" },
            { label: "A fee to withdraw", sub: "then the money is gone", icon: "ban", tone: "down" },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "release-fee",
      statement: "A legitimate trading platform may ask you to pay a release fee before you can withdraw your profits.",
      answer: false,
      explain:
        "Real brokers deduct any fees from your account. A demand to send new money before you can withdraw is a hallmark of fraud.",
    },
    {
      kind: "learn",
      title: "Gurus, signals and screenshots",
      body: [
        "Social media is full of winning trade screenshots. Screenshots are easy to fake or cherry-pick: you see the winners, never the losers or the account size.",
        "Judge any educator, signal group or tool, including EntrixAlgo, by its process and its full track record, never by a highlight reel. Be extra careful with anyone selling a course and promising you'll quit your job.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "A winning screenshot",
          columns: [
            { title: "What it shows", icon: "eye", tone: "up", points: ["The winners"] },
            { title: "What it hides", icon: "lock", tone: "down", points: ["The losers", "The account size", "The full track record"] },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "judge-a-guru",
      prompt: "Someone posts daily winning trades and sells a signal group. What is the best evidence they are any good?",
      options: [
        "A full, verified record of every trade, losers included",
        "More screenshots of big wins",
        "Photos of their car",
        "Thousands of followers",
      ],
      answer: 0,
      explain: "Only a complete, independently verified record shows real performance. Wins, cars and followers can all be selected or bought.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Regulators license firms; always look a firm up on the official register.",
        "Guaranteed returns and pressure to act now are classic scam signs.",
        "Fake platforms show fake profits and demand fees before withdrawals.",
        "Screenshots prove nothing; ask for a full, verified track record.",
      ],
    },
  ],
}
