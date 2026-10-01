import { ACCENT, type Accent, cx } from "~/components/ui"
import { num } from "~/lib/format"

// Flat HTML bars (values always printed, so colour is never the only cue)

export function FunnelBars({ steps }: { steps: { label: string; value: number; hint?: string }[] }) {
  const top = steps[0]?.value ?? 0
  const accents: Accent[] = ["sky", "violet", "fuchsia", "emerald"]
  return (
    <div className="space-y-4">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null
        const width = top > 0 ? Math.max((s.value / top) * 100, s.value > 0 ? 1.5 : 0) : 0
        return (
          <div key={s.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-gray-200">{s.label}</span>
              <span className="flex items-baseline gap-2">
                <span className="num font-semibold text-white">{num(s.value)}</span>
                {prev !== null && (
                  <span className="text-xs text-gray-500">{prev > 0 ? `${Math.round((s.value / prev) * 100)}% of previous` : "—"}</span>
                )}
              </span>
            </div>
            <div className="h-2 bg-white/[0.06]">
              <div className={cx("h-full", ACCENT[accents[i % accents.length]].bar)} style={{ width: `${width}%` }} />
            </div>
            {s.hint && <p className="mt-1 text-[11px] text-gray-500">{s.hint}</p>}
          </div>
        )
      })}
    </div>
  )
}

export function ShareBars({ rows, of, ofLabel }: { rows: { label: string; value: number; sub?: string }[]; of: number; ofLabel: string }) {
  const accents: Accent[] = ["violet", "sky", "emerald", "amber", "fuchsia", "rose"]
  return (
    <div className="space-y-3">
      {rows.map((r, i) => {
        const share = of > 0 ? r.value / of : 0
        return (
          <div key={r.label}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span className="text-gray-200">{r.label}</span>
              <span className="flex items-baseline gap-2">
                <span className="num font-semibold text-white">{num(r.value)}</span>
                <span className="text-xs text-gray-500">{of > 0 ? `${Math.round(share * 100)}% of ${ofLabel}` : ""}</span>
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06]">
              <div className={cx("h-full", ACCENT[accents[i % accents.length]].bar)} style={{ width: `${Math.min(100, share * 100)}%` }} />
            </div>
            {r.sub && <p className="mt-1 text-[11px] text-gray-500">{r.sub}</p>}
          </div>
        )
      })}
    </div>
  )
}
