import type { CSSProperties } from "react"

import { tradeDayKey, type TradeRow } from "@/lib/trades"

// All calendar math runs on UTC dates so a cell's "YYYY-MM-DD" always matches
// the journal's own `date.slice(0, 10)` (see tradeDayKey). "Today" is the
// viewer's local calendar day, expressed as the same kind of UTC date.

export type Mode = "week" | "month" | "year" | "all"

export type DayStat = {
  key:    string
  pnl:    number
  count:  number
  wins:   number
  losses: number
  trades: TradeRow[]
}

export type Goal = { month: string; amount: number }

export const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const MONTHS_LONG  = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
export const WEEKDAYS     = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

// ─── Dates ────────────────────────────────────────────────────────────────────

export const utc = (y: number, m: number, d = 1) => new Date(Date.UTC(y, m, d))

export const dayKey = (d: Date) => d.toISOString().slice(0, 10)

export const monthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`

export const keyToDate = (key: string) => new Date(`${key}T00:00:00Z`)

export function todayUTC(): Date {
  const n = new Date()
  return utc(n.getFullYear(), n.getMonth(), n.getDate())
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * 86_400_000)
}

/** Monday = 0 … Sunday = 6 */
export const weekdayIndex = (d: Date) => (d.getUTCDay() + 6) % 7

export const isWeekend = (d: Date) => weekdayIndex(d) >= 5

export function startOfWeek(d: Date): Date {
  return addDays(d, -weekdayIndex(d))
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate()
}

/** Weeks (Mon–Sun) covering a month; days outside the month are null. */
export function monthWeeks(y: number, m: number): (Date | null)[][] {
  const first  = utc(y, m, 1)
  const total  = daysInMonth(y, m)
  const offset = weekdayIndex(first)
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => utc(y, m, i + 1)),
  ]
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function shiftAnchor(anchor: Date, mode: Mode, dir: 1 | -1): Date {
  const y = anchor.getUTCFullYear()
  const m = anchor.getUTCMonth()
  if (mode === "week")  return addDays(anchor, 7 * dir)
  if (mode === "month") return utc(y, m + dir, 1)
  if (mode === "year")  return utc(y + dir, m, 1)
  return anchor
}

/** Stable id for the period on screen — drives the slide animation key. */
export function periodKey(anchor: Date, mode: Mode): string {
  if (mode === "week")  return `w:${dayKey(startOfWeek(anchor))}`
  if (mode === "month") return `m:${monthKey(anchor.getUTCFullYear(), anchor.getUTCMonth())}`
  if (mode === "year")  return `y:${anchor.getUTCFullYear()}`
  return "all"
}

export function periodTitle(anchor: Date, mode: Mode): string {
  const y = anchor.getUTCFullYear()
  const m = anchor.getUTCMonth()
  if (mode === "month") return `${MONTHS_LONG[m]} ${y}`
  if (mode === "year")  return String(y)
  if (mode === "all")   return "All time"
  const start = startOfWeek(anchor)
  const end   = addDays(start, 6)
  const sm = MONTHS_SHORT[start.getUTCMonth()]
  const em = MONTHS_SHORT[end.getUTCMonth()]
  return start.getUTCMonth() === end.getUTCMonth()
    ? `${sm} ${start.getUTCDate()} – ${end.getUTCDate()}, ${end.getUTCFullYear()}`
    : `${sm} ${start.getUTCDate()} – ${em} ${end.getUTCDate()}, ${end.getUTCFullYear()}`
}

export function periodContains(anchor: Date, mode: Mode, day: Date): boolean {
  return mode === "all" || periodKey(anchor, mode) === periodKey(day, mode)
}

export function formatLongDate(key: string): string {
  const d = keyToDate(key)
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" })
}

export function formatShortDate(key: string): string {
  const d = keyToDate(key)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

// ─── Aggregation ─────────────────────────────────────────────────────────────

export function buildDayMap(trades: TradeRow[]): Map<string, DayStat> {
  const map = new Map<string, DayStat>()
  for (const t of trades) {
    const key = tradeDayKey(t.date)
    let s = map.get(key)
    if (!s) {
      s = { key, pnl: 0, count: 0, wins: 0, losses: 0, trades: [] }
      map.set(key, s)
    }
    s.pnl   += t.pnl
    s.count += 1
    if (t.pnl >= 0) s.wins += 1
    else            s.losses += 1
    s.trades.push(t)
  }
  return map
}

export type Summary = {
  pnl:         number
  trades:      number
  tradingDays: number
  greenDays:   number
  redDays:     number
  best:        DayStat | null
  worst:       DayStat | null
}

export function summarize(days: DayStat[]): Summary {
  const s: Summary = { pnl: 0, trades: 0, tradingDays: 0, greenDays: 0, redDays: 0, best: null, worst: null }
  for (const d of days) {
    s.pnl         += d.pnl
    s.trades      += d.count
    s.tradingDays += 1
    if (d.pnl > 0) s.greenDays += 1
    if (d.pnl < 0) s.redDays   += 1
    if (!s.best  || d.pnl > s.best.pnl)  s.best  = d
    if (!s.worst || d.pnl < s.worst.pnl) s.worst = d
  }
  return s
}

/** Every trading day whose key starts with `prefix` ("2026", "2026-09"). */
export function daysWithPrefix(map: Map<string, DayStat>, prefix: string): DayStat[] {
  const out: DayStat[] = []
  for (const [k, v] of map) if (k.startsWith(prefix)) out.push(v)
  return out
}

export function daysInRange(map: Map<string, DayStat>, start: Date, count: number): DayStat[] {
  const out: DayStat[] = []
  for (let i = 0; i < count; i++) {
    const s = map.get(dayKey(addDays(start, i)))
    if (s) out.push(s)
  }
  return out
}

// ─── Goals ───────────────────────────────────────────────────────────────────

/** This month's own goal, or the latest earlier one carried forward. */
export function resolveGoal(goals: Goal[], mk: string): { amount: number; from: string; own: boolean } | null {
  let found: Goal | null = null
  for (const g of goals) {
    if (g.month <= mk && (!found || g.month > found.month)) found = g
  }
  return found ? { amount: found.amount, from: found.month, own: found.month === mk } : null
}

export function monthKeyLabel(mk: string): string {
  const [y, m] = mk.split("-").map(Number)
  return `${MONTHS_LONG[m - 1]} ${y}`
}

// ─── Formatting ──────────────────────────────────────────────────────────────

const money   = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })

export function fmtMoney(n: number, opts: { signed?: boolean; compact?: boolean } = {}): string {
  const abs  = Math.abs(n)
  const body = opts.compact && abs >= 1000 ? compact.format(abs) : opts.compact ? String(Math.round(abs * 100) / 100) : money.format(abs)
  const sign = n < 0 ? "-" : opts.signed && n > 0 ? "+" : ""
  return `${sign}$${body}`
}

const cellK = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const cellKWhole = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 0 })

/**
 * Day P&L for the month grid on phones, where a cell is ~30-45px wide:
 * whole dollars, K/M from 1,000 ("+1.2K", "-12K"), always signed, so it
 * stays within 5-6 characters. `dollar: false` drops the "$" for the
 * 7-column (weekends on) grid, the narrowest case.
 */
export function fmtCellPnl(n: number, { dollar = true }: { dollar?: boolean } = {}): string {
  const abs  = Math.abs(n)
  // Round first, so -999.6 reads "-1K" rather than "-1000"
  const r    = Math.round(abs)
  const body = abs < 1 ? abs.toFixed(2)
    : r >= 1_000_000 ? cellK.format(r)      // "2.5M"
    : r >= 10_000 ? cellKWhole.format(r)    // "13K"
    : r >= 1000 ? cellK.format(r)           // "1.2K"
    : String(r)
  const sign = n < 0 ? "-" : n > 0 ? "+" : ""
  return `${sign}${dollar ? "$" : ""}${body}`
}

// ─── Heat ────────────────────────────────────────────────────────────────────

const GREEN = "16,185,129"
const RED   = "244,63,94"

/** Tint for a P&L cell, scaled by size relative to the largest day in view. */
export function heat(pnl: number, maxAbs: number): CSSProperties | undefined {
  if (pnl === 0 || maxAbs <= 0) return undefined
  // sqrt keeps small days visible next to one outsized day
  const t   = Math.sqrt(Math.min(1, Math.abs(pnl) / maxAbs))
  const rgb = pnl > 0 ? GREEN : RED
  return {
    backgroundColor: `rgba(${rgb},${(0.07 + 0.3 * t).toFixed(3)})`,
    borderColor:     `rgba(${rgb},${(0.18 + 0.4 * t).toFixed(3)})`,
  }
}

export const pnlText = (n: number) => (n > 0 ? "text-emerald-300" : n < 0 ? "text-rose-300" : "text-gray-300")
