"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Check, Loader2, Pencil, Target } from "lucide-react"
import { useEffect, useId, useMemo, useRef, useState } from "react"

import { cn } from "@/lib/utils"

import {
  dayKey,
  daysInMonth,
  type DayStat,
  fmtMoney,
  isWeekend,
  monthKeyLabel,
  MONTHS_SHORT,
  utc,
} from "./utils"

type ResolvedGoal = { amount: number; from: string; own: boolean } | null

const EASE = [0.22, 1, 0.36, 1] as const

// ─── Shell ───────────────────────────────────────────────────────────────────

function Shell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/25 bg-[#070712] p-5", className)}>
      <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
      <div className="pointer-events-none absolute -right-20 -top-24 size-56 rounded-full bg-purple-500/10 blur-3xl" />
      <div className="relative">{children}</div>
    </div>
  )
}

function Heading({ title, sub, action }: { title: string; sub?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-fuchsia-600/5">
          <Target className="size-4 text-purple-300" strokeWidth={1.75} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">{title}</h2>
          {sub && <p className="text-xs text-gray-500">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}

// ─── Goal editor ─────────────────────────────────────────────────────────────

function GoalEditor({ initial, canClear, onSave, onCancel }: {
  initial: number | null
  canClear: boolean
  onSave: (amount: number | null) => Promise<void>
  onCancel: () => void
}) {
  const [value, setValue] = useState(initial ? String(initial) : "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => inputRef.current?.focus(), [])

  async function save(amount: number | null) {
    setSaving(true)
    setError(null)
    try {
      await onSave(amount)
    } catch {
      setError("Couldn't save the goal. Try again.")
      setSaving(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18 }}
      onSubmit={(e) => {
        e.preventDefault()
        const n = parseFloat(value)
        if (!Number.isFinite(n) || n <= 0) {
          setError("Enter a goal greater than $0.")
          return
        }
        save(n)
      }}
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
      className="mt-4"
    >
      <label htmlFor="monthlyGoal" className="mb-1.5 block text-xs font-medium text-gray-400">
        Profit goal for this month
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
          <input
            ref={inputRef}
            id="monthlyGoal"
            type="number"
            inputMode="decimal"
            step="any"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="750"
            aria-invalid={!!error}
            aria-describedby={error ? "monthlyGoalError" : "monthlyGoalHelp"}
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] py-2.5 pl-7 pr-3 text-sm text-white tabular-nums placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-400 disabled:opacity-60"
        >
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          Save goal
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
        >
          Cancel
        </button>
      </div>
      {error ? (
        <p id="monthlyGoalError" role="alert" className="mt-1.5 text-xs text-rose-400">{error}</p>
      ) : (
        <p id="monthlyGoalHelp" className="mt-1.5 text-xs text-gray-600">
          Later months keep this goal until you change it.
          {canClear && (
            <>
              {" "}
              <button type="button" onClick={() => save(null)} className="font-medium text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline">
                Remove this month&apos;s goal
              </button>
            </>
          )}
        </p>
      )}
    </motion.form>
  )
}

// ─── Cumulative P&L curve vs goal ────────────────────────────────────────────

const CW = 600
const CH = 150
const PAD = { t: 14, r: 8, b: 20, l: 8 }

function EquityCurve({ y, m, dayMap, goal, today }: {
  y: number
  m: number
  dayMap: Map<string, DayStat>
  goal: number | null
  today: Date
}) {
  const reduce = useReducedMotion()
  const uid = useId().replace(/:/g, "")
  const n = daysInMonth(y, m)

  const { points, lastDay, min, max } = useMemo(() => {
    const isCurrent = today.getUTCFullYear() === y && today.getUTCMonth() === m
    const isFuture  = utc(y, m, 1) > today
    const last = isFuture ? 0 : isCurrent ? today.getUTCDate() : n
    let cum = 0
    const pts: number[] = [0]
    for (let d = 1; d <= last; d++) {
      cum += dayMap.get(dayKey(utc(y, m, d)))?.pnl ?? 0
      pts.push(cum)
    }
    return {
      points:  pts,
      lastDay: last,
      min:     Math.min(0, ...pts),
      max:     Math.max(goal ?? 0, ...pts, 1),
    }
  }, [y, m, n, dayMap, goal, today])

  const span = max - min || 1
  const top  = max + span * 0.08
  const bot  = min - (min < 0 ? span * 0.08 : 0)
  const sx = (d: number) => PAD.l + (d / n) * (CW - PAD.l - PAD.r)
  const sy = (v: number) => PAD.t + (1 - (v - bot) / (top - bot)) * (CH - PAD.t - PAD.b)

  const line = points.map((v, i) => `${i === 0 ? "M" : "L"}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join(" ")
  const area = `${line} L${sx(lastDay).toFixed(1)},${sy(0).toFixed(1)} L${sx(0).toFixed(1)},${sy(0).toFixed(1)} Z`
  const end  = points[points.length - 1] ?? 0
  const up   = end >= 0
  const stroke = up ? "#34d399" : "#fb7185"

  const ticks = [1, 8, 15, 22, n].filter((d, i, a) => a.indexOf(d) === i && d <= n)

  return (
    <svg viewBox={`0 0 ${CW} ${CH}`} className="h-36 w-full sm:h-40" role="img"
      aria-label={`Cumulative P&L for the month: ${fmtMoney(end, { signed: true })}${goal ? ` against a ${fmtMoney(goal)} goal` : ""}`}>
      <defs>
        <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* zero line */}
      <line x1={PAD.l} x2={CW - PAD.r} y1={sy(0)} y2={sy(0)} stroke="#fff" strokeOpacity="0.08" strokeWidth="1" />

      {/* goal line */}
      {goal !== null && (
        <g>
          <line x1={PAD.l} x2={CW - PAD.r} y1={sy(goal)} y2={sy(goal)} stroke="#c084fc" strokeOpacity="0.7" strokeWidth="1.2" strokeDasharray="5 5" />
          <text x={CW - PAD.r} y={sy(goal) - 5} textAnchor="end" fontSize="11" fontWeight="600" fill="#d8b4fe">
            Goal {fmtMoney(goal, { compact: true })}
          </text>
        </g>
      )}

      {lastDay > 0 && (
        <>
          <motion.path
            key={`a-${y}-${m}`}
            d={area}
            fill={`url(#area-${uid})`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          />
          <motion.path
            key={`l-${y}-${m}`}
            d={line}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={reduce ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: EASE }}
          />
          <motion.circle
            key={`c-${y}-${m}`}
            cx={sx(lastDay)}
            cy={sy(end)}
            r="4"
            fill={stroke}
            stroke="#070712"
            strokeWidth="2"
            initial={reduce ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.85, type: "spring", stiffness: 500, damping: 24 }}
          />
        </>
      )}

      {ticks.map((d) => (
        <text key={d} x={sx(d)} y={CH - 4} textAnchor={d === n ? "end" : "middle"} fontSize="11" fill="#6b7280">
          {MONTHS_SHORT[m]} {d}
        </text>
      ))}
    </svg>
  )
}

