import { ArrowDownRight, ArrowUpRight, type LucideIcon, Minus } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import type { PlanKind } from "~/lib/format"

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ")
}

// One accent per business area, full class strings so Tailwind sees them
export const ACCENT = {
  violet:  { text: "text-violet-300",  line: "via-violet-400/70",  glow: "bg-[radial-gradient(closest-side,rgba(139,92,246,0.22),transparent)]",  tile: "border-violet-400/30 from-violet-500/30 to-fuchsia-600/10",  icon: "text-violet-200",  bar: "bg-violet-400",  soft: "bg-violet-500/10 border-violet-400/25" },
  sky:     { text: "text-sky-300",     line: "via-sky-400/70",     glow: "bg-[radial-gradient(closest-side,rgba(14,165,233,0.22),transparent)]",     tile: "border-sky-400/30 from-sky-500/30 to-cyan-600/10",          icon: "text-sky-200",     bar: "bg-sky-400",     soft: "bg-sky-500/10 border-sky-400/25" },
  emerald: { text: "text-emerald-300", line: "via-emerald-400/70", glow: "bg-[radial-gradient(closest-side,rgba(16,185,129,0.22),transparent)]", tile: "border-emerald-400/30 from-emerald-500/30 to-teal-600/10",  icon: "text-emerald-200", bar: "bg-emerald-400", soft: "bg-emerald-500/10 border-emerald-400/25" },
  fuchsia: { text: "text-fuchsia-300", line: "via-fuchsia-400/70", glow: "bg-[radial-gradient(closest-side,rgba(217,70,239,0.22),transparent)]", tile: "border-fuchsia-400/30 from-fuchsia-500/30 to-pink-600/10",  icon: "text-fuchsia-200", bar: "bg-fuchsia-400", soft: "bg-fuchsia-500/10 border-fuchsia-400/25" },
  amber:   { text: "text-amber-300",   line: "via-amber-400/70",   glow: "bg-[radial-gradient(closest-side,rgba(245,158,11,0.22),transparent)]",   tile: "border-amber-400/30 from-amber-500/30 to-orange-600/10",    icon: "text-amber-200",   bar: "bg-amber-400",   soft: "bg-amber-500/10 border-amber-400/25" },
  rose:    { text: "text-rose-300",    line: "via-rose-400/70",    glow: "bg-[radial-gradient(closest-side,rgba(244,63,94,0.22),transparent)]",    tile: "border-rose-400/30 from-rose-500/30 to-red-600/10",         icon: "text-rose-200",    bar: "bg-rose-400",    soft: "bg-rose-500/10 border-rose-400/25" },
} as const
export type Accent = keyof typeof ACCENT

export function IconTile({ icon: Icon, accent = "violet", size = "md" }: { icon: LucideIcon; accent?: Accent; size?: "sm" | "md" | "lg" }) {
  const a = ACCENT[accent]
  return (
    <span
      className={cx(
        "flex shrink-0 items-center justify-center rounded-xl border bg-gradient-to-br",
        a.tile,
        size === "sm" ? "size-7" : size === "lg" ? "size-11" : "size-9",
      )}
    >
      <Icon className={cx(a.icon, size === "sm" ? "size-3.5" : size === "lg" ? "size-5" : "size-4")} strokeWidth={1.75} aria-hidden />
    </span>
  )
}

