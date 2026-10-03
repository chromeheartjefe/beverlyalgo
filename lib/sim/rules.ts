// Paper Trading rules, shared by the browser (to show what will happen) and
// the server (which decides what did happen). All money is virtual.

export type Side = "long" | "short"

// ─── Accounts ────────────────────────────────────────────────────────────────

export const LEVELS = [
  { level: 1, name: "Starter", balance: 1_000 },
  { level: 2, name: "Builder", balance: 5_000 },
  { level: 3, name: "Trader", balance: 25_000 },
  { level: 4, name: "Desk", balance: 100_000 },
] as const

export const MAX_LEVEL = LEVELS.length
export const levelInfo = (level: number) => LEVELS[Math.min(Math.max(level, 1), MAX_LEVEL) - 1]

/** Grow the account by this much to pass it */
export const PROFIT_TARGET = 0.08
/** Fall this far from the account's highest balance and it fails */
export const MAX_DRAWDOWN = 0.1
/** Lose this much of the balance the day started with and it fails */
export const DAILY_LOSS = 0.04
/** Trades needed before a pass counts, so one lucky trade can't do it */
export const MIN_TRADES = 10

export type AccountStatus = "active" | "passed" | "failed"
export type FailReason = "drawdown" | "daily"

export interface SimAccount {
  level: number
  startBalance: number
  balance: number
  /** Highest balance this account has reached */
  peak: number
  /** The player's local day ("YYYY-MM-DD") the daily limit is counting */
  dayKey: string | null
  /** Balance when that day started */
  dayStart: number
  trades: number
  status: AccountStatus
  failReason: FailReason | null
  /** Highest level ever reached, and how many accounts were passed and failed */
  bestLevel: number
  passes: number
  fails: number
}

export function newAccount(level: number, carry?: Pick<SimAccount, "bestLevel" | "passes" | "fails">): SimAccount {
  const { balance } = levelInfo(level)
  return {
    level,
    startBalance: balance,
    balance,
    peak: balance,
    dayKey: null,
    dayStart: balance,
    trades: 0,
    status: "active",
    failReason: null,
    bestLevel: Math.max(level, carry?.bestLevel ?? 1),
    passes: carry?.passes ?? 0,
    fails: carry?.fails ?? 0,
  }
}

export const passBalance = (a: Pick<SimAccount, "startBalance">) => a.startBalance * (1 + PROFIT_TARGET)

/** The balance at which the account fails right now: whichever limit is nearer */
export function failBalance(a: Pick<SimAccount, "peak" | "dayStart" | "dayKey">, today: string): { balance: number; reason: FailReason } {
  const drawdown = a.peak * (1 - MAX_DRAWDOWN)
  // A new day starts from the current balance, so the daily line can't be known for it yet
  const daily = a.dayKey === today ? a.dayStart * (1 - DAILY_LOSS) : -Infinity
  return daily > drawdown ? { balance: daily, reason: "daily" } : { balance: drawdown, reason: "drawdown" }
}

/** The account after a closed trade's profit or loss */
export function applyTrade(account: SimAccount, pnl: number, today: string): SimAccount {
  const a = { ...account }
  if (a.dayKey !== today) {
    a.dayKey = today
    a.dayStart = a.balance
  }
  a.balance = roundMoney(a.balance + pnl)
  a.trades += 1
  a.peak = Math.max(a.peak, a.balance)
  if (a.balance <= a.dayStart * (1 - DAILY_LOSS)) {
    a.status = "failed"
    a.failReason = "daily"
  }
  // Checked second so that when both limits break, the bigger one is named
  if (a.balance <= a.peak * (1 - MAX_DRAWDOWN)) {
    a.status = "failed"
    a.failReason = "drawdown"
  }
  if (a.status === "failed") a.fails += 1
  else if (a.balance >= passBalance(a) && a.trades >= MIN_TRADES) {
    a.status = "passed"
    a.passes += 1
  }
  return a
}

// ─── Orders ──────────────────────────────────────────────────────────────────

/** Share of the balance a trade may risk */
export const RISK_CHOICES = [0.005, 0.01, 0.02] as const
/** Stop distance, in average candle ranges */
export const STOP_CHOICES = [
  { id: "tight", label: "Tight", ranges: 1 },
  { id: "normal", label: "Normal", ranges: 1.5 },
  { id: "wide", label: "Wide", ranges: 2.5 },
] as const
/** Target distance as a multiple of the risk; null = no target */
export const TARGET_CHOICES = [1, 2, 3, null] as const

/** The gap between the buying and the selling price, as a share of price */
export const SPREAD = 0.0002

/** Price a market order fills at: buys pay the ask, sells receive the bid */
export function fillPrice(mid: number, buying: boolean): number {
  return mid * (buying ? 1 + SPREAD / 2 : 1 - SPREAD / 2)
}

export const roundMoney = (v: number) => Math.round(v * 100) / 100

