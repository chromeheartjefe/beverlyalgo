"use client"

import { Eye, Radar, TrendingDown, TrendingUp } from "lucide-react"
import useSWR from "swr"

import type { ScreenerResult, ScreenerTicker } from "@/app/api/screener/route"
import { formatPrice } from "@/components/dashboard/market-ticker"
import { Loaded } from "@/components/ui/motion"
import { timeAgo } from "@/lib/format"
import { fetcher } from "@/lib/swr"
import { cn } from "@/lib/utils"

import { CardLink, EmptyState, OverviewCard, Skeleton } from "./card"

const DIRECTION: Record<ScreenerTicker["direction"], { icon: typeof Eye; pill: string; bar: string }> = {
  Bullish: { icon: TrendingUp,   pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", bar: "from-emerald-500 to-teal-400" },
  Bearish: { icon: TrendingDown, pill: "border-rose-500/30 bg-rose-500/10 text-rose-300",          bar: "from-rose-500 to-orange-400" },
  Watch:   { icon: Eye,          pill: "border-amber-500/30 bg-amber-500/10 text-amber-200",        bar: "from-amber-400 to-yellow-300" },
}

export function ScreenerPicks() {
  // Same key as the AI Screener page: reads the last scan, never starts one.
  const { data, error } = useSWR<{ result: ScreenerResult | null }>("/api/screener", fetcher)
  const result = data?.result ?? null
  const picks = result ? [...result.tickers].sort((a, b) => b.potential - a.potential).slice(0, 4) : []

  return (
    <OverviewCard
      accent="cyan"
      icon={Radar}
      title="AI Screener picks"
      sub={result ? `Last scan ${timeAgo(result.generatedAt)}${result.stale ? ", may be out of date" : ""}` : "Top movers ranked by AI"}
      action={<CardLink href="/dashboard/ai-screener">Screener</CardLink>}
    >
      <Loaded
        loading={!data && !error}
        className="flex flex-1 flex-col"
        fallback={
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        }
      >
      {picks.length === 0 ? (
        <EmptyState
          title="No scan yet"
          body="Run the free AI Screener to find the stocks and crypto with the strongest momentum right now."
          href="/dashboard/ai-screener"
          cta="Run a scan"
        />
      ) : (
        <ul className="space-y-2.5">
          {picks.map((t) => {
            const d = DIRECTION[t.direction]
            const up = t.changePercent >= 0
            return (
              <li key={`${t.assetType}-${t.symbol}`} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-mono text-sm font-bold text-white">{t.symbol}</span>
                    <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-px text-[11px] font-medium text-gray-400">
                      {t.assetType === "crypto" ? "Crypto" : "Stock"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs tabular-nums text-gray-400">
                    ${formatPrice(t.price)}{" "}
                    <span className={up ? "text-emerald-300" : "text-rose-300"}>
                      {up ? "+" : "-"}{Math.abs(t.changePercent).toFixed(2)}%
                    </span>
                  </p>
                </div>
                <div className="w-24 shrink-0 sm:w-28">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-1.5 py-px text-[11px] font-semibold", d.pill)}>
                      <d.icon className="size-3" aria-hidden />
                      {t.direction}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-white">{t.potential}</span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                    <div className={cn("h-full rounded-full bg-gradient-to-r", d.bar)} style={{ width: `${Math.max(4, Math.min(100, t.potential))}%` }} />
                  </div>
                  <span className="sr-only">Potential score {t.potential} out of 100</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      </Loaded>
    </OverviewCard>
  )
}
