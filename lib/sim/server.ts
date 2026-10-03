import { and, desc, eq, inArray, notInArray } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { PAPER_TRADING } from "@/config/features"
import { db } from "@/db"
import { simAccounts, simMissions, type SimTradeRow, simTrades, users } from "@/db/schema"
import { bumpStats, settledDay } from "@/lib/academy/server"
import { MISSIONS,type MissionTrade } from "@/lib/sim/missions"
import {
  type AccountStatus, applyTrade, type FailReason, MAX_LEVEL, newAccount, resolveTrade, type SimAccount, type TradeReport,
} from "@/lib/sim/rules"

// Paper Trading on the server. The price simulation runs in the player's
// browser, so the server can't see the market: it takes the prices of a closed
// trade, works out the result itself, applies the account rules and checks the
// missions. A determined player could invent trades. The stakes are a virtual
// balance and Academy XP, so the checks here are sanity bounds (lib/sim/rules)
// and rate limits, not proof.

/** The signed-in Pro user's id, or the response that turns the request away */
export async function requirePro(): Promise<{ userId: string } | { response: NextResponse }> {
  if (!PAPER_TRADING) return { response: NextResponse.json({ error: "Not found" }, { status: 404 }) }
  const session = await auth()
  if (!session?.user?.id) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!user || user.plan === "free") {
    return { response: NextResponse.json({ error: "Paper Trading is a Pro feature." }, { status: 403 }) }
  }
  return { userId: session.user.id }
}

/** Closed trades kept per player; older ones are pruned */
const TRADES_KEPT = 200

export interface SimTradeView {
  id: string
  side: "long" | "short"
  pnl: number
  r: number
  riskPct: number
  reason: "target" | "stop" | "manual"
  level: number
  closedAt: string
}

export interface SimState {
  account: SimAccount
  /** Ids of completed missions */
  missions: string[]
  /** Newest first */
  trades: SimTradeView[]
}

const toAccount = (row: typeof simAccounts.$inferSelect): SimAccount => ({
  level: row.level,
  startBalance: row.startBalance,
  balance: row.balance,
  peak: row.peak,
  dayKey: row.dayKey,
  dayStart: row.dayStart,
  trades: row.trades,
  status: row.status as AccountStatus,
  failReason: row.failReason as FailReason | null,
  bestLevel: row.bestLevel,
  passes: row.passes,
  fails: row.fails,
})

const toView = (t: SimTradeRow): SimTradeView => ({
  id: t.id,
  side: t.side as SimTradeView["side"],
  pnl: t.pnl,
  r: t.r,
  riskPct: t.riskPct,
  reason: t.reason as SimTradeView["reason"],
  level: t.level,
  closedAt: t.closedAt.toISOString(),
})

const toMissionTrade = (t: SimTradeRow): MissionTrade => {
  const stopDistance = Math.abs(t.entry - t.stop)
  return {
    side: t.side as MissionTrade["side"],
    r: t.r,
    riskPct: t.riskPct,
    reason: t.reason as MissionTrade["reason"],
    targetR: t.target === null || stopDistance === 0 ? null : Math.abs(t.target - t.entry) / stopDistance,
    spike: t.spike,
    lockedIn: t.lockedIn,
  }
}

async function saveAccount(userId: string, a: SimAccount) {
  const values = { ...a, updatedAt: new Date() }
  await db.insert(simAccounts).values({ userId, ...values }).onConflictDoUpdate({ target: simAccounts.userId, set: values })
}

async function loadAccount(userId: string): Promise<SimAccount> {
  const [row] = await db.select().from(simAccounts).where(eq(simAccounts.userId, userId))
  if (row) return toAccount(row)
  const fresh = newAccount(1)
  await db.insert(simAccounts).values({ userId, ...fresh }).onConflictDoNothing()
  return fresh
}

export async function getSimState(userId: string): Promise<SimState> {
  const [account, missions, trades] = await Promise.all([
    loadAccount(userId),
    db.select({ missionId: simMissions.missionId }).from(simMissions).where(eq(simMissions.userId, userId)),
    db.select().from(simTrades).where(eq(simTrades.userId, userId)).orderBy(desc(simTrades.closedAt)).limit(100),
  ])
  return { account, missions: missions.map((m) => m.missionId), trades: trades.map(toView) }
}

export interface TradeOutcome {
  state: SimState
  trade: SimTradeView
  /** Missions this trade completed, with the XP each paid */
  completed: { id: string; xp: number }[]
}

/** How often a trade is worked out again when another one got in first */
const SAVE_ATTEMPTS = 4

/**
 * Applies a trade to the account and saves it, or returns null when another
 * trade changed the account in between. This database driver (neon-http) has
 * no transactions or row locks, so the write only goes through while the row
 * still looks the way it did when it was read: two trades posted at once (a
 * retry racing an automatic close, two tabs) used to overwrite each other.
 */
