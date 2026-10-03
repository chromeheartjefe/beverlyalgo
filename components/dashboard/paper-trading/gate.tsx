"use client"

import { useSession } from "next-auth/react"

import { FeatureLock } from "@/components/dashboard/feature-lock"
import type { Hints } from "@/components/dashboard/paper-trading/order-ticket"
import type { MissionView } from "@/components/dashboard/paper-trading/panels"
import { PaperTrading } from "@/components/dashboard/paper-trading/paper-trading"

// Paper Trading is a Pro feature. Free accounts see a still picture of it
// behind the usual lock; the market itself only starts for Pro accounts.
export function PaperTradingGate({ missions, hints, ruinHref }: { missions: MissionView[]; hints: Hints; ruinHref: string | null }) {
  const { data: session, status } = useSession()
  const user = session?.user as { id?: string; plan?: string } | undefined
  // Lock only once the plan is known, so a Pro user never sees the lock flash
  const locked = status === "authenticated" && (user?.plan ?? "free") === "free"

  if (locked) {
    return (
      <FeatureLock locked feature="Paper Trading">
        <StillPreview />
      </FeatureLock>
    )
  }
  if (!user?.id) return <StillPreview loading />
  return <PaperTrading userId={user.id} missions={missions} hints={hints} ruinHref={ruinHref} />
}

// A fixed drawing of the page: an account card, a chart and a ticket
const CANDLES: [number, number, number, number][] = [
  [52, 60, 48, 58], [58, 63, 55, 56], [56, 59, 50, 52], [52, 57, 49, 55], [55, 66, 54, 64], [64, 70, 61, 68], [68, 71, 62, 63], [63, 67, 60, 66],
  [66, 75, 65, 73], [73, 78, 70, 72], [72, 74, 64, 66], [66, 70, 63, 69], [69, 80, 68, 78], [78, 84, 75, 82], [82, 86, 76, 78], [78, 83, 74, 81],
  [81, 90, 80, 88], [88, 92, 83, 85], [85, 89, 81, 87], [87, 95, 86, 93],
]

function StillPreview({ loading = false }: { loading?: boolean }) {
  return (
    <div aria-hidden className={loading ? "animate-pulse" : undefined}>
      <div className="rounded-2xl border border-white/15 bg-white/[0.025] p-5">
        <p className="text-sm text-gray-400">Starter account, level 1 of 4</p>
        <p className="mt-0.5 text-3xl font-bold text-white">$1,032.40</p>
        <div className="mt-5 h-3 bg-gradient-to-r from-rose-500/45 via-white/[0.08] to-emerald-500/45" />
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-white/15 bg-white/[0.025] p-5">
          <svg viewBox="0 0 400 200" className="h-[300px] w-full lg:h-[420px]" preserveAspectRatio="none">
            {CANDLES.map(([o, h, l, c], i) => {
              const x = 10 + i * 19.5
              const y = (v: number) => 200 - (v - 40) * 3.4
              const up = c >= o
              return (
                <g key={i} fill={up ? "#34d399" : "#fb7185"}>
                  <rect x={x + 5} y={y(h)} width={1.6} height={y(l) - y(h)} />
                  <rect x={x} y={y(Math.max(o, c))} width={12} height={Math.max(Math.abs(y(o) - y(c)), 1.5)} />
                </g>
              )
            })}
          </svg>
        </div>
        <div className="space-y-4">
          <div className="h-64 rounded-2xl border border-white/15 bg-white/[0.025]" />
          <div className="h-40 rounded-2xl border border-white/15 bg-white/[0.025]" />
        </div>
      </div>
    </div>
  )
}
