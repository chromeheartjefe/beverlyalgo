"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { BookOpen, CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { useTradeActions, useTrades } from "@/components/dashboard/trade-form-modal"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { fetcher } from "@/lib/swr"
import { cn } from "@/lib/utils"
import { withViewTransition } from "@/lib/view-transition"

import { DayDrawer } from "./day-drawer"
import { type GoalBar,GoalRecordCard, MonthGoalCard } from "./goal-card"
import { AnimatedMoney, MiniStat, ModeSwitcher, WeekendSwitch } from "./parts"
import {
  addDays,
  buildDayMap,
  dayKey,
  daysInRange,
  type DayStat,
  daysWithPrefix,
  fmtMoney,
  formatShortDate,
  type Goal,
  isWeekend,
  keyToDate,
  type Mode,
  monthKey,
  MONTHS_LONG,
  MONTHS_SHORT,
  periodContains,
  periodKey,
  periodTitle,
  pnlText,
  resolveGoal,
  shiftAnchor,
  startOfWeek,
  summarize,
  todayUTC,
  utc,
} from "./utils"
import { AllTimeView, type MonthAgg,MonthView, WeekView, YearView } from "./views"

const GOALS_KEY = "/api/trading-goals"
const WEEKENDS_PREF = "entrix:calendar:weekends"

const slide = {
  enter:  (dir: number) => ({ opacity: 0, x: dir * 36 }),
  center: { opacity: 1, x: 0 },
  exit:   (dir: number) => ({ opacity: 0, x: dir * -36 }),
}

