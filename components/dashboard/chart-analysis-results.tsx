"use client"

// Split out from app/dashboard/chart-analysis/page.tsx and loaded via
// next/dynamic — this view (plus its Understanding/Risks tabs) only ever
// renders after a completed analysis, never on initial tab-open, so keeping
// it out of the page's own chunk keeps the "just open the tab" path lighter.

import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Eye,
  Layers,
  RefreshCcw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react"

import type { AnalysisResult } from "@/app/dashboard/chart-analysis/page"
import { cn } from "@/lib/utils"

const fmtPrice = (n: number | null) =>
  n !== null ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"

// ─── Understanding tab ────────────────────────────────────────────────────────

function UnderstandTab({ result }: { result: AnalysisResult }) {
  const trendIcon  = result.signal === "BUY" ? TrendingUp : result.signal === "SELL" ? TrendingDown : Activity
  const trendAccent = result.signal === "BUY"
    ? { iconBg: "bg-emerald-500/10", iconText: "text-emerald-400", hl: "text-emerald-400", border: "border-emerald-500/[0.18]", card: "bg-emerald-500/[0.04]" }
    : result.signal === "SELL"
    ? { iconBg: "bg-red-500/10",     iconText: "text-red-400",     hl: "text-red-400",     border: "border-red-500/[0.18]",     card: "bg-red-500/[0.04]"     }
    : { iconBg: "bg-yellow-500/10",  iconText: "text-yellow-400",  hl: "text-yellow-400",  border: "border-yellow-500/[0.18]",  card: "bg-yellow-500/[0.04]"  }

  const sections = [
    {
      id: "trend",
      Icon: trendIcon,
      iconBg:   trendAccent.iconBg,
      iconText: trendAccent.iconText,
      hlText:   trendAccent.hl,
      border:   trendAccent.border,
      card:     trendAccent.card,
      label: "Current Trend",
      highlight: `${result.trendAlignment} Alignment · ${result.signal}`,
      body: result.structure,
      note:
        result.volatility === "High"   ? "High volatility — price may swing sharply in either direction."
        : result.volatility === "Medium" ? "Moderate volatility — watch for wick traps near key levels."
        :                                  "Low volatility environment — breakouts may develop slowly.",
    },
    {
      id: "pattern",
      Icon: Layers,
      iconBg:   "bg-violet-500/10",
      iconText: "text-violet-400",
      hlText:   "text-violet-300",
      border:   "border-violet-500/[0.18]",
      card:     "bg-violet-500/[0.04]",
      label: "Pattern Detected",
      highlight: result.patterns[0],
      body: result.patterns.length > 1
        ? `Combined with ${result.patterns.slice(1, 3).join(" and ")}, forming a ${result.patternStrength.toLowerCase()}-strength confluence.`
        : `Standalone ${result.patternStrength.toLowerCase()}-strength formation supporting the ${result.signal} bias.`,
      note: result.patterns[3] ? `Additional signal: ${result.patterns[3]}` : null,
    },
    {
      id: "signal",
      Icon: Zap,
      iconBg:   "bg-purple-500/10",
      iconText: "text-purple-400",
      hlText:   "text-purple-300",
      border:   "border-purple-500/[0.18]",
      card:     "bg-purple-500/[0.04]",
      label: "Why This Signal?",
      highlight: `${result.confidence}% Confidence · ${result.signal}`,
      body: `${result.trendAlignment} trend alignment combined with ${result.patternStrength.toLowerCase()} pattern strength produced this ${result.signal.toLowerCase()} signal.${result.rrRatio !== null ? ` The ${result.rrRatio}:1 risk/reward ratio further validates the setup.` : ""}`,
      note:
        result.confidence >= 80 ? "High-confidence signal — conditions are strongly aligned."
        : result.confidence >= 60 ? "Moderate confidence — consider waiting for additional confirmation."
        :                           "Lower confidence — treat this as an early-stage idea, not a confirmed setup.",
    },
  ]

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">Why the AI reached this conclusion</p>
      </div>
      {sections.map(({ id, Icon, iconBg, iconText, hlText, border, card, label, highlight, body, note }, i) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={cn("rounded-xl border p-4", border, card)}
        >
          <div className="flex items-start gap-3">
            <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("size-4", iconText)} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-600">{label}</p>
              <p className={cn("mb-2 text-[13px] font-semibold leading-tight", hlText)}>{highlight}</p>
              <p className="text-[12px] leading-relaxed text-gray-400">{body}</p>
              {note && (
                <p className="mt-2 border-t border-white/[0.05] pt-2 text-[11px] leading-snug text-gray-600">{note}</p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Risks tab ────────────────────────────────────────────────────────────────

function RisksTab({ result }: { result: AnalysisResult }) {
  const items = [
    {
      id: "invalidation",
      Icon: XCircle,
      iconBg: "bg-red-500/10",
      iconText: "text-red-400",
      border: "border-red-500/20",
      card: "bg-red-500/[0.04]",
      tag: "Critical",
      tagStyle: "border-red-500/25 bg-red-500/10 text-red-400",
      title: "Price Invalidation",
      body: result.sl !== null
        ? `This analysis is INVALID if price ${result.signal === "BUY" ? "breaks and closes below" : result.signal === "SELL" ? "breaks and closes above" : "moves decisively beyond"} ${fmtPrice(result.sl)}.`
        : "No clear invalidation level visible. Apply strict manual risk management.",
    },
    {
      id: "stoploss",
      Icon: ShieldAlert,
      iconBg: "bg-red-500/10",
      iconText: "text-red-400",
      border: "border-red-500/[0.14]",
      card: "bg-red-500/[0.03]",
      tag: "Exit Signal",
      tagStyle: "border-orange-500/25 bg-orange-500/10 text-orange-400",
      title: "Stop Loss Level",
      body: result.sl !== null
        ? `Exit the trade immediately if price hits ${fmtPrice(result.sl)}. Never move the stop to avoid taking a loss.`
        : "No stop loss level identified. Set your own based on key structure levels before entering.",
    },
    {
      id: "scenario",
      Icon: AlertTriangle,
      iconBg: "bg-amber-500/10",
      iconText: "text-amber-400",
      border: "border-amber-500/[0.18]",
      card: "bg-amber-500/[0.03]",
      tag: "Watch",
      tagStyle: "border-amber-500/25 bg-amber-500/10 text-amber-400",
      title:
        result.volatility === "High" ? "High Volatility Warning"
        : result.risk === "High"     ? "High Risk Environment"
        :                              "Alternate Scenario",
      body:
        result.volatility === "High"
          ? "High volatility raises the probability of stop-loss hunting and sudden reversals. Use reduced position size and wider buffers."
          : result.risk === "High"
          ? "Elevated risk conditions detected. Consider halving your normal position size and waiting for additional confirmation before entering."
          : `If ${result.patterns[0]} fails to follow through, a range-bound or opposing scenario becomes likely. Monitor volume for early warning signs.`,
    },
    {
      id: "watchout",
      Icon: Eye,
      iconBg: "bg-white/[0.06]",
      iconText: "text-gray-400",
      border: "border-white/[0.07]",
      card: "bg-white/[0.025]",
      tag: null as string | null,
      tagStyle: "",
      title: "Overall Risk Profile",
      body: `${result.risk} risk · ${result.volatility} volatility · ${result.patternStrength} pattern strength. ${
        result.risk === "High"     ? "Size conservatively — this setup carries above-average failure odds."
        : result.risk === "Moderate" ? "Standard position sizing applies. Monitor key levels closely."
        :                              "Favorable conditions, but remember: no trade is guaranteed."
      }`,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-600">Exit or skip the trade if these happen</p>
      </div>
      {items.map(({ id, Icon, iconBg, iconText, border, card, tag, tagStyle, title, body }, i) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className={cn("rounded-xl border p-4", border, card)}
        >
          <div className="flex items-start gap-3">
            <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", iconBg)}>
              <Icon className={cn("size-4", iconText)} />
            </div>
            <div className="flex-1">
              <div className="mb-1.5 flex items-center gap-2">
                <p className="text-[12px] font-semibold text-white">{title}</p>
                {tag && (
                  <span className={cn("rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide", tagStyle)}>
                    {tag}
                  </span>
                )}
              </div>
              <p className="text-[12px] leading-relaxed text-gray-400">{body}</p>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/[0.07] px-4 py-3">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-400" />
        <p className="text-[11px] font-semibold leading-snug text-red-300/90">
          IF ANY of these conditions are met, the trade idea is invalidated. Do not hold and hope.
        </p>
      </div>
    </div>
  )
}

// ─── Results ──────────────────────────────────────────────────────────────────

export function ResultsView({
  preview,
  filename,
  result,
  onReset,
}: {
  preview: string | null
  filename: string
  result: AnalysisResult
  onReset: () => void
}) {
  const signalColors = {
    BUY:     { badge: "bg-emerald-500/10 text-emerald-400", border: "border-emerald-500/30" },
    SELL:    { badge: "bg-red-500/10 text-red-400",         border: "border-red-500/30"     },
    NEUTRAL: { badge: "bg-yellow-500/10 text-yellow-400",   border: "border-yellow-500/30"  },
  }
  const sc        = signalColors[result.signal]
  const SignalIcon = result.signal === "BUY" ? TrendingUp : result.signal === "SELL" ? TrendingDown : Activity

  const riskColor: Record<string, string> = {
    Low:      "text-emerald-400",
    Moderate: "text-yellow-400",
    High:     "text-red-400",
  }
  const alignColor: Record<string, string> = {
    Weak:     "text-red-400",
    Moderate: "text-yellow-400",
    Strong:   "text-emerald-400",
  }
  const strengthColor: Record<string, string> = {
    Low:    "text-red-400",
    Medium: "text-yellow-400",
    High:   "text-emerald-400",
  }
  const rrColor =
    result.rrRatio === null ? "text-gray-400"
    : result.rrRatio >= 2  ? "text-emerald-400"
    : result.rrRatio >= 1  ? "text-yellow-400"
    : "text-red-400"

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* File header */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <CheckCircle className="size-4 text-emerald-400" />
          {filename}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
        >
          <RefreshCcw className="size-3" />
          Analyze Another
        </button>
      </div>

      {/* Chart + signal card */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        {/* Chart preview */}
        <div className="relative overflow-hidden rounded-xl border border-white/[0.07] bg-[#08080f] sm:col-span-3">
          {preview ? (
            <img src={preview} alt="Analyzed chart" className="w-full" />
          ) : (
            <svg viewBox="0 0 400 180" className="h-44 w-full opacity-60">
              {(
                [
                  [20,  100, 118, 95,  123, false],
                  [46,  88,  104, 83,  109, false],
                  [72,  75,  90,  70,  96,  true ],
                  [98,  60,  76,  55,  82,  true ],
                  [124, 62,  75,  57,  80,  false],
                  [150, 46,  60,  41,  66,  true ],
                  [176, 36,  52,  31,  58,  true ],
                  [202, 28,  44,  23,  50,  true ],
                  [228, 30,  44,  25,  50,  false],
                  [254, 16,  30,  11,  36,  true ],
                  [280, 10,  24,  5,   30,  true ],
                  [306, 14,  26,  9,   32,  false],
                  [332, 6,   18,  2,   24,  true ],
                  [358, 2,   14,  0,   20,  true ],
                ] as [number, number, number, number, number, boolean][]
              ).map(([x, bT, bB, wT, wB, g]) => (
                <g key={x}>
                  <line x1={x + 5} y1={wT} x2={x + 5} y2={wB} stroke={g ? "#34d399" : "#f87171"} strokeWidth={1.5} />
                  <rect x={x} y={bT} width={10} height={bB - bT} fill={g ? "#34d399" : "#f87171"} rx={1} />
                </g>
              ))}
              <line x1={0} y1={5}   x2={380} y2={5}   stroke="rgba(52,211,153,0.5)"  strokeWidth={1} strokeDasharray="5 4" />
              <line x1={0} y1={35}  x2={380} y2={35}  stroke="rgba(251,191,36,0.4)"  strokeWidth={1} strokeDasharray="5 4" />
              <line x1={0} y1={118} x2={380} y2={118} stroke="rgba(248,113,113,0.4)" strokeWidth={1} strokeDasharray="5 4" />
            </svg>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#08080f] to-transparent" />
          <span className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
            <CheckCircle className="size-2.5" /> Analyzed
          </span>
        </div>

        {/* Signal card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col justify-between rounded-xl border border-white/[0.08] bg-[#0d0d1c] p-4 sm:col-span-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex size-6 items-center justify-center rounded-full bg-purple-500/15">
                <Zap className="size-3 text-purple-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">AI Signal</p>
                <p className="text-[10px] text-gray-600">{result.pair} · {result.timeframe}</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className={cn("flex items-center gap-1.5 rounded-lg px-2.5 py-1", sc.badge)}>
              <SignalIcon className="size-3.5" />
              <span className="text-sm font-bold">{result.signal}</span>
            </div>
            <div className="text-right">
              <p className="text-xl font-black leading-none text-white">{result.confidence}%</p>
              <p className="text-[10px] text-gray-600">Confidence</p>
            </div>
          </div>

          <div className="mt-3 space-y-2 divide-y divide-white/[0.05]">
            {[
              { l: "Entry", v: fmtPrice(result.entry), c: "text-gray-200"    },
              { l: "TP1",   v: fmtPrice(result.tp1),   c: "text-emerald-400" },
              { l: "TP2",   v: fmtPrice(result.tp2),   c: "text-emerald-400" },
              { l: "SL",    v: fmtPrice(result.sl),     c: "text-red-400"     },
              { l: "R:R",   v: result.rrRatio !== null ? `${result.rrRatio}` : "—", c: rrColor },
            ].map(({ l, v, c }, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex justify-between pt-2 text-xs"
              >
                <span className="text-gray-500">{l}</span>
                <span className={cn("font-semibold", c)}>{v}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Analysis block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
      >
        <span className="mb-4 inline-flex items-center rounded-lg bg-purple-500/15 px-3 py-1.5 text-[11px] font-semibold text-purple-400">
          Analysis
        </span>

        <div className="space-y-4">
          {/* Patterns + Risk */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                <Zap className="size-3 text-purple-400" />
                Detected Patterns
              </h3>
              <ul className="space-y-2">
                {result.patterns.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle className="size-3.5 shrink-0 text-emerald-400" />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5">
              <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
                <AlertTriangle className="size-3 text-orange-400" />
                Risk Assessment
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Overall Risk",     value: result.risk,            color: riskColor[result.risk]                },
                  { label: "Volatility",       value: result.volatility,      color: strengthColor[result.volatility]      },
                  { label: "Pattern Strength", value: result.patternStrength, color: strengthColor[result.patternStrength] },
                  { label: "Trend Alignment",  value: result.trendAlignment,  color: alignColor[result.trendAlignment]     },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{label}</span>
                    <span className={cn("font-semibold", color ?? "text-gray-400")}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Market structure */}
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gray-500">
              <ArrowUpRight className="size-3 text-violet-400" />
              Market Structure
            </h3>
            <p className="text-sm leading-relaxed text-gray-400">{result.structure}</p>
          </div>
        </div>
      </motion.div>

      {/* Understanding block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
      >
        <span className="mb-4 inline-flex items-center rounded-lg bg-purple-500/15 px-3 py-1.5 text-[11px] font-semibold text-purple-400">
          Understanding
        </span>
        <UnderstandTab result={result} />
      </motion.div>

      {/* Risks block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5"
      >
        <span className="mb-4 inline-flex items-center rounded-lg bg-purple-500/15 px-3 py-1.5 text-[11px] font-semibold text-purple-400">
          Risks
        </span>
        <RisksTab result={result} />
      </motion.div>

      <p className="text-center text-[11px] text-gray-700">
        AI-generated analysis for educational purposes only. Not financial advice.
        Always do your own research before trading.
      </p>
    </motion.div>
  )
}
