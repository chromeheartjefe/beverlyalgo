// Trading Glossary data model. Terms are plain data; visuals are referenced
// by key and built on the client (lib/glossary/visuals.ts).

export const CATEGORIES = [
  { id: "markets", label: "Markets & Instruments", tone: "sky" },
  { id: "orders", label: "Orders & Execution", tone: "emerald" },
  { id: "charts", label: "Charts & Candles", tone: "indigo" },
  { id: "structure", label: "Market Structure", tone: "violet" },
  { id: "levels", label: "Levels & Patterns", tone: "teal" },
  { id: "indicators", label: "Indicators", tone: "amber" },
  { id: "smc", label: "Smart Money & ICT", tone: "fuchsia" },
  { id: "time", label: "Sessions & Time", tone: "cyan" },
  { id: "risk", label: "Risk & Sizing", tone: "rose" },
  { id: "strategy", label: "Strategy & Testing", tone: "lime" },
  { id: "psychology", label: "Psychology", tone: "orange" },
  { id: "macro", label: "News & Macro", tone: "blue" },
] as const

export type CategoryId = (typeof CATEGORIES)[number]["id"]
export type Level = "beginner" | "intermediate" | "advanced"

export type VisualKey =
  | "candle"
  | "doji"
  | "hammer"
  | "engulfing"
  | "volume"
  | "gap"
  | "uptrend"
  | "bos"
  | "choch"
  | "support"
  | "trendline"
  | "fibonacci"
  | "moving-average"
  | "rsi"
  | "macd"
  | "bollinger"
  | "atr"
  | "divergence"
  | "liquidity"
  | "sweep"
  | "equal-lows"
  | "fvg"
  | "order-block"
  | "breaker"
  | "displacement"
  | "premium-discount"
  | "ote"
  | "asian-range"
  | "killzone"
  | "judas"
  | "head-and-shoulders"
  | "double-top"
  | "order-book"
  | "drawdown"
  | "spring"

export interface GlossaryTerm {
  /** URL key, unique */
  slug: string
  term: string
  /** Abbreviations and other names that search should find */
  aliases?: string[]
  category: CategoryId
  level: Level
  /** One sentence, shown on the card */
  short: string
  /** Fuller explanation; **double asterisks** mark key words */
  detail: string[]
  /** A concrete worked example */
  example?: string
  visual?: VisualKey
  /** Slugs of related terms */
  related: string[]
  /** Entrix Academy lesson id that teaches it */
  lessonId?: string
  /** A dashboard tool that puts it to use */
  tool?: { label: string; href: string }
}
