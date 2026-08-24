"use client"

import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import {
  Activity,
  ArrowUpRight,
  Brain,
  Clock,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { AnimatedGroup } from "@/components/ui/animated-group"
import { tradeResult, type TradeRow } from "@/lib/trades"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type AnalysisRow = {
  id:         string
  pair:       string
  timeframe:  string
  signal:     "BUY" | "SELL" | "NEUTRAL"
  confidence: number
  entry:      number | null
  createdAt:  string
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

// ─── Performance chart ────────────────────────────────────────────────────────

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ""
  let d = `M ${pts[0][0]},${pts[0][1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`
  }
  return d
}

function PerformanceChart({ points }: { points: { label: string; value: number }[] }) {
  const W = 560, H = 160
  const PL = 4, PR = 4, PT = 14, PB = 28
  const cW = W - PL - PR
  const cH = H - PT - PB
  const vals = points.map((d) => d.value)
  const minV = Math.min(...vals)
  const maxV = Math.max(...vals)
  const rng  = maxV - minV || 1

  const xs = (i: number) => PL + (i / (points.length - 1)) * cW
  const ys = (v: number) => PT + cH - ((v - minV) / rng) * cH

  const pts = points.map((d, i) => [xs(i), ys(d.value)] as [number, number])
  const line = smoothPath(pts)
  const area = `${line} L ${pts[pts.length - 1][0]},${PT + cH} L ${pts[0][0]},${PT + cH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="perf-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#a855f7" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0"    />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((t) => (
        <line
          key={t}
          x1={PL} y1={PT + cH * (1 - t)}
          x2={W - PR} y2={PT + cH * (1 - t)}
          stroke="rgba(255,255,255,0.04)"
          strokeWidth={1}
        />
      ))}
      <path d={area} fill="url(#perf-grad)" />
      <path d={line} fill="none" stroke="#a855f7" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="#a855f7" />
      ))}
      {points.map((d, i) => (
        <text
          key={i}
          x={xs(i)}
          y={H - 6}
          // The first/last labels sit flush against the viewBox edge — centering
          // them (as the interior points do) pushes roughly half the text
          // outside the viewBox, where it gets clipped. Anchor those two inward
          // instead so the full label always stays within bounds.
          textAnchor={i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"}
          fill="rgba(107,114,128,0.9)"
          fontSize={10}
          fontFamily="sans-serif"
        >
          {d.label}
        </text>
      ))}
    </svg>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

type Stat = {
  label:   string
  value:   number | null
  format:  { prefix?: string; suffix?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
  delta:   string
  icon:    typeof Activity
  iconBg:  string
  iconCol: string
  pos:     boolean
  noArrow?: boolean
  loading?: boolean
}

function StatCard({ label, value, format, delta, icon: Icon, iconBg, iconCol, pos, noArrow, loading }: Stat) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">{label}</p>
        <div className={cn("flex size-9 items-center justify-center rounded-xl", iconBg)}>
          <Icon className={cn("size-4", iconCol)} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2.5" aria-hidden="true">
          <div className="h-7 w-20 animate-pulse rounded-md bg-white/[0.06]" />
          <div className="h-3 w-28 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
      ) : (
        <div>
          <p className="text-2xl font-black text-white tabular-nums">
            {value === null ? (
              <span className="text-gray-600">—</span>
            ) : (
              <>
                {format.prefix}
                <NumberFlow
                  value={value}
                  format={{
                    minimumFractionDigits: format.minimumFractionDigits ?? 0,
                    maximumFractionDigits: format.maximumFractionDigits ?? (format.minimumFractionDigits ?? 0),
                  }}
                />
                {format.suffix}
              </>
            )}
          </p>
          <p className={cn("mt-1.5 flex items-center gap-1 text-xs", value === null ? "text-gray-600" : pos ? "text-emerald-400" : "text-red-400")}>
            {value !== null && !noArrow && (pos ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />)}
            {delta}
          </p>
        </div>
      )}
    </div>
  )
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const fmtPrice = (n: number | null) =>
  n !== null ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [trades,    setTrades]    = useState<TradeRow[]>([])
  const [analyses,  setAnalyses]  = useState<AnalysisRow[]>([])
  const [loaded,    setLoaded]    = useState(false)

  useEffect(() => {
    Promise.all([
      fetch("/api/trades").then((r) => r.json()).catch(() => []),
      fetch("/api/analyses").then((r) => r.json()).catch(() => []),
    ]).then(([t, a]) => {
      setTrades(Array.isArray(t) ? t : [])
      setAnalyses(Array.isArray(a) ? a : [])
      setLoaded(true)
    })
  }, [])

  const now = Date.now()

  const recentTrades = useMemo(
    () => trades.filter((t) => now - new Date(t.date).getTime() <= THIRTY_DAYS_MS),
    [trades, now]
  )
  const recentAnalyses = useMemo(
    () => analyses.filter((a) => now - new Date(a.createdAt).getTime() <= THIRTY_DAYS_MS),
    [analyses, now]
  )

  const tradeStats = useMemo(() => {
    if (recentTrades.length === 0) return null
    let pnl = 0, wins = 0
    for (const t of recentTrades) {
      pnl += t.pnl
      if (tradeResult(t.pnl) === "Win") wins++
    }
    return { pnl, winRate: (wins / recentTrades.length) * 100 }
  }, [recentTrades])

  const avgConfidence = useMemo(() => {
    if (recentAnalyses.length === 0) return null
    return recentAnalyses.reduce((s, a) => s + a.confidence, 0) / recentAnalyses.length
  }, [recentAnalyses])

  const STATS: Stat[] = [
    {
      label:   "Win Rate (30d)",
      value:   tradeStats ? tradeStats.winRate : null,
      format:  { suffix: "%", minimumFractionDigits: 1 },
      delta:   tradeStats ? `${recentTrades.length} trade${recentTrades.length === 1 ? "" : "s"} logged` : "No trades logged yet",
      icon:    Activity,
      iconBg:  "bg-emerald-500/[0.12]",
      iconCol: "text-emerald-400",
      pos:     (tradeStats?.winRate ?? 0) >= 50,
      noArrow: true,
      loading: !loaded,
    },
    {
      label:   "Net P&L (30d)",
      value:   tradeStats ? tradeStats.pnl : null,
      format:  { prefix: "$", minimumFractionDigits: 0, maximumFractionDigits: 0 },
      delta:   tradeStats ? "From logged trades" : "No trades logged yet",
      icon:    tradeStats && tradeStats.pnl < 0 ? TrendingDown : TrendingUp,
      iconBg:  "bg-blue-500/[0.12]",
      iconCol: "text-blue-400",
      pos:     (tradeStats?.pnl ?? 0) >= 0,
      loading: !loaded,
    },
    {
      label:    "AI Analyses (30d)",
      value:    loaded ? recentAnalyses.length : null,
      format:   {},
      delta:    "Chart analyses run this month",
      icon:     Zap,
      iconBg:   "bg-orange-500/[0.12]",
      iconCol:  "text-orange-400",
      pos:      true,
      noArrow:  true,
      loading:  !loaded,
    },
    {
      label:   "AI Confidence Avg",
      value:   avgConfidence,
      format:  { suffix: "%" },
      delta:   avgConfidence !== null ? "Across recent analyses" : "Run an analysis to see this",
      icon:    Brain,
      iconBg:  "bg-violet-500/[0.12]",
      iconCol: "text-violet-400",
      pos:     true,
      noArrow: true,
      loading: !loaded,
    },
  ]

  const perfPoints = useMemo(() => {
    if (trades.length < 2) return []
    const sorted = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let cumulative = 0
    return sorted.map((t) => {
      cumulative += t.pnl
      return {
        label: new Date(t.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        value: cumulative,
      }
    })
  }, [trades])

  const perfChangePct = useMemo(() => {
    if (perfPoints.length < 2) return null
    const first = perfPoints[0].value
    const last  = perfPoints[perfPoints.length - 1].value
    if (first === 0) return null
    return ((last - first) / Math.abs(first)) * 100
  }, [perfPoints])

  const recentAnalysesSorted = useMemo(
    () => [...analyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4),
    [analyses]
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s your trading intelligence overview.
        </p>
      </div>

      <OnboardingChecklist hasTrades={trades.length > 0} hasAnalyses={analyses.length > 0} />

      {/* Stats */}
      <AnimatedGroup
        preset="blur-slide"
        className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </AnimatedGroup>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* Left column (wider) */}
        <div className="space-y-6 xl:col-span-3">
          {/* New AI Analysis CTA */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-br from-[#0f0f1e] to-[#0a0a12]"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-purple-500/[0.15]">
                    <Brain className="size-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">New AI Analysis</h2>
                    <p className="text-xs text-gray-500">Upload your chart for instant pattern recognition</p>
                  </div>
                </div>
                <Link
                  href="/dashboard/chart-analysis"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-400"
                >
                  Analyze Chart
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>

              {/* Drop zone preview */}
              <Link href="/dashboard/chart-analysis">
                <div className="mt-5 flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.10] bg-white/[0.02] transition-colors hover:border-purple-500/40 hover:bg-purple-500/[0.03]">
                  <Zap className="size-7 text-gray-600" />
                  <p className="mt-2 text-sm text-gray-600">Drag and drop your chart image here</p>
                  <p className="mt-0.5 text-xs text-gray-700">Supports PNG, JPG (Max 5MB)</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1 text-xs text-gray-500">
                    or click to Browse Files →
                  </span>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Performance Overview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-white">Performance Overview</h2>
                <p className="mt-0.5 text-xs text-gray-500">Cumulative P&L from your logged trades</p>
              </div>
              {perfChangePct !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl border px-3 py-1.5",
                    perfChangePct >= 0
                      ? "border-emerald-500/20 bg-emerald-500/10"
                      : "border-red-500/20 bg-red-500/10"
                  )}
                >
                  {perfChangePct >= 0
                    ? <TrendingUp className="size-3.5 text-emerald-400" />
                    : <TrendingDown className="size-3.5 text-red-400" />}
                  <span className={cn("text-xs font-semibold", perfChangePct >= 0 ? "text-emerald-400" : "text-red-400")}>
                    {perfChangePct >= 0 ? "+" : ""}{perfChangePct.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {perfPoints.length >= 2 ? (
              <PerformanceChart points={perfPoints} />
            ) : (
              <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-center">
                <p className="text-sm text-gray-500">Not enough trades yet.</p>
                <p className="text-xs text-gray-700">Log at least 2 trades in the Trade Journal to see your P&L curve.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right column: recent analyses */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="xl:col-span-2"
        >
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Recent AI Analyses</h2>
                <p className="mt-0.5 text-xs text-gray-500">Your latest chart analyses</p>
              </div>
              {recentAnalysesSorted.length > 0 && (
                <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <motion.span
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="inline-block size-1.5 rounded-full bg-emerald-400"
                  />
                  Live
                </span>
              )}
            </div>

            {/* Analysis list */}
            {recentAnalysesSorted.length > 0 ? (
              <div className="divide-y divide-white/[0.05]">
                {recentAnalysesSorted.map((a) => (
                  <div key={a.id} className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white">{a.pair}</span>
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-gray-500">
                          {a.timeframe}
                        </span>
                      </div>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold",
                          a.signal === "BUY"    ? "bg-emerald-500/10 text-emerald-400"
                          : a.signal === "SELL" ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400"
                        )}
                      >
                        {a.signal}
                      </span>
                    </div>

                    <div className="mt-2 flex items-end justify-between">
                      <div>
                        <p className="text-sm text-gray-300">Entry {fmtPrice(a.entry)}</p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-gray-600">
                          <Clock className="size-3" />
                          {timeAgo(new Date(a.createdAt).getTime())}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-purple-400">{a.confidence}%</p>
                        <p className="text-[11px] text-gray-600">Confidence</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                  <Zap className="size-4 text-gray-600" />
                </div>
                <p className="text-xs text-gray-500">No analyses yet.</p>
                <p className="text-[11px] text-gray-700">Run your first chart analysis to see results here.</p>
              </div>
            )}

            {/* Footer */}
            <div className="border-t border-white/[0.07] px-5 py-3">
              <Link
                href="/dashboard/chart-analysis"
                className="flex items-center gap-1 text-xs font-medium text-purple-400 hover:text-purple-300"
              >
                Run a new analysis
                <ArrowUpRight className="size-3" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