export function TradeCalendar() {
  const reduce = useReducedMotion()
  const { trades, loading } = useTrades()
  const { openAdd, openEdit, remove, modal } = useTradeActions()
  const { data: goalsData, mutate: mutateGoals } = useSWR<Goal[]>(GOALS_KEY, fetcher)
  const goals = useMemo(() => goalsData ?? [], [goalsData])

  const [today] = useState(todayUTC)
  const [mode, setMode] = useState<Mode>("month")
  const [anchor, setAnchor] = useState<Date>(today)
  const [dir, setDir] = useState<1 | -1>(1)
  const [weekends, setWeekendsState] = useState(false)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [focusMorph, setFocusMorph] = useState(false)
  // The month grid's cells cascade in once, on first load only
  const [introDone, setIntroDone] = useState(false)

  // Per-viewer convenience only, so browser storage is enough
  useEffect(() => {
    try {
      if (localStorage.getItem(WEEKENDS_PREF) === "1") setWeekendsState(true)
    } catch {}
  }, [])
  const setWeekends = useCallback((v: boolean) => {
    setWeekendsState(v)
    try { localStorage.setItem(WEEKENDS_PREF, v ? "1" : "0") } catch {}
  }, [])

  useEffect(() => {
    if (loading) return
    const t = setTimeout(() => setIntroDone(true), 900)
    return () => clearTimeout(t)
  }, [loading])

  // ─── Derived data ──────────────────────────────────────────────────────────

  const dayMap = useMemo(() => buildDayMap(trades), [trades])

  const months = useMemo(() => {
    const map = new Map<string, MonthAgg>()
    for (const [k, s] of dayMap) {
      const mk = k.slice(0, 7)
      const agg = map.get(mk) ?? { pnl: 0, count: 0, days: 0 }
      agg.pnl += s.pnl
      agg.count += s.count
      agg.days += 1
      map.set(mk, agg)
    }
    return map
  }, [dayMap])

  const years = useMemo(() => {
    const ys = new Set<number>([today.getUTCFullYear()])
    for (const k of dayMap.keys()) ys.add(Number(k.slice(0, 4)))
    return [...ys].sort((a, b) => b - a)
  }, [dayMap, today])

  const y = anchor.getUTCFullYear()
  const m = anchor.getUTCMonth()
  const mk = monthKey(y, m)

  const periodDays: DayStat[] = useMemo(() => {
    if (mode === "week")  return daysInRange(dayMap, startOfWeek(anchor), 7)
    if (mode === "month") return daysWithPrefix(dayMap, mk)
    if (mode === "year")  return daysWithPrefix(dayMap, String(y))
    return [...dayMap.values()]
  }, [mode, dayMap, anchor, mk, y])

  const summary = useMemo(() => summarize(periodDays), [periodDays])
  const monthPnl = months.get(mk)?.pnl ?? 0
  const goal = resolveGoal(goals, mk)

  const hiddenWeekend = useMemo(() => {
    if (weekends || mode === "year" || mode === "all") return null
    const days = periodDays.filter((d) => isWeekend(keyToDate(d.key)))
    if (!days.length) return null
    return { count: days.reduce((a, d) => a + d.count, 0), pnl: days.reduce((a, d) => a + d.pnl, 0) }
  }, [weekends, mode, periodDays])

  // ─── Navigation ────────────────────────────────────────────────────────────

  const step = (d: 1 | -1) => {
    setDir(d)
    setAnchor((a) => shiftAnchor(a, mode, d))
  }

  const goToday = () => {
    setDir(anchor < today ? 1 : -1)
    setAnchor(today)
  }

  const switchMode = (next: Mode) => {
    withViewTransition(() => {
      setMode(next)
      // Looking at the period that contains today → the new view opens on
      // today too (not on the 1st of the month or January)
      if (periodContains(anchor, mode, today)) setAnchor(today)
    })
  }

  // Year tile / all-time cell → that month, the clicked tile morphing into the grid
  const openMonth = (yy: number, mm: number, el: HTMLElement) => {
    el.style.viewTransitionName = "cal-focus"
    withViewTransition(() => {
      setFocusMorph(true)
      setMode("month")
      setAnchor(utc(yy, mm, 1))
    }).then(() => setFocusMorph(false))
  }

  const openYear = (yy: number) => {
    withViewTransition(() => {
      setMode("year")
      setAnchor(utc(yy, 0, 1))
    })
  }

  // Keyboard: ←/→ move between periods when focus isn't in a field or dialog
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (selectedKey || mode === "all") return
      const t = e.target as HTMLElement
      if (t.closest("input, textarea, select, [role='dialog'], [role='tablist']")) return
      if (e.key === "ArrowLeft")  step(-1)
      if (e.key === "ArrowRight") step(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // ─── Goals ─────────────────────────────────────────────────────────────────

  const saveGoal = async (amount: number | null) => {
    const res = await fetch(GOALS_KEY, {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ month: mk, amount }),
    })
    if (!res.ok) throw new Error("save failed")
    mutateGoals((prev) => {
      const rest = (prev ?? []).filter((g) => g.month !== mk)
      return (amount === null ? rest : [...rest, { month: mk, amount }]).sort((a, b) => a.month.localeCompare(b.month))
    }, { revalidate: false })
    toast.success(amount === null ? "Goal removed" : "Goal saved")
  }

  const goalBars: GoalBar[] = useMemo(() => {
    if (mode === "year") {
      return MONTHS_SHORT.map((label, i) => {
        const k = monthKey(y, i)
        const future = utc(y, i, 1) > today
        return { id: k, label, pnl: months.get(k)?.pnl ?? 0, goal: future ? null : resolveGoal(goals, k)?.amount ?? null, future }
      })
    }
    if (mode === "all") {
      return [...years].reverse().map((yy) => {
        let pnl = 0
        let goalSum = 0
        let anyGoal = false
        for (let i = 0; i < 12; i++) {
          const k = monthKey(yy, i)
          pnl += months.get(k)?.pnl ?? 0
          if (utc(yy, i, 1) <= today) {
            const g = resolveGoal(goals, k)
            if (g) { goalSum += g.amount; anyGoal = true }
          }
        }
        return { id: String(yy), label: String(yy), pnl, goal: anyGoal ? goalSum : null, future: false }
      })
    }
    return []
  }, [mode, y, months, goals, years, today])

  const goalsHit = useMemo(() => {
    const scope = mode === "year" ? [y] : years
    let hit = 0
    let total = 0
    for (const yy of scope) {
      for (let i = 0; i < 12; i++) {
        if (utc(yy, i, 1) > today) continue
        const k = monthKey(yy, i)
        const g = resolveGoal(goals, k)
        if (!g) continue
        total++
        if ((months.get(k)?.pnl ?? 0) >= g.amount) hit++
      }
    }
    return { hit, total }
  }, [mode, y, years, goals, months, today])

  // ─── Day drawer ────────────────────────────────────────────────────────────

  const stepDay = (d: 1 | -1) => {
    if (!selectedKey) return
    let next = addDays(keyToDate(selectedKey), d)
    if (!weekends) while (isWeekend(next)) next = addDays(next, d)
    setSelectedKey(dayKey(next))
    // Keep the calendar behind the drawer on the same period as the day
    if ((mode === "week" || mode === "month") && !periodContains(anchor, mode, next)) {
      setDir(d)
      setAnchor(mode === "month" ? utc(next.getUTCFullYear(), next.getUTCMonth(), 1) : next)
    }
  }

  const addOn = (key?: string) => openAdd(key)

  // ─── Render ────────────────────────────────────────────────────────────────

  const pk = periodKey(anchor, mode)
  const title = periodTitle(anchor, mode)
  const showToday = mode !== "all" && !periodContains(anchor, mode, today)
  const periodLabel =
    mode === "week" ? "This week's" : mode === "month" ? `${MONTHS_LONG[m]}` : mode === "year" ? String(y) : "All-time"
  const winDayRate = summary.tradingDays ? Math.round((summary.greenDays / summary.tradingDays) * 100) : null
  const isEmpty = !loading && trades.length === 0

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Trade Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">Your Trade Journal, day by day. Pick a day to see or add its trades.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/trade-journal"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06]"
          >
            <BookOpen className="size-4" />
            Journal
          </Link>
          <button
            onClick={() => addOn(selectedKey ?? undefined)}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-400"
          >
            <Plus className="size-4" />
            Add Trade
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <ModeSwitcher mode={mode} onChange={switchMode} />

        <div className="flex items-center justify-between gap-2 lg:justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => step(-1)}
                disabled={mode === "all"}
                aria-label={`Previous ${mode}`}
                className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Previous ({"←"})</TooltipContent>
          </Tooltip>
          <h2
            className="min-w-0 flex-1 truncate text-center text-base font-semibold text-white tabular-nums sm:min-w-[220px] sm:flex-none sm:text-lg"
            style={{ viewTransitionName: "cal-title" }}
            aria-live="polite"
          >
            {title}
          </h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => step(1)}
                disabled={mode === "all"}
                aria-label={`Next ${mode}`}
                className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-400 transition-colors hover:bg-white/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="size-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Next ({"→"})</TooltipContent>
          </Tooltip>
          <AnimatePresence initial={false}>
            {showToday && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={goToday}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-purple-400/25 bg-purple-500/10 px-3 text-sm font-medium text-purple-200 transition-colors hover:bg-purple-500/20"
              >
                <CalendarDays className="size-4" />
                Today
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end">
          {mode === "week" || mode === "month" || mode === "year" ? (
            <WeekendSwitch on={weekends} onChange={setWeekends} />
          ) : (
            <span className="hidden h-10 lg:block" />
          )}
        </div>
      </div>

      {/* Summary + goal */}
      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#070712] p-5 lg:col-span-2">
          <div
            className={cn(
              "pointer-events-none absolute -left-16 -top-20 size-56 rounded-full blur-3xl transition-colors duration-700",
              summary.pnl > 0 ? "bg-emerald-500/15" : summary.pnl < 0 ? "bg-rose-500/15" : "bg-white/[0.03]",
            )}
          />
          <div className="relative">
            <p className="text-sm text-gray-400">{periodLabel} net P&amp;L</p>
            <p className={cn("mt-1 text-4xl font-bold tracking-tight sm:text-5xl", summary.tradingDays ? pnlText(summary.pnl) : "text-gray-600")}>
              <AnimatedMoney value={summary.pnl} />
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {summary.trades} trade{summary.trades === 1 ? "" : "s"} over {summary.tradingDays} trading day{summary.tradingDays === 1 ? "" : "s"}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <MiniStat
                label="Green days"
                value={winDayRate === null ? "–" : `${winDayRate}%`}
                sub={`${summary.greenDays} green, ${summary.redDays} red`}
              />
              <MiniStat
                label="Avg per trading day"
                value={summary.tradingDays ? <span className={pnlText(summary.pnl)}>{fmtMoney(summary.pnl / summary.tradingDays, { signed: true })}</span> : "–"}
              />
              <MiniStat
                label="Best day"
                value={summary.best && summary.best.pnl > 0 ? <span className="text-emerald-300">{fmtMoney(summary.best.pnl, { signed: true })}</span> : "–"}
                sub={summary.best && summary.best.pnl > 0 ? formatShortDate(summary.best.key) : undefined}
                onClick={summary.best && summary.best.pnl > 0 ? () => setSelectedKey(summary.best!.key) : undefined}
              />
              <MiniStat
                label="Worst day"
                value={summary.worst && summary.worst.pnl < 0 ? <span className="text-rose-300">{fmtMoney(summary.worst.pnl, { signed: true })}</span> : "–"}
                sub={summary.worst && summary.worst.pnl < 0 ? formatShortDate(summary.worst.key) : undefined}
                onClick={summary.worst && summary.worst.pnl < 0 ? () => setSelectedKey(summary.worst!.key) : undefined}
              />
            </div>
          </div>
        </div>

        {mode === "week" || mode === "month" ? (
          <MonthGoalCard
            className="lg:col-span-3"
            y={y}
            m={m}
            dayMap={dayMap}
            monthPnl={monthPnl}
            goal={goal}
            today={today}
            weekends={weekends}
            onSave={saveGoal}
          />
        ) : (
          <GoalRecordCard
            className="lg:col-span-3"
            title={mode === "year" ? `${y} by month` : "All time by year"}
            sub={
              goalsHit.total
                ? `Goal reached in ${goalsHit.hit} of ${goalsHit.total} month${goalsHit.total === 1 ? "" : "s"}`
                : "Set a monthly goal in the Month view to track it here"
            }
            bars={goalBars}
            onSelect={(id, el) => {
              if (mode === "year") openMonth(y, Number(id.slice(5)) - 1, el)
              else openYear(Number(id))
            }}
          />
        )}
      </div>

      {/* Empty-journal prompt */}
      <AnimatePresence initial={false}>
        {isEmpty && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mb-5 flex flex-col items-start gap-3 rounded-2xl border border-dashed border-purple-400/25 bg-purple-500/[0.05] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-300">
                No trades yet. Anything you log in the Trade Journal lands on its day here.
              </p>
              <button
                onClick={() => addOn()}
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-400"
              >
                <Plus className="size-4" />
                Log your first trade
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar body */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-2.5 sm:p-4" style={{ viewTransitionName: "cal-body" }}>
        {loading ? (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-7" aria-busy="true" aria-label="Loading trades">
            {Array.from({ length: 35 }, (_, i) => (
              <div key={i} className="h-[60px] animate-pulse rounded-xl bg-white/[0.04] sm:h-[84px]" style={{ animationDelay: `${(i % 7) * 60}ms` }} />
            ))}
          </div>
        ) : (
          <div key={mode} className="relative overflow-hidden">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.div
                key={pk}
                custom={dir}
                variants={reduce ? undefined : slide}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ x: { type: "spring", stiffness: 360, damping: 36 }, opacity: { duration: 0.18 } }}
              >
                {mode === "month" && (
                  <MonthView
                    y={y}
                    m={m}
                    dayMap={dayMap}
                    today={today}
                    weekends={weekends}
                    selectedKey={selectedKey}
                    onSelectDay={setSelectedKey}
                    stagger={!introDone && !focusMorph}
                    focusName={focusMorph ? "cal-focus" : undefined}
                  />
                )}
                {mode === "week" && (
                  <WeekView
                    anchor={anchor}
                    dayMap={dayMap}
                    today={today}
                    weekends={weekends}
                    selectedKey={selectedKey}
                    onSelectDay={setSelectedKey}
                    onAdd={addOn}
                  />
                )}
                {mode === "year" && (
                  <YearView
                    year={y}
                    dayMap={dayMap}
                    months={months}
                    today={today}
                    weekends={weekends}
                    goals={goals}
                    onOpenMonth={(mm, el) => openMonth(y, mm, el)}
                  />
                )}
                {mode === "all" && (
                  <AllTimeView years={years} months={months} today={today} onOpenMonth={openMonth} onOpenYear={openYear} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence initial={false}>
          {hiddenWeekend && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-gray-500">
                <span>
                  {hiddenWeekend.count} weekend trade{hiddenWeekend.count === 1 ? "" : "s"} (
                  <span className={pnlText(hiddenWeekend.pnl)}>{fmtMoney(hiddenWeekend.pnl, { signed: true })}</span>) hidden but counted in totals.
                </span>
                <button onClick={() => setWeekends(true)} className="font-medium text-purple-300 underline-offset-2 hover:text-purple-200 hover:underline">
                  Show weekends
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DayDrawer
        dayKey={selectedKey}
        stat={selectedKey ? dayMap.get(selectedKey) : undefined}
        onClose={() => setSelectedKey(null)}
        onStep={stepDay}
        onAdd={addOn}
        onEdit={openEdit}
        onDelete={remove}
      />
      {modal}
    </div>
  )
}
