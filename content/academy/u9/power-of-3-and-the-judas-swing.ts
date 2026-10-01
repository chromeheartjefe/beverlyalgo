import { D, DAY, dayTimeLabels } from "@/content/academy/l3/setups"
import type { LessonContent } from "@/lib/academy/types"

export const lesson: LessonContent = {
  id: "u9-power-of-3-and-the-judas-swing",
  sources: ["ICT terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "Every candle has three acts",
      body: [
        "ICT's **Power of 3** (also called **AMD**) says that a candle, especially the daily candle, is built in three phases:",
        "**Accumulation**: quiet trading around the open. **Manipulation**: a false move in the wrong direction that runs stops. **Distribution**: the real move, which forms the bulk of the candle.",
      ],
      visual: { type: "figure", id: "power-of-three" },
    },
    {
      kind: "learn",
      title: "The Judas swing",
      body: [
        "The manipulation phase is often called the **Judas swing**: a betrayal move early in the session that looks like the start of the day's trend, traps traders on the wrong side, then reverses.",
        "On a bullish day, the Judas swing usually drops **below the open** (and often below the Asian low), creating the day's low. On a bearish day, it spikes above the open to make the day's high.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles: DAY,
          decimals: 2,
          timeLabels: dayTimeLabels(3),
          sessions: [
            { from: D.asianFrom, to: 7, label: "A", tone: "neutral" },
            { from: 8, to: 10, label: "M", tone: "down" },
            { from: 11, to: 17, label: "D", tone: "up" },
          ],
          annotations: [
            { kind: "line", from: [D.midnight, D.midnightOpen], to: [DAY.length - 1, D.midnightOpen], tone: "warn", dashed: true },
            { kind: "marker", index: D.judas, at: "low", text: "Judas swing", tone: "down" },
          ],
          caption: "Illustrative: accumulation, manipulation, distribution (New York time)",
        },
      },
    },
    {
      kind: "match",
      id: "amd",
      prompt: "Match each phase to what happens.",
      pairs: [
        ["Accumulation", "Quiet range around the open"],
        ["Manipulation", "A false move that runs stops"],
        ["Distribution", "The real move of the day"],
      ],
      explain: "Quiet build-up, a stop run the wrong way, then the real move.",
    },
    {
      kind: "choice",
      id: "bullish-day-shape",
      prompt: "On a bullish Power of 3 day, what does the daily candle usually look like?",
      options: [
        "A long lower wick below the open and a close near the high",
        "A long upper wick and a close near the low",
        "A tiny doji",
        "A gap down that never recovers",
      ],
      answer: 0,
      explain: "The manipulation leaves the lower wick below the open; distribution drives the close near the high.",
    },
    {
      kind: "truefalse",
      id: "judas-real",
      statement: "The Judas swing is usually the start of the day's real trend.",
      answer: false,
      explain: "It is the fake-out. The real move comes after it, in the opposite direction.",
    },
    {
      kind: "learn",
      title: "Using it",
      body: [
        "If your higher-timeframe bias is bullish, Power of 3 tells you **when** to look for a buy: after a manipulation below the open, ideally a sweep of the Asian low in the London killzone, followed by an MSS on a lower timeframe.",
        "If the drop below the open just keeps going, the bias was wrong, and your stop protects you.",
      ],
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Power of 3: accumulation, manipulation, distribution.",
        "The Judas swing is the manipulation: a false move that runs stops.",
        "Bullish days often dip below the open before rallying.",
        "Combine with bias, killzones and an MSS for timing.",
      ],
    },
  ],
}
