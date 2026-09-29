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
