"use client"

import { BookOpen, Target } from "lucide-react"
import Link from "next/link"
import { useId, useMemo } from "react"

import {
  buildDayMap,
  dayKey,
  daysInMonth,
  daysWithPrefix,
  fmtCellPnl,
  fmtMoney,
  type Goal,
  heat,
  monthKey,
  MONTHS_LONG,
  monthWeeks,
  pnlText,
  resolveGoal,
  summarize,
  todayUTC,
} from "@/components/dashboard/trade-calendar/utils"
import { Loaded } from "@/components/ui/motion"
import type { TradeRow } from "@/lib/trades"
import { cn } from "@/lib/utils"

import { CardLink, OverviewCard, Skeleton } from "./card"

const R = 42
const CIRC = 2 * Math.PI * R

function GoalRing({ progress, reached, label }: { progress: number; reached: boolean; label: string }) {
  const color = reached ? "#34d399" : "#fbbf24"
  const glowId = `goal-glow-${useId().replace(/:/g, "")}`
  return (
    <div className="relative size-28 shrink-0">
      {/* overflow-visible plus a filter region well beyond the ring: a CSS
          drop-shadow here was clipped to a square at the SVG's edges. */}
      <svg viewBox="0 0 100 100" className="size-full -rotate-90 overflow-visible" aria-hidden>
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={color} floodOpacity="0.45" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="butt"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progress)}
          filter={`url(#${glowId})`}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold tabular-nums text-white">{label}</span>
        <span className="text-[10px] uppercase tracking-wider text-gray-500">of goal</span>
      </div>
    </div>
  )
}

// Placeholder when there is nothing to show yet (no trades this month)
const EMPTY = "—"

function Stat({ label, value, tone }: { label: string; value: string; tone?: "up" | "down" }) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl px-2 py-2 text-center",
        tone === "up" ? "bg-emerald-500/[0.08]" : tone === "down" ? "bg-rose-500/[0.08]" : "bg-white/[0.04]"
      )}
    >
      <p className={cn("truncate text-sm font-semibold tabular-nums", value === EMPTY ? "text-gray-600" : tone === "up" ? "text-emerald-300" : tone === "down" ? "text-rose-300" : "text-white")}>
        {value}
      </p>
      <p className="truncate text-[10px] text-gray-500">{label}</p>
    </div>
  )
}

// Calendar cells are narrow: whole dollars under $1K, compact above (+$341, -$15.8K)
// Same short form as the Trade Calendar's 7-column month grid ("+123", "-1.2K",
// "+13K"): these cells are even narrower, and "+$12.3K" used to get cut off
const cellMoney = (n: number) => fmtCellPnl(n, { dollar: false })

const WEEKDAY_INITIALS = ["M", "T", "W", "T", "F", "S", "S"]

function monthData(trades: TradeRow[], mk: string) {
  const map = buildDayMap(trades)
  let wins = 0, losses = 0, grossWin = 0, grossLoss = 0
  for (const t of trades) {
    if (!t.date.startsWith(mk)) continue
    if (t.pnl >= 0) { wins++; grossWin += t.pnl } else { losses++; grossLoss += -t.pnl }
  }
  const count = wins + losses
  return {
    dayMap:  map,
    summary: summarize(daysWithPrefix(map, mk)),
    stats: {
      count,
      winRate:      count ? (wins / count) * 100 : null,
      profitFactor: grossLoss > 0 ? grossWin / grossLoss : null,
      avgWin:       wins ? grossWin / wins : null,
      avgLoss:      losses ? grossLoss / losses : null,
    },
  }
}

// Made-up weekday results for this month, only ever shown blurred behind the
// empty-state message, so the card previews what it becomes instead of
// sitting there as an empty grid.
const DEMO_PNL = [180, -60, 240, 95, -140, 310, 55, -35, 150, 420, -90, 130, 70, -210, 260, 45, 190, -75, 115, 335, -50, 85]

