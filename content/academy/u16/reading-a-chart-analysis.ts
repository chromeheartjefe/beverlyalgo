import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u16-reading-a-chart-analysis",
  sources: ["EntrixAlgo Chart Analysis"],
  steps: [
    {
      kind: "learn",
      title: "What Chart Analysis does",
      body: [
        "**Chart Analysis** reads a screenshot of any chart and returns a structured trade plan: a **signal** (BUY, SELL or NEUTRAL), a **confidence** grade, an **entry** (or limit entry), two targets (**TP1** and **TP2**), a **stop loss**, and the **risk to reward**.",
        "It is a Pro tool. Free accounts with a verified email get one free analysis to try it.",
      ],
      visual: { type: "figure", id: "analysis-readout" },
    },
    {
      kind: "learn",
      title: "Better screenshots, better levels",
      body: [
        "The AI reads prices from the image, so give it a clear one. **Zoom price text** to about 125% or more, **show the ticker and timeframe** labels, and **keep the price axis on screen**.",
        "A blurry chart or one without a price axis can't produce exact levels.",
      ],
    },
    {
      kind: "choice",
      id: "screenshot",
      prompt: "Which screenshot will give the most accurate levels?",
      options: [
        "A sharp chart with the ticker, timeframe and price axis visible",
        "A cropped chart with the price axis cut off",
        "A photo of your monitor taken from an angle",
        "A zoomed-out chart where the price text is tiny",
      ],
      answer: 0,
      explain: "The AI calculates levels from the prices it can read. Clear labels and a visible axis make that possible.",
    },
    {
      kind: "learn",
      title: "Confidence and NEUTRAL",
      body: [
        "**Confidence** is a grade of setup quality: how many factors line up. It is not the chance of winning.",
        "**NEUTRAL** means no trade: the chart doesn't offer a setup with a clear edge and at least 1:1.5 reward to risk. Instead you get **long above** and **short below** levels. Wait for a candle to close beyond one, then run a fresh analysis.",
      ],
    },
    {
      kind: "truefalse",
      id: "confidence",
      statement: "A confidence of 84% means the trade has an 84% chance of winning.",
      answer: false,
      explain: "Confidence grades how well the setup lines up. Even great setups lose often; that's what your stop and sizing are for.",
    },
    {
      kind: "learn",
      title: "Limit entries",
      body: [
        "When the readout says **Limit Entry**, the plan is to place a limit order at that price rather than buy at the current price. If price reaches TP1 without filling your order, the setup is gone: don't chase it.",
        "That is the same discipline as the MSS and FVG model from Level 3: no fill, no trade.",
      ],
    },
    {
      kind: "numeric",
      id: "rr",
      prompt: "A readout shows entry 100, stop 98 and TP2 105. What is the reward to risk to TP2?",
      answer: 2.5,
      tolerance: 0.001,
      suffix: ": 1",
      explain: "Risk is 2 (100 − 98), reward is 5 (105 − 100): 5 ÷ 2 = 2.5.",
    },
    {
      kind: "learn",
      title: "Using it the right way",
      body: [
        "Treat Chart Analysis as a fast, structured **second opinion**, not as an order to trade. Check it against your own bias, the killzone and the news calendar. Then size the position from its stop with the **Risk Calculator**, never from a gut feeling.",
        "AI can misread charts. If a level looks wrong to you, it might be.",
      ],
    },
    {
      kind: "choice",
      id: "after-readout",
      prompt: "Chart Analysis gives a BUY with a stop and targets. What should you do next?",
      options: [
        "Check it against your own analysis, then size it from the stop with the Risk Calculator",
        "Enter immediately with your full account",
        "Ignore the stop because confidence is high",
        "Take the opposite trade",
      ],
      answer: 0,
      explain: "The readout is input to your process. Your plan, your context and your position sizing still decide the trade.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Chart Analysis turns a screenshot into a signal, entry, TP1, TP2, stop and R:R.",
        "Clear screenshots: legible prices, ticker and timeframe, price axis visible.",
        "Confidence grades setup quality, not win probability; NEUTRAL means wait.",
        "Use it as a second opinion and size from its stop.",
      ],
    },
  ],
}
