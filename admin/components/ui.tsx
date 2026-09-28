import Link from "next/link"
import type { ReactNode } from "react"

import type { PlanKind } from "~/lib/format"

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ")
}

export function PageHeader({ title, sub, right }: { title: string; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold text-white">{title}</h1>
        {sub && <p className="mt-1 text-sm text-gray-400">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ title, sub, right, className, children }: {
  title?: string
  sub?: ReactNode
  right?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <section className={cx("rounded-2xl border border-white/15 bg-surface p-5", className)}>
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-sm font-semibold text-white">{title}</h2>}
            {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  )
}

/** A KPI tile: the number is the headline, the label and hint support it. */
export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "good" | "warn" | "bad" }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-surface p-4">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p
        className={cx(
          "mt-1.5 text-2xl font-semibold tabular-nums",
          tone === "good" ? "text-emerald-300" : tone === "warn" ? "text-amber-300" : tone === "bad" ? "text-rose-300" : "text-white",
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}

const BADGE = {
  gray:   "border-white/15 bg-white/[0.05] text-gray-300",
  purple: "border-purple-400/30 bg-purple-500/10 text-purple-200",
  green:  "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  amber:  "border-amber-400/30 bg-amber-500/10 text-amber-300",
  red:    "border-rose-400/30 bg-rose-500/10 text-rose-300",
  blue:   "border-sky-400/30 bg-sky-500/10 text-sky-300",
} as const

export function Badge({ color = "gray", children }: { color?: keyof typeof BADGE; children: ReactNode }) {
  return (
    <span className={cx("inline-flex items-center whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium", BADGE[color])}>
      {children}
    </span>
  )
}

export function PlanBadge({ kind }: { kind: PlanKind }) {
  const map: Record<PlanKind, [keyof typeof BADGE, string]> = {
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/15 text-xs text-gray-400">
            {head.map((h, i) => (
              <th key={i} className="whitespace-nowrap px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.07]">{children}</tbody>
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
    <Link href={`/users/${id}`} className="text-purple-300 hover:text-white hover:underline">
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
