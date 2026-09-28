"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowDownRight, ArrowUpRight, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  addDays,
  dayKey,
  type DayStat,
  fmtMoney,
  type Goal,
  heat,
  isWeekend,
  monthKey,
  MONTHS_LONG,
  MONTHS_SHORT,
  monthWeeks,
  pnlText,
  resolveGoal,
  startOfWeek,
  utc,
  weekdayIndex,
  WEEKDAYS,
} from "./utils"

export type MonthAgg = { pnl: number; count: number; days: number }

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#07070d]"

function cellLabel(d: Date, s: DayStat | undefined) {
  const date = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })
  if (!s) return `${date}: no trades`
  return `${date}: ${fmtMoney(s.pnl, { signed: true })}, ${s.count} trade${s.count === 1 ? "" : "s"}`
}

// ─── Month ───────────────────────────────────────────────────────────────────

const MONTH_GRID = {
  7: "grid-cols-7 lg:grid-cols-[repeat(7,minmax(0,1fr))_minmax(0,0.9fr)]",
  5: "grid-cols-5 lg:grid-cols-[repeat(5,minmax(0,1fr))_minmax(0,0.9fr)]",
} as const

export function MonthView({ y, m, dayMap, today, weekends, selectedKey, onSelectDay, stagger, focusName }: {
  y: number
  m: number
  dayMap: Map<string, DayStat>
  today: Date
  weekends: boolean
  selectedKey: string | null
  onSelectDay: (key: string) => void
  stagger: boolean
  /** view-transition-name for the year → month morph */
  focusName?: string
}) {
  const reduce = useReducedMotion()
  const cols = weekends ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 2, 3, 4]
  const weeks = monthWeeks(y, m).filter((w) => cols.some((c) => w[c]))
  const todayKey = dayKey(today)

  let maxAbs = 0
  for (const w of weeks) for (const d of w) if (d) maxAbs = Math.max(maxAbs, Math.abs(dayMap.get(dayKey(d))?.pnl ?? 0))

  let idx = 0

  return (
    <div style={focusName ? { viewTransitionName: focusName } : undefined}>
      <div className={cn("grid gap-1.5 sm:gap-2", MONTH_GRID[weekends ? 7 : 5])}>
        {cols.map((c) => (
          <div key={c} className="pb-1 text-center text-xs font-medium text-gray-500">{WEEKDAYS[c]}</div>
        ))}
        <div className="hidden pb-1 text-center text-xs font-medium text-gray-500 lg:block">Week</div>

        {weeks.map((w, wi) => {
          const weekDays = w.filter(Boolean) as Date[]
          const weekStats = weekDays.map((d) => dayMap.get(dayKey(d))).filter(Boolean) as DayStat[]
          const weekPnl = weekStats.reduce((a, s) => a + s.pnl, 0)
          return [
            ...cols.map((c) => {
              const d = w[c]
              if (!d) return <div key={`${wi}-${c}`} aria-hidden="true" />
              const key = dayKey(d)
              const s = dayMap.get(key)
              const isToday = key === todayKey
              const future = d > today
              const i = idx++
              return (
                <motion.button
                  key={key}
                  onClick={() => onSelectDay(key)}
                  aria-label={cellLabel(d, s)}
                  aria-pressed={selectedKey === key}
                  initial={stagger && !reduce ? { opacity: 0, y: 6 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: stagger ? i * 0.012 : 0, duration: 0.3 }}
                  whileTap={reduce ? undefined : { scale: 0.96 }}
                  style={heat(s?.pnl ?? 0, maxAbs)}
                  className={cn(
                    "group relative flex min-h-[60px] flex-col justify-between rounded-lg border p-1.5 text-left transition-[border-color,background-color,box-shadow] sm:min-h-[84px] sm:rounded-xl sm:p-2.5 xl:min-h-[96px]",
                    focusRing,
                    s ? "hover:brightness-110" : "border-white/15 bg-white/[0.015] hover:border-white/30 hover:bg-white/[0.04]",
                    s && s.pnl === 0 && "border-white/25 bg-white/[0.05]",
                    future && !s && "opacity-45",
                    selectedKey === key && "ring-2 ring-purple-400/80 ring-offset-2 ring-offset-[#07070d]",
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={cn(
                        "flex size-5 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums sm:size-6 sm:text-xs",
                        isToday ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]" : s ? "text-white/90" : "text-gray-500",
                      )}
                    >
                      {d.getUTCDate()}
                    </span>
                    {s ? (
                      <span className="hidden text-[11px] text-white/60 sm:inline">
                        {s.count} trade{s.count === 1 ? "" : "s"}
                      </span>
                    ) : (
                      <Plus className="hidden size-3.5 text-gray-600 opacity-0 transition-opacity group-hover:opacity-100 sm:block" aria-hidden="true" />
                    )}
                  </div>
                  {s ? (
                    <span className={cn("font-semibold tabular-nums", pnlText(s.pnl))}>
                      <span className="text-[11px] sm:hidden">{fmtMoney(s.pnl, { signed: true, compact: true })}</span>
                      <span className="hidden text-sm sm:inline xl:text-[15px]">{fmtMoney(s.pnl, { signed: true })}</span>
                    </span>
                  ) : (
                    <span className="hidden h-px w-3 bg-white/10 sm:block" aria-hidden="true" />
                  )}
                </motion.button>
              )
            }),
            <div
              key={`wk-${wi}`}
              className="hidden flex-col justify-between rounded-xl border border-dashed border-white/20 bg-transparent p-2.5 lg:flex"
            >
              <span className="text-xs text-gray-500">Week {wi + 1}</span>
              <div>
                <p className={cn("text-sm font-semibold tabular-nums", weekStats.length ? pnlText(weekPnl) : "text-gray-600")}>
                  {weekStats.length ? fmtMoney(weekPnl, { signed: true }) : "No trades"}
                </p>
                {weekStats.length > 0 && (
                  <p className="text-[11px] text-gray-500">
                    {weekStats.length} day{weekStats.length === 1 ? "" : "s"}
                  </p>
                )}
              </div>
            </div>,
          ]
        })}
      </div>
    </div>
  )
}