export interface OpenPosition {
  side: Side
  entry: number
  qty: number
  /** Where the stop was when the trade opened: 1R is measured from here */
  initialStop: number
  stop: number
  target: number | null
  /** Money at risk when the trade opened */
  risk: number
  /** That risk as a share of the balance at the time */
  riskPct: number
  /** A news spike happened while the trade was open */
  spike: boolean
  /** The stop was moved to the entry price or better */
  lockedIn: boolean
}

/**
 * A market order sized from the stop: the quantity that loses `riskPct` of
 * the balance if the stop is hit. `mid` is the last price.
 */
export function openPosition({
  side, mid, balance, riskPct, stopDistance, targetR,
}: {
  side: Side
  mid: number
  balance: number
  riskPct: number
  stopDistance: number
  targetR: number | null
}): OpenPosition {
  const dir = side === "long" ? 1 : -1
  const entry = fillPrice(mid, side === "long")
  const stop = entry - dir * stopDistance
  const risk = balance * riskPct
  return {
    side,
    entry,
    qty: risk / stopDistance,
    initialStop: stop,
    stop,
    target: targetR === null ? null : entry + dir * stopDistance * targetR,
    risk,
    riskPct,
    spike: false,
    lockedIn: false,
  }
}

/** Profit or loss of a position if it were closed with the last price at `mid` */
export function openPnl(p: Pick<OpenPosition, "side" | "entry" | "qty">, mid: number): number {
  const dir = p.side === "long" ? 1 : -1
  return (fillPrice(mid, p.side === "short") - p.entry) * p.qty * dir
}

export type CloseReason = "target" | "stop" | "manual"

/**
 * Whether the last price closes the position. A target fills at its own price
 * (it is a limit order). A stop is a market order: when price jumps past it,
 * it fills at the worse price, which is slippage.
 */
export function checkExit(p: OpenPosition, mid: number): { reason: CloseReason; exit: number } | null {
  if (p.side === "long") {
    const bid = fillPrice(mid, false)
    if (bid <= p.stop) return { reason: "stop", exit: bid }
    if (p.target !== null && bid >= p.target) return { reason: "target", exit: p.target }
  } else {
    const ask = fillPrice(mid, true)
    if (ask >= p.stop) return { reason: "stop", exit: ask }
    if (p.target !== null && ask <= p.target) return { reason: "target", exit: p.target }
  }
  return null
}

/** A stop may move towards profit, never further away from the entry than it is */
export function canMoveStop(p: OpenPosition, to: number, mid: number): boolean {
  if (p.side === "long") return to >= p.stop && to < fillPrice(mid, false)
  return to <= p.stop && to > fillPrice(mid, true)
}

// ─── Closed trades ───────────────────────────────────────────────────────────

/** What the browser reports when a trade closes. The server works out the rest. */
export interface TradeReport {
  side: Side
  entry: number
  exit: number
  qty: number
  /** The stop when the trade opened */
  stop: number
  target: number | null
  reason: CloseReason
  spike: boolean
  lockedIn: boolean
}

export interface TradeResult {
  pnl: number
  /** Result in units of the money risked: +2 is twice the risk, -1 a full stop */
  r: number
  risk: number
  riskPct: number
}

/** Loose bounds: slippage and rounding are allowed for, an invented jackpot is not */
const MAX_RISK_PCT = 0.026
const MAX_WIN_R = 25
const MAX_LOSS_R = -4

/** The result of a reported trade against a balance, or why the report can't be right */
export function resolveTrade(t: TradeReport, balance: number): { ok: true; result: TradeResult } | { ok: false; error: string } {
  const dir = t.side === "long" ? 1 : -1
  const stopDistance = (t.entry - t.stop) * dir
  if (!(t.entry > 0) || !(t.exit > 0) || !(t.qty > 0) || !(stopDistance > 0)) return { ok: false, error: "The trade's prices don't add up." }
  const risk = stopDistance * t.qty
  const riskPct = risk / balance
  if (riskPct > MAX_RISK_PCT) return { ok: false, error: "That trade risked more than the account allows." }
  const pnl = (t.exit - t.entry) * t.qty * dir
  const r = pnl / risk
  if (r > MAX_WIN_R || r < MAX_LOSS_R) return { ok: false, error: "That result is outside what the practice market can produce." }
  return { ok: true, result: { pnl: roundMoney(pnl), r: Math.round(r * 100) / 100, risk: roundMoney(risk), riskPct } }
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export interface SimStats {
  trades: number
  winRate: number
  /** Average result per trade, in R: the strategy's expectancy so far */
  expectancy: number
  averageWin: number
  averageLoss: number
  best: number
  worst: number
}

export function statsOf(results: { r: number }[]): SimStats | null {
  if (results.length === 0) return null
  const rs = results.map((t) => t.r)
  const wins = rs.filter((r) => r > 0)
  const losses = rs.filter((r) => r < 0)
  const mean = (list: number[]) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : 0)
  return {
    trades: rs.length,
    winRate: wins.length / rs.length,
    expectancy: mean(rs),
    averageWin: mean(wins),
    averageLoss: mean(losses),
    best: Math.max(...rs),
    worst: Math.min(...rs),
  }
}
