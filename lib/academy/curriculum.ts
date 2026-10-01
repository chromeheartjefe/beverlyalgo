// The whole Entrix Academy course map (.academy/PLAN.md). Lesson ids are
// stored in academy_progress: never rename or reuse one once it has shipped.
// Slugs only shape URLs. A lesson without content shows as "Coming soon".

export interface CurriculumLesson {
  id: string
  slug: string
  title: string
  minutes: number
}

export interface CurriculumUnit {
  id: string
  slug: string
  title: string
  summary: string
  lessons: CurriculumLesson[]
}

export interface CurriculumLevel {
  id: string
  title: string
  summary: string
  units: CurriculumUnit[]
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// Lesson ids are "<unit id>-<slug>", e.g. "u1-what-is-a-market"
function unit(id: string, title: string, summary: string, lessons: string[]): CurriculumUnit {
  return {
    id,
    slug: slugify(title),
    title,
    summary,
    lessons: lessons.map((t) => {
      const slug = slugify(t)
      return { id: `${id}-${slug}`, slug, title: t, minutes: 6 }
    }),
  }
}

export const CURRICULUM: CurriculumLevel[] = [
  {
    id: "l1",
    title: "Foundations",
    summary: "How markets work, how orders fill and how to read a chart.",
    units: [
      unit("u1", "Welcome to the Markets", "What a market is, what you can trade and who trades it.", [
        "What is a market?",
        "What can you trade?",
        "Who is on the other side?",
        "Exchanges, brokers and OTC",
        "Trading vs investing vs gambling",
        "Market sessions and hours",
        "Regulation and scams",
        "The honest numbers",
      ]),
      unit("u2", "Orders and Execution", "Bid, ask, spread and every order type you will use.", [
        "Bid, ask and spread",
        "The order book and liquidity",
        "Market orders and slippage",
        "Limit orders",
        "Stop and stop-limit orders",
        "Going long and going short",
        "Leverage and margin",
        "What trading really costs",
        "Pips, points, ticks and lots",
      ]),
      unit("u3", "Reading a Chart", "Candles, timeframes and volume, from zero.", [
        "Line, bar and candle charts",
        "Anatomy of a candle",
        "Timeframes",
        "Volume",
        "Single-candle patterns",
        "Two and three-candle patterns",
        "Candles in context",
        "Log vs linear scale",
        "Gaps",
      ]),
    ],
  },
  {
    id: "l2",
    title: "Technical Analysis Essentials",
    summary: "Structure, levels and indicators: the base every method builds on.",
    units: [
      unit("u4", "Market Structure", "Trends, ranges, BOS and CHoCH.", [
        "Swing highs and swing lows",
        "Trend vs range",
        "Impulse and pullback",
        "Break of structure",
        "Change of character",
        "Internal vs swing structure",
        "Multi-timeframe structure",
        "Where it came from: Dow theory",
      ]),
      unit("u5", "Levels, Trendlines and Patterns", "Support, resistance, zones and classic patterns.", [
        "Support and resistance",
        "Role reversal",
        "Round numbers",
        "Trendlines and channels",
        "Supply and demand zones",
        "Classic reversal patterns",
        "Continuation patterns",
        "Breakouts, fakeouts and retests",
        "Fibonacci retracements and extensions",
      ]),
      unit("u6", "Indicators", "What the popular indicators measure, and their limits.", [
        "Why indicators lag",
        "Moving averages",
        "RSI",
        "MACD",
        "Bollinger Bands",
        "ATR",
        "VWAP and volume tools",
        "Divergence and combining tools",
      ]),
    ],
  },
  {
    id: "l3",
    title: "Smart Money Concepts and ICT",
    summary: "Liquidity, imbalances, time and the entry models traders use today.",
    units: [
      unit("u7", "Liquidity", "Where the stops sit and why price goes to get them.", [
        "What liquidity means in SMC",
        "Buy-side and sell-side liquidity",
        "Equal highs, equal lows and trendline liquidity",
        "Sweeps vs real breakouts",
        "Inducement",
        "Internal vs external range liquidity",
        "Stop hunts and turtle soup",
        "Liquidity voids",
      ]),
      unit("u8", "Imbalances and Order Blocks", "FVGs, order blocks, breakers and how to rank them.", [
        "Displacement",
        "Fair value gaps",
        "Consequent encroachment",
        "Inverse fair value gaps",
        "Volume imbalance and balanced price range",
        "Order blocks",
        "Breaker and mitigation blocks",
        "Rejection and propulsion blocks",
        "Ranking points of interest",
      ]),
      unit("u9", "Time and Price", "Premium, discount, killzones and Power of 3.", [
        "Dealing ranges",
        "Premium, discount and equilibrium",
        "Optimal trade entry",
        "Sessions and killzones",
        "The Asian range",
        "Opening prices and opening gaps",
        "Power of 3 and the Judas swing",
        "Wyckoff: the roots of AMD",
      ]),
      unit("u10", "SMC and ICT Entry Models", "Putting it together into testable setups.", [
        "Bias and draw on liquidity",
        "Top-down analysis",
        "The MSS and FVG entry",
        "Silver Bullet",
        "Unicorn model",
        "Turtle soup reversal",
        "SMT divergence",
        "Market maker models",
        "Build and backtest your own model",
      ]),
    ],
  },
  {
    id: "l4",
    title: "Becoming a Trader",
    summary: "Risk, strategy, psychology, news and the markets themselves.",
    units: [
      unit("u11", "Risk Management", "Position sizing, R multiples and staying in the game.", [
        "Risk comes first",
        "The 1% rule",
        "Position sizing",
        "Where to put your stop",
        "R multiples and reward to risk",
        "Win rate, R:R and expectancy",
        "Drawdown math",
        "Risk of ruin",
        "Leverage and correlation",
      ]),
      unit("u12", "Building and Testing a Strategy", "From an idea to a plan you can trust.", [
        "Setup, trigger and management",
        "Writing a trading plan",
        "Entries and exits",
        "Honest backtesting",
        "Forward testing",
        "Journaling",
        "The weekly review",
        "Sample size and when to change",
      ]),
      unit("u13", "Trading Psychology", "The mistakes every trader's brain wants to make.", [
        "Loss aversion",
        "FOMO",
        "Revenge trading",
        "Overconfidence and overtrading",
        "Cutting winners early",
        "Routines, discipline and tilt",
        "Lessons from Livermore",
      ]),
      unit("u14", "Fundamentals and News", "What moves markets on the calendar.", [
        "Why news moves price",
        "The economic calendar",
        "Rates and central banks",
        "Inflation and CPI",
        "Jobs and NFP",
        "Earnings and crypto drivers",
        "Trading around news",
      ]),
      unit("u15", "Market Playbooks", "How forex, crypto, stocks, futures and gold differ.", [
        "Forex",
        "Crypto",
        "Stocks",
        "Futures and indices",
        "Gold",
        "Choosing your market",
        "Choosing your style",
      ]),
    ],
  },
  {
    id: "l5",
    title: "Trading with EntrixAlgo",
    summary: "Use every EntrixAlgo tool as part of one routine.",
    units: [
      unit("u16", "Product Mastery", "Chart Analysis, Screener, Indicator, Journal and Bot.", [
        "Reading a Chart Analysis",
        "The AI Screener",
        "The AI Indicator",
        "Journal and Calendar workflow",
        "The AI Trading Bot",
        "A daily routine",
      ]),
    ],
  },
]

export interface LessonRef {
  level: CurriculumLevel
  unit: CurriculumUnit
  lesson: CurriculumLesson
  /** Position in the whole course, 0-based */
  index: number
}

/** Every lesson in course order */
export const ALL_LESSONS: LessonRef[] = CURRICULUM.flatMap((level) =>
  level.units.flatMap((u) => u.lessons.map((lesson) => ({ level, unit: u, lesson }))),
).map((ref, index) => ({ ...ref, index }))

export function findLesson(unitSlug: string, lessonSlug: string): LessonRef | undefined {
  return ALL_LESSONS.find((r) => r.unit.slug === unitSlug && r.lesson.slug === lessonSlug)
}

export function findLessonById(id: string): LessonRef | undefined {
  return ALL_LESSONS.find((r) => r.lesson.id === id)
}

export function lessonHref(ref: { unit: CurriculumUnit; lesson: CurriculumLesson }): string {
  return `/dashboard/academy/${ref.unit.slug}/${ref.lesson.slug}`
}
