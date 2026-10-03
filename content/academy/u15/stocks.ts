import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-stocks",
  sources: ["Investor.gov (U.S. SEC): day trading, margin and short sales", "FINRA: intraday margin standards replacing the pattern day trader rule (approved by the SEC in April 2026)"],
  steps: [
    {
      kind: "learn",
      title: "The stocks playbook",
      body: [
        "**What you trade**: shares of individual companies, plus ETFs that track indices, sectors or themes. **When**: the US regular session, 9:30 am to 4:00 pm New York time, with thinner pre-market and after-hours sessions.",
        "**What drives them**: earnings and guidance, company news, the sector, and the overall market. Even good companies fall when the whole market sells off.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "timeline",
          title: "The US stock day, New York time",
          events: [
            { time: "Before the open", label: "Pre-market: thinner", tone: "neutral" },
            { time: "9:30 am", label: "Regular session opens", tone: "up" },
            { time: "4:00 pm", label: "Regular session closes", tone: "up" },
            { time: "After the close", label: "After-hours: thinner", tone: "neutral" },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Watch-outs",
      body: [
        "**Gaps**: overnight news and earnings make stocks open far from the last close, jumping over stops. **Liquidity**: large companies trade smoothly; tiny ones can be thin and easy to manipulate. **Shorting**: you need shares to borrow, may pay a fee, and can face squeezes.",
        "**Day trading rules**: in the US, the pattern day trader rule long required at least $25,000 in a margin account to day trade frequently. In 2026 it was replaced by new intraday margin standards, and brokers have until October 2027 to switch over, so check your broker's current rules.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "path",
          title: "A gap jumps over a stop",
          points: [100, 100.6, 100.2, 100.9, 100.5, 95.8, 96.3, 95.6, 96.1],
          marks: [{ at: 4, label: "Last close" }, { at: 5, label: "Next open", tone: "down", side: "below" }],
          levels: [{ price: 99, label: "Stop", tone: "down" }],
        },
        caption: "Overnight news or earnings make the stock open far from the last close.",
      },
    },
    {
      kind: "choice",
      id: "gap-risk",
      prompt: "You hold a stock overnight and the company reports bad earnings after the close. What risk does your stop face?",
      options: [
        "The stock can gap below it, and the fill comes at the much lower opening price",
        "None, stops always fill at their price",
        "The stop gets cancelled automatically",
        "The exchange reverses the earnings",
      ],
      answer: 0,
      explain: "With no trading overnight, the stock opens wherever the new price is. Your stop fills there, not at its level.",
    },
    {
      kind: "truefalse",
      id: "small-caps",
      statement: "Tiny, thinly traded stocks are usually the safest place for beginners.",
      answer: false,
      explain: "They move wildly on small orders, have wide spreads and are favourite targets for pump-and-dump schemes.",
    },
    {
      kind: "choice",
      id: "market-matters",
      prompt: "A company reports solid results, but the whole stock market falls 3% that day. What usually happens to its shares?",
      options: [
        "They are often dragged down with the market",
        "They always rise because results were solid",
        "They can't move on market days",
        "They are suspended",
      ],
      answer: 0,
      explain: "Most stocks move with the broader market. Company news competes with the overall tide.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Regular US session 9:30 am to 4:00 pm New York time.",
        "Earnings and news create overnight gaps.",
        "Prefer liquid stocks; avoid tiny, thin ones.",
        "Check your broker's day-trading and shorting rules.",
      ],
    },
  ],
}
