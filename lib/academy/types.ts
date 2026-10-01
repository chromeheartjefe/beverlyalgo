// Entrix Academy content model. Lessons are plain, serializable data so a
// server page can load one and hand it to the client player as props.
// Interactive figures are referenced by id (FigureId) and resolved on the
// client, because components can't cross the server/client boundary.

/** One OHLC candle: [open, high, low, close] */
export type Candle = [number, number, number, number]

export type Tone = "up" | "down" | "accent" | "neutral" | "warn"

export type ChartAnnotation =
  // Horizontal price line across the chart (support, entry, the last price...)
  | { kind: "hline"; price: number; label?: string; tone?: Tone; dashed?: boolean }
  // Price box from candle `from` to candle `to` (or the right edge): zones, FVGs, ranges
  | { kind: "zone"; from: number; to?: number; top: number; bottom: number; label?: string; tone?: Tone }
  // Text pinned above a candle's high or below its low
  | { kind: "marker"; index: number; at: "high" | "low"; text: string; tone?: Tone }
  // Straight line between two [candle index, price] points: trendlines, necklines,
  // BOS lines (same price at both ends). `extend` runs it on to the right edge.
  | { kind: "line"; from: [number, number]; to: [number, number]; label?: string; tone?: Tone; dashed?: boolean; extend?: boolean }

/** One value per candle (null where it isn't defined yet, e.g. the first 19 of a 20 SMA) */
export interface Series {
  values: (number | null)[]
  tone?: Tone
  label?: string
  dashed?: boolean
}

/** An indicator drawn in its own pane under the price (RSI, MACD, ATR...) */
export interface IndicatorPane {
  label: string
  lines?: Series[]
  /** Bars around zero, e.g. the MACD histogram */
  histogram?: (number | null)[]
  /** Dashed reference levels, e.g. RSI 30 and 70 */
  levels?: number[]
  min?: number
  max?: number
  decimals?: number
  /** Straight lines inside the pane, e.g. to mark a divergence */
  segments?: { from: [number, number]; to: [number, number]; tone?: Tone }[]
}

export interface ChartSpec {
  candles: Candle[]
  /** "candles" (default), "ohlc" bars or a close-price line */
  style?: "candles" | "ohlc" | "line"
  /** One volume per candle; draws a volume pane under the price */
  volumes?: number[]
  /** "log" spaces prices by percentage instead of by amount */
  scale?: "linear" | "log"
  /** Lines drawn over the price, e.g. moving averages */
  overlays?: Series[]
  /** Indicator pane under the price (replaces the volume pane) */
  pane?: IndicatorPane
  /** Shaded time windows behind the candles: sessions, killzones */
  sessions?: { from: number; to: number; label: string; tone?: Tone }[]
  /** Clock labels under the chart, e.g. { index: 12, text: "8:00" } */
  timeLabels?: { index: number; text: string }[]
  /** Fixed chart height in pixels (default 260) */
  height?: number
  annotations?: ChartAnnotation[]
  /** Candles drawn emphasised; the rest are dimmed */
  highlight?: number[]
  /** Reveal the candles one by one when the chart first shows */
  reveal?: boolean
  /** Price decimals on the axis labels */
  decimals?: number
  /** Optional caption under the chart */
  caption?: string
}

/** Client-side figures (components/dashboard/academy/figures) */
export type FigureId =
  | "order-matching"
  | "asset-classes"
  | "market-participants"
  | "price-tug"
  | "sessions-timeline"
  | "order-book"
  | "market-sweep"
  | "candle-anatomy"
  | "candle-merge"
  | "chart-types"
  | "structure-story"
  | "liquidity-sweep"
  | "fvg-fill"
  | "power-of-three"
  | "killzones"
  | "analysis-readout"

export type Visual =
  | { type: "chart"; chart: ChartSpec }
  // Several charts stacked, e.g. two correlated markets for SMT divergence
  | { type: "charts"; charts: ChartSpec[] }
  | { type: "figure"; id: FigureId; caption?: string }

export type CalloutTone = "tip" | "warn" | "note"

/**
 * Text is a list of paragraphs. Inside a paragraph, **double asterisks**
 * mark bold key terms. Nothing else is parsed.
 */
export type Paragraphs = string[]

export interface LearnStep {
  kind: "learn"
  title: string
  body: Paragraphs
  visual?: Visual
  callout?: { tone: CalloutTone; text: string }
}

interface QuestionBase {
  /** Stable id, unique inside the lesson; spaced review will key on it */
  id: string
  /** Shown after answering, right or wrong */
  explain: string
  visual?: Visual
}

export interface ChoiceQuestion extends QuestionBase {
  kind: "choice"
  prompt: string
  options: string[]
  /** Index into options */
  answer: number
}

export interface TrueFalseQuestion extends QuestionBase {
  kind: "truefalse"
  statement: string
  answer: boolean
}

export interface TapQuestion extends Omit<QuestionBase, "visual"> {
  kind: "tap"
  prompt: string
  chart: ChartSpec
  /** Candle indices that count as a correct tap */
  targets: number[]
}

export interface NumericQuestion extends QuestionBase {
  kind: "numeric"
  prompt: string
  answer: number
  /** Accepted distance from answer (0 = exact) */
  tolerance: number
  prefix?: string
  suffix?: string
}

export interface MatchQuestion extends Omit<QuestionBase, "visual"> {
  kind: "match"
  prompt: string
  /** [left, right] pairs as they belong together; the right side is shuffled on screen */
  pairs: [string, string][]
}

export type Question = ChoiceQuestion | TrueFalseQuestion | TapQuestion | NumericQuestion | MatchQuestion

export interface RecapStep {
  kind: "recap"
  title: string
  points: string[]
}

export type Step = LearnStep | Question | RecapStep

export interface LessonContent {
  /** Must match the lesson id in the curriculum */
  id: string
  steps: Step[]
  /** Where the facts were checked; shown on the recap screen */
  sources: string[]
}

export function isQuestion(step: Step): step is Question {
  return (
    step.kind === "choice" ||
    step.kind === "truefalse" ||
    step.kind === "tap" ||
    step.kind === "numeric" ||
    step.kind === "match"
  )
}