// ─── Week ────────────────────────────────────────────────────────────────────

const WEEK_GRID = {
  7: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-7",
  5: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-5",
} as const

export function WeekView({ anchor, dayMap, today, weekends, selectedKey, onSelectDay, onAdd }: {
  anchor: Date
  dayMap: Map<string, DayStat>
  today: Date
  weekends: boolean
  selectedKey: string | null
  onSelectDay: (key: string) => void
  onAdd: (key: string) => void
}) {
  const start = startOfWeek(anchor)
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i)).filter((d) => weekends || !isWeekend(d))
  const todayKey = dayKey(today)
  const maxAbs = Math.max(0, ...days.map((d) => Math.abs(dayMap.get(dayKey(d))?.pnl ?? 0)))

  return (
    <div className={cn("grid gap-2.5", WEEK_GRID[weekends ? 7 : 5])}>
      {days.map((d) => {
        const key = dayKey(d)
        const s = dayMap.get(key)
        const isToday = key === todayKey
        const shown = s?.trades.slice(0, 5) ?? []
        return (
          <div
            key={key}
            className={cn(
              "flex flex-col overflow-hidden rounded-xl border border-white/15 bg-[#070712] xl:min-h-[280px]",
              selectedKey === key && "ring-2 ring-purple-400/80 ring-offset-2 ring-offset-[#07070d]",
            )}
          >
            <button
              onClick={() => onSelectDay(key)}
              aria-label={cellLabel(d, s)}
              style={heat(s?.pnl ?? 0, maxAbs)}
              className={cn("border-b border-white/15 p-3 text-left transition-[filter] hover:brightness-110", focusRing, !s && "bg-white/[0.02]")}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-400">{WEEKDAYS[weekdayIndex(d)]}</span>
                <span
                  className={cn(
                    "flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums",
                    isToday ? "bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.6)]" : "text-gray-300",
                  )}
                >
                  {MONTHS_SHORT[d.getUTCMonth()]} {d.getUTCDate()}
                </span>
              </div>
              <p className={cn("mt-2 text-lg font-semibold tabular-nums", s ? pnlText(s.pnl) : "text-gray-600")}>
                {s ? fmtMoney(s.pnl, { signed: true }) : "No trades"}
              </p>
              {s && (
                <p className="text-[11px] text-white/60">
                  {s.count} trade{s.count === 1 ? "" : "s"}, {s.wins}W {s.losses}L
                </p>
              )}
            </button>

            <ul className="flex-1 divide-y divide-white/[0.04] px-3">
              {shown.map((t) => (
                <li key={t.id} className="flex items-center gap-2 py-2">
                  {t.direction === "Buy" ? (
                    <ArrowUpRight className="size-3.5 shrink-0 text-emerald-400" aria-label="Buy" />
                  ) : (
                    <ArrowDownRight className="size-3.5 shrink-0 text-rose-400" aria-label="Sell" />
                  )}
                  <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-gray-200">{t.pair}</span>
                  <span className={cn("text-xs font-semibold tabular-nums", pnlText(t.pnl))}>{fmtMoney(t.pnl, { signed: true, compact: true })}</span>
                </li>
              ))}
            </ul>
            {s && s.trades.length > shown.length && (
              <button onClick={() => onSelectDay(key)} className={cn("mx-3 mb-1 rounded-md py-1 text-left text-[11px] font-medium text-purple-300 hover:text-purple-200", focusRing)}>
                +{s.trades.length - shown.length} more
              </button>
            )}

            <button
              onClick={() => onAdd(key)}
              className={cn(
                "m-2 mt-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 text-xs font-medium text-gray-500 transition-colors hover:border-purple-400/40 hover:bg-purple-500/[0.06] hover:text-purple-200",
                focusRing,
              )}
            >
              <Plus className="size-3.5" />
              Add trade
            </button>
          </div>
        )
      })}
    </div>
  )
}

