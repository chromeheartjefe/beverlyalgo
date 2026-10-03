// Visuals for the plain steps of Levels 2 and 3: charts (U3), structure (U4), levels and
// patterns (U5), indicators (U6), liquidity (U7), imbalances and blocks (U8), time and
// price (U9), entry models (U10).
// Every fact is the one in the step's own text. Candle groups and price paths are
// drawings of the idea on made-up prices; where numbers show, the caption explains them.
export default [
  // ── u3-line-bar-and-candle-charts ──
  { lesson: "u3-line-bar-and-candle-charts", step: "Line and bar charts", scene: { kind: "compare", columns: [
    { title: "Line chart", icon: "chart", tone: "accent", points: ["Joins only the closing prices", "Great for the big picture", "Hides the spikes and rejections"] },
    { title: "Bar chart", icon: "candles", tone: "up", points: ["A vertical line from high to low", "Left tick: the open", "Right tick: the close", "All four prices"] },
  ] } },
  { lesson: "u3-line-bar-and-candle-charts", step: "Candlestick charts", scene: { kind: "candles", title: "The body: the area between open and close", groups: [
    { label: "Closed higher", note: "Usually a green body", tone: "up", candles: [[100, 106, 98, 105]] },
    { label: "Closed lower", note: "Usually a red body", tone: "down", candles: [[105, 107, 99, 100]] },
  ] } },

  // ── u3-anatomy-of-a-candle ──
  { lesson: "u3-anatomy-of-a-candle", step: "Reading the fight inside a candle", scene: { kind: "candles", groups: [
    { label: "Long upper wick", note: "Higher prices rejected", candles: [[100, 110, 99, 101.5]] },
    { label: "Long lower wick", note: "Lower prices rejected", candles: [[100, 101, 90, 98.5]] },
    { label: "Big body", note: "One side in control", candles: [[100, 110.5, 99.5, 110]] },
    { label: "Tiny body", note: "Neither side won", candles: [[100, 104, 96, 100.4]] },
  ] } },

  // ── u3-timeframes ──
  { lesson: "u3-timeframes", step: "Same market, different stories", scene: { kind: "compare", columns: [
    { title: "Higher timeframes", icon: "calendar", tone: "accent", points: ["Move slower", "Carry more weight", "More traders and money behind a level"] },
    { title: "Lower timeframes", icon: "clock", tone: "up", points: ["Show the detail", "Help with timing"] },
  ] } },
  { lesson: "u3-timeframes", step: "Choosing your timeframes", scene: { kind: "grid", title: "Who uses which charts", corner: "", cols: ["Typical charts"], rows: [
    { label: "Scalpers", cells: ["1 to 5-minute"], tones: ["warn"] },
    { label: "Day traders", cells: ["5-minute to 1-hour"], tones: ["accent"] },
    { label: "Swing traders", cells: ["4-hour and daily"], tones: ["up"] },
  ] }, caption: "Most traders pair two or three: a higher timeframe for direction and a lower one for the entry." },

  // ── u3-volume ──
  { lesson: "u3-volume", step: "Reading volume", scene: { kind: "compare", columns: [
    { title: "Rising volume", icon: "trending-up", tone: "up", points: ["Suggests conviction", "Lots of traders pushing that way"] },
    { title: "Thin volume", icon: "alert", tone: "warn", points: ["Moves are often more fragile"] },
    { title: "Volume spikes", icon: "zap", tone: "accent", points: ["Session opens", "News", "Many stops triggering", "The climax of a long trend"] },
  ] } },
  { lesson: "u3-volume", step: "Volume in forex and crypto", scene: { kind: "compare", title: "What the volume bars really count", columns: [
    { title: "Spot forex", icon: "coins", tone: "warn", points: ["No central exchange", "Tick volume: how often your broker's price changed", "Only your broker's slice"] },
    { title: "Futures", icon: "building", tone: "up", points: ["Real exchange volume", "Like those on CME"] },
    { title: "Crypto", icon: "bitcoin", tone: "accent", points: ["Reported per exchange", "The same coin shows different volume"] },
  ] } },

  // ── u3-single-candle-patterns ──
  { lesson: "u3-single-candle-patterns", step: "Indecision: doji and spinning top", scene: { kind: "candles", title: "Indecision", groups: [
    { label: "Doji", note: "Opens and closes at almost the same price", candles: [[100, 104, 96, 100]] },
    { label: "Spinning top", note: "A small body, wicks on both sides", candles: [[100, 104.5, 95.5, 101.5]] },
  ] } },
  { lesson: "u3-single-candle-patterns", step: "Rejection: hammer and shooting star", scene: { kind: "candles", title: "Rejection", groups: [
    { label: "Hammer", note: "After a decline: buyers took it all back", tone: "up", candles: [[100, 101.2, 92, 101]] },
    { label: "Shooting star", note: "After a rally: buyers were rejected", tone: "down", candles: [[100, 108, 98.8, 99]] },
  ] }, caption: "The long wick is at least twice the body." },
  { lesson: "u3-single-candle-patterns", step: "Control: marubozu", scene: { kind: "candles", title: "Control", groups: [
    { label: "Bullish marubozu", note: "Opened at the low, closed at the high", tone: "up", candles: [[100, 110, 100, 110]] },
    { label: "Bearish marubozu", note: "Opened at the high, closed at the low", tone: "down", candles: [[110, 110, 100, 100]] },
  ] } },

  // ── u3-two-and-three-candle-patterns ──
  { lesson: "u3-two-and-three-candle-patterns", step: "Engulfing patterns", scene: { kind: "candles", groups: [
    { label: "Bullish engulfing", note: "The green body covers the red one, after a decline", tone: "up", candles: [[106, 106.5, 103.5, 104], [104, 104.3, 101.6, 102], [101.6, 105.4, 101.2, 105]] },
    { label: "Bearish engulfing", note: "The red body swallows the green one, after a rally", tone: "down", candles: [[100, 102.5, 99.6, 102], [102, 104.4, 101.7, 104], [104.4, 104.8, 100.6, 101]] },
  ] } },
  { lesson: "u3-two-and-three-candle-patterns", step: "Inside bars", scene: { kind: "candles", groups: [
    { label: "Inside bar", note: "The whole range fits inside the candle before it", candles: [[100, 106, 98, 105], [104, 104.6, 101, 102]],
      lines: [{ price: 106, label: "Mother candle's high", tone: "accent" }, { price: 98, label: "Mother candle's low", tone: "accent" }] },
  ] }, caption: "Traders watch for the breakout from either line." },
  { lesson: "u3-two-and-three-candle-patterns", step: "Stars and tweezers", scene: { kind: "candles", groups: [
    { label: "Morning star", note: "Selling stalls, then a strong green candle", tone: "up", candles: [[108, 108.5, 102.5, 103], [102.4, 103.2, 101.2, 102], [102.6, 107, 102.2, 106.5]] },
    { label: "Evening star", note: "The bearish mirror, at a top", tone: "down", candles: [[100, 105.5, 99.5, 105], [105.6, 106.8, 104.8, 106], [105.4, 105.8, 101, 101.5]] },
    { label: "Tweezer bottom", note: "Two candles, the same low", candles: [[104, 104.5, 100, 100.8], [100.8, 104.2, 100, 103.6]] },
  ] } },

  // ── u3-candles-in-context ──
  { lesson: "u3-candles-in-context", step: "Location beats shape", scene: { kind: "checklist", title: "A pattern matters most", items: [
    { text: "At a level that already matters", mark: "ok" },
    { text: "After an extended move", mark: "ok" },
    { text: "On a meaningful timeframe", mark: "ok" },
    { text: "Ideally with strong volume", mark: "ok" },
  ] } },
  { lesson: "u3-candles-in-context", step: "Waiting for confirmation", scene: { kind: "compare", title: "The trade-off is real", columns: [
    { title: "Enter on the pattern", icon: "zap", tone: "warn", points: ["An earlier entry", "A better price", "More false signals"] },
    { title: "Wait for confirmation", icon: "hourglass", tone: "accent", points: ["The next candle closes in the pattern's direction", "Filters out some false signals", "A later entry, a worse price"] },
  ] } },
  { lesson: "u3-candles-in-context", step: "How Smart Money traders see candles", scene: { kind: "compare", columns: [
    { title: "Candles", icon: "candles", tone: "accent", points: ["The language"] },
    { title: "Location", icon: "target", tone: "up", points: ["The meaning", "Did price just sweep a pool of stops?", "Is it at an imbalance or an order block?"] },
  ] } },

  // ── u3-log-vs-linear-scale ──
  { lesson: "u3-log-vs-linear-scale", step: "When it matters", scene: { kind: "compare", columns: [
    { title: "Use log scale", icon: "trending-up", tone: "up", points: ["Long-term charts", "Huge percentage moves", "Like Bitcoin over the years"] },
    { title: "It rarely matters", icon: "clock", tone: "neutral", points: ["Intraday charts", "Price only moves a few percent", "The two scales look almost identical"] },
  ] } },

  // ── u3-gaps ──
  { lesson: "u3-gaps", step: "Where gaps happen", scene: { kind: "grid", title: "Which markets gap", corner: "", cols: ["How often"], rows: [
    { label: "Stocks", cells: ["Often: overnight news and earnings"], tones: ["warn"] },
    { label: "Futures", cells: ["Mostly over the weekend"], tones: ["accent"] },
    { label: "Spot forex", cells: ["Only over the weekend"], tones: ["accent"] },
    { label: "Spot crypto", cells: ["Rarely: it never closes"], tones: ["up"] },
    { label: "CME Bitcoin futures", cells: ["Yes: CME closes at weekends"], tones: ["warn"] },
  ] } },
  { lesson: "u3-gaps", step: "Types of gaps", scene: { kind: "grid", title: "Four types of gap", corner: "", cols: ["Where it shows up"], rows: [
    { label: "Common", cells: ["Inside ranges, often filled"], tones: ["neutral"] },
    { label: "Breakaway", cells: ["Launches a new move out of a range"], tones: ["up"] },
    { label: "Runaway", cells: ["Mid-trend, as it accelerates"], tones: ["accent"] },
    { label: "Exhaustion", cells: ["Late in a trend, can mark its end"], tones: ["warn"] },
  ] } },
  { lesson: "u3-gaps", step: "Gaps vs fair value gaps", scene: { kind: "compare", title: "Don't mix them up", columns: [
    { title: "Gap", icon: "door", tone: "accent", points: ["Empty space between sessions"] },
    { title: "Fair value gap", icon: "layers", tone: "warn", points: ["A three-candle pattern", "Price moved so fast it left a one-sided imbalance", "Needs no market close"] },
  ] } },

  // ── u4-swing-highs-and-swing-lows ──
  { lesson: "u4-swing-highs-and-swing-lows", step: "A simple definition", scene: { kind: "candles", title: "Two candles on each side", groups: [
    { label: "Swing high", note: "The middle high is higher than the highs on both sides", tone: "down",
      candles: [[100, 102, 99.5, 101.5], [101.5, 103.5, 101, 103], [103, 106, 102.5, 104], [104, 104.5, 101.8, 102.2], [102.2, 103, 100.5, 101]] },
    { label: "Swing low", note: "The middle low is lower than the lows on both sides", tone: "up",
      candles: [[106, 106.5, 104, 104.5], [104.5, 105, 102.5, 103], [103, 103.6, 100, 102], [102, 104.2, 101.5, 104], [104, 105.8, 103.4, 105.5]] },
  ] } },
  { lesson: "u4-swing-highs-and-swing-lows", step: "Swings are only confirmed later", scene: { kind: "flow", nodes: [
    { label: "A new high forms", icon: "trending-up" },
    { label: "It might still keep going", icon: "hourglass", tone: "warn" },
    { label: "The candles after it form", icon: "candles" },
    { label: "Now it is a confirmed swing high", icon: "check", tone: "up" },
  ] } },

  // ── u4-impulse-and-pullback ──
  { lesson: "u4-impulse-and-pullback", step: "Why pullbacks matter", scene: { kind: "path", title: "Chase the impulse, or wait for the pullback", points: [100, 103, 106, 104.6, 103.8, 104.4, 107, 110],
    marks: [{ at: 2, label: "Chasing: already stretched", tone: "down" }, { at: 4, label: "The new higher low", tone: "up", side: "below" }, { at: 7, label: "The next impulse" }] } },
  { lesson: "u4-impulse-and-pullback", step: "Reading the strength of a trend", scene: { kind: "compare", title: "Watch how the legs change", columns: [
    { title: "A strong trend", icon: "trending-up", tone: "up", points: ["Bigger impulses", "Shallow pullbacks"] },
    { title: "Running out of energy", icon: "hourglass", tone: "warn", points: ["Shrinking impulses", "Deeper, longer pullbacks"] },
  ] } },

  // ── u4-break-of-structure ──
  { lesson: "u4-break-of-structure", step: "Close or wick?", scene: { kind: "candles", groups: [
    { label: "A wick above", note: "Price only visited it", tone: "warn", candles: [[98, 99.6, 97.5, 99.2], [99.2, 101.5, 98.8, 99.4]], lines: [{ price: 100, label: "Old high" }] },
    { label: "A close above", note: "Buyers held it there until the candle ended", tone: "up", candles: [[98, 99.6, 97.5, 99.2], [99.2, 101.6, 99, 101.2]], lines: [{ price: 100, label: "Old high" }] },
  ] }, caption: "This course uses the close." },

  // ── u4-change-of-character ──
  { lesson: "u4-change-of-character", step: "The first crack in a trend", scene: { kind: "path", title: "An uptrend loses its last higher low", points: [100, 104, 102, 107, 105, 110, 107.5, 104],
    marks: [{ at: 4, label: "The last higher low", tone: "up", side: "below" }, { at: 7, label: "CHoCH: a close below it", tone: "down", side: "below" }],
    levels: [{ price: 105, label: "", tone: "neutral" }] } },
  { lesson: "u4-change-of-character", step: "CHoCH is a warning, not a guarantee", scene: { kind: "flow", title: "What traders usually want to see", nodes: [
    { label: "CHoCH", sub: "a warning", icon: "alert", tone: "warn" },
    { label: "A lower high that holds", icon: "flag" },
    { label: "A BOS down", icon: "trending-down", tone: "down" },
  ] }, caption: "Sometimes price breaks the higher low, then recovers and carries on up." },

  // ── u4-internal-vs-swing-structure ──
  { lesson: "u4-internal-vs-swing-structure", step: "Why the split matters", scene: { kind: "compare", columns: [
    { title: "Internal structure", icon: "search", tone: "warn", points: ["Breaks happen all the time", "Often mean little on their own", "Used to time entries"] },
    { title: "Swing structure", icon: "flag", tone: "up", points: ["Breaks carry the weight", "Gives the direction"] },
  ] } },
  { lesson: "u4-internal-vs-swing-structure", step: "Strong and weak highs and lows", scene: { kind: "path", title: "In an uptrend", points: [100, 104, 101.5, 108, 105.5, 111, 109],
    marks: [{ at: 2, label: "Strong low", tone: "up", side: "below" }, { at: 3, label: "Breaks structure" }, { at: 5, label: "Weak high", tone: "warn" }] },
    caption: "The strong low launched the move that broke structure. The weak high is the newest one, not broken yet." },

  // ── u4-multi-timeframe-structure ──
  { lesson: "u4-multi-timeframe-structure", step: "A simple top-down routine", scene: { kind: "flow", nodes: [
    { label: "Daily or 4-hour", sub: "the trend and the big swing highs and lows", icon: "calendar", tone: "accent" },
    { label: "One step down", sub: "wait for a pullback into a sensible area", icon: "hourglass", tone: "warn" },
    { label: "Entry timeframe", sub: "structure turns back in the HTF direction", icon: "target", tone: "up" },
  ] } },

  // ── u5-support-and-resistance ──
  { lesson: "u5-support-and-resistance", step: "Zones, not lines", scene: { kind: "path", title: "Support as a zone", points: [104, 101.2, 103.5, 100.6, 103, 100.9, 104.5],
    levels: [{ price: 101.3, label: "Top of the zone", tone: "up" }, { price: 100.5, label: "Bottom of the zone", tone: "up" }] },
    caption: "Three turns at three slightly different prices, all inside the zone." },
  { lesson: "u5-support-and-resistance", step: "More touches: stronger or weaker?", scene: { kind: "path", title: "Every test uses up some of the orders", points: [100, 106, 100.3, 104.5, 100.2, 103, 100.1, 101.6, 100, 97.5],
    marks: [{ at: 1, label: "A strong bounce", tone: "up" }, { at: 5, label: "Weaker" }, { at: 7, label: "Weaker still", tone: "warn" }, { at: 9, label: "It breaks in the end", tone: "down", side: "below" }],
    levels: [{ price: 100, label: "", tone: "neutral" }] } },

  // ── u5-role-reversal ──
  { lesson: "u5-role-reversal", step: "Why it happens", scene: { kind: "compare", title: "Price comes back to the broken level", columns: [
    { title: "Sellers who shorted there", icon: "trending-down", tone: "down", points: ["Now losing", "Buy back to get out near break-even"] },
    { title: "Buyers who missed it", icon: "trending-up", tone: "up", points: ["Glad of a second chance", "Buy at the same price"] },
  ] }, caption: "Both groups buy at the old resistance, so it turns into support." },

  // ── u5-round-numbers ──
  { lesson: "u5-round-numbers", step: "Just short, just beyond", scene: { kind: "path", points: [96, 98.2, 99.6, 98.4, 97.8, 99.2, 100.5, 99.4, 97.6],
    marks: [{ at: 2, label: "Turns just before it", side: "below" }, { at: 6, label: "Runs just beyond, then reverses", tone: "warn" }],
    levels: [{ price: 100, label: "Round number", tone: "accent" }] },
    caption: "Take-profits fill early, and stops just past the number get triggered." },

  // ── u5-trendlines-and-channels ──
  { lesson: "u5-trendlines-and-channels", step: "Drawing them honestly", scene: { kind: "checklist", items: [
    { text: "Use real swing points, not random wicks", mark: "ok" },
    { text: "Forcing a line that ignores half the candles", mark: "bad" },
    { text: "A steeper line breaks sooner", mark: "dot" },
    { text: "A break is a warning: structure confirms the turn", mark: "dot" },
  ] } },

  // ── u5-supply-and-demand-zones ──
  { lesson: "u5-supply-and-demand-zones", step: "Why price comes back", scene: { kind: "flow", title: "The idea behind a demand zone", nodes: [
    { label: "The base", sub: "large buyers can't fill everything", icon: "layers" },
    { label: "Price leaves", sub: "some orders are still waiting", icon: "trending-up" },
    { label: "Price returns", icon: "repeat", tone: "warn" },
    { label: "Leftover orders can push it away again", icon: "zap", tone: "up" },
  ] }, caption: "A fresh zone, never revisited, is usually considered stronger." },
  { lesson: "u5-supply-and-demand-zones", step: "The bridge to order blocks", scene: { kind: "compare", columns: [
    { title: "Supply and demand", icon: "layers", tone: "accent", points: ["The direct ancestor"] },
    { title: "Order block", icon: "target", tone: "up", points: ["The last opposite candle before a strong move", "Same idea, sharper definition"] },
    { title: "Level 3 adds", icon: "search", tone: "warn", points: ["Did the move take liquidity first?", "Did it leave a fair value gap?"] },
  ] } },

  // ── u5-classic-reversal-patterns ──
  { lesson: "u5-classic-reversal-patterns", step: "The measured move", scene: { kind: "path", title: "Projecting a head and shoulders target", points: [100, 104, 102, 108, 102, 104.5, 102, 99],
    marks: [{ at: 3, label: "Head", tone: "accent" }, { at: 6, label: "Neckline break", side: "below" }],
    levels: [{ price: 102, label: "Neckline", tone: "neutral" }, { price: 96, label: "Target", tone: "down" }] },
    caption: "The head is 6 above the neckline, so the target sits 6 below the break. A rough guide, not a promise." },

  // ── u5-continuation-patterns ──
  { lesson: "u5-continuation-patterns", step: "Pauses inside trends", scene: { kind: "path", points: [100, 103, 106, 105.2, 105.9, 105.1, 105.8, 108.5, 111],
    marks: [{ at: 4, label: "The trend rests", tone: "warn", side: "below" }, { at: 8, label: "More often than not, it resumes", tone: "up" }] } },
  { lesson: "u5-continuation-patterns", step: "Wedges", scene: { kind: "compare", columns: [
    { title: "Rising wedge", icon: "trending-up", tone: "down", points: ["Both lines slope up and converge", "New highs with less and less energy", "Often breaks down"] },
    { title: "Falling wedge", icon: "trending-down", tone: "up", points: ["The mirror image", "Often breaks up"] },
  ] } },

  // ── u5-breakouts-fakeouts-and-retests ──
  { lesson: "u5-breakouts-fakeouts-and-retests", step: "Breakouts", scene: { kind: "flow", title: "Why a breakout runs", nodes: [
    { label: "A close beyond the level", icon: "door" },
    { label: "Breakout traders buy", icon: "users", tone: "accent" },
    { label: "Short sellers' stops trigger", sub: "more buying", icon: "zap", tone: "warn" },
    { label: "Price is pushed away", icon: "trending-up", tone: "up" },
  ] } },
  { lesson: "u5-breakouts-fakeouts-and-retests", step: "Three ways to trade a breakout", scene: { kind: "compare", columns: [
    { title: "On the break", icon: "zap", tone: "warn", points: ["You never miss a move", "Caught by every fakeout"] },
    { title: "On the close", icon: "check", tone: "accent", points: ["Fewer fakeouts", "A slightly worse price"] },
    { title: "On the retest", icon: "repeat", tone: "up", points: ["Best price, clearest stop", "Some breakouts never come back"] },
  ] } },

  // ── u5-fibonacci-retracements-and-extensions ──
  { lesson: "u5-fibonacci-retracements-and-extensions", step: "Why traders watch them", scene: { kind: "compare", columns: [
    { title: "Why they work", icon: "users", tone: "accent", points: ["So many traders watch them", "Healthy pullbacks give back a third to two thirds"] },
    { title: "Strongest lined up with", icon: "layers", tone: "up", points: ["A support zone", "An old swing point", "A fair value gap or order block"] },
  ] }, caption: "There is no proof that markets obey 61.8%." },
  { lesson: "u5-fibonacci-retracements-and-extensions", step: "Extensions: where might it go?", scene: { kind: "bars", title: "Extensions of the previous swing", max: 161.8, bars: [
    { label: "The previous swing", value: 100, display: "100%", tone: "neutral" },
    { label: "First extension", value: 127.2, display: "127.2%", tone: "accent" },
    { label: "Second extension", value: 161.8, display: "161.8%", tone: "up" },
  ] }, caption: "Rough guides for taking profit, not destinations." },

  // ── u6-why-indicators-lag ──
  { lesson: "u6-why-indicators-lag", step: "Indicators are made of the past", scene: { kind: "flow", nodes: [
    { label: "Past prices", sub: "and sometimes volume", icon: "candles" },
    { label: "A formula", icon: "calculator", tone: "accent" },
    { label: "The indicator", icon: "chart" },
    { label: "Arrives after the move", sub: "that delay is lag", icon: "hourglass", tone: "warn" },
  ] } },
  { lesson: "u6-why-indicators-lag", step: "Faster means noisier", scene: { kind: "compare", title: "Speed against reliability", columns: [
    { title: "5-period average", icon: "zap", tone: "warn", points: ["Turns much sooner", "Turns on every small wiggle", "More false signals"] },
    { title: "50-period average", icon: "hourglass", tone: "accent", points: ["Turns much later", "Less noise"] },
  ] }, caption: "There is no setting that is both." },
  { lesson: "u6-why-indicators-lag", step: "How to use them", scene: { kind: "compare", columns: [
    { title: "Indicators describe", icon: "eye", tone: "accent", points: ["Is momentum strong or fading?", "Is volatility high or low?", "Is price stretched from its average?"] },
    { title: "Structure and levels decide", icon: "target", tone: "up", points: ["Where you trade"] },
  ] } },

  // ── u6-rsi ──
  { lesson: "u6-rsi", step: "The formula, in one line", scene: { kind: "grid", title: "RSI = 100 - 100 / (1 + RS)", corner: "", cols: ["RS", "RSI"], rows: [
    { label: "Gains 3 times losses", cells: [3, 75], tones: ["neutral", "up"] },
    { label: "Gains equal losses", cells: [1, 50], tones: ["neutral", "neutral"] },
    { label: "Losses 3 times gains", cells: [0.33, 25], tones: ["neutral", "down"] },
  ] }, caption: "RS is the average gain divided by the average loss over the period." },
  { lesson: "u6-rsi", step: "Overbought is not a sell signal", scene: { kind: "compare", columns: [
    { title: "Above 70", icon: "trending-up", tone: "up", points: ["Called overbought", "It means momentum is strong", "It can stay there in a strong trend"] },
    { title: "The 50 line", icon: "scale", tone: "accent", points: ["Above 50: bulls have the momentum", "Below 50: bears do"] },
    { title: "Below 30", icon: "trending-down", tone: "down", points: ["Called oversold", "Not a buy signal on its own"] },
  ] } },

  // ── u6-macd ──
  { lesson: "u6-macd", step: "Reading it", scene: { kind: "grid", title: "Reading MACD", corner: "", cols: ["What it shows"], rows: [
    { label: "Above zero", cells: ["Upward momentum"], tones: ["up"] },
    { label: "Below zero", cells: ["Downward momentum"], tones: ["down"] },
    { label: "Cross above the signal line", cells: ["Momentum improving"], tones: ["up"] },
    { label: "Cross below the signal line", cells: ["Momentum fading"], tones: ["down"] },
    { label: "Histogram shrinking", cells: ["A move losing steam"], tones: ["warn"] },
  ] } },

  // ── u6-bollinger-bands ──
  { lesson: "u6-bollinger-bands", step: "Squeeze, then expansion", scene: { kind: "flow", nodes: [
    { label: "A quiet period", icon: "moon" },
    { label: "The squeeze", sub: "bands at their narrowest in a long while", icon: "filter", tone: "warn" },
    { label: "Often a big move", icon: "zap", tone: "accent" },
    { label: "The bands open up quickly", icon: "trending-up", tone: "up" },
  ] }, caption: "The squeeze doesn't tell you the direction. Structure and the breakout do." },
  { lesson: "u6-bollinger-bands", step: "Touching a band is not a signal", scene: { kind: "compare", title: "What a band touch means", columns: [
    { title: "In ranges", icon: "repeat", tone: "accent", points: ["Touches often mark the edges"] },
    { title: "In trends", icon: "trending-up", tone: "up", points: ["Touches mark strength", "Price can walk the band", "Candle after candle near the upper band"] },
  ] } },

  // ── u6-atr ──
  { lesson: "u6-atr", step: "True range", scene: { kind: "bars", title: "True range: the largest of three distances", max: 4, bars: [
    { label: "High minus low", value: 2, display: "2", tone: "neutral" },
    { label: "High minus previous close", value: 4, display: "4", tone: "up" },
    { label: "Previous close minus low", value: 2, display: "2", tone: "neutral" },
  ] }, caption: "Example: the previous close was 100, then a candle gapped up with a high of 104 and a low of 102. Its true range is 4." },
  { lesson: "u6-atr", step: "Stops that fit the market", scene: { kind: "compare", columns: [
    { title: "Tighter than the noise", icon: "alert", tone: "down", points: ["Hit by random wiggles"] },
    { title: "1.5 to 2 ATR", icon: "shield", tone: "up", points: ["Beyond your entry or the structure", "Wider in volatile markets", "Tighter in calm ones"] },
  ] } },

  // ── u6-vwap-and-volume-tools ──
  { lesson: "u6-vwap-and-volume-tools", step: "Using VWAP", scene: { kind: "compare", columns: [
    { title: "Above VWAP", icon: "trending-up", tone: "up", points: ["The average buyer today is in profit", "Intraday bias leans bullish"] },
    { title: "Below VWAP", icon: "trending-down", tone: "down", points: ["Intraday bias leans bearish"] },
  ] }, caption: "Anchored VWAP starts the calculation from a candle you choose, instead of the session open." },
  { lesson: "u6-vwap-and-volume-tools", step: "Volume profile", scene: { kind: "bars", title: "Volume at each price", max: 100, bars: [
    { label: "105", value: 20, display: "", tone: "neutral" },
    { label: "104", value: 45, display: "", tone: "neutral" },
    { label: "103", value: 80, display: "", tone: "up" },
    { label: "102", value: 100, display: "POC", tone: "accent" },
    { label: "101", value: 70, display: "", tone: "up" },
    { label: "100", value: 35, display: "", tone: "neutral" },
    { label: "99", value: 15, display: "", tone: "neutral" },
  ] }, caption: "An example. The busiest price is the point of control; the band holding about 70% of the volume (101 to 103 here) is the value area." },

  // ── u6-divergence-and-combining-tools ──
  { lesson: "u6-divergence-and-combining-tools", step: "Divergence warns, it doesn't time", scene: { kind: "compare", columns: [
    { title: "What it tells you", icon: "alert", tone: "warn", points: ["A move is losing momentum", "It can last a long time", "Several in a row while the trend keeps going"] },
    { title: "What to do", icon: "shield", tone: "up", points: ["Tighten stops", "Skip new entries in the old direction", "Wait for structure, like a CHoCH"] },
  ] } },
  { lesson: "u6-divergence-and-combining-tools", step: "Don't stack the same tool", scene: { kind: "compare", columns: [
    { title: "One opinion, four times", icon: "repeat", tone: "down", points: ["RSI", "Stochastic", "CCI", "Williams %R"] },
    { title: "Different things", icon: "layers", tone: "up", points: ["Trend: a moving average", "Momentum: RSI or MACD", "Volatility: ATR", "Volume or VWAP"] },
  ] } },

  // ── u7-what-liquidity-means-in-smc ──
  { lesson: "u7-what-liquidity-means-in-smc", step: "Welcome to Level 3", scene: { kind: "flow", title: "How to treat Smart Money Concepts", nodes: [
    { label: "A framework", sub: "not proven truth", icon: "book", tone: "accent" },
    { label: "Understand it", icon: "brain" },
    { label: "Test it", sub: "honest backtests", icon: "search", tone: "warn" },
    { label: "Your evidence", sub: "the kind that counts", icon: "check", tone: "up" },
  ] } },
  { lesson: "u7-what-liquidity-means-in-smc", step: "Where the stops are", scene: { kind: "path", title: "Orders sit beyond obvious highs and lows", points: [101, 104, 101.5, 103.2, 99.5, 102, 101],
    marks: [{ at: 1, label: "Buy orders above the high", tone: "up" }, { at: 4, label: "Sell orders below the low", tone: "down", side: "below" }] },
    caption: "The more obvious the level, the bigger the pool." },
  { lesson: "u7-what-liquidity-means-in-smc", step: "Is someone hunting you?", scene: { kind: "compare", columns: [
    { title: "The story", icon: "user", tone: "warn", points: ["A single big player", "Moving price to trap retail traders"] },
    { title: "The reality", icon: "users", tone: "up", points: ["Many large participants, algorithms and market makers", "They go where the orders are", "That is where big size can trade"] },
  ] } },

  // ── u7-buy-side-and-sell-side-liquidity ──
  { lesson: "u7-buy-side-and-sell-side-liquidity", step: "Liquidity as a destination", scene: { kind: "path", title: "From one pool to the other", points: [104.5, 102, 100.4, 101.4, 100.4, 99.6, 101.6, 103.4, 105.2],
    marks: [{ at: 0, label: "The old high" }, { at: 5, label: "Sell-side taken", tone: "down", side: "below" }, { at: 8, label: "Buy-side taken", tone: "up" }],
    levels: [{ price: 104.5, label: "", tone: "up" }, { price: 100.4, label: "", tone: "down" }] },
    caption: "Price drops below the equal lows first, then rallies through the old high." },

  // ── u7-equal-highs-equal-lows-and-trendline-liquidity ──
  { lesson: "u7-equal-highs-equal-lows-and-trendline-liquidity", step: "Other obvious pools", scene: { kind: "checklist", title: "Highs and lows that lots of people watch", items: [
    { text: "The previous day's high and low", mark: "dot" },
    { text: "The previous week's high and low", mark: "dot" },
    { text: "The Asian session's high and low", mark: "dot" },
  ] } },

  // ── u7-sweeps-vs-real-breakouts ──
  { lesson: "u7-sweeps-vs-real-breakouts", step: "Signs of a sweep", scene: { kind: "candles", groups: [
    { label: "A sweep", note: "A wick through the level, a close back, then a strong move the other way", tone: "up",
      candles: [[102, 102.4, 100.6, 101], [101, 101.3, 98.6, 100.8], [100.8, 104, 100.6, 103.8]], lines: [{ price: 100, label: "Old low" }] },
  ] } },
  { lesson: "u7-sweeps-vs-real-breakouts", step: "Signs of a real breakout", scene: { kind: "candles", groups: [
    { label: "A real breakout", note: "Closes beyond the level, keeps closing there, and the retest holds", tone: "down",
      candles: [[102, 102.3, 100.4, 100.8], [100.8, 101, 98.8, 99], [99, 99.4, 97.6, 97.9], [97.9, 99.9, 97.7, 99.6], [99.6, 99.95, 97, 97.2]], lines: [{ price: 100, label: "Old low" }] },
  ] } },

  // ── u7-inducement ──
  { lesson: "u7-inducement", step: "How SMC traders use it", scene: { kind: "flow", nodes: [
    { label: "The first obvious pullback low", sub: "don't buy it", icon: "ban", tone: "warn" },
    { label: "It gets swept", sub: "early buyers are shaken out", icon: "zap", tone: "down" },
    { label: "The deeper zone", sub: "look for your entry there", icon: "target", tone: "up" },
  ] } },

  // ── u7-internal-vs-external-range-liquidity ──
  { lesson: "u7-internal-vs-external-range-liquidity", step: "Two kinds of targets", scene: { kind: "compare", columns: [
    { title: "External (ERL)", icon: "door", tone: "warn", points: ["At the edges of the range", "Beyond the swing highs and lows", "Where the stops are"] },
    { title: "Internal (IRL)", icon: "layers", tone: "accent", points: ["Inside the range", "Mostly fair value gaps", "The imbalances price left behind"] },
  ] } },

  // ── u7-stop-hunts-and-turtle-soup ──
  { lesson: "u7-stop-hunts-and-turtle-soup", step: "Where the name comes from", scene: { kind: "timeline", events: [
    { time: "1980s", label: "Turtle traders buy breakouts to 20-day highs", tone: "accent" },
    { time: "1995", label: "Street Smarts: fade the breakout that fails", tone: "warn" },
    { time: "ICT", label: "Borrows the name for any stop hunt", tone: "up" },
  ] } },
  { lesson: "u7-stop-hunts-and-turtle-soup", step: "Not every new high is a stop hunt", scene: { kind: "compare", columns: [
    { title: "A real new high", icon: "trending-up", tone: "up", points: ["Strong trends make them all the time", "Most of them are real", "Fading them fights the trend"] },
    { title: "A turtle soup", icon: "repeat", tone: "warn", points: ["A quick rejection back inside", "Ideally displacement", "And a structure shift the other way"] },
  ] } },

  // ── u7-liquidity-voids ──
  { lesson: "u7-liquidity-voids", step: "Void vs fair value gap", scene: { kind: "compare", columns: [
    { title: "Fair value gap", icon: "target", tone: "accent", points: ["The precise three-candle gap", "Between candle 1's wick and candle 3's wick"] },
    { title: "Liquidity void", icon: "layers", tone: "warn", points: ["The broader stretch", "Covered by the big candle bodies", "Its midpoint is a key level"] },
  ] } },

  // ── u8-displacement ──
  { lesson: "u8-displacement", step: "What makes it count", scene: { kind: "checklist", title: "Displacement that counts", items: [
    { text: "It breaks structure: a BOS or MSS", mark: "ok" },
    { text: "It leaves a fair value gap", mark: "ok" },
    { text: "Strongest right after a liquidity sweep", mark: "ok" },
    { text: "A big candle inside the range with no gap: just volatility", mark: "bad" },
  ] } },

  // ── u8-fair-value-gaps ──
  { lesson: "u8-fair-value-gaps", step: "Using FVGs", scene: { kind: "flow", title: "A bullish setup", nodes: [
    { label: "A bullish FVG", icon: "layers", tone: "accent" },
    { label: "Price retraces into it", icon: "repeat" },
    { label: "Entry", sub: "the top of the gap or its midpoint", icon: "target", tone: "up" },
    { label: "Stop", sub: "below the move's low", icon: "shield", tone: "down" },
  ] } },

  // ── u8-consequent-encroachment ──
  { lesson: "u8-consequent-encroachment", step: "Wicks have a midpoint too", scene: { kind: "candles", groups: [
    { label: "The 50% of a big wick", note: "Often revisited and respected", candles: [[100, 101, 90, 99.5], [99.5, 100.5, 97, 98], [98, 98.5, 94.75, 97.2]],
      lines: [{ price: 94.75, label: "Midpoint of the wick", tone: "accent" }] },
  ] } },

  // ── u8-inverse-fair-value-gaps ──
  { lesson: "u8-inverse-fair-value-gaps", step: "Trading the flip", scene: { kind: "flow", nodes: [
    { label: "An old bearish gap", icon: "layers", tone: "down" },
    { label: "It flips", icon: "repeat", tone: "warn" },
    { label: "A pullback dips into it", icon: "trending-down" },
    { label: "It holds as support", icon: "shield", tone: "up" },
  ] }, caption: "A retrace into the inverted gap often holds. It works best when several pieces agree." },

  // ── u8-order-blocks ──
  { lesson: "u8-order-blocks", step: "The SMC checklist", scene: { kind: "checklist", title: "An order block most SMC traders trust", items: [
    { text: "It took liquidity: swept a high or low", mark: "ok" },
    { text: "The move away left an FVG", mark: "ok" },
    { text: "The move broke structure", mark: "ok" },
    { text: "Unmitigated: price hasn't come back to it yet", mark: "ok" },
  ] } },

  // ── u8-breaker-and-mitigation-blocks ──
  { lesson: "u8-breaker-and-mitigation-blocks", step: "When an order block fails", scene: { kind: "flow", nodes: [
    { label: "An order block", icon: "layers" },
    { label: "Price breaks straight through", sub: "with displacement", icon: "zap", tone: "down" },
    { label: "The block has failed", sub: "its traders are trapped", icon: "lock", tone: "warn" },
    { label: "It flips: a breaker block", icon: "repeat", tone: "accent" },
  ] }, caption: "A failed bearish order block becomes bullish support. A failed bullish one becomes bearish resistance." },
  { lesson: "u8-breaker-and-mitigation-blocks", step: "Mitigation blocks", scene: { kind: "compare", columns: [
    { title: "Breaker block", icon: "zap", tone: "up", points: ["A liquidity sweep first", "Stops were taken before the reversal", "The stronger of the two"] },
    { title: "Mitigation block", icon: "repeat", tone: "warn", points: ["No liquidity sweep", "A higher low instead of a new low", "Then a break through the failed block"] },
  ] } },

  // ── u8-rejection-and-propulsion-blocks ──
  { lesson: "u8-rejection-and-propulsion-blocks", step: "Propulsion blocks", scene: { kind: "flow", nodes: [
    { label: "An older order block", sub: "supports price", icon: "layers" },
    { label: "A new candle forms there", sub: "the propulsion block", icon: "candles", tone: "accent" },
    { label: "The next move takes off from it", icon: "trending-up", tone: "up" },
  ] } },

  // ── u9-dealing-ranges ──
  { lesson: "u9-dealing-ranges", step: "Why define one", scene: { kind: "compare", title: "A dealing range tells you where you are", columns: [
    { title: "Near its low", icon: "trending-down", tone: "up", points: ["Buying is cheap relative to the leg"] },
    { title: "Near its high", icon: "trending-up", tone: "down", points: ["Buying is expensive"] },
  ] }, caption: "Its edges are also the external liquidity from Unit 7." },

  // ── u9-premium-discount-and-equilibrium ──
  { lesson: "u9-premium-discount-and-equilibrium", step: "Stacking it with zones", scene: { kind: "path", points: [100, 104, 110, 107, 103.5, 107, 108.5],
    marks: [{ at: 4, label: "A bullish zone in discount", tone: "up", side: "below" }],
    levels: [{ price: 110, label: "Range high", tone: "neutral" }, { price: 105, label: "Equilibrium", tone: "accent" }, { price: 100, label: "Range low", tone: "neutral" }] },
    caption: "Premium and discount are a filter, not a signal." },

  // ── u9-optimal-trade-entry ──
  { lesson: "u9-optimal-trade-entry", step: "OTE plus a reason", scene: { kind: "checklist", title: "OTE worth acting on lines up with", items: [
    { text: "A fair value gap", mark: "ok" },
    { text: "An order block", mark: "ok" },
    { text: "A breaker", mark: "ok" },
    { text: "Ideally a liquidity sweep before the leg", mark: "ok" },
    { text: "On its own, a Fibonacci zone is just a zone", mark: "dot" },
  ] } },

  // ── u9-sessions-and-killzones ──
  { lesson: "u9-sessions-and-killzones", step: "Why traders limit themselves to killzones", scene: { kind: "compare", columns: [
    { title: "Outside the killzones", icon: "ban", tone: "down", points: ["Markets often chop in small ranges", "Money lost to spreads and false signals"] },
    { title: "Inside them", icon: "clock", tone: "up", points: ["That noise is cut", "A couple of hours at the screen, not all day"] },
  ] } },

  // ── u9-the-asian-range ──
  { lesson: "u9-the-asian-range", step: "London takes one side", scene: { kind: "timeline", title: "A common pattern", events: [
    { time: "Asia", label: "The range forms", tone: "neutral" },
    { time: "London", label: "Sweeps one side, then reverses", tone: "warn" },
    { time: "New York", label: "Pushes the day's main move", tone: "up" },
  ] } },

  // ── u9-opening-prices-and-opening-gaps ──
  { lesson: "u9-opening-prices-and-opening-gaps", step: "Opening gaps in futures", scene: { kind: "grid", title: "Two opening gaps in CME futures", corner: "New York time", cols: ["From", "To"], rows: [
    { label: "NDOG", cells: ["The 5 pm close", "The 6 pm reopen"], tones: ["neutral", "accent"] },
    { label: "NWOG", cells: ["Friday's close", "Sunday's open"], tones: ["neutral", "accent"] },
  ] }, caption: "New day and new week opening gaps. ICT traders mark both as levels price often comes back to." },

  // ── u9-power-of-3-and-the-judas-swing ──
  { lesson: "u9-power-of-3-and-the-judas-swing", step: "Using it", scene: { kind: "flow", title: "When to look for a buy", nodes: [
    { label: "A bullish higher-timeframe bias", icon: "trending-up" },
    { label: "A drop below the open", sub: "the manipulation: ideally a sweep of the Asian low", icon: "trending-down", tone: "warn" },
    { label: "An MSS", sub: "on a lower timeframe", icon: "zap", tone: "accent" },
    { label: "Look for the buy", icon: "target", tone: "up" },
  ] }, caption: "If the drop below the open just keeps going, the bias was wrong, and your stop protects you." },

  // ── u9-wyckoff-the-roots-of-amd ──
  { lesson: "u9-wyckoff-the-roots-of-amd", step: "A century-old idea", scene: { kind: "flow", title: "Wyckoff's Composite Man", nodes: [
    { label: "Accumulates quietly", icon: "layers" },
    { label: "Shakes out weak hands", icon: "zap", tone: "warn" },
    { label: "Marks price up", icon: "trending-up", tone: "up" },
  ] }, caption: "Richard Wyckoff, 1873 to 1934. Swap Composite Man for smart money and you have the core of SMC." },
  { lesson: "u9-wyckoff-the-roots-of-amd", step: "Watch the word distribution", scene: { kind: "compare", title: "Same word, different meaning", columns: [
    { title: "In Wyckoff", icon: "book", tone: "warn", points: ["A topping range", "Large players sell before a markdown"] },
    { title: "In ICT's AMD", icon: "zap", tone: "accent", points: ["The expansion phase", "The real move of the day", "It can be up or down"] },
  ] } },

  // ── u10-bias-and-draw-on-liquidity ──
  { lesson: "u10-bias-and-draw-on-liquidity", step: "From draw to bias", scene: { kind: "flow", nodes: [
    { label: "The daily trend is up", icon: "trending-up" },
    { label: "An untaken high sits above", sub: "the draw", icon: "flag", tone: "accent" },
    { label: "The bias is bullish", sub: "look for buys, ignore sells", icon: "target", tone: "up" },
  ] }, caption: "A working assumption, not a prediction to defend." },

  // ── u10-top-down-analysis ──
  { lesson: "u10-top-down-analysis", step: "Three timeframes, three jobs", scene: { kind: "flow", nodes: [
    { label: "Daily or 4-hour", sub: "the bias and the draw on liquidity", icon: "calendar", tone: "accent" },
    { label: "1-hour or 15-minute", sub: "a point of interest where price could turn", icon: "search", tone: "warn" },
    { label: "5-minute or 1-minute", sub: "the trigger: usually a sweep and an MSS", icon: "target", tone: "up" },
  ] } },

  // ── u10-the-mss-and-fvg-entry ──
  { lesson: "u10-the-mss-and-fvg-entry", step: "When to skip it", scene: { kind: "checklist", title: "Skip the setup if", items: [
    { text: "The MSS came without displacement", mark: "bad" },
    { text: "It goes against the higher-timeframe bias", mark: "bad" },
    { text: "The gap sits in premium, for a long", mark: "bad" },
    { text: "The target leaves less than about 2R", mark: "bad" },
    { text: "Price never came back to your limit: let it go", mark: "bad" },
  ] } },

  // ── u10-silver-bullet ──
  { lesson: "u10-silver-bullet", step: "A one-hour model", scene: { kind: "timeline", title: "Silver Bullet windows, New York time", events: [
    { time: "3 to 4 am", label: "First window", tone: "accent" },
    { time: "10 to 11 am", label: "Second window", tone: "accent" },
    { time: "2 to 3 pm", label: "Third window", tone: "accent" },
  ] }, caption: "Inside a window: a fair value gap in the direction of the draw, an entry on the retrace, a target at the nearest liquidity." },

  // ── u10-unicorn-model ──
  { lesson: "u10-unicorn-model", step: "How it unfolds", scene: { kind: "flow", nodes: [
    { label: "A sweep of an old low", icon: "zap", tone: "warn" },
    { label: "A strong move up", sub: "displacement through the bearish order block", icon: "trending-up" },
    { label: "A breaker with an FVG on top", icon: "layers", tone: "accent" },
    { label: "Entry in the overlap", sub: "stop below the sweep low", icon: "target", tone: "up" },
  ] }, caption: "The target is the next buy-side liquidity." },

  // ── u10-turtle-soup-reversal ──
  { lesson: "u10-turtle-soup-reversal", step: "Best places for it", scene: { kind: "checklist", title: "Highs and lows that everyone sees", items: [
    { text: "The previous day's high or low", mark: "ok" },
    { text: "The previous week's high or low", mark: "ok" },
    { text: "Equal highs and lows", mark: "ok" },
    { text: "The edges of the Asian range, in a killzone", mark: "ok" },
    { text: "Worst against a strong higher-timeframe trend", mark: "bad" },
  ] } },

  // ── u10-smt-divergence ──
  { lesson: "u10-smt-divergence", step: "When twins disagree", scene: { kind: "compare", columns: [
    { title: "Usually move together", icon: "repeat", tone: "up", points: ["NQ and ES", "EUR/USD and GBP/USD"] },
    { title: "Usually move opposite", icon: "scale", tone: "warn", points: ["The dollar index (DXY)", "Against EUR/USD"] },
  ] }, caption: "SMT divergence: correlated markets disagree at a key level. One makes a lower low, the other doesn't." },
  { lesson: "u10-smt-divergence", step: "Using it", scene: { kind: "flow", title: "A confirmation, not an entry", nodes: [
    { label: "A sweep at your point of interest", icon: "zap", tone: "warn" },
    { label: "SMT divergence", sub: "adds weight", icon: "scale", tone: "accent" },
    { label: "Wait for the MSS", icon: "hourglass" },
    { label: "The entry gap", icon: "target", tone: "up" },
  ] } },

  // ── u10-market-maker-models ──
  { lesson: "u10-market-maker-models", step: "How traders use it", scene: { kind: "compare", title: "A map, not an entry", columns: [
    { title: "Still in the sell-side curve", icon: "trending-down", tone: "warn", points: ["Be careful buying"] },
    { title: "Already in the buy-side curve", icon: "trending-up", tone: "up", points: ["Look for buys at each new stage", "Target the levels the decline left behind"] },
  ] }, caption: "The market maker sell model (MMSM) is the mirror." },
]