export function PageHeader({ title, sub, right, icon, accent = "violet", eyebrow }: {
  title: string
  sub?: ReactNode
  right?: ReactNode
  icon?: LucideIcon
  accent?: Accent
  eyebrow?: string
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-center gap-3.5">
        {icon && <IconTile icon={icon} accent={accent} size="lg" />}
        <div>
          {eyebrow && <p className={cx("text-[11px] font-semibold uppercase tracking-[0.18em]", ACCENT[accent].text)}>{eyebrow}</p>}
          <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
          {sub && <p className="mt-1 max-w-3xl text-sm text-gray-400">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

/** Glass card with an accent hairline and a soft corner glow */
export function Card({ title, sub, right, className, accent, icon, children }: {
  title?: string
  sub?: ReactNode
  right?: ReactNode
  className?: string
  accent?: Accent
  icon?: LucideIcon
  children: ReactNode
}) {
  const a = accent ? ACCENT[accent] : null
  return (
    <section className={cx("relative overflow-hidden rounded-2xl border border-white/[0.09] bg-surface/80 p-5 shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]", className)}>
      {a && <span className={cx("pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />}
      {a && <div className={cx("pointer-events-none absolute -right-20 -top-24 size-56", a.glow)} />}
      {(title || right) && (
        <div className="relative mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icon && <IconTile icon={icon} accent={accent ?? "violet"} size="sm" />}
            <div>
              {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
              {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
            </div>
          </div>
          {right}
        </div>
      )}
      <div className="relative">{children}</div>
    </section>
  )
}

/** Change vs the previous period. `goodWhenUp` false for costs and churn. */
export function Delta({ value, label, goodWhenUp = true }: { value: number | null; label?: string; goodWhenUp?: boolean }) {
  if (value === null || !Number.isFinite(value)) {
    return <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Minus className="size-3" aria-hidden />{label ?? "no prior data"}</span>
  }
  const up = value > 0.0005
  const down = value < -0.0005
  const good = up ? goodWhenUp : down ? !goodWhenUp : null
  const Icon = up ? ArrowUpRight : down ? ArrowDownRight : Minus
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold",
        good === true ? "bg-emerald-500/10 text-emerald-300" : good === false ? "bg-rose-500/10 text-rose-300" : "bg-white/[0.05] text-gray-400",
      )}
    >
      <Icon className="size-3" aria-hidden />
      <span className="num">{Math.abs(value * 100).toFixed(0)}%</span>
      {label && <span className="font-normal text-gray-500">{label}</span>}
    </span>
  )
}

/** A KPI tile: the number is the headline, the label and hint support it. */
export function Stat({ label, value, hint, tone, accent, icon, delta, spark, size = "md" }: {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: "good" | "warn" | "bad"
  accent?: Accent
  icon?: LucideIcon
  delta?: ReactNode
  spark?: ReactNode
  size?: "md" | "lg"
}) {
  const a = accent ? ACCENT[accent] : null
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-surface/80 p-4">
      {a && <span className={cx("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />}
      {a && size === "lg" && <div className={cx("pointer-events-none absolute -right-16 -top-20 size-48", a.glow)} />}
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-400">{label}</p>
        {icon && <IconTile icon={icon} accent={accent ?? "violet"} size="sm" />}
      </div>
      <p
        className={cx(
          "num relative mt-2 font-semibold",
          size === "lg" ? "text-3xl" : "text-2xl",
          tone === "good" ? "text-emerald-300" : tone === "warn" ? "text-amber-300" : tone === "bad" ? "text-rose-300" : "text-white",
        )}
      >
        {value}
      </p>
      {(delta || hint) && (
        <div className="relative mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          {delta}
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </div>
      )}
      {spark && <div className="relative -mx-1 mt-3">{spark}</div>}
    </div>
  )
}

/** A flat progress bar for "x of budget" style numbers (flat ends on purpose) */
export function Meter({ value, accent = "violet", warnAt = 0.7, badAt = 0.9 }: { value: number; accent?: Accent; warnAt?: number; badAt?: number }) {
  const v = Math.max(0, Math.min(1, value))
  const color = value >= badAt ? "bg-rose-400" : value >= warnAt ? "bg-amber-400" : ACCENT[accent].bar
  return (
    <div className="h-1.5 w-full bg-white/[0.07]" role="meter" aria-valuenow={Math.round(v * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("h-full", color)} style={{ width: `${v * 100}%` }} />
    </div>
  )
}

const BADGE = {
  gray:    "border-white/15 bg-white/[0.05] text-gray-300",
  purple:  "border-violet-400/30 bg-violet-500/10 text-violet-200",
  green:   "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  amber:   "border-amber-400/30 bg-amber-500/10 text-amber-300",
  red:     "border-rose-400/30 bg-rose-500/10 text-rose-300",
  blue:    "border-sky-400/30 bg-sky-500/10 text-sky-300",
  fuchsia: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300",
} as const
export type BadgeColor = keyof typeof BADGE

export function Badge({ color = "gray", children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", BADGE[color])}>
      {children}
    </span>
  )
}

export function PlanBadge({ kind }: { kind: PlanKind }) {
  const map: Record<PlanKind, [BadgeColor, string]> = {
    free:     ["gray", "Free"],
    monthly:  ["purple", "Pro monthly"],
    lifetime: ["green", "Pro lifetime"],
    manual:   ["blue", "Pro manual"],
  }
  const [color, label] = map[kind]
  return <Badge color={color}>{label}</Badge>
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="-mx-1 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/[0.09] text-[11px] uppercase tracking-wider text-gray-500">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.05] [&>tr]:transition-colors [&>tr:hover]:bg-white/[0.025]">{children}</tbody>
      </table>
      {empty && <p className="px-3 py-6 text-center text-sm text-gray-500">Nothing here yet.</p>}
    </div>
  )
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cx("whitespace-nowrap px-3 py-2.5 text-gray-200", className)}>{children}</td>
}

export function Muted({ children }: { children: ReactNode }) {
  return <span className="text-gray-500">{children}</span>
}

export function UserLink({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Link href={`/users/${id}`} className="text-violet-300 transition-colors hover:text-white hover:underline">
      {children}
    </Link>
  )
}

export function Notice({ tone = "amber", children }: { tone?: "amber" | "red" | "blue"; children: ReactNode }) {
  const color = tone === "red" ? "border-rose-400/30 bg-rose-500/10 text-rose-200"
    : tone === "blue" ? "border-sky-400/30 bg-sky-500/10 text-sky-200"
    : "border-amber-400/30 bg-amber-500/10 text-amber-200"
  return <div className={cx("rounded-xl border px-4 py-3 text-sm", color)}>{children}</div>
}

/** Small uppercase heading between groups of cards */
export function SectionLabel({ children, accent = "violet" }: { children: ReactNode; accent?: Accent }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <span className={cx("text-[11px] font-semibold uppercase tracking-[0.18em]", ACCENT[accent].text)}>{children}</span>
      <span className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
    </div>
  )
}
