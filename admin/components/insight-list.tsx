import { AlertTriangle, ArrowRight, CheckCircle2, Info, OctagonAlert } from "lucide-react"
import Link from "next/link"

import { cx } from "~/components/ui"
import type { Insight } from "~/lib/insights"

const TONE = {
  bad:  { icon: OctagonAlert,  box: "border-rose-400/25 bg-rose-500/[0.07]",       ic: "text-rose-300" },
  warn: { icon: AlertTriangle, box: "border-amber-400/25 bg-amber-500/[0.06]",     ic: "text-amber-300" },
  good: { icon: CheckCircle2,  box: "border-emerald-400/25 bg-emerald-500/[0.06]", ic: "text-emerald-300" },
  info: { icon: Info,          box: "border-sky-400/25 bg-sky-500/[0.06]",         ic: "text-sky-300" },
} as const

export function InsightList({ items }: { items: Insight[] }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-gray-500">Nothing stands out right now. Signals appear here as data comes in.</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((it, i) => {
        const t = TONE[it.tone]
        const Icon = t.icon
        const body = (
          <div className={cx("group flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors", t.box, it.href && "hover:bg-white/[0.04]")}>
            <Icon className={cx("mt-0.5 size-4 shrink-0", t.ic)} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{it.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{it.detail}</p>
            </div>
            {it.href && <ArrowRight className="mt-0.5 size-4 shrink-0 text-gray-600 transition-colors group-hover:text-white" aria-hidden />}
          </div>
        )
        return <li key={i}>{it.href ? <Link href={it.href}>{body}</Link> : body}</li>
      })}
    </ul>
  )
}
