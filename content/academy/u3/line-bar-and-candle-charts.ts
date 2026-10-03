import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u3-line-bar-and-candle-charts",
  sources: ["Chart types (line, bar and candlestick): standard definitions, explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Four prices for every slice of time",
      body: [
        "A chart splits time into equal slices: one minute, one hour, one day. For each slice, four prices tell the story: the **open** (first trade), the **high**, the **low** and the **close** (last trade). Traders call them **OHLC**.",
        "Different chart types draw those same four prices in different ways. Try all three below.",
      ],
      visual: { type: "figure", id: "chart-types" },
    },
    {
      kind: "learn",
      title: "Line and bar charts",
      body: [
        "A **line chart** joins only the closing prices. It is great for seeing the big picture, but it hides everything that happened inside each period: the spikes, the rejections, the real highs and lows.",
        "A **bar chart** draws each period as a vertical line from high to low, with a small tick on the left for the open and on the right for the close. It holds all four prices, but it takes practice to read quickly.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            {
              title: "Line chart",
              icon: "chart",
              tone: "accent",
              points: ["Joins only the closing prices", "Great for the big picture", "Hides the spikes and rejections"],
            },
            {
              title: "Bar chart",
              icon: "candles",
              tone: "up",
              points: ["A vertical line from high to low", "Left tick: the open", "Right tick: the close", "All four prices"],
            },
          ],
        },
      },
    },
    {
      kind: "learn",
      title: "Candlestick charts",
      body: [
        "**Candlesticks** go back to Japanese rice traders in the 1700s. They show the same four prices as a bar, but the area between open and close becomes a coloured **body**: usually green when price closed higher, red when it closed lower.",
        "That colour lets you see who won each period at a glance. It is why most traders use candles, and why the rest of this course does too.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "candles",
          title: "The body: the area between open and close",
          groups: [
            { label: "Closed higher", note: "Usually a green body", tone: "up", candles: [[100, 106, 98, 105]] },
            { label: "Closed lower", note: "Usually a red body", tone: "down", candles: [[105, 107, 99, 100]] },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "line-shows-wicks",
      statement: "A line chart shows the highs and lows of each period.",
      answer: false,
      explain: "A line chart only connects the closes. A spike to a new high that closed lower simply doesn't appear on it.",
    },
    {
      kind: "match",
      id: "chart-type-match",
      prompt: "Match each term to its description.",
      pairs: [
        ["Line chart", "Joins only the closing prices"],
        ["Bar chart", "Open and close shown as small side ticks"],
        ["Candlestick chart", "A coloured body between open and close"],
        ["OHLC", "Open, high, low and close"],
      ],
      explain: "All three chart types come from the same OHLC data. They only differ in how much of it they draw, and how.",
    },
    {
      kind: "choice",
      id: "glance-chart",
      prompt: "You want to see at a glance whether each hour closed up or down. Which chart type fits best?",
      options: ["Candlestick chart", "Line chart", "A table of closing prices", "A pie chart"],
      answer: 0,
      explain: "A candle's colour tells you instantly whether it closed above or below its open.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Every period has an open, high, low and close (OHLC).",
        "Line charts show only closes: clean but incomplete.",
        "Bar charts show all four prices with side ticks.",
        "Candlesticks show the same data with a coloured body, easiest to read.",
      ],
    },
  ],
}
