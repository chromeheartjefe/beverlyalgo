import { swingCandles } from "@/lib/academy/candles"
import type { LessonContent } from "@/lib/academy/types"

// Uptrend pullback: a minor low at 8 (the inducement) sits above the real
// demand zone. Price takes the minor low, taps the zone at 14, then rallies.
const candles = swingCandles([[0, 100], [5, 104], [8, 102.8], [10, 103.4], [14, 101.6], [20, 106]], { noise: 0.12, wick: 0.18, seed: 93 })
const IDM = candles[8][2]
const SWEPT = candles.findIndex((c, i) => i > 10 && c[2] < IDM)

export const lesson: LessonContent = {
  id: "u7-inducement",
  sources: ["Smart Money Concepts terminology as commonly taught; explained here in our own words"],
  steps: [
    {
      kind: "learn",
      title: "The bait before the real level",
      body: [
        "**Inducement** (IDM) is an SMC term for an early, tempting level that sits just before the real area of interest. Typically it is a small, obvious pullback low inside a bigger retracement.",
        "Traders who buy that first little low too early put their stops under it. That creates fresh liquidity, which price takes out on its way to the deeper, better level.",
      ],
      visual: {
        type: "chart",
        chart: {
          candles,
          decimals: 2,
          annotations: [
            { kind: "hline", price: IDM, label: "Inducement low", tone: "warn", dashed: true },
            { kind: "zone", from: 3, top: 102.0, bottom: 101.25, label: "Real demand zone", tone: "up" },
          ],
          caption: "Illustrative",
        },
      },
    },
    {
      kind: "tap",
      id: "idm-swept",
      prompt: "Tap the candle that first swept the inducement low.",
      chart: { candles, decimals: 2, annotations: [{ kind: "hline", price: IDM, tone: "neutral", dashed: true }] },
      targets: [SWEPT],
      explain: "This is where price first traded below the minor low, taking the stops of everyone who bought it too early, on the way to the zone.",
    },
    {
      kind: "learn",
      title: "How SMC traders use it",
      body: [
        "Many SMC traders won't trust a zone until the inducement in front of it has been taken. The idea: until early buyers have been shaken out, price hasn't collected the liquidity it needs.",
        "Practically: don't buy the first obvious pullback low. Wait for it to be swept, and look for your entry at the deeper zone.",
      ],
      visual: {
        type: "scene",
        scene: {
          kind: "flow",
          nodes: [
            { label: "The first obvious pullback low", sub: "don't buy it", icon: "ban", tone: "warn" },
            { label: "It gets swept", sub: "early buyers are shaken out", icon: "zap", tone: "down" },
            { label: "The deeper zone", sub: "look for your entry there", icon: "target", tone: "up" },
          ],
        },
      },
    },
    {
      kind: "choice",
      id: "idm-why",
      prompt: "Why is a small pullback low just above a demand zone called inducement?",
      options: [
        "It tempts traders to buy early, creating stops that price takes on the way to the real zone",
        "It is always the exact bottom of the move",
        "It has the most volume of the day",
        "Exchanges mark it on their charts",
      ],
      answer: 0,
      explain: "It induces early entries. Their stops become the liquidity that fuels the move into the deeper level.",
    },
    {
      kind: "truefalse",
      id: "first-low",
      statement: "In SMC, the first small pullback low is usually the best place to buy.",
      answer: false,
      explain: "It is often the inducement: the level that gets swept before price reaches the real point of interest.",
    },
    {
      kind: "choice",
      id: "after-idm",
      prompt: "Price has just swept the inducement low and is now inside your demand zone. What comes next for a disciplined trader?",
      options: [
        "Wait for a lower-timeframe sign of strength, like an MSS, before entering",
        "Buy immediately with double size",
        "Short, because the low broke",
        "Move your stop further away",
      ],
      answer: 0,
      explain: "The sweep sets the stage; confirmation (displacement and a structure shift) is still needed.",
    },
    {
      kind: "recap",
      title: "Lesson recap",
      points: [
        "Inducement is an early, obvious level in front of the real point of interest.",
        "Its stops become liquidity for the move into the deeper zone.",
        "Wait for the inducement to be swept before trusting the zone.",
        "Then look for confirmation before entering.",
      ],
    },
  ],
}
