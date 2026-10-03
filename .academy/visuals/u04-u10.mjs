// Visuals for the three lessons in Levels 2 and 3 that had none.
export default [
  // ── u4-where-it-came-from-dow-theory ──
  { lesson: "u4-where-it-came-from-dow-theory", step: "An idea from 1900", scene: { kind: "timeline", title: "Where Dow theory comes from", events: [
    { time: "Around 1900", label: "Charles Dow writes his editorials" },
    { time: "1922", label: "Hamilton's The Stock Market Barometer" },
    { time: "Today", label: "The core ideas are in every modern method", tone: "up" },
  ] } },
  { lesson: "u4-where-it-came-from-dow-theory", step: "Three trends at once", scene: { kind: "compare", title: "Tide, waves and ripples", columns: [
    { title: "Primary", icon: "trending-up", tone: "up", points: ["The big move", "Can last a year or more"] },
    { title: "Secondary", icon: "repeat", tone: "warn", points: ["Corrections against it", "Weeks to months"] },
    { title: "Minor", icon: "candles", tone: "neutral", points: ["Day-to-day moves", "Mean little on their own"] },
  ] } },
  { lesson: "u4-where-it-came-from-dow-theory", step: "Highs, lows and confirmation", scene: { kind: "path", title: "A bull market, the way Dow judged it", points: [10, 14, 12, 17, 15, 21, 18, 25, 22, 29],
    marks: [{ at: 3, label: "Higher high", tone: "up" }, { at: 4, label: "Higher low", tone: "up", side: "below" }, { at: 7, label: "Higher high", tone: "up" }, { at: 8, label: "Higher low", tone: "up", side: "below" }] } },
  { lesson: "u4-where-it-came-from-dow-theory", step: "The three phases", scene: { kind: "flow", title: "The three phases of a big bull market", nodes: [
    { label: "Accumulation", sub: "informed buyers buy quietly", icon: "eye", tone: "neutral" },
    { label: "Public participation", sub: "the trend is obvious, most join", icon: "users", tone: "up" },
    { label: "Distribution", sub: "late buyers pile in, early buyers sell", icon: "flag", tone: "down" },
  ] } },

  // ── u8-ranking-points-of-interest ──
  { lesson: "u8-ranking-points-of-interest", step: "Too many zones", scene: { kind: "flow", title: "From dozens of zones to a few", nodes: [
    { label: "Dozens of zones", sub: "on every chart", icon: "layers", tone: "warn" },
    { label: "Rank them", icon: "filter", tone: "accent" },
    { label: "Act only at the best", icon: "target", tone: "up" },
  ] } },
  { lesson: "u8-ranking-points-of-interest", step: "The ranking checklist", scene: { kind: "checklist", title: "A strong point of interest", items: [
    { text: "Higher timeframe", mark: "ok" },
    { text: "With the higher-timeframe bias", mark: "ok" },
    { text: "Liquidity taken first", mark: "ok" },
    { text: "Displacement away from it", mark: "ok" },
    { text: "Fresh: not touched since it formed", mark: "ok" },
    { text: "On the right side of the range", mark: "ok" },
  ] } },

  // ── u10-build-and-backtest-your-own-model ──
  { lesson: "u10-build-and-backtest-your-own-model", step: "Your model, written down", scene: { kind: "checklist", title: "What a written model fixes", items: [
    { text: "Market and timeframes", mark: "dot" },
    { text: "Bias rule", mark: "dot" },
    { text: "Time window", mark: "dot" },
    { text: "Setup", mark: "dot" },
    { text: "Trigger", mark: "dot" },
    { text: "Entry", mark: "dot" },
    { text: "Stop and target rules", mark: "dot" },
    { text: "Daily limits", mark: "dot" },
  ] } },
  { lesson: "u10-build-and-backtest-your-own-model", step: "Backtesting without lying to yourself", scene: { kind: "compare", columns: [
    { title: "Honest backtest", icon: "check", tone: "up", points: ["Candle by candle", "Every setup logged", "Right side of the chart hidden"] },
    { title: "Hindsight", icon: "eye", tone: "down", points: ["A finished chart", "Only the beautiful setups", "The perfect gap looks obvious"] },
  ] } },
  { lesson: "u10-build-and-backtest-your-own-model", step: "What the numbers must show", scene: { kind: "checklist", title: "After 50 to 100 trades, measure", items: [
    { text: "Win rate", mark: "dot" },
    { text: "Average win and loss, in R", mark: "dot" },
    { text: "Expectancy after costs", mark: "dot" },
    { text: "Biggest losing streak", mark: "dot" },
    { text: "Deepest drawdown", mark: "dot" },
  ] } },
  { lesson: "u10-build-and-backtest-your-own-model", step: "The honest truth about SMC", scene: { kind: "flow", title: "Your own proof", nodes: [
    { label: "A precise model", icon: "pen" },
    { label: "An honest backtest", icon: "search" },
    { label: "A forward test", icon: "hourglass" },
    { label: "Risk management", sub: "Level 4", icon: "shield", tone: "up" },
  ] } },
]
