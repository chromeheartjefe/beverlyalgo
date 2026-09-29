// Shared by the support chat widget (client) and its API routes (server).
// Nothing secret here: the system prompt lives in lib/support-chat.ts.

export const SUPPORT_CHAT = {
  maxInputChars:   500,
  // Messages of history sent with each question. Each one is re-billed as
  // input on every call, so the window stays small.
  contextMessages: 6,
  // Messages attached to a "contact the team" email, for context.
  transcriptMessages: 10,
} as const

// Site paths the bot may link to. The widget only turns these into links, so
// a made-up or external URL in a reply stays plain text.
export const SUPPORT_LINKS = new Set([
  "/",
  "/sign-up",
  "/sign-in",
  "/forgot-password",
  "/#pricing",
  "/#faq",
  "/dashboard",
  "/dashboard/chart-analysis",
  "/dashboard/trading-bot",
  "/dashboard/indicator",
  "/dashboard/ai-screener",
  "/dashboard/trade-journal",
  "/dashboard/trade-calendar",
  "/dashboard/risk-calculator",
  "/dashboard/settings",
  "/privacy",
  "/terms",
])

// Starter questions answered instantly in the browser, at zero AI cost. Keep
// them in line with the facts in lib/support-chat.ts. "contact" opens the
// form to reach the team instead of answering.
export type QuickReply = { label: string; answer: string } | { label: string; contact: true }

export const QUICK_REPLIES: QuickReply[] = [
  {
    label: "What does Pro include?",
    answer:
      "Pro unlocks AI Chart Analysis, the AI Trading Bot and our invite-only TradingView indicator, plus priority support and early access to new features. It's $49/month (cancel anytime) or $299 once for lifetime access. See /#pricing",
  },
  {
    label: "Is there a free plan?",
    answer:
      "Yes. A free account includes the AI Screener, Trade Journal, Trade Calendar and Risk Calculator, no card needed. Create one at /sign-up",
  },
  {
    label: "How do I get the TradingView indicator?",
    answer:
      "With Pro, open /dashboard/indicator and submit your TradingView username. Invites go out once a day, so you'll have access within 48 hours. Then accept the invite on TradingView and add the script from Indicators > Invite-only scripts.",
  },
  { label: "Talk to a person", contact: true },
]