function demoTrades(y: number, m: number, mk: string): TradeRow[] {
  const out: TradeRow[] = []
  let i = 0
  for (let d = 1; d <= daysInMonth(y, m); d++) {
    const weekday = new Date(Date.UTC(y, m, d)).getUTCDay()
    if (weekday === 0 || weekday === 6) continue
    const pnl = DEMO_PNL[i++ % DEMO_PNL.length]
    out.push({ id: `demo-${d}`, date: `${mk}-${String(d).padStart(2, "0")}`, pair: "DEMO", direction: "Buy", entry: 0, exit: 0, pnl })
  }
  return out
}

function EmptyOverlay({ hasTrades }: { hasTrades: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4">
      <div className="w-full max-w-[18rem] rounded-2xl border border-amber-500/25 bg-[#0b0a14]/85 p-5 text-center shadow-[0_0_40px_-12px_rgba(245,158,11,0.35)]">
        <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-amber-500/15 ring-1 ring-amber-400/30">
          <BookOpen className="size-5 text-amber-300" aria-hidden />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-white">
          {hasTrades ? "No trades this month yet" : "No trades logged yet"}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-gray-400">
          Log a trade and this card fills in with your daily P&amp;L, win rate and best days.
        </p>
        <Link
          href="/dashboard/trade-journal"
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/15 px-4 text-sm font-semibold text-amber-100 transition-colors hover:border-amber-400/50 hover:bg-amber-500/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          {hasTrades ? "Log a trade" : "Log your first trade"}
        </Link>
      </div>
    </div>
  )
}

