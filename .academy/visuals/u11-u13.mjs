// Visuals for Level 4, part 1: risk (U11), strategy and testing (U12), psychology (U13).
// Numbers are the ones in each step's text, or plain arithmetic on them.
const LEFEVRE = { author: "Edwin Lefèvre", source: "Reminiscences of a Stock Operator (1923)" }

export default [
  // ── u11-risk-comes-first ──
  { lesson: "u11-risk-comes-first", step: "Welcome to Level 4", scene: { kind: "flow", title: "What decides whether you last", nodes: [
    { label: "Risk", sub: "how you handle it", icon: "shield", tone: "up" },
    { label: "Testing", sub: "how you test your ideas", icon: "search", tone: "accent" },
    { label: "Yourself", sub: "how you handle you", icon: "brain", tone: "warn" },
  ] } },
  { lesson: "u11-risk-comes-first", step: "Amateurs and professionals", scene: { kind: "compare", title: "The first question before a trade", columns: [
    { title: "Beginners", icon: "user", tone: "warn", points: ["How much can I make?"] },
    { title: "Professionals", icon: "shield", tone: "up", points: ["How much can I lose?", "Is that acceptable?", "Decided before entry"] },
  ] } },
  { lesson: "u11-risk-comes-first", step: "Survival is the edge", scene: { kind: "flow", title: "Why survival comes first", nodes: [
    { label: "A strategy that works", icon: "check", tone: "up" },
    { label: "Still has long losing streaks", icon: "trending-down", tone: "warn" },
    { label: "Survive them", icon: "shield", tone: "accent" },
    { label: "The edge has time to show", icon: "trending-up", tone: "up" },
  ] } },

  // ── u11-the-1-rule ──
  { lesson: "u11-the-1-rule", step: "Risk a small slice", scene: { kind: "bars", title: "The 1% rule on a $10,000 account", bars: [
    { label: "The account", value: 10000, display: "$10,000", tone: "accent" },
    { label: "Risk on one trade", value: 100, display: "$100", tone: "up" },
  ] } },

  // ── u11-position-sizing ──
  { lesson: "u11-position-sizing", step: "The stop sets the size", scene: { kind: "flow", title: "The order professionals work in", nodes: [
    { label: "Place the stop", sub: "where the idea is wrong", icon: "flag" },
    { label: "Money at risk", sub: "your planned loss", icon: "wallet" },
    { label: "Divide", sub: "by stop distance x value of one unit", icon: "calculator", tone: "accent" },
    { label: "Position size", icon: "scale", tone: "up" },
  ] } },
  { lesson: "u11-position-sizing", step: "Wide stops, small size", scene: { kind: "grid", title: "Two trades with the same risk", corner: "", cols: ["Stop", "Size", "Risk"], rows: [
    { label: "Wide stop", cells: ["50 points", "1 contract", "The same"], tones: ["neutral", "neutral", "up"] },
    { label: "Tight stop", cells: ["25 points", "2 contracts", "The same"], tones: ["neutral", "neutral", "up"] },
  ] } },

  // ── u11-where-to-put-your-stop ──
  { lesson: "u11-where-to-put-your-stop", step: "Three solid methods", scene: { kind: "compare", columns: [
    { title: "Structure", icon: "flag", tone: "accent", points: ["Beyond the swing point or sweep the setup depends on"] },
    { title: "Volatility", icon: "candles", tone: "warn", points: ["1.5 to 2 ATR from entry", "Normal noise doesn't hit it"] },
    { title: "Both", icon: "shield", tone: "up", points: ["Beyond structure", "With about 1 ATR of room"] },
  ] } },
  { lesson: "u11-where-to-put-your-stop", step: "Never widen it", scene: { kind: "compare", title: "Moving a stop once the trade is on", columns: [
    { title: "Allowed", icon: "check", tone: "up", points: ["Towards profit", "To breakeven", "Trailing behind price"] },
    { title: "Never", icon: "ban", tone: "down", points: ["Further away", "To give it room", "1% losses become 5% losses"] },
  ] } },

  // ── u11-r-multiples-and-reward-to-risk ──
  { lesson: "u11-r-multiples-and-reward-to-risk", step: "Measure trades in R", scene: { kind: "grid", title: "Every result, in R", corner: "", cols: ["Full stop hit", "Breakeven exit", "Twice your risk"], signed: true, suffix: "R", rows: [
    { label: "Result", cells: [-1, 0, 2] },
  ] } },
  { lesson: "u11-r-multiples-and-reward-to-risk", step: "Planned reward to risk", scene: { kind: "path", title: "Risk 2 to make 6", points: [100, 99.3, 100.6, 101.5, 100.9, 102.4, 103.6, 103, 104.8, 106],
    marks: [{ at: 0, label: "Entry" }, { at: 9, label: "A 3R target", tone: "up" }],
    levels: [{ price: 106, label: "Target 106", tone: "up" }, { price: 100, label: "Entry 100", tone: "neutral" }, { price: 98, label: "Stop 98", tone: "down" }] },
    caption: "6 of reward for 2 of risk is 3:1." },

  // ── u11-win-rate-r-r-and-expectancy ──
  { lesson: "u11-win-rate-r-r-and-expectancy", step: "Two numbers, one result", scene: { kind: "compare", title: "Neither number means anything alone", columns: [
    { title: "70% win rate", icon: "percent", tone: "warn", points: ["With tiny winners", "Can lose money"] },
    { title: "35% win rate", icon: "percent", tone: "up", points: ["With big winners", "Can make a lot"] },
  ] } },
  { lesson: "u11-win-rate-r-r-and-expectancy", step: "The breakeven win rate", scene: { kind: "bars", title: "Win rate needed just to break even", max: 100, bars: [
    { label: "R:R of 1:1", value: 50, display: "50%", tone: "warn" },
    { label: "R:R of 2:1", value: 33.3, display: "about 33%", tone: "accent" },
    { label: "R:R of 3:1", value: 25, display: "25%", tone: "up" },
  ] } },
  { lesson: "u11-win-rate-r-r-and-expectancy", step: "Costs come off the top", scene: { kind: "bars", title: "Expectancy per trade", max: 0.25, bars: [
    { label: "Before costs", value: 0.2, display: "+0.2R", tone: "up" },
    { label: "Costs", value: 0.1, display: "0.1R", tone: "down" },
    { label: "What is really left", value: 0.1, display: "+0.1R", tone: "warn" },
  ] } },

  // ── u11-drawdown-math ──
  { lesson: "u11-drawdown-math", step: "Losses need bigger gains", scene: { kind: "bars", title: "Gain needed to recover a loss", max: 300, bars: [
    { label: "Lose 10%", value: 11, display: "+11%", tone: "up" },
    { label: "Lose 20%", value: 25, display: "+25%", tone: "up" },
    { label: "Lose 30%", value: 43, display: "+43%", tone: "warn" },
    { label: "Lose 50%", value: 100, display: "+100%", tone: "warn" },
    { label: "Lose 75%", value: 300, display: "+300%", tone: "down" },
  ] } },

  // ── u11-risk-of-ruin ──
  { lesson: "u11-risk-of-ruin", step: "Streaks are guaranteed", scene: { kind: "stat", title: "Winning 40% of the time", stats: [
    { value: 7.8, decimals: 1, suffix: "%", label: "chance that any given run of 5 trades are all losers", tone: "warn" },
  ] } },
  { lesson: "u11-risk-of-ruin", step: "Risk of ruin", scene: { kind: "bars", title: "Account left after 8 losses in a row", max: 100, bars: [
    { label: "Risking 1% a trade", value: 92.3, display: "about 92%", tone: "up" },
    { label: "Risking 10% a trade", value: 43, display: "about 43%", tone: "warn" },
    { label: "Risking 20% a trade", value: 16.8, display: "about 17%", tone: "down" },
  ] }, caption: "The same ordinary losing streak, at three different sizes of risk." },
  { lesson: "u11-risk-of-ruin", step: "Circuit breakers", scene: { kind: "checklist", title: "Hard limits that keep bad days small", items: [
    { text: "A daily loss limit, for example 2% or 3R", mark: "ok" },
    { text: "A weekly loss limit", mark: "ok" },
    { text: "A maximum number of trades per day", mark: "ok" },
    { text: "Halve your risk after a drawdown of, say, 10%", mark: "ok" },
  ] } },

  // ── u11-leverage-and-correlation ──
  { lesson: "u11-leverage-and-correlation", step: "Leverage is not your risk", scene: { kind: "compare", title: "Which one is safer?", columns: [
    { title: "500:1 leverage", icon: "shield", tone: "up", points: ["A stop is in place", "Position sized for 1% risk", "The safer of the two"] },
    { title: "10:1 leverage", icon: "alert", tone: "down", points: ["No stop", "Nothing limits the loss"] },
  ] } },
  { lesson: "u11-leverage-and-correlation", step: "Correlation: one bet in disguise", scene: { kind: "flow", title: "Two trades, one bet", nodes: [
    { label: "Long NQ", sub: "1% risk", icon: "trending-up" },
    { label: "Long ES", sub: "1% risk", icon: "trending-up" },
    { label: "They move together", icon: "repeat", tone: "warn" },
    { label: "Really one bet", sub: "2% if both stop out", icon: "alert", tone: "down" },
  ] } },
  { lesson: "u11-leverage-and-correlation", step: "A total risk cap", scene: { kind: "bars", title: "Open risk against an example cap of 3%", max: 3, bars: [
    { label: "Trade 1", value: 1, display: "1%", tone: "accent" },
    { label: "Trade 2, a related market", value: 1, display: "1%", tone: "accent" },
    { label: "Total open risk", value: 2, display: "2% of the 3% cap", tone: "warn" },
  ] } },

  // ── u12-setup-trigger-and-management ──
  { lesson: "u12-setup-trigger-and-management", step: "Three parts of every trade", scene: { kind: "flow", title: "Three questions every strategy answers", nodes: [
    { label: "Setup", sub: "is the market worth trading?", icon: "search" },
    { label: "Trigger", sub: "what makes you enter, right now?", icon: "zap", tone: "accent" },
    { label: "Management", sub: "stop, targets, what next?", icon: "shield", tone: "up" },
  ] } },
  { lesson: "u12-setup-trigger-and-management", step: "An example", scene: { kind: "compare", columns: [
    { title: "Setup", icon: "search", tone: "neutral", points: ["4-hour bias bullish", "Pullback into a 1-hour FVG in discount", "New York killzone"] },
    { title: "Trigger", icon: "zap", tone: "accent", points: ["5-minute sweep of a low", "MSS with displacement", "Limit at the gap's CE"] },
    { title: "Management", icon: "shield", tone: "up", points: ["Stop below the sweep low", "Half off at 2R, stop to breakeven", "Rest runs to the old high"] },
  ] } },

  // ── u12-writing-a-trading-plan ──
  { lesson: "u12-writing-a-trading-plan", step: "A plan you can follow under pressure", scene: { kind: "compare", columns: [
    { title: "When you write it", icon: "pen", tone: "up", points: ["You are calm", "One or two pages", "The big decisions get made here"] },
    { title: "When you use it", icon: "flame", tone: "warn", points: ["You are excited or scared", "No big decisions left to make"] },
  ] } },
  { lesson: "u12-writing-a-trading-plan", step: "What goes in it", scene: { kind: "checklist", title: "A trading plan", items: [
    { text: "Markets and hours", mark: "dot" },
    { text: "Setups: setup, trigger and management", mark: "dot" },
    { text: "Risk: % per trade, loss limits, maximum trades", mark: "dot" },
    { text: "Routine: before, during and after the session", mark: "dot" },
    { text: "Review: how and when you journal", mark: "dot" },
    { text: "If-then rules for what usually goes wrong", mark: "ok" },
  ] } },

  // ── u12-entries-and-exits ──
  { lesson: "u12-entries-and-exits", step: "Three ways in", scene: { kind: "compare", columns: [
    { title: "Limit", icon: "target", tone: "up", points: ["Price comes to your level", "Best price", "Some trades never fill"] },
    { title: "Market", icon: "check", tone: "accent", points: ["When the trigger candle closes", "Never miss the move", "A worse price"] },
    { title: "Stop entry", icon: "zap", tone: "warn", points: ["As price breaks a level", "Catches momentum", "Suffers on fakeouts"] },
  ] } },
  { lesson: "u12-entries-and-exits", step: "Ways out", scene: { kind: "checklist", title: "Ways out of a trade", items: [
    { text: "Fixed target at liquidity or a level", mark: "dot" },
    { text: "Partials: take some, let the rest run", mark: "dot" },
    { text: "Breakeven: stop to entry after a gain", mark: "dot" },
    { text: "Trailing stop behind swings, or by ATR", mark: "dot" },
    { text: "Time stop: close what hasn't worked by a set time", mark: "dot" },
  ] } },
  { lesson: "u12-entries-and-exits", step: "The breakeven trap", scene: { kind: "path", title: "Breakeven moved too early", points: [100, 100.6, 101.2, 100.7, 100, 100.5, 101.6, 102.8, 102.2, 103.5, 104.2],
    marks: [{ at: 2, label: "Stop moved to entry", tone: "warn" }, { at: 4, label: "Stopped out at 0R", tone: "down", side: "below" }, { at: 10, label: "Target hit without you", tone: "up" }],
    levels: [{ price: 104.2, label: "Target", tone: "up" }, { price: 100, label: "Entry", tone: "neutral" }] } },

  // ── u12-honest-backtesting ──
  { lesson: "u12-honest-backtesting", step: "Testing on the past", scene: { kind: "flow", title: "A backtest", nodes: [
    { label: "Your exact rules", icon: "list" },
    { label: "Past price data", sub: "trade by trade", icon: "candles" },
    { label: "Record every result", icon: "pen", tone: "accent" },
    { label: "Is there an edge?", icon: "search", tone: "up" },
  ] } },
  { lesson: "u12-honest-backtesting", step: "The classic traps", scene: { kind: "checklist", title: "How backtests fool you", items: [
    { text: "Look-ahead: using what you couldn't have known", mark: "bad" },
    { text: "Cherry-picking: logging only the good trades", mark: "bad" },
    { text: "Overfitting: rules tuned to fit the past", mark: "bad" },
    { text: "Survivorship: testing only what still exists", mark: "bad" },
    { text: "Ignoring spreads, commissions and slippage", mark: "bad" },
  ] } },
  { lesson: "u12-honest-backtesting", step: "Keep some data back", scene: { kind: "timeline", title: "Split your history", events: [
    { time: "In-sample", label: "Build and adjust the rules here" },
    { time: "Then", label: "Lock the rules", tone: "warn" },
    { time: "Out-of-sample", label: "Test once, unchanged, on data you haven't seen", tone: "up" },
  ] } },

  // ── u12-forward-testing ──
  { lesson: "u12-forward-testing", step: "From the past to the present", scene: { kind: "flow", title: "The road to real size", nodes: [
    { label: "Backtest", icon: "search" },
    { label: "Demo account", icon: "book" },
    { label: "Very small real size", icon: "coins", tone: "warn" },
    { label: "Scale up", sub: "once live looks like the backtest", icon: "trending-up", tone: "up" },
  ] } },
  { lesson: "u12-forward-testing", step: "What live trading adds", scene: { kind: "checklist", title: "What no backtest has", items: [
    { text: "Real slippage", mark: "bad" },
    { text: "Missed fills", mark: "bad" },
    { text: "Spreads that widen on news", mark: "bad" },
    { text: "Technical problems", mark: "bad" },
    { text: "Your emotions when real money is moving", mark: "bad" },
  ] } },
  { lesson: "u12-forward-testing", step: "How long?", scene: { kind: "stat", stats: [
    { value: 30, suffix: " to 50", label: "trades at least, across different market conditions", tone: "accent" },
  ] } },

  // ── u12-journaling ──
  { lesson: "u12-journaling", step: "Your most honest coach", scene: { kind: "compare", columns: [
    { title: "Memory", icon: "brain", tone: "warn", points: ["Remembers the big wins", "Forgets the rule breaks"] },
    { title: "A journal", icon: "book", tone: "up", points: ["Records every trade", "Forgets nothing"] },
  ] } },
  { lesson: "u12-journaling", step: "What to record", scene: { kind: "compare", columns: [
    { title: "Facts", icon: "list", tone: "neutral", points: ["Market, date and time", "Entry, stop, target, exit", "Size and result in R"] },
    { title: "Context", icon: "candles", tone: "accent", points: ["Which setup", "Which killzone", "Screenshots before and after"] },
    { title: "Behaviour", icon: "brain", tone: "up", points: ["Did you follow the plan?", "What were you feeling?"] },
  ] } },
  { lesson: "u12-journaling", step: "Patterns hide in the data", scene: { kind: "checklist", title: "After 50 trades, a journal can answer", items: [
    { text: "Which setup actually makes money?", mark: "dot" },
    { text: "Which time of day loses?", mark: "dot" },
    { text: "Do you lose more after a winning streak?", mark: "dot" },
    { text: "What do broken rules cost you in total?", mark: "dot" },
  ] } },

  // ── u12-the-weekly-review ──
  { lesson: "u12-the-weekly-review", step: "Step back once a week", scene: { kind: "cycle", center: "Once a week, outside market hours", nodes: [
    { label: "Trade the plan" },
    { label: "Journal every trade" },
    { label: "Weekly review", tone: "up" },
    { label: "One change", tone: "warn" },
  ] } },
  { lesson: "u12-the-weekly-review", step: "A simple review routine", scene: { kind: "flow", title: "Four steps", nodes: [
    { label: "1. Numbers", sub: "trades, win rate, total R", icon: "calculator" },
    { label: "2. Rules", sub: "what did breaking them cost?", icon: "list" },
    { label: "3. Best and worst", sub: "look at the screenshots", icon: "eye" },
    { label: "4. One change", sub: "a single thing to improve", icon: "target", tone: "up" },
  ] } },

  // ── u12-sample-size-and-when-to-change ──
  { lesson: "u12-sample-size-and-when-to-change", step: "Twenty trades say very little", scene: { kind: "stat", title: "A strategy that truly wins half the time", stats: [
    { value: 13, suffix: "%", label: "chance it wins 7 or fewer of its next 20 trades", tone: "warn" },
  ] } },
  { lesson: "u12-sample-size-and-when-to-change", step: "How many is enough?", scene: { kind: "timeline", title: "How many trades?", events: [
    { time: "Under 30", label: "Mostly noise", tone: "down" },
    { time: "50 to 100", label: "The real shape starts to show", tone: "warn" },
    { time: "More", label: "Better still, above all with a low win rate", tone: "up" },
  ] } },
  { lesson: "u12-sample-size-and-when-to-change", step: "When to change", scene: { kind: "checklist", title: "Good reasons to change a strategy", items: [
    { text: "A large sample, clearly worse than the backtest", mark: "ok" },
    { text: "After costs, with correct execution", mark: "ok" },
    { text: "Or the market itself has clearly changed", mark: "ok" },
    { text: "Then change one thing, and test again", mark: "dot" },
    { text: "Not: constant switching", mark: "bad" },
  ] } },

  // ── u13-loss-aversion ──
  { lesson: "u13-loss-aversion", step: "Losses hurt twice as much", scene: { kind: "bars", title: "How strongly it is felt", max: 2, bars: [
    { label: "A gain", value: 1, display: "1x", tone: "up" },
    { label: "A loss of the same size", value: 2, display: "roughly 2x", tone: "down" },
  ] } },
  { lesson: "u13-loss-aversion", step: "How it shows up in trading", scene: { kind: "compare", columns: [
    { title: "Holding losers", icon: "hourglass", tone: "down", points: ["Closing makes the loss real", "So we wait and hope"] },
    { title: "Moving stops", icon: "flag", tone: "down", points: ["The stop would make it real", "So it gets moved"] },
    { title: "Cutting winners", icon: "trending-up", tone: "warn", points: ["A profit could turn into a loss", "So we grab it early"] },
  ] }, caption: "The result is backwards: small wins and big losses." },
  { lesson: "u13-loss-aversion", step: "Working with your brain", scene: { kind: "checklist", title: "Design around it", items: [
    { text: "Set the stop before entering", mark: "ok" },
    { text: "Never move it away", mark: "ok" },
    { text: "Use bracket orders", mark: "ok" },
    { text: "Size small enough that a loss doesn't sting much", mark: "ok" },
    { text: "Think in R: -1R is one planned outcome among many", mark: "ok" },
  ] } },

  // ── u13-fomo ──
  { lesson: "u13-fomo", step: "Fear of missing out", scene: { kind: "path", title: "A chased entry", points: [10, 10.5, 10.2, 11.5, 13, 14.8, 16.5, 17.6, 18.2, 17.1, 15.6, 14.9],
    marks: [{ at: 2, label: "The level: no trade taken", side: "below" }, { at: 8, label: "Jumps in late, far from any level", tone: "down" }, { at: 11, label: "The stretched move pulls back", tone: "warn", side: "below" }] } },
  { lesson: "u13-fomo", step: "Defences against FOMO", scene: { kind: "checklist", title: "Defences", items: [
    { text: "No setup, no trade", mark: "ok" },
    { text: "Price alerts at your levels", mark: "ok" },
    { text: "A log of missed trades, checked against your rules", mark: "ok" },
    { text: "A missed trade costs nothing", mark: "dot" },
    { text: "A chased trade often costs 1R or more", mark: "bad" },
  ] } },

  // ── u13-revenge-trading ──
  { lesson: "u13-revenge-trading", step: "Trying to get it back", scene: { kind: "cycle", center: "One planned -1R turns into -5R", nodes: [
    { label: "A loss", tone: "down" },
    { label: "Win it back, now", tone: "warn" },
    { label: "Bigger size, worse setup", tone: "warn" },
    { label: "A bigger loss", tone: "down" },
  ] } },
  { lesson: "u13-revenge-trading", step: "Hard stops for you, not just the trade", scene: { kind: "checklist", title: "Rules that stop you, not the trade", items: [
    { text: "Daily loss limit: hit it and you're done", mark: "ok" },
    { text: "Two losses in a row: a break of at least 30 minutes", mark: "ok" },
    { text: "Fixed size: never bigger after a loss", mark: "ok" },
    { text: "Walk away from the screen", mark: "ok" },
  ] } },

  // ── u13-overconfidence-and-overtrading ──
  { lesson: "u13-overconfidence-and-overtrading", step: "Trading more, earning less", scene: { kind: "bars", title: "Annual return, US households in the 1990s", suffix: "%", max: 20, bars: [
    { label: "Households that traded the most", value: 11.4, tone: "down" },
    { label: "The market", value: 17.9, tone: "up" },
  ] }, caption: "From Barber and Odean's study of household brokerage accounts." },
  { lesson: "u13-overconfidence-and-overtrading", step: "Where overconfidence comes from", scene: { kind: "cycle", center: "Luck that feels like skill", nodes: [
    { label: "A winning streak", tone: "up" },
    { label: "It feels like skill", tone: "warn" },
    { label: "Bigger size, looser rules", tone: "warn" },
    { label: "More trades", tone: "warn" },
    { label: "The streak ends", tone: "down" },
  ] } },
  { lesson: "u13-overconfidence-and-overtrading", step: "Defences", scene: { kind: "checklist", title: "Defences", items: [
    { text: "Cap your trades per day", mark: "ok" },
    { text: "Grade every setup A, B or C in your journal", mark: "ok" },
    { text: "Check which grades actually make money", mark: "ok" },
    { text: "Keep size fixed through every streak", mark: "ok" },
  ] } },

  // ── u13-cutting-winners-early ──
  { lesson: "u13-cutting-winners-early", step: "The disposition effect", scene: { kind: "compare", title: "What Odean's study found", columns: [
    { title: "Winners", icon: "trending-up", tone: "up", points: ["Sold far more readily", "Went on to do better"] },
    { title: "Losers", icon: "trending-down", tone: "down", points: ["Kept", "Did worse than the winners that were sold"] },
  ] } },
  { lesson: "u13-cutting-winners-early", step: "Sitting tight", scene: { kind: "quote", text: "It never was my thinking that made the big money for me. It was always my sitting. Got that? My sitting tight!", ...LEFEVRE } },
  { lesson: "u13-cutting-winners-early", step: "Tools to stay in", scene: { kind: "checklist", title: "Tools to stay in a winner", items: [
    { text: "Set the target as an order before entry", mark: "ok" },
    { text: "Take partials at a first target", mark: "ok" },
    { text: "Trail the stop behind structure", mark: "ok" },
    { text: "Use alerts, and look away", mark: "ok" },
  ] } },

  // ── u13-routines-discipline-and-tilt ──
  { lesson: "u13-routines-discipline-and-tilt", step: "Discipline is a system, not willpower", scene: { kind: "compare", columns: [
    { title: "Willpower", icon: "flame", tone: "warn", points: ["Runs out", "Fastest after a loss or a long day"] },
    { title: "Routine", icon: "repeat", tone: "up", points: ["Makes the right action the easy one"] },
  ] } },
  { lesson: "u13-routines-discipline-and-tilt", step: "A simple daily routine", scene: { kind: "compare", columns: [
    { title: "Before", icon: "sun", tone: "neutral", points: ["Check the news calendar", "Mark levels and liquidity", "Decide bias, and what proves it wrong"] },
    { title: "During", icon: "candles", tone: "accent", points: ["Only your killzone", "Only your setups", "A checklist before each entry"] },
    { title: "After", icon: "moon", tone: "up", points: ["Journal every trade", "Note your state of mind", "Close the platform"] },
  ] } },
  { lesson: "u13-routines-discipline-and-tilt", step: "Tilt", scene: { kind: "checklist", title: "Signs of tilt", items: [
    { text: "Trading faster, bigger or more often", mark: "bad" },
    { text: "Feeling angry or desperate", mark: "bad" },
    { text: "Ignoring your plan", mark: "bad" },
    { text: "Wanting to win back losses", mark: "bad" },
    { text: "The only good trade now is no trade", mark: "ok" },
  ] } },

  // ── u13-lessons-from-livermore ──
  { lesson: "u13-lessons-from-livermore", step: "A book traders still read", scene: { kind: "timeline", events: [
    { time: "Early 1900s", label: "Jesse Livermore makes and loses several fortunes" },
    { time: "1923", label: "Lefèvre writes Reminiscences of a Stock Operator" },
    { time: "A century later", label: "Still one of the most recommended trading books", tone: "up" },
  ] } },
  { lesson: "u13-lessons-from-livermore", step: "Nothing new", scene: { kind: "quote", text: "Whatever happens in the stock market to-day has happened before and will happen again.", ...LEFEVRE } },
  { lesson: "u13-lessons-from-livermore", step: "Hope and fear", scene: { kind: "quote", text: "The speculator's chief enemies are always boring from within. It is inseparable from human nature to hope and to fear.", ...LEFEVRE } },
  { lesson: "u13-lessons-from-livermore", step: "They beat themselves", scene: { kind: "quote", text: "The market does not beat them. They beat themselves, because though they have brains they cannot sit tight.", ...LEFEVRE } },
]