// ─── Year ────────────────────────────────────────────────────────────────────

export function YearView({ year, dayMap, months, today, weekends, goals, onOpenMonth }: {
  year: number
  dayMap: Map<string, DayStat>
  months: Map<string, MonthAgg>
  today: Date
  weekends: boolean
  goals: Goal[]
  onOpenMonth: (m: number, el: HTMLElement) => void
}) {
  const reduce = useReducedMotion()
  const cols = weekends ? 7 : 5
  const todayKey = dayKey(today)

  let maxAbs = 0
  for (const [k, v] of dayMap) if (k.startsWith(`${year}-`)) maxAbs = Math.max(maxAbs, Math.abs(v.pnl))

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {MONTHS_LONG.map((name, m) => {
        const mk = monthKey(year, m)
        const agg = months.get(mk)
        const goal = resolveGoal(goals, mk)
        const future = utc(year, m, 1) > today
        const current = today.getUTCFullYear() === year && today.getUTCMonth() === m
        const pct = goal && agg ? Math.max(0, Math.round((agg.pnl / goal.amount) * 100)) : null
        const cells = monthWeeks(year, m).flatMap((w) => w.slice(0, cols))
        return (
          <motion.button
            key={mk}
            onClick={(e) => onOpenMonth(m, e.currentTarget)}
            whileHover={reduce ? undefined : { y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            aria-label={`${name} ${year}: ${agg ? `${fmtMoney(agg.pnl, { signed: true })} over ${agg.days} trading day${agg.days === 1 ? "" : "s"}` : "no trades"}. Open month`}
            className={cn(
              "group rounded-2xl border bg-[#070712] p-4 text-left transition-colors",
              focusRing,
              current ? "border-purple-400/40 shadow-[0_0_30px_-12px_rgba(168,85,247,0.6)]" : "border-white/15 hover:border-white/30",
              future && "opacity-55",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-white">{name}</span>
              <span className={cn("text-sm font-semibold tabular-nums", agg ? pnlText(agg.pnl) : "text-gray-600")}>
                {agg ? fmtMoney(agg.pnl, { signed: true }) : "No trades"}
              </span>
            </div>
            <div className="mt-0.5 flex items-center justify-between text-[11px] text-gray-500">
              <span>{agg ? `${agg.days} trading day${agg.days === 1 ? "" : "s"}` : future ? "Upcoming" : "Nothing logged"}</span>
              {pct !== null && (
                <span className={cn("font-medium", pct >= 100 ? "text-emerald-300" : "text-purple-300")}>
                  {pct >= 100 ? "Goal reached" : `${pct}% of goal`}
                </span>
              )}
            </div>

            <div className={cn("mt-3 grid gap-[3px]", cols === 7 ? "grid-cols-7" : "grid-cols-5")} aria-hidden="true">
              {cells.map((d, i) => {
                if (!d) return <span key={i} className="aspect-square" />
                const key = dayKey(d)
                const s = dayMap.get(key)
                return (
                  <span
                    key={i}
                    style={heat(s?.pnl ?? 0, maxAbs)}
                    className={cn(
                      "aspect-square rounded-[3px] border",
                      !s && "border-transparent bg-white/[0.04]",
                      key === todayKey && "outline outline-1 outline-offset-1 outline-purple-400",
                    )}
                  />
                )
              })}
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}

// ─── All time ────────────────────────────────────────────────────────────────

export function AllTimeView({ years, months, today, onOpenMonth, onOpenYear }: {
  years: number[]
  months: Map<string, MonthAgg>
  today: Date
  onOpenMonth: (y: number, m: number, el: HTMLElement) => void
  onOpenYear: (y: number) => void
}) {
  let maxAbs = 0
  for (const v of months.values()) maxAbs = Math.max(maxAbs, Math.abs(v.pnl))

  return (
    <div className="overflow-hidden rounded-2xl border border-white/25 bg-[#070712]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-1.5 p-2 text-sm">
          <caption className="sr-only">Monthly P&amp;L by year</caption>
          <thead>
            <tr>
              <th scope="col" className="w-16 px-2 pb-1 text-left text-xs font-medium text-gray-500">Year</th>
              {MONTHS_SHORT.map((mn) => (
                <th key={mn} scope="col" className="pb-1 text-center text-xs font-medium text-gray-500">{mn}</th>
              ))}
              <th scope="col" className="pb-1 text-right text-xs font-medium text-gray-500">Total</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => {
              let total = 0
              let any = false
              return (
                <tr key={y}>
                  <th scope="row" className="px-1 text-left">
                    <button
                      onClick={() => onOpenYear(y)}
                      className={cn("rounded-md px-1 py-0.5 text-sm font-semibold text-white transition-colors hover:text-purple-300", focusRing)}
                    >
                      {y}
                    </button>
                  </th>
                  {MONTHS_SHORT.map((mn, m) => {
                    const agg = months.get(monthKey(y, m))
                    if (agg) { total += agg.pnl; any = true }
                    const future = utc(y, m, 1) > today
                    return (
                      <td key={mn} className="p-0">
                        <button
                          onClick={(e) => onOpenMonth(y, m, e.currentTarget)}
                          disabled={future}
                          style={heat(agg?.pnl ?? 0, maxAbs)}
                          aria-label={`${MONTHS_LONG[m]} ${y}: ${agg ? fmtMoney(agg.pnl, { signed: true }) : "no trades"}`}
                          className={cn(
                            "flex h-12 w-full items-center justify-center rounded-lg border text-xs font-semibold tabular-nums transition-[filter,border-color]",
                            focusRing,
                            agg ? cn(pnlText(agg.pnl), "hover:brightness-125") : "border-white/15 bg-white/[0.015] text-gray-700 hover:border-white/30",
                            future && "cursor-default opacity-30 hover:border-white/15",
                          )}
                        >
                          {agg ? fmtMoney(agg.pnl, { signed: true, compact: true }) : "–"}
                        </button>
                      </td>
                    )
                  })}
                  <td className={cn("px-2 text-right text-sm font-bold tabular-nums", any ? pnlText(total) : "text-gray-600")}>
                    {any ? fmtMoney(total, { signed: true }) : "–"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