// ─── Month goal card (week + month views) ────────────────────────────────────

export function MonthGoalCard({ y, m, dayMap, monthPnl, goal, today, weekends, onSave, className }: {
  y: number
  m: number
  dayMap: Map<string, DayStat>
  monthPnl: number
  goal: ResolvedGoal
  today: Date
  weekends: boolean
  onSave: (amount: number | null) => Promise<void>
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const reduce = useReducedMotion()
  const mk = `${y}-${String(m + 1).padStart(2, "0")}`

  useEffect(() => setEditing(false), [mk])

  const amount   = goal?.amount ?? null
  const progress = amount ? Math.max(0, Math.min(1, monthPnl / amount)) : 0
  const hit      = amount !== null && monthPnl >= amount
  const toGo     = amount !== null ? amount - monthPnl : 0

  // Remaining days you'd trade on: today onwards, skipping weekends if hidden.
  const daysLeft = useMemo(() => {
    const isCurrent = today.getUTCFullYear() === y && today.getUTCMonth() === m
    if (!isCurrent) return null
    let c = 0
    for (let d = today.getUTCDate(); d <= daysInMonth(y, m); d++) {
      if (weekends || !isWeekend(utc(y, m, d))) c++
    }
    return c
  }, [today, y, m, weekends])

  return (
    <Shell className={className}>
      <Heading
        title="Monthly goal"
        sub={
          goal && !goal.own
            ? `${monthKeyLabel(mk)}, carried over from ${monthKeyLabel(goal.from)}`
            : monthKeyLabel(mk)
        }
        action={
          !editing && (
            <button
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
            >
              <Pencil className="size-3.5" />
              {amount ? "Edit goal" : "Set goal"}
            </button>
          )
        }
      />

      <AnimatePresence initial={false}>
        {editing && (
          <GoalEditor
            key="editor"
            initial={amount}
            canClear={!!goal?.own}
            onCancel={() => setEditing(false)}
            onSave={async (a) => {
              await onSave(a)
              setEditing(false)
            }}
          />
        )}
      </AnimatePresence>

      {amount !== null ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-sm text-gray-400">
              <span className={cn("font-semibold tabular-nums", monthPnl >= 0 ? "text-white" : "text-rose-300")}>
                {fmtMoney(monthPnl)}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-white tabular-nums">{fmtMoney(amount)}</span>
            </p>
            <AnimatePresence mode="wait" initial={false}>
              {hit ? (
                <motion.span
                  key="hit"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300"
                >
                  <Check className="size-3" /> Goal reached
                </motion.span>
              ) : (
                <motion.span key="pct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sm font-semibold text-purple-200 tabular-nums">
                  {Math.round(progress * 100)}%
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"
            role="progressbar" aria-label="Monthly goal progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}>
            <motion.div
              className={cn("h-full rounded-full bg-gradient-to-r", hit ? "from-emerald-500 to-teal-300" : "from-purple-500 to-fuchsia-400")}
              initial={reduce ? false : { width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            {hit
              ? `${fmtMoney(monthPnl - amount)} above goal.`
              : daysLeft
                ? `${fmtMoney(toGo)} to go, about ${fmtMoney(toGo / daysLeft)} per day over the ${daysLeft} ${weekends ? "day" : "weekday"}${daysLeft === 1 ? "" : "s"} left.`
                : `${fmtMoney(toGo)} short of goal.`}
          </p>
        </div>
      ) : (
        !editing && (
          <p className="mt-4 text-sm text-gray-400">
            Set a profit target for the month and track how each day moves you toward it.
          </p>
        )
      )}

      <div className="mt-3">
        <EquityCurve y={y} m={m} dayMap={dayMap} goal={amount} today={today} />
      </div>
    </Shell>
  )
}

// ─── Goal record (year + all-time views) ─────────────────────────────────────

export type GoalBar = {
  id:     string
  label:  string
  pnl:    number
  goal:   number | null
  future: boolean
}

export function GoalRecordCard({ title, sub, bars, onSelect, className }: {
  title: string
  sub: string
  bars: GoalBar[]
  onSelect: (id: string, el: HTMLElement) => void
  className?: string
}) {
  const reduce = useReducedMotion()
  const scale = Math.max(1, ...bars.flatMap((b) => [Math.abs(b.pnl), b.goal ?? 0]))
  const hasNeg = bars.some((b) => b.pnl < 0)
  // Share of the chart height above the zero line
  const upShare = hasNeg ? 0.72 : 1

  return (
    <Shell className={className}>
      <Heading title={title} sub={sub} />

      <div className="mt-5 flex h-40 items-stretch gap-1 sm:gap-1.5">
        {bars.map((b, i) => {
          const h = Math.abs(b.pnl) / scale
          const hit = b.goal !== null && b.pnl >= b.goal
          const tone = b.pnl < 0
            ? "from-rose-500/80 to-rose-400/40"
            : hit
              ? "from-emerald-400 to-emerald-500/50"
              : "from-purple-400/90 to-purple-500/40"
          return (
            <button
              key={b.id}
              onClick={(e) => onSelect(b.id, e.currentTarget)}
              disabled={b.future}
              aria-label={`${b.label}: ${fmtMoney(b.pnl, { signed: true })}${b.goal ? `, goal ${fmtMoney(b.goal)}${hit ? ", reached" : ""}` : ""}`}
              className="group relative flex min-w-0 flex-1 flex-col rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 disabled:cursor-default"
            >
              <div className="relative w-full flex-1">
                {/* above zero */}
                <div className="absolute inset-x-0 top-0 flex flex-col justify-end" style={{ height: `${upShare * 100}%` }}>
                  {b.goal !== null && !b.future && (
                    <span className="absolute inset-x-0 z-10 border-t border-dashed border-purple-300/70" style={{ bottom: `${(b.goal / scale) * 100}%` }} />
                  )}
                  {b.pnl > 0 && (
                    <motion.div
                      className={cn("w-full rounded-t-[5px] bg-gradient-to-t transition-[filter] group-hover:brightness-125", tone)}
                      initial={reduce ? false : { height: 0 }}
                      animate={{ height: `${h * 100}%` }}
                      transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.03, ease: EASE }}
                    />
                  )}
                </div>
                {/* below zero */}
                {hasNeg && (
                  <div className="absolute inset-x-0 bottom-0 border-t border-white/15" style={{ height: `${(1 - upShare) * 100}%` }}>
                    {b.pnl < 0 && (
                      <motion.div
                        className={cn("w-full rounded-b-[5px] bg-gradient-to-b transition-[filter] group-hover:brightness-125", tone)}
                        initial={reduce ? false : { height: 0 }}
                        animate={{ height: `${Math.min(1, (h * upShare) / (1 - upShare)) * 100}%` }}
                        transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.03, ease: EASE }}
                      />
                    )}
                  </div>
                )}
                {!hasNeg && <span className="absolute inset-x-0 bottom-0 border-t border-white/15" />}
              </div>
              <span className={cn("mt-1.5 truncate text-center text-[11px]", b.future ? "text-gray-700" : "text-gray-500 group-hover:text-gray-300")}>
                {b.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-emerald-400" />Goal reached</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-purple-400" />Profit, under goal</span>
        <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-sm bg-rose-400" />Loss</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-purple-300" />Goal</span>
      </div>
    </Shell>
  )
}

