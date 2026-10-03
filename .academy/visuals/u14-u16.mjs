// Visuals for Level 4, part 2 and Level 5: news (U14), markets and styles (U15), EntrixAlgo tools (U16).
// Every fact is the one in the step's own text. Price paths and the calendar
// example are drawings of the idea, and their captions say so.
export default [
  // ── u14-why-news-moves-price ──
  { lesson: "u14-why-news-moves-price", step: "Surprise moves markets", scene: { kind: "flow", title: "What actually moves price", nodes: [
    { label: "Forecast", sub: "already in the price", icon: "target" },
    { label: "Actual", sub: "the number released", icon: "news" },
    { label: "Surprise", sub: "the gap between them", icon: "zap", tone: "warn" },
    { label: "Price moves", icon: "candles", tone: "up" },
  ] } },
  { lesson: "u14-why-news-moves-price", step: "Priced in, and sell the news", scene: { kind: "path", title: "Buy the rumour, sell the news", points: [100, 100.8, 101.9, 102.6, 103.8, 104.9, 106, 105, 103.6, 102.8, 102.1],
    marks: [{ at: 1, label: "Price rises on the expectation", side: "below" }, { at: 6, label: "The event arrives", tone: "warn" }, { at: 10, label: "No one left to buy", tone: "down", side: "below" }] },
    caption: "A drawing of the saying, not a real chart." },

  // ── u14-the-economic-calendar ──
  { lesson: "u14-the-economic-calendar", step: "Your weekly map of volatility", scene: { kind: "flow", title: "Three numbers on every release", nodes: [
    { label: "Previous", sub: "the last reading", icon: "clock" },
    { label: "Forecast", sub: "what is expected", icon: "target", tone: "accent" },
    { label: "Actual", sub: "filled in once released", icon: "check", tone: "up" },
  ] }, caption: "Each row also shows the date, the time and the expected impact: low, medium or high." },
  { lesson: "u14-the-economic-calendar", step: "The big ones for US markets", scene: { kind: "grid", title: "The big US releases", corner: "New York time", cols: ["What", "How often", "Time"], rows: [
    { label: "CPI", cells: ["Inflation", "Monthly", "8:30 am"], tones: ["neutral", "neutral", "accent"] },
    { label: "NFP", cells: ["Jobs", "First Friday", "8:30 am"], tones: ["neutral", "neutral", "accent"] },
    { label: "FOMC", cells: ["Rate decision", "8 times a year", "2:00 pm"], tones: ["neutral", "neutral", "warn"] },
  ] }, caption: "Non-farm payrolls usually land on the first Friday of the month." },

  // ── u14-rates-and-central-banks ──
  { lesson: "u14-rates-and-central-banks", step: "The most important price in the world", scene: { kind: "compare", title: "Interest rates: the price of money", columns: [
    { title: "Who decides", icon: "bank", tone: "accent", points: ["Central banks", "In the US, the FOMC", "It meets eight times a year"] },
    { title: "What it reaches", icon: "globe", tone: "up", points: ["What companies pay to borrow", "What savings earn", "What a currency is worth", "What investors pay for future profits"] },
  ] } },
  { lesson: "u14-rates-and-central-banks", step: "How markets tend to react", scene: { kind: "grid", title: "The usual reaction", corner: "", cols: ["Currency", "Stocks", "Gold"], rows: [
    { label: "Higher rates", cells: ["Stronger", "Weighed on", "Weighed on"], tones: ["up", "down", "down"] },
    { label: "Lower rates", cells: ["Weaker", "Supported", "Supported"], tones: ["down", "up", "up"] },
  ] }, caption: "Tendencies, not rules. It is the surprise that matters." },
  { lesson: "u14-rates-and-central-banks", step: "Reading the Fed", scene: { kind: "path", title: "A common FOMC afternoon", points: [100, 100.1, 99.9, 100, 101.5, 102, 101.7, 100.8, 99.7, 99, 98.8],
    marks: [{ at: 3, label: "2:00 pm decision", side: "below" }, { at: 5, label: "First move", tone: "warn" }, { at: 7, label: "2:30 pm press conference" }, { at: 10, label: "Often reversed", tone: "down", side: "below" }] },
    caption: "A drawing of the pattern, not a real session." },

  // ── u14-inflation-and-cpi ──
  { lesson: "u14-inflation-and-cpi", step: "Measuring rising prices", scene: { kind: "compare", columns: [
    { title: "Headline CPI", icon: "coins", tone: "accent", points: ["A basket of goods and services", "Its change over a year is the inflation rate"] },
    { title: "Core CPI", icon: "filter", tone: "up", points: ["Leaves out food and energy", "Shows the underlying trend", "Markets often care more about it"] },
  ] } },
  { lesson: "u14-inflation-and-cpi", step: "Why traders care", scene: { kind: "flow", title: "When CPI comes in hot", nodes: [
    { label: "Hot CPI", sub: "above forecast", icon: "flame", tone: "warn" },
    { label: "Rate hikes more likely", sub: "or fewer cuts", icon: "percent" },
    { label: "Dollar tends to rise", icon: "trending-up", tone: "up" },
    { label: "Stocks and gold tend to fall", icon: "trending-down", tone: "down" },
  ] }, caption: "A cool reading tends to do the opposite." },

  // ── u14-jobs-and-nfp ──
  { lesson: "u14-jobs-and-nfp", step: "The jobs report", scene: { kind: "compare", title: "One report, three numbers", columns: [
    { title: "Non-farm payrolls", icon: "users", tone: "accent", points: ["The headline", "Jobs added outside farming"] },
    { title: "Unemployment rate", icon: "percent", tone: "warn", points: ["In the same report"] },
    { title: "Hourly earnings", icon: "wallet", tone: "up", points: ["Average hourly earnings", "That is wage growth"] },
  ] } },
  { lesson: "u14-jobs-and-nfp", step: "Reading the reaction", scene: { kind: "flow", title: "Why the first reaction can mislead", nodes: [
    { label: "Strong headline", icon: "trending-up", tone: "up" },
    { label: "Earlier months revised down", icon: "repeat", tone: "warn" },
    { label: "A confusing reaction", icon: "alert", tone: "warn" },
    { label: "The first spike often reverses", icon: "trending-down", tone: "down" },
  ] } },

  // ── u14-earnings-and-crypto-drivers ──
  { lesson: "u14-earnings-and-crypto-drivers", step: "Earnings season", scene: { kind: "compare", title: "What traders read in a report", columns: [
    { title: "EPS", icon: "coins", tone: "accent", points: ["Earnings per share", "Against analysts' estimates"] },
    { title: "Revenue", icon: "chart", tone: "accent", points: ["Against analysts' estimates"] },
    { title: "Guidance", icon: "eye", tone: "up", points: ["What management expects next", "Often moves the stock most"] },
  ] } },
  { lesson: "u14-earnings-and-crypto-drivers", step: "Big tech moves the indices", scene: { kind: "flow", nodes: [
    { label: "A handful of very large companies", icon: "building" },
    { label: "A big part of the Nasdaq-100 and S&P 500", icon: "layers", tone: "accent" },
    { label: "Their earnings", icon: "news", tone: "warn" },
    { label: "Can move NQ and ES", sub: "even after hours", icon: "candles", tone: "up" },
  ] } },
  { lesson: "u14-earnings-and-crypto-drivers", step: "What moves crypto", scene: { kind: "checklist", title: "Crypto's own drivers", items: [
    { text: "The halving: new Bitcoin per block is cut in half", mark: "dot" },
    { text: "Fund flows, such as spot Bitcoin ETFs", mark: "dot" },
    { text: "Regulation and enforcement news", mark: "dot" },
    { text: "Exchange events: hacks or collapses", mark: "dot" },
    { text: "Macro forces, like interest rates", mark: "dot" },
  ] } },

  // ── u14-trading-around-news ──
  { lesson: "u14-trading-around-news", step: "Your options", scene: { kind: "timeline", title: "Around a high-impact release", events: [
    { time: "A few minutes before", label: "Be flat, or reduce size", tone: "accent" },
    { time: "The release", label: "Stops slip most at obvious levels", tone: "down" },
    { time: "First 5 to 15 minutes", label: "Wait and let it play out", tone: "warn" },
    { time: "After", label: "Trade the structure that forms", tone: "up" },
  ] } },

  // ── u15-forex ──
  { lesson: "u15-forex", step: "The forex playbook", scene: { kind: "compare", title: "Three kinds of pair", columns: [
    { title: "Majors", icon: "coins", tone: "up", points: ["The US dollar and another big currency", "EUR/USD, USD/JPY, GBP/USD"] },
    { title: "Crosses", icon: "repeat", tone: "accent", points: ["Leave the dollar out", "EUR/GBP, GBP/JPY"] },
    { title: "Exotics", icon: "globe", tone: "warn", points: ["A major and an emerging-market currency", "Much wider spreads"] },
  ] } },
  { lesson: "u15-forex", step: "What drives it", scene: { kind: "compare", columns: [
    { title: "What drives a pair", icon: "scale", tone: "accent", points: ["Interest rate differences", "Central bank decisions and guidance", "Inflation and jobs data", "Risk appetite"] },
    { title: "When markets are scared", icon: "shield", tone: "warn", points: ["The yen often strengthens", "So does the Swiss franc"] },
  ] } },
  { lesson: "u15-forex", step: "Watch-outs", scene: { kind: "compare", columns: [
    { title: "Leverage", icon: "alert", tone: "down", points: ["Offshore brokers offer extreme leverage", "Size from your stop regardless"] },
    { title: "Swap", icon: "moon", tone: "warn", points: ["Holding past 5 pm New York time", "Costs or earns interest"] },
    { title: "Broker", icon: "bank", tone: "accent", points: ["Spot forex is OTC", "Check that it is regulated"] },
  ] } },

  // ── u15-crypto ──
  { lesson: "u15-crypto", step: "The crypto playbook", scene: { kind: "compare", title: "Two ways to trade a coin", columns: [
    { title: "Spot", icon: "bitcoin", tone: "up", points: ["You own the coin"] },
    { title: "Perpetual futures", icon: "repeat", tone: "warn", points: ["Leveraged contracts", "No expiry", "Use funding payments"] },
  ] }, caption: "Both trade 24/7. Weekends are often thinner." },
  { lesson: "u15-crypto", step: "Risks unique to crypto", scene: { kind: "cycle", title: "A liquidation cascade", center: "So much leverage in perps", nodes: [
    { label: "A fast move", tone: "warn" },
    { label: "Liquidations are triggered", tone: "down" },
    { label: "They push price further", tone: "down" },
  ] }, caption: "One of the four risks: volatility, liquidation cascades, exchange risk and manipulation." },
  { lesson: "u15-crypto", step: "Making it workable", scene: { kind: "checklist", items: [
    { text: "Trade the most liquid coins while learning: BTC, ETH", mark: "ok" },
    { text: "Low leverage and stop-based sizing", mark: "ok" },
    { text: "Watch funding rates if you hold perps for days", mark: "ok" },
    { text: "Regulated, reputable venues where available", mark: "ok" },
  ] } },

  // ── u15-stocks ──
  { lesson: "u15-stocks", step: "The stocks playbook", scene: { kind: "timeline", title: "The US stock day, New York time", events: [
    { time: "Before the open", label: "Pre-market: thinner", tone: "neutral" },
    { time: "9:30 am", label: "Regular session opens", tone: "up" },
    { time: "4:00 pm", label: "Regular session closes", tone: "up" },
    { time: "After the close", label: "After-hours: thinner", tone: "neutral" },
  ] } },
  { lesson: "u15-stocks", step: "Watch-outs", scene: { kind: "path", title: "A gap jumps over a stop", points: [100, 100.6, 100.2, 100.9, 100.5, 95.8, 96.3, 95.6, 96.1],
    marks: [{ at: 4, label: "Last close" }, { at: 5, label: "Next open", tone: "down", side: "below" }],
    levels: [{ price: 99, label: "Stop", tone: "down" }] },
    caption: "A drawing of the idea: overnight news or earnings make the stock open far from the last close." },

  // ── u15-futures-and-indices ──
  { lesson: "u15-futures-and-indices", step: "The futures playbook", scene: { kind: "bars", title: "What one point is worth", max: 50, bars: [
    { label: "ES (S&P 500)", value: 50, display: "$50", tone: "accent" },
    { label: "NQ (Nasdaq-100)", value: 20, display: "$20", tone: "accent" },
    { label: "MES (micro)", value: 5, display: "$5", tone: "up" },
    { label: "MNQ (micro)", value: 2, display: "$2", tone: "up" },
  ] }, caption: "The micros are a tenth of the size." },
  { lesson: "u15-futures-and-indices", step: "Expiry and rollover", scene: { kind: "timeline", title: "Index futures expire every quarter", events: [
    { time: "March", label: "Expiry" },
    { time: "June", label: "Expiry" },
    { time: "September", label: "Expiry" },
    { time: "December", label: "Expiry" },
  ] }, caption: "About a week before each expiry, volume moves to the next contract and traders roll forward." },
  { lesson: "u15-futures-and-indices", step: "Why traders like them, and the catches", scene: { kind: "compare", columns: [
    { title: "Why traders like them", icon: "check", tone: "up", points: ["A central exchange", "Transparent prices and real volume", "Nearly round the clock", "Micros suit small accounts"] },
    { title: "The catches", icon: "alert", tone: "warn", points: ["Leverage is high: size from your stop", "Prop firm evaluations: most participants don't pass"] },
  ] } },

  // ── u15-gold ──
  { lesson: "u15-gold", step: "The gold playbook", scene: { kind: "compare", title: "Three ways to trade gold", columns: [
    { title: "XAU/USD", icon: "gold", tone: "warn", points: ["Spot gold", "Through forex and CFD brokers"] },
    { title: "GC", icon: "layers", tone: "accent", points: ["Futures", "100 troy ounces", "$10 per 0.10 move"] },
    { title: "MGC", icon: "layers", tone: "up", points: ["Micro gold futures", "10 ounces"] },
  ] } },
  { lesson: "u15-gold", step: "What drives gold", scene: { kind: "compare", columns: [
    { title: "Gold tends to shine", icon: "trending-up", tone: "up", points: ["Rates after inflation fall", "The dollar weakens", "Fear: a safe haven in crises", "Central banks are buying"] },
    { title: "Gold tends to suffer", icon: "trending-down", tone: "down", points: ["Rates after inflation rise", "The dollar strengthens"] },
  ] } },

  // ── u15-choosing-your-market ──
  { lesson: "u15-choosing-your-market", step: "Fit the market to your life", scene: { kind: "flow", title: "Four questions decide it", nodes: [
    { label: "When can you trade?", icon: "clock" },
    { label: "How much capital?", icon: "wallet" },
    { label: "How much volatility can you stomach?", icon: "candles" },
    { label: "What costs and rules apply where you live?", icon: "scale" },
    { label: "The best market for you", icon: "target", tone: "up" },
  ] } },
  { lesson: "u15-choosing-your-market", step: "Start with one", scene: { kind: "flow", title: "Specialise first", nodes: [
    { label: "One market", icon: "target", tone: "accent" },
    { label: "Months of screen time", sub: "on one chart", icon: "hourglass", tone: "warn" },
    { label: "You know its rhythm", sub: "when it moves, how far, how it reacts to news", icon: "eye", tone: "up" },
  ] } },

  // ── u15-choosing-your-style ──
  { lesson: "u15-choosing-your-style", step: "Four styles", scene: { kind: "grid", title: "Four styles, by holding time", corner: "Style", cols: ["Each trade lasts", "What it looks like"], rows: [
    { label: "Scalping", cells: ["Seconds to minutes", "Many trades, tiny targets"], tones: ["warn", "neutral"] },
    { label: "Day trading", cells: ["Minutes to hours", "Flat by the end of the day"], tones: ["accent", "neutral"] },
    { label: "Swing", cells: ["Days to a few weeks", "4-hour and daily charts"], tones: ["up", "neutral"] },
    { label: "Position", cells: ["Weeks to months", "Following big trends"], tones: ["up", "neutral"] },
  ] } },
  { lesson: "u15-choosing-your-style", step: "The trade-offs", scene: { kind: "compare", columns: [
    { title: "Shorter styles", icon: "zap", tone: "warn", points: ["More trades, faster feedback", "Costs eat more of each small target", "Intense focus in market hours"] },
    { title: "Longer styles", icon: "hourglass", tone: "accent", points: ["Less screen time, less in costs", "Sit through overnight gaps and news", "Slow feedback: months to build a sample"] },
  ] } },
  { lesson: "u15-choosing-your-style", step: "Where to go from here", scene: { kind: "flow", title: "What comes next", nodes: [
    { label: "Pick a market and a style", icon: "target" },
    { label: "Write your plan", icon: "pen" },
    { label: "Backtest it honestly", icon: "search", tone: "accent" },
    { label: "Forward test it small", icon: "seed", tone: "up" },
  ] } },

  // ── u16-reading-a-chart-analysis ──
  { lesson: "u16-reading-a-chart-analysis", step: "Better screenshots, better levels", scene: { kind: "checklist", title: "Before you take the screenshot", items: [
    { text: "Zoom the price text to about 125% or more", mark: "ok" },
    { text: "Show the ticker and timeframe labels", mark: "ok" },
    { text: "Keep the price axis on screen", mark: "ok" },
    { text: "Blurry, or no price axis: no exact levels", mark: "bad" },
  ] } },
  { lesson: "u16-reading-a-chart-analysis", step: "Confidence and NEUTRAL", scene: { kind: "path", title: "What NEUTRAL gives you", points: [100, 100.4, 99.7, 100.3, 99.8, 100.5, 100.2, 101.3, 101.6],
    marks: [{ at: 3, label: "NEUTRAL: no trade", side: "below" }, { at: 7, label: "A close beyond it", tone: "accent" }],
    levels: [{ price: 101, label: "Long above", tone: "up" }, { price: 99, label: "Short below", tone: "down" }] },
    caption: "Wait for a candle to close beyond one of the two levels, then run a fresh analysis." },
  { lesson: "u16-reading-a-chart-analysis", step: "Limit entries", scene: { kind: "compare", title: "A limit entry has two outcomes", columns: [
    { title: "Price comes to your limit", icon: "check", tone: "up", points: ["The order fills", "The plan is on"] },
    { title: "Price reaches TP1 first", icon: "ban", tone: "down", points: ["No fill", "The setup is gone", "Don't chase it"] },
  ] } },
  { lesson: "u16-reading-a-chart-analysis", step: "Using it the right way", scene: { kind: "flow", title: "A second opinion, not an order", nodes: [
    { label: "Chart Analysis", sub: "a fast, structured second opinion", icon: "search", tone: "accent" },
    { label: "Check it", sub: "your bias, the killzone, the news calendar", icon: "eye", tone: "warn" },
    { label: "Risk Calculator", sub: "size from its stop", icon: "calculator", tone: "up" },
  ] } },

  // ── u16-the-ai-screener ──
  { lesson: "u16-the-ai-screener", step: "Finding what's moving", scene: { kind: "stat", title: "The shortlist, refreshed roughly every hour", stats: [
    { value: 5, label: "crypto picks", tone: "accent" },
    { value: 5, label: "stock picks", tone: "accent" },
    { value: 100, label: "top of the potential score, which starts at 0", tone: "up" },
  ] } },
  { lesson: "u16-the-ai-screener", step: "A watchlist, not a signal", scene: { kind: "compare", columns: [
    { title: "What it gives you", icon: "eye", tone: "up", points: ["Bullish, Bearish or Watch", "A potential score", "Where to look"] },
    { title: "Left out on purpose", icon: "ban", tone: "warn", points: ["No entry", "No stop", "No target", "What to do is your work"] },
  ] } },
  { lesson: "u16-the-ai-screener", step: "Fitting it into your day", scene: { kind: "flow", nodes: [
    { label: "Before your session", sub: "check the Screener for ideas", icon: "search" },
    { label: "Check for news", sub: "economic calendar and earnings", icon: "news", tone: "warn" },
    { label: "Open the chart", sub: "fair value gaps, swept liquidity", icon: "candles", tone: "accent" },
    { label: "Your own analysis", icon: "brain", tone: "up" },
  ] } },

  // ── u16-the-ai-indicator ──
  { lesson: "u16-the-ai-indicator", step: "Signals on your own chart", scene: { kind: "compare", title: "A tool inside your process", columns: [
    { title: "What an indicator does", icon: "candles", tone: "accent", points: ["Runs on your chart", "Paints signals directly on it"] },
    { title: "What it doesn't do", icon: "ban", tone: "warn", points: ["Replace your process"] },
  ] } },
  { lesson: "u16-the-ai-indicator", step: "Test it before you trust it", scene: { kind: "flow", title: "Before any real money", nodes: [
    { label: "Bar replay", sub: "your market, your timeframe", icon: "repeat" },
    { label: "Candle by candle", sub: "step through the past", icon: "candles" },
    { label: "Log every signal", sub: "winners and losers", icon: "pen", tone: "accent" },
    { label: "Do they hold up?", icon: "scale", tone: "warn" },
  ] } },
  { lesson: "u16-the-ai-indicator", step: "Signals plus context", scene: { kind: "checklist", title: "A signal is better when it is", items: [
    { text: "In line with the higher-timeframe bias", mark: "ok" },
    { text: "Inside a killzone", mark: "ok" },
    { text: "Away from big news", mark: "ok" },
    { text: "At a level where liquidity or an imbalance makes sense", mark: "ok" },
    { text: "Sized from its stop, and journaled", mark: "ok" },
  ] } },

  // ── u16-journal-and-calendar-workflow ──
  { lesson: "u16-journal-and-calendar-workflow", step: "The Trade Journal", scene: { kind: "compare", columns: [
    { title: "You log", icon: "pen", tone: "accent", points: ["Date, pair, direction", "Entry, exit, P&L"] },
    { title: "It shows", icon: "chart", tone: "up", points: ["Win rate and totals", "Wins and losses filter", "Search by pair"] },
    { title: "CSV export", icon: "list", tone: "warn", points: ["Add your own columns", "Setup, result in R", "Followed the plan?", "How you felt"] },
  ] } },
  { lesson: "u16-journal-and-calendar-workflow", step: "The Trade Calendar", scene: { kind: "grid", title: "Green days and red days", corner: "", cols: ["Mon", "Tue", "Wed", "Thu", "Fri"], signed: true, rows: [
    { label: "Week 1", cells: [120, -80, 0, 210, -60] },
    { label: "Week 2", cells: [-90, 150, 60, -40, 180] },
  ] }, caption: "Example daily results in dollars, to show the idea." },
  { lesson: "u16-journal-and-calendar-workflow", step: "A simple workflow", scene: { kind: "timeline", events: [
    { time: "After every session", label: "Log every trade, the same day", tone: "accent" },
    { time: "Every week", label: "Calendar for your weekly review", tone: "warn" },
    { time: "Every month", label: "Export the CSV: which setups pay?", tone: "up" },
  ] } },

  // ── u16-the-ai-trading-bot ──
  { lesson: "u16-the-ai-trading-bot", step: "A trading tutor that's always on", scene: { kind: "compare", columns: [
    { title: "Ask it about", icon: "message", tone: "accent", points: ["Strategy", "Risk management", "Order types", "Psychology"] },
    { title: "Alongside this course", icon: "book", tone: "up", points: ["A concept explained again in different words", "An example with your own numbers"] },
  ] } },
  { lesson: "u16-the-ai-trading-bot", step: "Good ways to use it", scene: { kind: "cycle", title: "Four good ways to use it", center: "Ask the AI Trading Bot to", nodes: [
    { label: "Explain a concept", tone: "accent" },
    { label: "Calculate a position size", tone: "up" },
    { label: "Quiz you", tone: "warn" },
    { label: "Review your plan", tone: "accent" },
  ] } },
  { lesson: "u16-the-ai-trading-bot", step: "Trust, but verify", scene: { kind: "grid", title: "Double-check anything you'll act on", corner: "", cols: ["Check it with"], rows: [
    { label: "Contract specs", cells: ["The exchange"], tones: ["accent"] },
    { label: "Rules", cells: ["Your broker"], tones: ["accent"] },
    { label: "Calculations", cells: ["By hand, or the Risk Calculator"], tones: ["up"] },
  ] } },

  // ── u16-a-daily-routine ──
  { lesson: "u16-a-daily-routine", step: "Putting it all together", scene: { kind: "cycle", center: "Every trading day", nodes: [
    { label: "Before the session", tone: "accent" },
    { label: "During the session", tone: "warn" },
    { label: "After the session", tone: "up" },
  ] } },
  { lesson: "u16-a-daily-routine", step: "Before the session", scene: { kind: "checklist", items: [
    { text: "Economic calendar: any high-impact news?", mark: "ok" },
    { text: "AI Screener, if you trade crypto or stocks", mark: "ok" },
    { text: "Mark the higher-timeframe bias", mark: "ok" },
    { text: "Draw on liquidity and key levels", mark: "ok" },
    { text: "Decide what would prove your bias wrong", mark: "ok" },
  ] } },
  { lesson: "u16-a-daily-routine", step: "During the session", scene: { kind: "flow", nodes: [
    { label: "Your killzone", sub: "your written setups only", icon: "clock" },
    { label: "Chart Analysis", sub: "a second opinion, if you like", icon: "search", tone: "accent" },
    { label: "Risk Calculator", sub: "size from the stop", icon: "calculator", tone: "up" },
    { label: "Your limits", sub: "daily loss and maximum trades", icon: "shield", tone: "warn" },
  ] } },
  { lesson: "u16-a-daily-routine", step: "After the session, and every week", scene: { kind: "compare", columns: [
    { title: "After every session", icon: "pen", tone: "accent", points: ["Log every trade in the Trade Journal", "Five minutes of Practice", "Ask the AI Trading Bot what confused you"] },
    { title: "Once a week", icon: "calendar", tone: "up", points: ["Open the Trade Calendar for your review", "Pick one thing to improve"] },
  ] } },
  { lesson: "u16-a-daily-routine", step: "One last thing", scene: { kind: "flow", nodes: [
    { label: "The final exam", sub: "on the Academy page", icon: "pen", tone: "accent" },
    { label: "Your certificate", icon: "star", tone: "up" },
    { label: "The real work", sub: "plan, test, risk small, keep practising", icon: "seed", tone: "warn" },
  ] } },
]
