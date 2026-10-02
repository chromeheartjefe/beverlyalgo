"use client"

import { Activity, ArrowUpRight, Bot, Brain, Sparkles, Zap } from "lucide-react"
import Link from "next/link"

import { Loaded } from "@/components/ui/motion"
import { timeAgo } from "@/lib/format"
import { cn } from "@/lib/utils"

import { CardLink, EmptyState, OverviewCard, Skeleton } from "./card"

export type AnalysisRow = {
  id:         string
  pair:       string
  timeframe:  string
  signal:     "BUY" | "SELL" | "NEUTRAL"
  confidence: number
  createdAt:  string
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

const SIGNAL = {
  BUY:     { label: "Buy",      pill: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", ring: "#34d399" },
  SELL:    { label: "Sell",     pill: "border-rose-500/30 bg-rose-500/10 text-rose-300",          ring: "#fb7185" },
  NEUTRAL: { label: "No trade", pill: "border-amber-500/30 bg-amber-500/10 text-amber-200",        ring: "#fbbf24" },
} as const

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  const r = 15
  const c = 2 * Math.PI * r
  return (
    <div className="relative size-10 shrink-0">
      <svg viewBox="0 0 40 40" className="size-full -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="butt" strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tabular-nums text-white">{value}</span>
    </div>
  )
}

function UpgradeCard({ freeTry }: { freeTry: boolean }) {
  const perks = [
    { icon: Zap, text: "AI Chart Analysis from any screenshot" },
    { icon: Bot, text: "AI Trading Bot with live market data" },
    { icon: Activity, text: "Invite-only TradingView indicator" },
  ]
  return (
    <section className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-br from-purple-600/[0.22] via-fuchsia-600/[0.1] to-transparent p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="relative flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-xl border border-purple-400/30 bg-purple-500/20">
          <Sparkles className="size-4 text-purple-200" aria-hidden />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Unlock the AI toolkit</h2>
          <p className="text-xs text-purple-200/70">Pro from $49/month, or $299 lifetime</p>
        </div>
      </div>
      {/* Show, don't tell: what a Chart Analysis result looks like (a fixed example) */}
      <div className="relative mt-4 rounded-xl border border-white/10 bg-black/25 p-3">
        <div className="flex items-center gap-3">
          <ConfidenceRing value={74} color="#34d399" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-white">ETH/USDT</span>
              <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-px text-[11px] text-gray-400">15m</span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-px text-[11px] font-semibold text-emerald-300">Buy</span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">Bullish structure break with volume</p>
          </div>
          <span className="shrink-0 self-start rounded-full bg-white/[0.08] px-2 py-px text-[11px] font-medium uppercase tracking-wide text-gray-300">Example</span>
        </div>
        <dl className="mt-2.5 grid grid-cols-3 gap-2 text-center">
          {[
            { k: "Entry", v: "2,705.40", c: "text-white" },
            { k: "Stop", v: "2,688.20", c: "text-rose-300" },
            { k: "Target", v: "2,743.10", c: "text-emerald-300" },
          ].map(({ k, v, c }) => (
            <div key={k} className="rounded-lg bg-white/[0.04] px-1.5 py-1">
              <dt className="text-[11px] uppercase tracking-wider text-gray-500">{k}</dt>
              <dd className={`mt-0.5 font-mono text-xs font-semibold tabular-nums ${c}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <ul className="relative mt-3.5 space-y-2">
        {perks.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-gray-200">
            <Icon className="mt-0.5 size-4 shrink-0 text-purple-300" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
      {/* While the free analysis is unused, trying it comes first */}
      <div className={cn("relative mt-auto grid gap-2 pt-4", freeTry && "grid-cols-2")}>
        {freeTry && (
          <Link
            href="/dashboard/chart-analysis"
            className="flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
          >
            Try it free
            <Zap className="size-4" aria-hidden />
          </Link>
        )}
        <Link
          href="/#pricing"
          className={cn(
            "flex min-h-11 items-center justify-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-[filter,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300",
            freeTry
              ? "border border-purple-400/30 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"
              : "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-950/40 hover:brightness-110",
          )}
        >
          Upgrade to Pro
          <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  )
}

export function AiAnalysesCard({ analyses, loading, isFree, freeTry = false }: { analyses: AnalysisRow[]; loading: boolean; isFree: boolean; freeTry?: boolean }) {
  if (isFree) return <UpgradeCard freeTry={freeTry} />

  const recent = analyses.slice(0, 4)
  const month = analyses.filter((a) => Date.now() - new Date(a.createdAt).getTime() <= THIRTY_DAYS_MS)
  const graded = month.filter((a) => a.signal !== "NEUTRAL")
  const avg = graded.length ? Math.round(graded.reduce((s, a) => s + a.confidence, 0) / graded.length) : null

  return (
    <OverviewCard
      accent="purple"
      icon={Brain}
      title="Recent AI analyses"
      sub={loading ? "Loading…" : `${month.length} in 30 days${avg !== null ? `, avg confidence ${avg}%` : ""}`}
      action={<CardLink href="/dashboard/chart-analysis">Analyze</CardLink>}
    >
      <Loaded
        loading={loading}
        className="flex flex-1 flex-col"
        fallback={
          <div className="space-y-2.5">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        }
      >
      {recent.length === 0 ? (
        <EmptyState
          title="No analyses yet"
          body="Upload a chart screenshot and the AI returns a signal with entry, target and stop levels."
          href="/dashboard/chart-analysis"
          cta="Analyze your first chart"
        />
      ) : (
        <ul className="space-y-2.5">
          {recent.map((a) => {
            const s = SIGNAL[a.signal]
            return (
              <li key={a.id}>
                <Link
                  href="/dashboard/chart-analysis"
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 transition-colors hover:border-white/20 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
                >
                  {a.signal === "NEUTRAL" ? (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-white/[0.08] text-[10px] text-gray-500">n/a</div>
                  ) : (
                    <ConfidenceRing value={a.confidence} color={s.ring} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-mono text-sm font-bold text-white">{a.pair}</span>
                      <span className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-px text-[11px] text-gray-400">{a.timeframe}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">{timeAgo(a.createdAt)}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold", s.pill)}>{s.label}</span>
                  {a.signal !== "NEUTRAL" && <span className="sr-only">{a.confidence}% confidence</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
      </Loaded>
    </OverviewCard>
  )
}
