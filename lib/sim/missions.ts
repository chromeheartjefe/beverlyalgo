// Paper Trading missions: small goals that put an Entrix Academy lesson into
// practice. Each is done once and pays Academy XP. The server checks them
// (lib/sim/server.ts) every time a trade closes.

import type { CloseReason, Side } from "@/lib/sim/rules"

/** A closed trade as the missions see it */
export interface MissionTrade {
  side: Side
  r: number
  riskPct: number
  reason: CloseReason
  /** Target distance as a multiple of the risk; null when the trade had no target */
  targetR: number | null
  spike: boolean
  lockedIn: boolean
}

export interface MissionContext {
  /** The trade that just closed */
  trade: MissionTrade
  /** Closed trades, newest first, the new one included */
  trades: MissionTrade[]
  /** Accounts the player has passed */
  passes: number
}

export interface Mission {
  id: string
  title: string
  /** What to do, in one sentence */
  goal: string
  xp: number
  /** The Entrix Academy lesson it practises */
  lessonId: string
  /** Glossary terms (slugs) worth a look */
  terms: string[]
  done: (ctx: MissionContext) => boolean
}

/** Rounding and the spread leave a 1% risk a hair over 1% */
const ONE_PERCENT = 0.0102

export const MISSIONS: Mission[] = [
  {
    id: "first-trade",
    title: "Your first trade",
    goal: "Open a trade and close it, by hand or at its stop or target.",
    xp: 10,
    lessonId: "u2-market-orders-and-slippage",
    terms: ["market-order", "spread"],
    done: () => true,
  },
  {
    id: "small-risk",
    title: "Risk 1% or less",
    goal: "Close a trade that risked 1% of the account or less.",
    xp: 15,
    lessonId: "u11-the-1-rule",
    terms: ["risk-per-trade", "position-sizing"],
    done: ({ trade }) => trade.riskPct <= ONE_PERCENT,
  },
  {
    id: "planned-loss",
    title: "Take the planned loss",
    goal: "Let a trade close at its stop for about 1R. A loss that was planned is a trade done right.",
    xp: 15,
    lessonId: "u11-where-to-put-your-stop",
    terms: ["stop-loss", "r-multiple"],
    // A stop is a market order, so it fills a little past its price
    done: ({ trade }) => trade.reason === "stop" && trade.r < 0 && trade.r >= -1.25,
  },
  {
    id: "go-short",
    title: "Profit from a fall",
    goal: "Close a short trade in profit.",
    xp: 15,
    lessonId: "u2-going-long-and-going-short",
    terms: ["short"],
    done: ({ trade }) => trade.side === "short" && trade.r > 0,
  },
  {
    id: "let-it-run",
    title: "Let the target fill",
    goal: "Set a target of 2R or more and let the market reach it without closing early.",
    xp: 25,
    lessonId: "u13-cutting-winners-early",
    terms: ["take-profit"],
    done: ({ trade }) => trade.reason === "target" && (trade.targetR ?? 0) >= 1.95,
  },
  {
    id: "two-r",
    title: "A 2R winner",
    goal: "Close a trade for twice what it risked, or more.",
    xp: 25,
    lessonId: "u11-r-multiples-and-reward-to-risk",
    terms: ["r-multiple"],
    done: ({ trade }) => trade.r >= 1.95,
  },
  {
    id: "protect-winner",
    title: "Protect a winner",
    goal: "Move your stop to your entry price once a trade is in profit, then close it at breakeven or better.",
    xp: 20,
    lessonId: "u12-entries-and-exits",
    terms: ["breakeven-stop", "trailing-stop"],
    done: ({ trade }) => trade.lockedIn && trade.r >= -0.05,
  },
  {
    id: "through-news",
    title: "Trade through a news spike",
    goal: "Have a trade open when a news spike hits, and finish it in profit.",
    xp: 25,
    lessonId: "u14-trading-around-news",
    terms: ["slippage"],
    done: ({ trade }) => trade.spike && trade.r > 0,
  },
  {
    id: "five-disciplined",
    title: "Five trades, small risk",
    goal: "Take five trades in a row that each risk 1% or less.",
    xp: 30,
    lessonId: "u11-position-sizing",
    terms: ["position-sizing"],
    done: ({ trades }) => trades.length >= 5 && trades.slice(0, 5).every((t) => t.riskPct <= ONE_PERCENT),
  },
  {
    id: "ten-trades",
    title: "Build a sample",
    goal: "Close ten trades, so your numbers start to mean something.",
    xp: 20,
    lessonId: "u12-sample-size-and-when-to-change",
    terms: ["sample-size", "win-rate"],
    done: ({ trades }) => trades.length >= 10,
  },
  {
    id: "positive-twenty",
    title: "Positive over twenty",
    goal: "Have your last twenty trades average more than 0R.",
    xp: 40,
    lessonId: "u11-win-rate-r-r-and-expectancy",
    terms: ["expectancy"],
    done: ({ trades }) => trades.length >= 20 && trades.slice(0, 20).reduce((sum, t) => sum + t.r, 0) > 0,
  },
  {
    id: "pass-account",
    title: "Pass an account",
    goal: "Grow an account by 8% without breaking its loss limits.",
    xp: 50,
    lessonId: "u11-risk-of-ruin",
    terms: ["drawdown", "daily-loss-limit"],
    done: ({ passes }) => passes >= 1,
  },
]

export const MISSION_BY_ID = new Map(MISSIONS.map((m) => [m.id, m]))

/** Missions that practise a lesson, for the "Practise this" link on that lesson */
export function missionsForLesson(lessonId: string): Mission[] {
  return MISSIONS.filter((m) => m.lessonId === lessonId)
}
