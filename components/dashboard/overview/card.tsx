import { ArrowUpRight, type LucideIcon } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

// Each Overview card has its own accent so the page reads as distinct,
// colour-coded areas instead of a wall of identical grey boxes. The accent
// tints the icon chip and a soft glow in the card's top-left corner.
const ACCENTS = {
  emerald: { chip: "border-emerald-500/25 bg-emerald-500/10", icon: "text-emerald-300", glow: "rgba(16,185,129,0.16)" },
  amber:   { chip: "border-amber-500/25 bg-amber-500/10",     icon: "text-amber-300",   glow: "rgba(245,158,11,0.14)" },
  sky:     { chip: "border-sky-500/25 bg-sky-500/10",         icon: "text-sky-300",     glow: "rgba(14,165,233,0.15)" },
  indigo:  { chip: "border-indigo-500/25 bg-indigo-500/10",   icon: "text-indigo-300",  glow: "rgba(99,102,241,0.16)" },
  cyan:    { chip: "border-cyan-500/25 bg-cyan-500/10",       icon: "text-cyan-300",    glow: "rgba(6,182,212,0.14)" },
  purple:  { chip: "border-purple-500/25 bg-purple-500/10",   icon: "text-purple-300",  glow: "rgba(168,85,247,0.17)" },
} as const

export type Accent = keyof typeof ACCENTS

export function OverviewCard({
  accent,
  icon: Icon,
  title,
  sub,
  action,
  className,
  children,
}: {
  accent:     Accent
  icon:       LucideIcon
  title:      string
  sub?:       ReactNode
  action?:    ReactNode
  className?: string
  children:   ReactNode
}) {
  const a = ACCENTS[accent]
  return (
    <section className={cn("relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/25 bg-white/[0.025] p-5 sm:p-6", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-24 size-64 rounded-full blur-3xl"
        style={{ background: a.glow }}
      />
      <header className="relative mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl border", a.chip)}>
            <Icon className={cn("size-4", a.icon)} aria-hidden />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {sub && <p className="mt-0.5 truncate text-xs text-gray-500">{sub}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className="relative flex flex-1 flex-col">{children}</div>
    </section>
  )
}

export function CardLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group -mr-1.5 -mt-1 flex min-h-9 shrink-0 items-center gap-1 rounded-lg px-2 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
    >
      {children}
      <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-px group-hover:translate-x-px" aria-hidden />
    </Link>
  )
}

/** Helpful empty state: what's missing, and the one action that fixes it. */
export function EmptyState({ title, body, href, cta }: { title: string; body: string; href: string; cta: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/[0.015] px-5 py-8 text-center">
      <p className="text-sm font-medium text-gray-300">{title}</p>
      <p className="max-w-xs text-xs leading-relaxed text-gray-500">{body}</p>
      <Link
        href={href}
        className="mt-2 inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.04] px-3.5 text-xs font-medium text-gray-200 transition-colors hover:border-white/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
      >
        {cta}
        <ArrowUpRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-white/[0.06] motion-reduce:animate-none", className)} />
}
