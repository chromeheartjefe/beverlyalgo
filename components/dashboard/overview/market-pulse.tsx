"use client"

import { Activity, Minus, TrendingDown, TrendingUp } from "lucide-react"

import { formatPrice, type TickerItem, useMarketSnapshot } from "@/components/dashboard/market-ticker"
import { cn } from "@/lib/utils"

import { OverviewCard, Skeleton } from "./card"

// The markets most traders check first; the mood bar uses every market.
const FEATURED = ["BTC", "ETH", "SOL", "XRP", "S&P 500", "Nasdaq 100", "Gold", "EUR/USD"]

// Tile tint grows with the size of the move, capped at 5%.
function tint(change: number) {
  if (Math.abs(change) < 0.005) return undefined
  const t = Math.min(1, Math.abs(change) / 5)
  const rgb = change > 0 ? "16,185,129" : "244,63,94"
  return {
    backgroundColor: `rgba(${rgb},${(0.05 + 0.17 * t).toFixed(3)})`,
    borderColor:     `rgba(${rgb},${(0.18 + 0.32 * t).toFixed(3)})`,
  }
}

function Tile({ item }: { item: TickerItem }) {
  const flat = Math.abs(item.changePercent) < 0.005
  const up = item.changePercent > 0
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5" style={tint(item.changePercent)}>
      <p className="truncate text-xs font-bold text-gray-300">{item.label}</p>
      {/* Same styling as the running ticker in the header: name bold light
          grey, price regular-weight mono in a softer grey */}
      <p className="mt-0.5 truncate font-mono text-sm text-gray-400">${formatPrice(item.price)}</p>
      <p className={cn("mt-0.5 flex items-center gap-1 text-xs font-medium tabular-nums", flat ? "text-gray-400" : up ? "text-emerald-300" : "text-rose-300")}>
        <Icon className="size-3" aria-hidden />
        {up ? "+" : flat ? "" : "-"}{Math.abs(item.changePercent).toFixed(2)}%
      </p>
    </div>
  )
}

function mood(upShare: number) {
  if (upShare >= 0.6) return { label: "Risk-on", text: "text-emerald-300", chip: "border-emerald-500/30 bg-emerald-500/10" }
  if (upShare <= 0.4) return { label: "Risk-off", text: "text-rose-300", chip: "border-rose-500/30 bg-rose-500/10" }
  return { label: "Mixed", text: "text-amber-200", chip: "border-amber-500/30 bg-amber-500/10" }
}

export function MarketPulse() {
  const { data, error } = useMarketSnapshot()
  const items = data ?? []
  const featured = FEATURED.map((label) => items.find((i) => i.label === label)).filter((i): i is TickerItem => !!i)
  // Breadth counts only direction: every market that moved is up or down,
  // and the bar is split between those two alone (never a grey "flat" gap)
  const up = items.filter((i) => i.changePercent > 0).length
  const down = items.filter((i) => i.changePercent < 0).length
  const moved = up + down
  const upShare = moved ? up / moved : 0.5
  const m = mood(upShare)

  return (
    <OverviewCard accent="sky" icon={Activity} title="Market pulse" sub="Daily change, updates every minute">
      {items.length === 0 ? (
        error ? (
          <p className="flex flex-1 items-center justify-center py-10 text-sm text-gray-500">Market data is unavailable right now.</p>
        ) : (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {FEATURED.map((f) => <Skeleton key={f} className="h-[4.75rem]" />)}
            </div>
          </div>
        )
      ) : (
        <>
          {/* Breadth: how many tracked markets are up vs down today */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-emerald-300">{up} up</span>
                <span className="mx-1.5 text-gray-600">·</span>
                <span className="font-semibold text-rose-300">{down} down</span>
                <span className="text-gray-500"> of {moved} markets</span>
              </p>
              <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", m.chip, m.text)}>{m.label}</span>
            </div>
            <div className="mt-2.5 flex h-2 overflow-hidden rounded-full" aria-hidden>
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-700" style={{ width: `${upShare * 100}%` }} />
              <div className="flex-1 bg-gradient-to-r from-rose-400 to-rose-500" />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {featured.map((item) => <Tile key={item.label} item={item} />)}
          </div>
        </>
      )}
    </OverviewCard>
  )
}
