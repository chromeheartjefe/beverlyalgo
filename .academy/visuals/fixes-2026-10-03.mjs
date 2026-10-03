// Scene fixes from the 2026-10-03 Academy review: a wrong label, labels the price
// line ran through, unlabelled lines, and a few clearer layouts. Each one replaces
// the scene the step already had.
export default [
  // 19. The strong low is the one that launched the latest break of structure
  { replace: true, lesson: "u4-internal-vs-swing-structure", step: "Strong and weak highs and lows", scene: { kind: "path", title: "In an uptrend", points: [100, 104, 101.5, 108, 105.5, 111, 109.5],
    marks: [{ at: 3, label: "Old swing high" }, { at: 4, label: "Strong low", tone: "up", side: "below" }, { at: 5, label: "Weak high", tone: "warn" }] },
    caption: "The strong low launched the move that broke the old swing high. The weak high is the newest one, not broken yet." },

  // 20. Same colours as the order book figure: buyers green, sellers red
  { replace: true, lesson: "u2-bid-ask-and-spread", step: "There are always two prices", scene: { kind: "compare", columns: [
    { title: "Bid", icon: "users", tone: "up", points: ["The highest price a buyer will pay", "You sell at the bid"] },
    { title: "Ask", icon: "users", tone: "down", points: ["The lowest price a seller will accept", "You buy at the ask"] },
  ] } },

  // 21. Labels moved to turning points, so the price line no longer runs through them
  { replace: true, lesson: "u2-stop-and-stop-limit-orders", step: "Stops can slip", scene: { kind: "path", title: "A gap through a stop", points: [100, 100.4, 99.8, 100.1, 99.3, 99.6, 97.4, 97.6, 97.5],
    marks: [{ at: 5, label: "Still above the stop" }, { at: 6, label: "Jumps past it: filled down here", tone: "down", side: "below" }],
    levels: [{ price: 98.8, label: "Your stop", tone: "down" }] } },
  { replace: true, lesson: "u5-support-and-resistance", step: "Zones, not lines", scene: { kind: "path", title: "Support as a zone", points: [104, 101.2, 103.5, 100.6, 103, 100.9, 103.2, 104.5],
    levels: [{ price: 101.3, label: "Zone top", tone: "up" }, { price: 100.5, label: "Zone bottom", tone: "up" }] },
    caption: "Three turns at three slightly different prices, all inside the zone." },
  { replace: true, lesson: "u5-round-numbers", step: "Just short, just beyond", scene: { kind: "path", points: [96, 98.2, 99.6, 98.4, 97.8, 99.2, 100.5, 99.4, 97.6],
    marks: [{ at: 2, label: "Turns just before it" }, { at: 6, label: "Runs just beyond, then reverses", tone: "warn" }],
    levels: [{ price: 100, label: "Round number", tone: "accent" }] },
    caption: "Take-profits fill early, and stops just past the number get triggered." },
  { replace: true, lesson: "u14-rates-and-central-banks", step: "Reading the Fed", scene: { kind: "path", title: "A common FOMC afternoon", points: [100, 100.1, 99.9, 100, 101.5, 102, 101.6, 101.8, 100.6, 99.4, 98.8],
    marks: [{ at: 3, label: "2:00 pm decision", side: "below" }, { at: 5, label: "First move", tone: "warn" }, { at: 6, label: "2:30 pm", side: "below" }, { at: 10, label: "Often reversed", tone: "down", side: "below" }] },
    caption: "The press conference starts at 2:30 pm." },
  { replace: true, lesson: "u16-reading-a-chart-analysis", step: "Confidence and NEUTRAL", scene: { kind: "path", title: "What NEUTRAL gives you", points: [100, 100.4, 99.7, 100.3, 99.8, 100.5, 101.4, 101.7, 101.8],
    marks: [{ at: 2, label: "NEUTRAL: no trade", side: "below" }, { at: 8, label: "Closed beyond it", tone: "accent" }],
    levels: [{ price: 101, label: "Long above", tone: "up" }, { price: 99, label: "Short below", tone: "down" }] },
    caption: "Wait for a candle to close beyond one of the two levels, then run a fresh analysis." },

  // 22. Dashed lines now say what they are
  { replace: true, lesson: "u4-change-of-character", step: "The first crack in a trend", scene: { kind: "path", title: "An uptrend loses its last higher low", points: [100, 104, 102, 107, 105, 110, 107.5, 104, 103.7, 103.5],
    marks: [{ at: 4, label: "Higher low", tone: "up", side: "below" }, { at: 7, label: "CHoCH: a close below it", tone: "down", side: "below" }],
    levels: [{ price: 105, label: "Last higher low", tone: "neutral" }] } },
  { replace: true, lesson: "u5-support-and-resistance", step: "More touches: stronger or weaker?", scene: { kind: "path", title: "Every test uses up some of the orders", points: [100, 106, 100.3, 104.5, 100.2, 103, 100.1, 101.6, 100, 97.5],
    marks: [{ at: 1, label: "A strong bounce", tone: "up" }, { at: 5, label: "Weaker" }, { at: 7, label: "Weaker still", tone: "warn" }, { at: 9, label: "It breaks in the end", tone: "down", side: "below" }],
    levels: [{ price: 100, label: "Support", tone: "neutral" }] } },
  { replace: true, lesson: "u7-buy-side-and-sell-side-liquidity", step: "Liquidity as a destination", scene: { kind: "path", title: "From one pool to the other", points: [104.5, 102, 100.4, 101.4, 100.4, 99.6, 101.6, 103.4, 105.6, 105.8],
    marks: [{ at: 0, label: "The old high" }, { at: 5, label: "Sell-side taken", tone: "down", side: "below" }, { at: 9, label: "Buy-side taken", tone: "up" }],
    levels: [{ price: 104.5, label: "Buy-side", tone: "up" }, { price: 100.4, label: "Sell-side", tone: "down" }] },
    caption: "Price drops below the equal lows first, then rallies through the old high." },

  // 23. The marker now sits after the neckline has broken
  { replace: true, lesson: "u5-classic-reversal-patterns", step: "The measured move", scene: { kind: "path", title: "Projecting a head and shoulders target", points: [100, 104, 102, 108, 102, 104.5, 102, 100.3, 100.2],
    marks: [{ at: 3, label: "Head", tone: "accent" }, { at: 7, label: "Neckline broken", tone: "down", side: "below" }],
    levels: [{ price: 102, label: "Neckline", tone: "neutral" }, { price: 96, label: "Target", tone: "down" }] },
    caption: "The head is 6 above the neckline, so the target sits 6 below the break. A rough guide, not a promise." },

  // 24. The drawing is a break below an old low, so it is labelled as one
  { replace: true, lesson: "u7-sweeps-vs-real-breakouts", step: "Signs of a real breakout", scene: { kind: "candles", groups: [
    { label: "A real breakdown", note: "Closes beyond the level, keeps closing there, and the retest holds", tone: "down",
      candles: [[102, 102.3, 100.4, 100.8], [100.8, 101, 98.8, 99], [99, 99.4, 97.6, 97.9], [97.9, 99.9, 97.7, 99.6], [99.6, 99.95, 97, 97.2]], lines: [{ price: 100, label: "Old low" }] },
  ] } },

  // 25. Small ones
  { replace: true, lesson: "u9-dealing-ranges", step: "Why define one", scene: { kind: "compare", title: "A dealing range tells you where you are", columns: [
    { title: "Near its low", icon: "check", tone: "up", points: ["Buying is cheap relative to the leg"] },
    { title: "Near its high", icon: "alert", tone: "down", points: ["Buying is expensive"] },
  ] }, caption: "Its edges are also the external liquidity from Unit 7." },
  { replace: true, lesson: "u7-stop-hunts-and-turtle-soup", step: "Where the name comes from", scene: { kind: "timeline", events: [
    { time: "1980s", label: "Turtle traders buy breakouts to 20-day highs", tone: "accent" },
    { time: "1995", label: "Street Smarts: fade the breakout that fails", tone: "warn" },
    { time: "Since then", label: "ICT borrows the name for any stop hunt", tone: "up" },
  ] } },
  { replace: true, lesson: "u16-the-ai-screener", step: "Finding what's moving", scene: { kind: "stat", title: "The shortlist, refreshed roughly every hour", stats: [
    { value: 5, label: "crypto picks", tone: "accent" },
    { value: 5, label: "stock picks", tone: "accent" },
  ] }, caption: "Each pick gets a direction and a potential score from 0 to 100." },
  { replace: true, lesson: "u15-choosing-your-market", step: "Fit the market to your life", scene: { kind: "checklist", title: "Four questions decide it", items: [
    { text: "When can you trade?", mark: "dot" },
    { text: "How much capital do you have?", mark: "dot" },
    { text: "How much volatility can you stomach?", mark: "dot" },
    { text: "What costs and rules apply where you live?", mark: "dot" },
  ] } },

  // 26. Path and candle scenes now carry a standing "Illustration, not a real chart." note
  //     (components/dashboard/academy/steps.tsx), so these captions drop their own version of it
  { replace: true, lesson: "u14-why-news-moves-price", step: "Priced in, and sell the news", scene: { kind: "path", title: "Buy the rumour, sell the news", points: [100, 100.8, 101.9, 102.6, 103.8, 104.9, 106, 105, 103.6, 102.8, 102.1],
    marks: [{ at: 1, label: "Price rises on the expectation", side: "below" }, { at: 6, label: "The event arrives", tone: "warn" }, { at: 10, label: "No one left to buy", tone: "down", side: "below" }] } },
  { replace: true, lesson: "u15-stocks", step: "Watch-outs", scene: { kind: "path", title: "A gap jumps over a stop", points: [100, 100.6, 100.2, 100.9, 100.5, 95.8, 96.3, 95.6, 96.1],
    marks: [{ at: 4, label: "Last close" }, { at: 5, label: "Next open", tone: "down", side: "below" }],
    levels: [{ price: 99, label: "Stop", tone: "down" }] },
    caption: "Overnight news or earnings make the stock open far from the last close." },
]