async function claimAccount(userId: string, before: SimAccount, after: SimAccount): Promise<boolean> {
  const claimed = await db
    .update(simAccounts)
    .set({ ...after, updatedAt: new Date() })
    .where(and(
      eq(simAccounts.userId, userId),
      eq(simAccounts.level, before.level),
      eq(simAccounts.trades, before.trades),
      eq(simAccounts.balance, before.balance),
      eq(simAccounts.status, "active"),
    ))
    .returning({ userId: simAccounts.userId })
  return claimed.length > 0
}

/** Records a closed trade. `day` is the player's local day, used for the daily loss limit and the streak. */
export async function recordTrade(userId: string, report: TradeReport, day: string): Promise<TradeOutcome | { error: string }> {
  const settled = await settledDay(userId, day)

  let saved: { account: SimAccount; next: SimAccount; today: string; pnl: number; r: number; riskPct: number } | null = null
  for (let attempt = 0; attempt < SAVE_ATTEMPTS && !saved; attempt++) {
    const account = await loadAccount(userId)
    if (account.status !== "active") return { error: "This account is closed. Start the next one to keep trading." }

    const resolved = resolveTrade(report, account.balance)
    if (!resolved.ok) return { error: resolved.error }

    // Never back before the day this account is already counting: a reported
    // day that jumps backwards (a changed clock, a trip west, or on purpose)
    // would start a "new" day and reset the daily loss limit
    const today = account.dayKey && account.dayKey > settled ? account.dayKey : settled
    const next = applyTrade(account, resolved.result.pnl, today)
    if (await claimAccount(userId, account, next)) saved = { account, next, today, ...resolved.result }
  }
  if (!saved) return { error: "We couldn't save that trade. Please try again." }
  const { account, next, today, pnl, r, riskPct } = saved

  const [row] = await db
    .insert(simTrades)
    .values({
      userId,
      level: account.level,
      side: report.side,
      entry: report.entry,
      exit: report.exit,
      qty: report.qty,
      stop: report.stop,
      target: report.target,
      pnl,
      r,
      riskPct,
      reason: report.reason,
      spike: report.spike,
      lockedIn: report.lockedIn,
      balanceAfter: next.balance,
    })
    .returning()

  // Missions: checked against the newest trades, this one first
  const [recent, already] = await Promise.all([
    db.select().from(simTrades).where(eq(simTrades.userId, userId)).orderBy(desc(simTrades.closedAt)).limit(TRADES_KEPT),
    db.select({ missionId: simMissions.missionId }).from(simMissions).where(eq(simMissions.userId, userId)),
  ])
  const done = new Set(already.map((m) => m.missionId))
  const trades = recent.map(toMissionTrade)
  const ctx = { trade: toMissionTrade(row), trades, passes: next.passes }
  const completed: { id: string; xp: number }[] = []
  for (const mission of MISSIONS) {
    if (done.has(mission.id) || !mission.done(ctx)) continue
    // The unique index decides: two requests at once can't both be paid
    const inserted = await db
      .insert(simMissions)
      .values({ userId, missionId: mission.id, xp: mission.xp })
      .onConflictDoNothing()
      .returning({ id: simMissions.id })
    if (inserted.length > 0) completed.push({ id: mission.id, xp: mission.xp })
  }
  const xp = completed.reduce((sum, m) => sum + m.xp, 0)
  if (xp > 0) await bumpStats(userId, xp, today)

  // Keep the table small: only the newest trades are ever read
  if (recent.length >= TRADES_KEPT) {
    const keep = recent.map((t) => t.id)
    await db.delete(simTrades).where(and(eq(simTrades.userId, userId), notInArray(simTrades.id, keep)))
  }

  return {
    state: {
      account: next,
      missions: [...done, ...completed.map((m) => m.id)],
      trades: recent.slice(0, 100).map(toView),
    },
    trade: toView(row),
    completed,
  }
}

export type AccountAction = "next" | "retry" | "restart"

/**
 * Moves on from a closed account, or restarts the current one:
 *   next    after a pass: the next level up (the top level starts again)
 *   retry   after a fail: the same level again
 *   restart at any time: the same level again, results so far discarded
 */
export async function accountAction(userId: string, action: AccountAction): Promise<SimState | { error: string }> {
  const account = await loadAccount(userId)
  const carry = { bestLevel: account.bestLevel, passes: account.passes, fails: account.fails }
  let level = account.level
  if (action === "next") {
    if (account.status !== "passed") return { error: "Pass this account first." }
    level = Math.min(account.level + 1, MAX_LEVEL)
  } else if (action === "retry") {
    if (account.status !== "failed") return { error: "This account is still running." }
  }
  await saveAccount(userId, newAccount(level, carry))
  return getSimState(userId)
}

/** Completed missions for a set of ids: used by the Academy to mark its "Practise this" links */
export async function completedMissions(userId: string, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return []
  const rows = await db
    .select({ missionId: simMissions.missionId })
    .from(simMissions)
    .where(and(eq(simMissions.userId, userId), inArray(simMissions.missionId, ids)))
  return rows.map((r) => r.missionId)
}
