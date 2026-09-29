import { ArrowUpRight, BookOpen, Bot, Calculator, Lock, type LucideIcon, Radar, Zap } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type Action = {
  href:  string
  title: string
  desc:  string
  icon:  LucideIcon
  pro:   boolean
  // Full class names so Tailwind picks them up
  tile:  string
  chip:  string
  text:  string
}

const ACTIONS: Action[] = [
  {
    href: "/dashboard/chart-analysis", title: "Analyze a chart", desc: "Signals from a screenshot", icon: Zap, pro: true,
    tile: "border-purple-500/25 from-purple-500/[0.14] hover:border-purple-400/45",
    chip: "bg-purple-500/15 text-purple-300", text: "group-hover:text-purple-200",
  },
  {
    href: "/dashboard/trading-bot", title: "Ask the AI Bot", desc: "Live market answers", icon: Bot, pro: true,
    tile: "border-fuchsia-500/25 from-fuchsia-500/[0.13] hover:border-fuchsia-400/45",
    chip: "bg-fuchsia-500/15 text-fuchsia-300", text: "group-hover:text-fuchsia-200",
  },
  {
    href: "/dashboard/ai-screener", title: "Scan markets", desc: "Top AI-ranked movers", icon: Radar, pro: false,
    tile: "border-cyan-500/25 from-cyan-500/[0.12] hover:border-cyan-400/45",
    chip: "bg-cyan-500/15 text-cyan-300", text: "group-hover:text-cyan-200",
  },
  {
    href: "/dashboard/trade-journal", title: "Log a trade", desc: "Keep your journal current", icon: BookOpen, pro: false,
    tile: "border-emerald-500/25 from-emerald-500/[0.12] hover:border-emerald-400/45",
    chip: "bg-emerald-500/15 text-emerald-300", text: "group-hover:text-emerald-200",
  },
  {
    href: "/dashboard/risk-calculator", title: "Size a position", desc: "Risk before you enter", icon: Calculator, pro: false,
    tile: "border-amber-500/25 from-amber-500/[0.12] hover:border-amber-400/45",
    chip: "bg-amber-500/15 text-amber-300", text: "group-hover:text-amber-200",
  },
]

export function QuickActions({ isFree }: { isFree: boolean }) {
  return (
    <nav aria-label="Quick actions" className="grid grid-cols-2 gap-3 md:grid-cols-5">
      {ACTIONS.map(({ href, title, desc, icon: Icon, pro, tile, chip, text }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "group relative flex min-h-[4.5rem] items-center gap-3 overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-3.5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 motion-reduce:hover:translate-y-0 max-md:last:col-span-2 md:flex-col md:items-start md:gap-3 md:p-4",
            tile
          )}
        >
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", chip)}>
            <Icon className="size-4" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className={cn("flex items-center gap-1.5 text-sm font-semibold text-white transition-colors", text)}>
              {title}
              {pro && isFree && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-white/[0.08] px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-gray-300">
                  <Lock className="size-2.5" aria-hidden />
                  Pro
                </span>
              )}
            </p>
            <p className="mt-0.5 hidden text-xs text-gray-500 sm:block">{desc}</p>
          </div>
          <ArrowUpRight
            aria-hidden
            className="absolute right-3 top-3 size-3.5 text-gray-600 transition-[color,transform] group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-gray-300"
          />
        </Link>
      ))}
    </nav>
  )
}
