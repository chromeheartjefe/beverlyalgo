import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u15-stocks",
  sources: ["Investor.gov (U.S. SEC): day trading, margin and short sales", "FINRA: pattern day trader rules"],
  steps: [
    {
      kind: "learn",
      title: "The stocks playbook",
      body: [
        "**What you trade**: shares of individual companies, plus ETFs that track indices, sectors or themes. **When**: the US regular session, 9:30 am to 4:00 pm New York time, with thinner pre-market and after-hours sessions.",
        "**What drives them**: earnings and guidance, company news, the sector, and the overall market. Even good companies fall when the whole market sells off.",
      ],
    },
    {
      kind: "learn",
      title: "Watch-outs",
      body: [
        "**Gaps**: overnight news and earnings make stocks open far from the last close, jumping over stops. **Liquidity**: large companies trade smoothly; tiny ones can be thin and easy to manipulate. **Shorting**: you need shares to borrow, may pay a fee, and can face squeezes.",
        "**Day trading rules**: in the US, the pattern day trader rule has long required at least $25,000 in a margin account to day trade frequently. FINRA has proposed changing it, so check your broker's current rules.",
      ],
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
