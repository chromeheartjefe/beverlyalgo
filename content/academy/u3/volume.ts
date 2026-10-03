import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import type { ChartSpec, LessonContent } from "@/lib/academy/types"

// A tight range, then a breakout on candle 16 with by far the biggest volume.
const BREAKOUT = 16
const candles = candlesFromCloses(
  [...pathCloses([[0, 100], [4, 100.8], [8, 100.1], [12, 100.9], [15, 100.3]], { noise: 0.15, seed: 8 }), 102.2, 102.6, 102.4, 103.0, 103.3, 103.1, 103.6],
  { wick: 0.25, seed: 8 },
)
const volumes = [130, 110, 150, 120, 140, 100, 115, 135, 125, 105, 140, 120, 150, 110, 125, 160, 430, 260, 190, 210, 180, 150, 170]

const chart: ChartSpec = { candles, volumes, decimals: 2 }

export const lesson: LessonContent = {
  id: "u3-volume",
  sources: [
    "Investor.gov (U.S. SEC): trading volume",
    "CME Group: futures volume and open interest",
  ],
  steps: [
    {
      kind: "learn",
      title: "How much traded",
      body: [
        "**Volume** is how much of an asset changed hands during each candle: shares, contracts or coins. It is usually drawn as bars under the price chart.",
        "Price tells you where the market went. Volume tells you how many people took part in getting it there.",
      ],
      visual: {
        type: "chart",
        chart: { ...chart, reveal: true, caption: "Illustrative. Volume bars sit under the candles, coloured like the candle above." },
      },
    },
    {
      kind: "tap",
      id: "biggest-volume",
      prompt: "Tap the candle with the highest volume.",
      chart,
      targets: [BREAKOUT],
      explain: "The breakout candle traded roughly three times the normal volume: many traders acted at once as price left the range.",
    },
    {
      kind: "learn",
      title: "Reading volume",
      body: [
        "**Rising volume behind a move** suggests conviction: lots of traders are pushing in that direction. Moves on thin volume are often more fragile.",
        "Volume also spikes at session opens, on news, when many stops trigger together, and at the climax of long trends, when the last buyers or sellers finally give up.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          columns: [
            { title: "Rising volume", icon: "trending-up", tone: "up", points: ["Suggests conviction", "Lots of traders pushing that way"] },
            { title: "Thin volume", icon: "alert", tone: "warn", points: ["Moves are often more fragile"] },
            {
              title: "Volume spikes",
              icon: "zap",
              tone: "accent",
              points: ["Session opens", "News", "Many stops triggering", "The climax of a long trend"],
            },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "breakout-volume",
      prompt: "Price breaks out of a range on three times its normal volume. Compared with a breakout on very low volume, this one is generally...",
      options: [
        "More convincing, because many traders took part",
        "Less convincing, because volume was unusual",
        "Exactly the same",
        "Impossible to compare",
      ],
      answer: 0,
      explain: "Heavy participation shows real commitment behind the move. It is a tendency, not a guarantee, but low-volume breakouts fail more easily.",
    },
    {
      kind: "learn",
      title: "Volume in forex and crypto",
      body: [
        "Spot forex has no central exchange, so nobody sees the total volume. Forex platforms show **tick volume** instead: how many times your broker's price changed. It tracks activity reasonably well, but it is only your broker's slice.",
        "Futures, like those on CME, report real exchange volume. Crypto volume is reported per exchange, so the same coin shows different volume on different venues.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "compare",
          title: "What the volume bars really count",
          columns: [
            {
              title: "Spot forex",
              icon: "coins",
              tone: "warn",
              points: ["No central exchange", "Tick volume: how often your broker's price changed", "Only your broker's slice"],
            },
            { title: "Futures", icon: "building", tone: "up", points: ["Real exchange volume", "Like those on CME"] },
            { title: "Crypto", icon: "bitcoin", tone: "accent", points: ["Reported per exchange", "The same coin shows different volume"] },
          ],
        },
      },
    },
    {
      kind: "truefalse",
      id: "fx-volume",
      statement: "The volume on a spot forex chart shows the total volume traded across the whole forex market.",
      answer: false,
      explain: "It is tick volume from your own broker's feed. Nobody can see the full forex market's volume, because it has no central exchange.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Volume is how much traded during each candle.",
        "Strong volume behind a move signals conviction.",
        "Volume spikes at opens, news, stop runs and trend climaxes.",
        "Forex shows broker tick volume; futures show real exchange volume.",
      ],
    },
  ],
}