export function GoalCard({ trades, goals, loading }: { trades: TradeRow[]; goals: Goal[]; loading: boolean }) {
  const today = todayUTC()
  const y = today.getUTCFullYear()
  const m = today.getUTCMonth()
  const mk = monthKey(y, m)
  const todayKey = dayKey(today)

  const real = useMemo(() => monthData(trades, mk), [trades, mk])
  // No trades this month: the card keeps its full layout, filled with
  // example numbers and blurred behind a message (see EmptyOverlay)
  const empty = !loading && real.stats.count === 0
  const demo = useMemo(() => (empty ? monthData(demoTrades(y, m, mk), mk) : null), [empty, y, m, mk])
  const { dayMap, summary, stats } = demo ?? real

  const goal = resolveGoal(goals, mk)
  const progress = goal ? Math.min(1, Math.max(0, summary.pnl / goal.amount)) : 0
  const reached = !!goal && summary.pnl >= goal.amount
  const daysLeft = daysInMonth(y, m) - today.getUTCDate()
  const weeks = monthWeeks(y, m)
  const maxAbs = Math.max(0, ...daysWithPrefix(dayMap, mk).map((d) => Math.abs(d.pnl)))

  return (
    <OverviewCard
      accent="amber"
      icon={Target}
      title="This month"
      sub={MONTHS_LONG[m]}
      action={<CardLink href="/dashboard/trade-calendar">Calendar</CardLink>}
    >
      <Loaded
        loading={loading}
        className="flex flex-1 flex-col"
        fallback={
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Skeleton className="size-28 rounded-full" />
            <div className="flex-1 space-y-2"><Skeleton className="h-6 w-24" /><Skeleton className="h-3 w-32" /></div>
          </div>
          <Skeleton className="h-36 w-full" />
        </div>
        }
      >
        <div className="relative flex flex-1 flex-col">
        <div
          aria-hidden={empty || undefined}
          inert={empty || undefined}
          className={cn("flex flex-1 flex-col", empty && "pointer-events-none select-none opacity-50 blur-[3px]")}
        >
          <div className="flex items-center gap-4">
            {goal ? (
              <GoalRing progress={progress} reached={reached} label={`${Math.round((summary.pnl / goal.amount) * 100)}%`} />
            ) : null}
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">Month P&L</p>
              <p className={cn("text-2xl font-bold tabular-nums", pnlText(summary.pnl))}>{fmtMoney(summary.pnl, { signed: true })}</p>
              {goal ? (
                <p className="mt-1 text-xs leading-relaxed text-gray-400">
                  {reached ? (
                    <span className="font-medium text-emerald-300">Goal of {fmtMoney(goal.amount, { compact: true })} reached</span>
                  ) : (
                    <>
                      <span className="font-medium text-amber-200">{fmtMoney(goal.amount - summary.pnl, { compact: true })}</span> to your {fmtMoney(goal.amount, { compact: true })} goal
                    </>
                  )}
                  <br />
                  {daysLeft === 0 ? "Last day of the month" : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
                </p>
              ) : (
                <Link
                  href="/dashboard/trade-calendar"
                  className="mt-2 inline-flex min-h-9 items-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 text-xs font-medium text-amber-200 transition-colors hover:border-amber-400/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                >
                  Set a monthly goal
                </Link>
              )}
            </div>
          </div>

          {/* Mini heat calendar of the month. It takes whatever height the
              card has spare (the card stretches to the market cards beside
              it on wide screens), with h-8 cells as the minimum. */}
          <div className="mt-5 flex flex-1 flex-col">
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-gray-600">
              {WEEKDAY_INITIALS.map((d, i) => <span key={i}>{d}</span>)}
            </div>
            <div className="mt-1 flex flex-1 flex-col gap-1">
              {weeks.map((week, wi) => (
                <div key={wi} className="grid flex-1 grid-cols-7 gap-1">
                  {week.map((d, di) => {
                    if (!d) return <span key={di} className="min-h-9" />
                    const key = dayKey(d)
                    const stat = dayMap.get(key)
                    const isToday = key === todayKey
                    return (
                      <span
                        key={di}
                        className={cn(
                          "flex min-h-9 min-w-0 flex-col items-center justify-center rounded-md border px-0.5 text-[10px] tabular-nums sm:text-[11px]",
                          stat ? "text-white/90" : key > todayKey ? "border-transparent text-gray-700" : "border-white/[0.06] bg-white/[0.02] text-gray-600",
                          isToday && "ring-1 ring-amber-300/70"
                        )}
                        style={stat ? heat(stat.pnl, maxAbs) : undefined}
                      >
                        <span aria-hidden className={cn(stat && "text-[9px] leading-none text-white/60 sm:text-[10px]")}>{d.getUTCDate()}</span>
                        {stat && (
                          <span aria-hidden className={cn("mt-0.5 max-w-full truncate text-[9px] font-semibold leading-none sm:text-[10px]", pnlText(stat.pnl))}>
                            {cellMoney(stat.pnl)}
                          </span>
                        )}
                        {stat && (
                          <span className="sr-only">
                            {`${MONTHS_LONG[m]} ${d.getUTCDate()}: ${fmtMoney(stat.pnl, { signed: true })}, ${stat.count} trade${stat.count === 1 ? "" : "s"}`}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Best/Worst day: same short form as the day squares, with "$" ("+$1.2K") */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            <Stat label="Green days" value={String(summary.greenDays)} tone="up" />
            <Stat label="Red days" value={String(summary.redDays)} tone="down" />
            <Stat label="Best day" value={summary.best && summary.best.pnl > 0 ? fmtCellPnl(summary.best.pnl) : EMPTY} tone={summary.best && summary.best.pnl > 0 ? "up" : undefined} />
            <Stat label="Worst day" value={summary.worst && summary.worst.pnl < 0 ? fmtCellPnl(summary.worst.pnl) : EMPTY} tone={summary.worst && summary.worst.pnl < 0 ? "down" : undefined} />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Stat label="Win rate" value={stats.winRate === null ? EMPTY : `${stats.winRate.toFixed(1)}%`} />
            <Stat
              label="Profit factor"
              value={stats.count === 0 ? EMPTY : stats.profitFactor === null ? "No losses" : stats.profitFactor.toFixed(2)}
            />
            <Stat
              label="Avg win / loss"
              value={stats.count === 0 ? EMPTY : `${stats.avgWin === null ? "$0" : fmtMoney(stats.avgWin, { compact: true })} / ${stats.avgLoss === null ? "$0" : fmtMoney(stats.avgLoss, { compact: true })}`}
            />
          </div>
        </div>
        {empty && <EmptyOverlay hasTrades={trades.length > 0} />}
        </div>
      </Loaded>
    </OverviewCard>
  )
}
