// User-facing changelog shown in the dashboard's "What's new" panel.
// Newest release first. Adding a release on top lights the unread dot for
// everyone who has not opened the panel since. Keep the copy plain and
// user-facing (no em-dashes); internal work goes under a single "Fixed" line.

export type ChangeKind = "new" | "improved" | "fixed"

export type ChangeItem = {
  kind: ChangeKind
  text: string
  href?: string
}

export type Release = {
  version: string
  date: string // YYYY-MM-DD
  title: string
  summary?: string
  items: ChangeItem[]
}

export const CHANGELOG: Release[] = [
  {
    version: "2.6",
    date: "2026-10-02",
    title: "Trading Glossary and a fresher EntrixAlgo",
    summary: "Look up any trading term in plain words, plus an easier sign-up and a refreshed home page.",
    items: [
      { kind: "new", text: "Trading Glossary: 198 trading terms explained in plain words, with chart pictures, examples and related terms. Search understands shorthand like FVG, BOS or R:R, and you can save the terms you want to revisit.", href: "/dashboard/glossary" },
      { kind: "new", text: "Tap a highlighted term in any Academy lesson to see what it means without leaving the lesson." },
      { kind: "improved", text: "Sign-up spots common email typos, like gmail.con or gmaik.com, before you create your account." },
      { kind: "improved", text: "Verifying your email is easier: every link we send keeps working, the resend button shows a short countdown, and Wrong email? takes you straight to changing it." },
      { kind: "improved", text: "Our emails are more likely to land in your inbox instead of spam." },
      { kind: "improved", text: "A refreshed home page: cleaner text, tighter spacing, shorter feature cards, a new Chart Analysis demo and reviews from traders using EntrixAlgo.", href: "/" },
      { kind: "improved", text: "The support chat button stays out of the way while you learn in the Academy and Glossary." },
      { kind: "fixed", text: "The home page now opens in browsers that block cookies or have graphics acceleration turned off." },
      { kind: "fixed", text: "Bug fixes and small visual polish." },
    ],
  },
  {
    version: "2.5",
    date: "2026-10-01",
    title: "Entrix Academy is here",
    summary: "A free trading course inside your dashboard: short lessons, quick checks, XP and daily streaks.",
    items: [
      { kind: "new", text: "Entrix Academy: learn trading from zero in bite-size lessons with animations, interactive charts and quick checks. Free for every account.", href: "/dashboard/academy" },
      { kind: "new", text: "The full course is live: 129 lessons across five levels, from how markets and orders work to candlesticks, market structure, patterns and indicators." },
      { kind: "new", text: "A full Smart Money Concepts and ICT level: liquidity, fair value gaps, order blocks, breakers, killzones, Power of 3, and entry models like Silver Bullet and Unicorn." },
      { kind: "new", text: "Earn XP, climb from Novice to Market Wizard, and keep a daily streak going. One missed day a week is forgiven." },
      { kind: "new", text: "Becoming a Trader: risk management and position sizing, building and backtesting a strategy, trading psychology, news, and playbooks for forex, crypto, stocks, futures and gold." },
      { kind: "new", text: "Practice: questions you miss come back for review, spaced out over days so they stick, plus quick refreshers from finished lessons.", href: "/dashboard/academy/practice" },
      { kind: "new", text: "Finish every lesson, pass the 30-question final exam, and earn a shareable Entrix Academy certificate." },
      { kind: "new", text: "Rank up with a celebration every time your XP takes you to a new rank." },
    ],
  },
  {
    version: "2.4",
    date: "2026-10-01",
    title: "Try it free, and a smoother EntrixAlgo",
    summary: "Free accounts get one AI chart analysis, and the whole site moves more smoothly, especially on phones.",
    items: [
      { kind: "new", text: "One free AI chart analysis for every Free account with a verified email. If the AI can't read your screenshot, it doesn't count.", href: "/dashboard/chart-analysis" },
      { kind: "new", text: "A Free plan on the pricing page, so you can see what's included before signing up." },
      { kind: "new", text: "The This month card shows a preview and a quick way to log a trade when your month has no trades yet.", href: "/dashboard/trade-journal" },
      { kind: "improved", text: "Smoother everywhere: tabs fade in, the sidebar highlight slides, and messages, alerts and lists ease in instead of popping." },
      { kind: "improved", text: "Chart Analysis results are easier to read, with patterns and risk side by side and a cleaner layout on phones." },
      { kind: "improved", text: "Daily P&L in the calendars stays inside its day square on phones, with short amounts like +1.2K." },
      { kind: "improved", text: "The AI Trading Bot fits shorter phone screens without scrolling the page." },
      { kind: "improved", text: "Tidier dashboard shortcuts and home page on phones, plus slimmer scrollbars." },
      { kind: "improved", text: "Our support email is shown in full wherever you need it, so you can write to us from any email app." },
      { kind: "fixed", text: "Chart Analysis no longer fails on instruments with very long names, like some futures contracts." },
      { kind: "fixed", text: "The menu on the home page no longer covers its own close button on phones." },
      { kind: "fixed", text: "Bug fixes and small visual polish." },
    ],
  },
  {
    version: "2.3",
    date: "2026-09-30",
    title: "Smoother and faster",
    summary: "EntrixAlgo feels lighter everywhere, with a proper loading screen when you sign in.",
    items: [
      { kind: "new", text: "A loading screen while your dashboard gets ready, so names, plans and numbers no longer pop in one by one." },
      { kind: "improved", text: "Switching between dashboard tabs is quicker." },
      { kind: "improved", text: "The home page scrolls smoother and its animations are lighter, especially on older computers and phones." },
      { kind: "fixed", text: "A placeholder account no longer flashes on screen for a moment when you sign in or sign out." },
      { kind: "fixed", text: "Bug fixes and small visual polish." },
    ],
  },
  {
    version: "2.2",
    date: "2026-09-29",
    title: "A calmer, cleaner dashboard",
    summary: "Small touches that make the dashboard feel better, especially on phones.",
    items: [
      { kind: "new", text: "A redesigned Dashboard: your month's goal and stats, market pulse, live market sessions and AI Screener picks in one place.", href: "/dashboard" },
      { kind: "new", text: "Support chat on every page. Tap the chat button in the bottom corner for quick answers, or to reach our team." },
      { kind: "new", text: "This What's new panel. Every update we ship now shows up right here." },
      { kind: "improved", text: "Pro feature previews now show the upgrade card straight away, no scrolling needed." },
      { kind: "improved", text: "Hover hints no longer get stuck on screen after tapping a button on your phone." },
      { kind: "improved", text: "Settings is simpler, with the always-on dark mode card and the unused notification switches removed." },
      { kind: "improved", text: "Chart Analysis shows the detected timeframe in one short format, like 5m or 1H." },
      { kind: "new", text: "Sign in with Google. One click on the sign-in or sign-up page, no password needed.", href: "/sign-in" },
      { kind: "improved", text: "Sign-up shows a password strength meter and blocks the most easily guessed passwords." },
      { kind: "fixed", text: "Bug fixes and small visual polish." },
    ],
  },
  {
    version: "2.1",
    date: "2026-09-29",
    title: "Smarter AI across the board",
    summary: "A newer AI model powers every AI tool, and your emails now land where they should.",
    items: [
      { kind: "new", text: "Help & Support in the sidebar. Reach us any time at support@entrixalgo.com." },
      { kind: "improved", text: "Chart Analysis, AI Screener and the AI Trading Bot run on a newer, sharper AI model.", href: "/dashboard/chart-analysis" },
      { kind: "improved", text: "Chart Analysis results get a Market structure card and a cleaner layout on phones." },
      { kind: "improved", text: "The AI Trading Bot now follows the latest market headlines from the past day and a half.", href: "/dashboard/trading-bot" },
      { kind: "improved", text: "Live prices in the ticker and AI Screener are more reliable." },
      { kind: "improved", text: "A redesigned plan card in the sidebar and crisper outlines throughout." },
      { kind: "fixed", text: "Verification and password reset emails now open the right page." },
      { kind: "fixed", text: "Crypto picks in the AI Screener load correctly again." },
      { kind: "fixed", text: "Signing out always brings you back to the home page." },
    ],
  },
  {
    version: "2.0",
    date: "2026-09-28",
    title: "The Trading Desk update",
    summary: "Two new tools, a rebuilt Chart Analysis and a fresh look.",
    items: [
      { kind: "new", text: "AI Screener: AI-ranked setups across stocks and crypto, refreshed every hour.", href: "/dashboard/ai-screener" },
      { kind: "new", text: "Trade Calendar: see your P&L day by day and set monthly goals.", href: "/dashboard/trade-calendar" },
      { kind: "new", text: "A Trading Desk section in the menu groups your everyday tools." },
      { kind: "improved", text: "Chart Analysis v2 grades every signal by its evidence and places safer entry and stop levels." },
      { kind: "improved", text: "Risk to reward now reads the same everywhere (1:X), with clear quality tiers in the Risk Calculator.", href: "/dashboard/risk-calculator" },
      { kind: "improved", text: "Stronger account security, including sign-out on every device when you change your password." },
      { kind: "improved", text: "Clearer messages when something goes wrong." },
      { kind: "fixed", text: "Security updates, bug fixes and performance improvements." },
    ],
  },
  {
    version: "1.2",
    date: "2026-09-10",
    title: "Polish and performance",
    items: [
      { kind: "improved", text: "Faster dashboard loading on slower connections." },
      { kind: "improved", text: "Tidier layouts on tablets and small laptops." },
      { kind: "fixed", text: "Bug fixes and stability improvements." },
    ],
  },
  {
    version: "1.1",
    date: "2026-08-27",
    title: "Make it yours",
    items: [
      { kind: "new", text: "Profile photos. Upload one from Settings.", href: "/dashboard/settings" },
      { kind: "improved", text: "Switching between dashboard tabs is instant, with no loading flash." },
      { kind: "improved", text: "EntrixAlgo scales properly on large and 4K monitors." },
      { kind: "improved", text: "The AI Trading Indicator preview chart fills wide screens." },
      { kind: "fixed", text: "The email verification banner fits on one line on phones, plus other small fixes." },
    ],
  },
  {
    version: "1.0",
    date: "2026-08-24",
    title: "EntrixAlgo is live",
    summary: "The first full release of the EntrixAlgo dashboard.",
    items: [
      { kind: "new", text: "AI Chart Analysis: upload a chart and get entries, targets and stops in seconds." },
      { kind: "new", text: "AI Trading Bot: ask about any market and get an answer grounded in live data." },
      { kind: "new", text: "AI Trading Indicator: our invite-only TradingView script." },
      { kind: "new", text: "Trade Journal and Risk Calculator to log trades and size positions." },
      { kind: "new", text: "EntrixAlgo Pro, monthly or lifetime." },
    ],
  },
]
