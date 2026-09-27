"use client"

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import { fmtMoney, type Mode } from "./utils"

// ─── Count-up money ──────────────────────────────────────────────────────────

export function AnimatedMoney({ value, signed = true, className }: {
  value: number
  signed?: boolean
  className?: string
}) {
  const reduce = useReducedMotion()
  const mv     = useMotionValue(value)
  const text   = useTransform(mv, (v) => fmtMoney(v, { signed }))
  const first  = useRef(true)

  useEffect(() => {
    if (first.current || reduce) {
      first.current = false
      mv.set(value)
      return
    }
    const controls = animate(mv, value, { duration: 0.6, ease: [0.22, 1, 0.36, 1] })
    return () => controls.stop()
  }, [value, reduce, mv])

  return (
    <motion.span className={cn("tabular-nums", className)} aria-label={fmtMoney(value, { signed })}>
      {text}
    </motion.span>
  )
}

// ─── View switcher ───────────────────────────────────────────────────────────

const MODES: { id: Mode; label: string }[] = [
  { id: "week",  label: "Week" },
  { id: "month", label: "Month" },
  { id: "year",  label: "Year" },
  { id: "all",   label: "All time" },
]

export function ModeSwitcher({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="tablist" aria-label="Calendar range" className="relative grid w-full grid-cols-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 sm:w-auto">
      {MODES.map(({ id, label }) => {
        const active = id === mode
        return (
          <button
            key={id}
            role="tab"
            aria-selected={active}
            onClick={() => !active && onChange(id)}
            className={cn(
              "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 sm:px-4 sm:py-1.5",
              active ? "text-white" : "text-gray-500 hover:text-gray-200",
            )}
          >
            {active && (
              <motion.span
                layoutId="cal-mode-pill"
                className="absolute inset-0 rounded-lg border border-purple-400/30 bg-gradient-to-b from-purple-500/30 to-purple-500/10 shadow-[0_0_20px_-6px_rgba(168,85,247,0.6)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative whitespace-nowrap">{label}</span>
          </button>
        )
      })}
    </div>
  )
}

// ─── Weekends switch ─────────────────────────────────────────────────────────

export function WeekendSwitch({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] py-2 pl-3 pr-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
    >
      Weekends
      <span
        className={cn(
          "relative flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors duration-200",
          on ? "justify-end border-purple-400/40 bg-purple-500/40" : "justify-start border-white/10 bg-white/[0.06]",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 600, damping: 36 }}
          className={cn("size-3.5 rounded-full", on ? "bg-white" : "bg-gray-500")}
        />
      </span>
    </button>
  )
}

// ─── Small stat ──────────────────────────────────────────────────────────────

export function MiniStat({ label, value, sub, onClick }: {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  onClick?: () => void
}) {
  const Tag = onClick ? "button" : "div"
  return (
    <Tag
      onClick={onClick}
      className={cn(
        "min-w-0 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-left",
        onClick && "transition-colors hover:border-white/[0.1] hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60",
      )}
    >
      <p className="truncate text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-white tabular-nums">{value}</p>
      {sub && <p className="truncate text-[11px] text-gray-500">{sub}</p>}
    </Tag>
  )
}
