import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u14-inflation-and-cpi",
  sources: ["U.S. Bureau of Labor Statistics: Consumer Price Index"],
  steps: [
    {
      kind: "learn",
      title: "Measuring rising prices",
      body: [
        "The **Consumer Price Index (CPI)**, published monthly by the US Bureau of Labor Statistics at 8:30 am New York time, tracks the price of a basket of goods and services. Its change over a year is the headline inflation rate.",
        "**Core CPI** leaves out food and energy, which jump around, to show the underlying trend. Markets often care more about core.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Headline CPI",
              icon: "coins",
              tone: "accent",
              points: ["A basket of goods and services", "Its change over a year is the inflation rate"],
            },
            {
              title: "Core CPI",
              icon: "filter",
              tone: "up",
              points: ["Leaves out food and energy", "Shows the underlying trend", "Markets often care more about it"],
            },
          ],
        },
      },
    },
    {
      kind: "numeric",
      id: "yoy",
      prompt: "The CPI index was 300 a year ago and is 309 today. What is the yearly inflation rate?",
      answer: 3,
      tolerance: 0.001,
      suffix: "%",
      explain: "(309 − 300) ÷ 300 = 0.03, or 3%.",
    },
    {
      kind: "learn",
      title: "Why traders care",
      body: [
        "Inflation drives interest rates. A **hot** CPI (above forecast) makes rate hikes, or fewer cuts, more likely: the dollar tends to rise while stocks and gold tend to fall. A **cool** reading tends to do the opposite.",
        "CPI days are among the most volatile of the month, especially in the first minutes after 8:30 am.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          title: "When CPI comes in hot",
          nodes: [
            { label: "Hot CPI", sub: "above forecast", icon: "flame", tone: "warn" },
            { label: "Rate hikes more likely", sub: "or fewer cuts", icon: "percent" },
            { label: "Dollar tends to rise", icon: "trending-up", tone: "up" },
            { label: "Stocks and gold tend to fall", icon: "trending-down", tone: "down" },
          ],
        },
        caption: "A cool reading tends to do the opposite.",
      },
    },
    {
      kind: "choice",
      id: "hot-cpi",
      prompt: "Core CPI comes in well above forecast. What is the most typical first reaction?",
      options: [
        "The dollar rises, stock index futures fall",
        "The dollar falls, stock index futures rise",
        "Nothing moves",
        "Only crypto moves",
      ],
      answer: 0,
      explain: "Hotter inflation raises rate expectations, which supports the dollar and pressures stocks. The first reaction can still reverse.",
    },
    {
      kind: "truefalse",
      id: "core-def",
      statement: "Core CPI excludes food and energy prices.",
      answer: true,
      explain: "They are volatile, so leaving them out shows the underlying inflation trend more clearly.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "CPI measures consumer prices; monthly at 8:30 am New York time.",
        "Core CPI excludes food and energy.",
        "Hot CPI: rate hikes more likely, dollar up, stocks and gold down.",
        "CPI mornings are among the most volatile of the month.",
      ],
    },
  ],
}
