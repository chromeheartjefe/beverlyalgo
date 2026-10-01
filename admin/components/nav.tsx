"use client"

import {
  Activity,
  BadgeDollarSign,
  BrainCircuit,
  Cpu,
  Filter,
  LayoutDashboard,
  Lightbulb,
  type LucideIcon,
  Radar,
  ScrollText,
  ServerCog,
  Users,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cx } from "~/components/ui"

type Item = { href: string; label: string; icon: LucideIcon; accent: string }

const GROUPS: { label: string; items: Item[] }[] = [
  {
    label: "Command",
    items: [
      { href: "/",        label: "Overview",   icon: LayoutDashboard, accent: "text-violet-300" },
      { href: "/insights", label: "AI analyst", icon: BrainCircuit,    accent: "text-fuchsia-300" },
      { href: "/ideas",   label: "Ideas",      icon: Lightbulb,       accent: "text-amber-300" },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/users",      label: "Users",      icon: Users,    accent: "text-sky-300" },
      { href: "/engagement", label: "Engagement", icon: Activity, accent: "text-fuchsia-300" },
      { href: "/funnel",     label: "Checkout funnel", icon: Filter, accent: "text-sky-300" },
    ],
  },
  {
    label: "Money",
    items: [
      { href: "/revenue", label: "Revenue",        icon: BadgeDollarSign, accent: "text-emerald-300" },
      { href: "/ai",      label: "AI & unit costs", icon: Cpu,            accent: "text-amber-300" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/indicator", label: "Indicator queue", icon: Radar,      accent: "text-violet-300" },
      { href: "/system",    label: "System health",   icon: ServerCog,  accent: "text-sky-300" },
      { href: "/audit",     label: "Audit log",       icon: ScrollText, accent: "text-gray-300" },
    ],
  },
]

export function Nav() {
  const pathname = usePathname()
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))
  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-white/[0.08] bg-[#07071a] px-3 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <span className="flex size-9 items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/40 to-fuchsia-600/20 text-sm font-black text-white shadow-[0_0_24px_rgba(139,92,246,0.35)]">
          E
        </span>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">
            Entrix<span className="text-violet-400">Algo</span>
          </p>
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-gray-500">Admin console</p>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-5 overflow-y-auto">
        {GROUPS.map((g) => (
          <div key={g.label}>
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map((l) => {
                const on = active(l.href)
                const Icon = l.icon
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cx(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                      on ? "bg-white/[0.07] text-white" : "text-gray-400 hover:bg-white/[0.04] hover:text-white",
                    )}
                  >
                    {on && <span className="absolute inset-y-1.5 left-0 w-0.5 bg-gradient-to-b from-violet-400 to-fuchsia-400" aria-hidden />}
                    <Icon className={cx("size-4 shrink-0", on ? l.accent : "text-gray-500 group-hover:text-gray-300")} strokeWidth={1.75} aria-hidden />
                    {l.label}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-500/[0.06] px-3 py-2 text-[11px] leading-snug text-amber-200/80">
        Local only · live production data · read-only connection
      </p>
    </aside>
  )
}
