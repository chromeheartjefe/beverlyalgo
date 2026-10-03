// Visuals for Level 1: Units 1 and 2. Every figure only draws what the step's own text says.
export default [
  // ── u1-what-is-a-market ──
  { lesson: "u1-what-is-a-market", step: "The price is the last trade", scene: { kind: "timeline", title: "The price follows the latest trade", events: [
    { time: "Trade", label: "A buyer and a seller agree at 100.25" },
    { time: "Screen", label: "Price shows 100.25", tone: "neutral" },
    { time: "A second later", label: "Someone pays 100.50", tone: "up" },
    { time: "Screen", label: "Price ticks to 100.50", tone: "up" },
  ] } },

  // ── u1-what-can-you-trade ──
  { lesson: "u1-what-can-you-trade", step: "Stocks", scene: { kind: "timeline", title: "A US stock day, New York time", events: [
    { time: "Early", label: "Pre-market: thin", tone: "neutral" },
    { time: "9:30 am", label: "Main session opens", tone: "up" },
    { time: "4:00 pm", label: "Main session closes", tone: "down" },
    { time: "Late", label: "After-hours: thin", tone: "neutral" },
  ] } },
  { lesson: "u1-what-can-you-trade", step: "Indices", scene: { kind: "flow", title: "From many stocks to one number", nodes: [
    { label: "A basket of stocks", sub: "S&P 500: 500 large US companies", icon: "layers" },
    { label: "One number", sub: "the index", icon: "chart", tone: "up" },
    { label: "Traded through", sub: "ETFs or futures like NQ and MNQ", icon: "candles" },
  ] } },
  { lesson: "u1-what-can-you-trade", step: "Forex", scene: { kind: "flow", title: "Reading a currency pair", nodes: [
    { label: "1 euro", icon: "coins" },
    { label: "EUR/USD at 1.0850", sub: "the quoted pair", tone: "up" },
    { label: "1.0850 US dollars", icon: "wallet" },
  ] } },
  { lesson: "u1-what-can-you-trade", step: "Commodities", scene: { kind: "flow", title: "How commodities are traded", nodes: [
    { label: "Raw materials", sub: "gold, silver, oil, gas, wheat", icon: "gold" },
    { label: "Contracts follow the price", sub: "futures and others", icon: "candles", tone: "up" },
    { label: "Traders trade the contract", sub: "not the gold bar", icon: "user" },
  ] } },
  { lesson: "u1-what-can-you-trade", step: "Crypto", scene: { kind: "compare", title: "When the market is open", columns: [
    { title: "US stocks", icon: "building", tone: "neutral", points: ["Main session 9:30 am to 4:00 pm", "Weekdays only"] },
    { title: "Crypto", icon: "bitcoin", tone: "warn", points: ["24 hours a day", "7 days a week", "Weekends and holidays too"] },
  ] } },
  { lesson: "u1-what-can-you-trade", step: "Futures (and a word on options)", scene: { kind: "flow", title: "What a futures contract is", nodes: [
    { label: "A set price", sub: "agreed today", icon: "pen" },
    { label: "A future date", sub: "when the deal is due", icon: "calendar" },
    { label: "Traders trade the contract", sub: "to profit from price moves", icon: "candles", tone: "up" },
  ] } },

  // ── u1-who-is-on-the-other-side ──
  { lesson: "u1-who-is-on-the-other-side", step: "Retail traders", scene: { kind: "compare", title: "Retail traders", columns: [
    { title: "One of them", icon: "user", tone: "neutral", points: ["Trades their own money", "A small order", "Barely moves the price"] },
    { title: "All of them", icon: "users", tone: "accent", points: ["Millions of traders", "Together they matter"] },
  ] } },
  { lesson: "u1-who-is-on-the-other-side", step: "Market makers", scene: { kind: "flow", title: "How a market maker earns the spread", nodes: [
    { label: "A seller", sub: "sells at the lower price", icon: "user" },
    { label: "Market maker", sub: "quotes both prices all day", icon: "scale", tone: "accent" },
    { label: "A buyer", sub: "buys at the higher price", icon: "user" },
  ] }, caption: "The small gap between the two prices is the market maker's income." },
  { lesson: "u1-who-is-on-the-other-side", step: "Algorithms and high-frequency traders", scene: { kind: "compare", title: "Two different games", columns: [
    { title: "High-frequency", icon: "cpu", tone: "warn", points: ["Millionths of a second", "Tiny price differences", "Many times over"] },
    { title: "Human traders", icon: "user", tone: "up", points: ["Minutes, hours and days", "A microsecond makes no difference"] },
  ] } },
  { lesson: "u1-who-is-on-the-other-side", step: "Hedgers and central banks", scene: { kind: "compare", columns: [
    { title: "Hedgers", icon: "shield", tone: "up", points: ["Reduce risk, not bet", "An airline locks in fuel cost", "A farmer locks in a harvest price"] },
    { title: "Central banks", icon: "bank", tone: "accent", points: ["Set interest rates", "Can move every market at once"] },
  ] } },
  { lesson: "u1-who-is-on-the-other-side", step: "Why this matters to you", scene: { kind: "checklist", title: "The other side of your order", items: [
    { text: "Often has more money", mark: "bad" },
    { text: "Often has more information", mark: "bad" },
    { text: "Often has more speed", mark: "bad" },
    { text: "Your answer: risk management, and knowing where the big orders sit", mark: "ok" },
  ] } },

  // ── u1-exchanges-brokers-and-otc ──
  { lesson: "u1-exchanges-brokers-and-otc", step: "Exchanges: one central meeting place", scene: { kind: "checklist", title: "Where things are listed", items: [
    { text: "NYSE and Nasdaq: stocks", mark: "dot" },
    { text: "CME: futures such as NQ, ES and gold", mark: "dot" },
    { text: "Coinbase and Binance: crypto", mark: "dot" },
    { text: "One book, so everyone sees the same prices", mark: "ok" },
  ] } },
  { lesson: "u1-exchanges-brokers-and-otc", step: "Brokers: your door to the market", scene: { kind: "flow", title: "The path of your order", nodes: [
    { label: "You", icon: "user" },
    { label: "Your broker", sub: "your door to the market", icon: "door", tone: "accent" },
    { label: "The market", sub: "an exchange or another firm", icon: "building" },
  ] }, caption: "Some brokers pass the order on. Others take the other side of it themselves." },
  { lesson: "u1-exchanges-brokers-and-otc", step: "OTC: trading without a central exchange", scene: { kind: "compare", columns: [
    { title: "Exchange", icon: "building", tone: "up", points: ["One central order book", "Everyone sees the same price"] },
    { title: "OTC", icon: "globe", tone: "warn", points: ["No central exchange", "Each dealer streams its own prices", "Very close, not identical"] },
  ] } },
  { lesson: "u1-exchanges-brokers-and-otc", step: "Charting platforms are not brokers", scene: { kind: "compare", columns: [
    { title: "Charting platform", icon: "chart", tone: "neutral", points: ["Shows prices", "Lets you draw and analyse", "Your money is not there"] },
    { title: "Your broker", icon: "wallet", tone: "accent", points: ["Executes the trade", "Holds your money", "Its prices are the ones you get"] },
  ] } },
  { lesson: "u1-exchanges-brokers-and-otc", step: "A word on CFDs", scene: { kind: "flow", title: "A contract for difference", nodes: [
    { label: "You", icon: "user" },
    { label: "A contract with your broker", icon: "pen", tone: "accent" },
    { label: "Pays the change in price", sub: "you never own the asset", icon: "coins" },
  ] } },

  // ── u1-trading-vs-investing-vs-gambling ──
  { lesson: "u1-trading-vs-investing-vs-gambling", step: "Investing: owning growth over years", scene: { kind: "path", title: "An investor's years", points: [10, 11, 12, 11.4, 13, 14.5, 13.1, 15, 17, 16.2, 18.5, 21, 20, 23, 26],
    marks: [{ at: 6, label: "A bad stretch", tone: "down", side: "below" }, { at: 14, label: "Time did the work", tone: "up" }] } },
  { lesson: "u1-trading-vs-investing-vs-gambling", step: "Trading: profiting from price moves", scene: { kind: "checklist", title: "What trading asks of you", items: [
    { text: "You can profit when prices rise or fall", mark: "ok" },
    { text: "No slow growth carries you along", mark: "bad" },
    { text: "Every trade has a cost", mark: "bad" },
    { text: "You need an edge to come out ahead", mark: "dot" },
  ] } },
  { lesson: "u1-trading-vs-investing-vs-gambling", step: "Gambling: betting without an edge", scene: { kind: "compare", columns: [
    { title: "Investing", icon: "seed", tone: "up", points: ["Years", "Profit from growth", "Ignores daily moves"] },
    { title: "Trading", icon: "candles", tone: "accent", points: ["Minutes to weeks", "Profit from the moves", "Needs an edge"] },
    { title: "Gambling", icon: "dice", tone: "down", points: ["No tested plan", "Size too big", "Losses get chased"] },
  ] } },
  { lesson: "u1-trading-vs-investing-vs-gambling", step: "Expectancy: the number that matters", scene: { kind: "rr", title: "Winning 4 trades in 10, with 2R winners", risk: 1, reward: 2, wins: 4, losses: 6 },
    caption: "+2R over 10 trades is +0.2R per trade, with more losers than winners." },

  // ── u1-market-sessions-and-hours ──
  { lesson: "u1-market-sessions-and-hours", step: "Why the session matters", scene: { kind: "compare", columns: [
    { title: "Busy session", icon: "sun", tone: "up", points: ["More traders active", "Tighter spreads", "Smoother fills"] },
    { title: "Quiet session", icon: "moon", tone: "warn", points: ["Thinner books", "Wider spreads", "Sudden jumps"] },
  ] } },
  { lesson: "u1-market-sessions-and-hours", step: "Stocks: a main session plus extended hours", scene: { kind: "timeline", title: "US stock hours, New York time", events: [
    { time: "4:00 am", label: "Pre-market can start", tone: "neutral" },
    { time: "9:30 am", label: "Regular session opens", tone: "up" },
    { time: "4:00 pm", label: "Regular session closes", tone: "down" },
    { time: "8:00 pm", label: "After-hours ends", tone: "neutral" },
  ] } },
  { lesson: "u1-market-sessions-and-hours", step: "Futures and crypto", scene: { kind: "compare", columns: [
    { title: "CME futures", icon: "candles", tone: "accent", points: ["Sunday evening to Friday afternoon", "Short daily break around 5 pm", "Busiest in New York stock hours"] },
    { title: "Crypto", icon: "bitcoin", tone: "warn", points: ["Never closes", "Busier when the US and Europe are awake", "Weekends often quieter"] },
  ] } },

  // ── u1-regulation-and-scams ──
  { lesson: "u1-regulation-and-scams", step: "Who watches the markets", scene: { kind: "compare", title: "Regulators", columns: [
    { title: "United States", icon: "bank", tone: "accent", points: ["SEC: stocks", "CFTC: futures and forex", "NFA and FINRA register firms"] },
    { title: "United Kingdom", icon: "bank", tone: "accent", points: ["FCA"] },
    { title: "Australia, EU", icon: "bank", tone: "accent", points: ["ASIC in Australia", "National regulators in the EU, coordinated by ESMA"] },
  ] } },
  { lesson: "u1-regulation-and-scams", step: "The classic red flags", scene: { kind: "checklist", title: "Red flags regulators keep warning about", items: [
    { text: "Guaranteed or \"risk-free\" returns", mark: "bad" },
    { text: "Pressure to act now", mark: "bad" },
    { text: "An unregistered firm, often offshore", mark: "bad" },
    { text: "Payment asked in crypto or gift cards", mark: "bad" },
    { text: "An \"account manager\" from social media", mark: "bad" },
    { text: "Withdrawals suddenly blocked or slow", mark: "bad" },
  ] } },
  { lesson: "u1-regulation-and-scams", step: "Relationship scams and fake platforms", scene: { kind: "flow", title: "How the fake-platform scam runs", nodes: [
    { label: "A friendly message", sub: "from a stranger", icon: "message" },
    { label: "Weeks of chatting", icon: "heart" },
    { label: "A \"secret\" platform", icon: "phone", tone: "warn" },
    { label: "Big profits on screen", sub: "all fake", icon: "trending-up", tone: "warn" },
    { label: "A fee to withdraw", sub: "then the money is gone", icon: "ban", tone: "down" },
  ] } },
  { lesson: "u1-regulation-and-scams", step: "Gurus, signals and screenshots", scene: { kind: "compare", title: "A winning screenshot", columns: [
    { title: "What it shows", icon: "eye", tone: "up", points: ["The winners"] },
    { title: "What it hides", icon: "lock", tone: "down", points: ["The losers", "The account size", "The full track record"] },
  ] } },

  // ── u1-the-honest-numbers ──
  { lesson: "u1-the-honest-numbers", step: "Most traders lose. Here is the data.", scene: { kind: "bars", title: "Retail CFD accounts (European regulators, 2018)", max: 100, bars: [
    { label: "Lost money", value: 74, to: 89, display: "74% to 89%", tone: "down" },
    { label: "Did not lose", value: 11, to: 26, display: "11% to 26%", tone: "up" },
  ] } },
  { lesson: "u1-the-honest-numbers", step: "Day trading for a living", scene: { kind: "stat", stats: [
    { value: 97, suffix: "%", label: "of Brazil's persistent day traders lost money", tone: "down" },
    { value: 1.1, decimals: 1, suffix: "%", label: "earned more than the minimum wage", tone: "warn" },
    { value: 1, prefix: "<", suffix: "%", label: "in Taiwan made money predictably, year after year", tone: "warn" },
  ] } },
  { lesson: "u1-the-honest-numbers", step: "Why they lose", scene: { kind: "checklist", title: "The same mistakes, again and again", items: [
    { text: "Risking too much on each trade", mark: "bad" },
    { text: "Too much leverage", mark: "bad" },
    { text: "No tested plan, just gut feel", mark: "bad" },
    { text: "Overtrading, so costs eat everything", mark: "bad" },
    { text: "Breaking their own rules after a loss", mark: "bad" },
  ] } },
  { lesson: "u1-the-honest-numbers", step: "The maths of losing", scene: { kind: "bars", title: "Gain needed to get back to where you started", max: 100, bars: [
    { label: "After a 10% loss", value: 11.1, display: "about +11%", tone: "warn" },
    { label: "After a 25% loss", value: 33.3, display: "+33%", tone: "warn" },
    { label: "After a 50% loss", value: 100, display: "+100%", tone: "down" },
  ] } },
  { lesson: "u1-the-honest-numbers", step: "What this course will and won't do", scene: { kind: "checklist", title: "This course", items: [
    { text: "Teaches how markets really work", mark: "ok" },
    { text: "Helps you avoid the classic ways to lose", mark: "ok" },
    { text: "Shows how to test an edge before betting on it", mark: "ok" },
    { text: "Cannot make you profitable on its own", mark: "bad" },
  ] } },

  // ── u2-bid-ask-and-spread ──
  { lesson: "u2-bid-ask-and-spread", step: "There are always two prices", scene: { kind: "compare", columns: [
    { title: "Bid", icon: "trending-down", tone: "down", points: ["The highest price a buyer will pay", "You sell at the bid"] },
    { title: "Ask", icon: "trending-up", tone: "up", points: ["The lowest price a seller will accept", "You buy at the ask"] },
  ] } },
  { lesson: "u2-bid-ask-and-spread", step: "What makes spreads tight or wide", scene: { kind: "compare", columns: [
    { title: "Tight spreads", icon: "check", tone: "up", points: ["Busy markets: EUR/USD, ES, Bitcoin", "The busiest sessions"] },
    { title: "Wide spreads", icon: "alert", tone: "warn", points: ["Small stocks, exotic pairs, new tokens", "Quiet hours and the 5 pm rollover", "Around big news"] },
  ] } },

  // ── u2-the-order-book-and-liquidity ──
  { lesson: "u2-the-order-book-and-liquidity", step: "What liquidity means", scene: { kind: "compare", columns: [
    { title: "Deep book", icon: "layers", tone: "up", points: ["Large size at every level", "Levels close together", "Fills near the price you see"] },
    { title: "Thin book", icon: "alert", tone: "warn", points: ["Little size", "Gaps between levels", "A modest order moves the price"] },
  ] } },
  { lesson: "u2-the-order-book-and-liquidity", step: "Liquidity you can't see", scene: { kind: "path", title: "Where stop orders wait", points: [50, 56, 53, 60, 57, 62, 55, 58, 51, 54, 48, 52, 49, 55, 58],
    marks: [{ at: 5, label: "Old high" }, { at: 10, label: "Old low", side: "below" }],
    levels: [{ price: 64, label: "Stops cluster just above", tone: "warn" }, { price: 46, label: "Stops cluster just below", tone: "warn" }] } },

  // ── u2-market-orders-and-slippage ──
  { lesson: "u2-market-orders-and-slippage", step: "Slippage", scene: { kind: "flow", title: "Example: a market buy", nodes: [
    { label: "You expect 100.00", icon: "eye" },
    { label: "Not enough size there", icon: "layers", tone: "warn" },
    { label: "Filled at 100.06", icon: "check", tone: "warn" },
    { label: "Slippage: 0.06", icon: "coins", tone: "down" },
  ] } },
  { lesson: "u2-market-orders-and-slippage", step: "When slippage gets ugly", scene: { kind: "checklist", title: "Expect the most slippage", items: [
    { text: "Right as big news hits", mark: "bad" },
    { text: "At the open of a session", mark: "bad" },
    { text: "In thin markets and quiet hours", mark: "bad" },
    { text: "When many stops trigger at once", mark: "bad" },
  ] } },
  { lesson: "u2-market-orders-and-slippage", step: "When a market order is the right tool", scene: { kind: "compare", columns: [
    { title: "Market order", icon: "zap", tone: "accent", points: ["Getting in or out now matters most", "Small size in a liquid market"] },
    { title: "Consider a limit", icon: "target", tone: "up", points: ["Big size", "Thin markets", "Around news"] },
  ] } },

  // ── u2-limit-orders ──
  { lesson: "u2-limit-orders", step: "Limit orders: my price or better", scene: { kind: "compare", columns: [
    { title: "Buy limit", icon: "trending-up", tone: "up", points: ["Fills at your price or lower", "Usually rests below the price"] },
    { title: "Sell limit", icon: "trending-down", tone: "down", points: ["Fills at your price or higher", "Usually rests above the price"] },
  ] }, caption: "A limit order guarantees the price, but not the fill." },
  { lesson: "u2-limit-orders", step: "Queues, partial fills and fees", scene: { kind: "compare", columns: [
    { title: "Maker", icon: "layers", tone: "up", points: ["A resting limit order", "Adds liquidity to the book", "Often lower fees"] },
    { title: "Taker", icon: "zap", tone: "warn", points: ["A market order", "Takes liquidity", "Often higher fees"] },
  ] } },

  // ── u2-stop-and-stop-limit-orders ──
  { lesson: "u2-stop-and-stop-limit-orders", step: "Stop orders: wake up at a price", scene: { kind: "compare", columns: [
    { title: "Sell stop", icon: "trending-down", tone: "down", points: ["Sits below the current price", "The stop-loss on a long"] },
    { title: "Buy stop", icon: "trending-up", tone: "up", points: ["Sits above the current price", "The stop-loss on a short", "Or an entry on a breakout"] },
  ] } },
  { lesson: "u2-stop-and-stop-limit-orders", step: "Stops can slip", scene: { kind: "path", title: "A gap through a stop", points: [100, 100.4, 99.8, 100.1, 99.5, 99.2, 97.6, 97.2, 97.5],
    marks: [{ at: 5, label: "Still above the stop" }, { at: 6, label: "Jumps past it: filled down here", tone: "down", side: "below" }],
    levels: [{ price: 98.8, label: "Your stop", tone: "down" }] } },
  { lesson: "u2-stop-and-stop-limit-orders", step: "Stop-limit orders", scene: { kind: "compare", columns: [
    { title: "Stop order", icon: "zap", tone: "accent", points: ["Becomes a market order", "Always gets you out", "The price can be bad"] },
    { title: "Stop-limit", icon: "target", tone: "warn", points: ["Becomes a limit order", "No terrible fill", "May not fill at all"] },
  ] } },

  // ── u2-going-long-and-going-short ──
  { lesson: "u2-going-long-and-going-short", step: "How you can sell what you don't own", scene: { kind: "flow", title: "Shorting a stock", nodes: [
    { label: "Borrow shares", sub: "from your broker", icon: "hand" },
    { label: "Sell them now", icon: "trending-down", tone: "down" },
    { label: "Buy them back later", icon: "trending-up", tone: "up" },
    { label: "Return them", sub: "and pay a borrowing fee", icon: "repeat" },
  ] } },
  { lesson: "u2-going-long-and-going-short", step: "Why shorts need extra care", scene: { kind: "compare", columns: [
    { title: "Long", icon: "trending-up", tone: "up", points: ["Can lose at most what you paid", "Price can't go below zero"] },
    { title: "Short", icon: "trending-down", tone: "down", points: ["The loss has no ceiling", "Price can keep rising", "Short squeezes can be brutal"] },
  ] } },

  // ── u2-leverage-and-margin ──
  { lesson: "u2-leverage-and-margin", step: "Leverage: a big position from a small deposit", scene: { kind: "bars", title: "20:1 leverage", bars: [
    { label: "Your margin", value: 1000, display: "$1,000", tone: "accent" },
    { label: "The position it controls", value: 20000, display: "$20,000", tone: "warn" },
  ] } },
  { lesson: "u2-leverage-and-margin", step: "Gains and losses are magnified", scene: { kind: "grid", title: "At 20:1 leverage", corner: "Price moves against you", cols: ["1%", "2%", "5%"], rows: [
    { label: "Your margin loses", cells: ["20%", "40%", "100%"], tones: ["warn", "warn", "down"] },
  ] } },
  { lesson: "u2-leverage-and-margin", step: "A futures example", scene: { kind: "bars", title: "A 100-point move in the Nasdaq-100", bars: [
    { label: "1 NQ contract, $20 a point", value: 2000, display: "$2,000", tone: "warn" },
    { label: "1 MNQ contract, $2 a point", value: 200, display: "$200", tone: "accent" },
  ] } },
  { lesson: "u2-leverage-and-margin", step: "Margin calls and liquidation", scene: { kind: "flow", title: "When the margin runs out", nodes: [
    { label: "Losses eat your margin", icon: "trending-down", tone: "warn" },
    { label: "Margin call", sub: "add money, or else", icon: "alert", tone: "warn" },
    { label: "Liquidation", sub: "the position is closed for you", icon: "ban", tone: "down" },
  ] } },

  // ── u2-what-trading-really-costs ──
  { lesson: "u2-what-trading-really-costs", step: "Every trade has a price tag", scene: { kind: "checklist", title: "The layers of cost", items: [
    { text: "Spread, on every entry and exit", mark: "dot" },
    { text: "Commission, per trade or per contract", mark: "dot" },
    { text: "Slippage, on market and stop orders", mark: "dot" },
    { text: "Financing, for leveraged positions held overnight", mark: "dot" },
    { text: "Platform, data and withdrawal fees at some brokers", mark: "dot" },
  ] } },
  { lesson: "u2-what-trading-really-costs", step: "Overnight financing", scene: { kind: "compare", columns: [
    { title: "Forex and CFDs: swap", icon: "moon", tone: "accent", points: ["At the 5 pm New York rollover", "From the interest rate difference", "Often three days' worth on Wednesday"] },
    { title: "Crypto perpetuals: funding", icon: "bitcoin", tone: "warn", points: ["Paid between longs and shorts", "Often every 8 hours", "Keeps the price near spot"] },
  ] } },
  { lesson: "u2-what-trading-really-costs", step: "Small costs add up fast", scene: { kind: "flow", title: "How a tiny cost grows", nodes: [
    { label: "One small commission", icon: "coins" },
    { label: "On every trade", icon: "repeat", tone: "warn" },
    { label: "Every day", icon: "calendar", tone: "warn" },
    { label: "A big number", icon: "wallet", tone: "down" },
  ] } },

  // ── u2-pips-points-ticks-and-lots ──
  { lesson: "u2-pips-points-ticks-and-lots", step: "Pips: the forex unit", scene: { kind: "ticks", title: "One pip, and a few pipettes", rows: [
    { market: "EUR/USD", from: "1.0850", to: "1.0851", unit: "1 pip = 0.0001" },
    { market: "A yen pair", from: "150.00", to: "150.01", unit: "1 pip = 0.01" },
    { market: "EUR/USD, extra decimal", from: "1.08500", to: "1.08503", unit: "3 pipettes" },
  ] } },
  { lesson: "u2-pips-points-ticks-and-lots", step: "Lots: the forex size", scene: { kind: "bars", title: "What one pip is worth on EUR/USD", bars: [
    { label: "Standard lot: 100,000", value: 10, display: "about $10", tone: "warn" },
    { label: "Mini lot: 10,000", value: 1, display: "$1", tone: "accent" },
    { label: "Micro lot: 1,000", value: 0.1, display: "$0.10", tone: "accent" },
  ] } },
  { lesson: "u2-pips-points-ticks-and-lots", step: "Points and ticks: the futures units", scene: { kind: "grid", title: "Futures: what a move is worth", corner: "Contract", cols: ["Tick size", "Per tick", "Per point"], rows: [
    { label: "NQ", cells: ["0.25", "$5", "$20"] },
    { label: "ES", cells: ["0.25", "$12.50", "$50"] },
    { label: "Gold (GC)", cells: ["$0.10", "$10", "$100"] },
  ] }, caption: "Gold's point here is a $1.00 move on the 100-ounce contract: ten ticks." },
  { lesson: "u2-pips-points-ticks-and-lots", step: "Why this matters", scene: { kind: "flow", title: "The one thing to know before any trade", nodes: [
    { label: "What one unit of movement is worth", sub: "at your size", icon: "calculator", tone: "accent" },
    { label: "Set your stop", icon: "shield" },
    { label: "Size your position", icon: "scale" },
  ] } },
]
