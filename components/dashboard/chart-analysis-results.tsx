"use client"

// Split out from app/dashboard/chart-analysis/page.tsx and loaded via
// next/dynamic — this view (plus its Understanding/Risks tabs) only ever
// renders after a completed analysis, never on initial tab-open, so keeping
// it out of the page's own chunk keeps the "just open the tab" path lighter.

import { motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Eye,
  Hourglass,
  Layers,
  Lightbulb,
  Radar,
  RefreshCcw,
  Scale,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Waypoints,
  XCircle,
  Zap,
} from "lucide-react"

import type { AnalysisResult } from "@/app/dashboard/chart-analysis/page"
import { fmtPrice } from "@/lib/format"
import { RR_TIERS, rrTier } from "@/lib/risk-reward"
import { cn } from "@/lib/utils"

// ─── Signal hero ──────────────────────────────────────────────────────────────
// This card is the entire reason someone opens Chart Analysis, so it gets its
// own full-width, high-contrast treatment instead of sharing a row with the
// chart thumbnail — direction-tinted glow + glass stat tiles, sized to read
// at a glance.

const SIGNAL_THEME = {
  BUY: {
    text:   "text-emerald-400",
    ring:   "#34d399",
    badge:  "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_34px_-10px_rgba(52,211,153,0.6)]",
    blob:   "bg-emerald-500/25",
    border: "border-emerald-500/25",
    panel:  "bg-gradient-to-br from-emerald-500/[0.12] via-transparent to-transparent",
  },
  SELL: {
    text:   "text-red-400",
    ring:   "#f87171",
    badge:  "bg-gradient-to-br from-red-400 to-red-600 shadow-[0_10px_34px_-10px_rgba(248,113,113,0.6)]",
    blob:   "bg-red-500/25",
    border: "border-red-500/25",
    panel:  "bg-gradient-to-br from-red-500/[0.12] via-transparent to-transparent",
  },
  NEUTRAL: {
    text:   "text-amber-400",
    ring:   "#fbbf24",
    badge:  "bg-gradient-to-br from-amber-400 to-amber-600 shadow-[0_10px_34px_-10px_rgba(251,191,36,0.6)]",
    blob:   "bg-amber-500/25",
    border: "border-amber-500/25",
    panel:  "bg-gradient-to-br from-amber-500/[0.12] via-transparent to-transparent",
  },
} as const

// Rendered twice (mobile/desktop) with different pixel sizes rather than one
// CSS-responsive SVG — stroke-dasharray/offset are computed from a numeric
// radius, so the ring geometry itself has to change, not just its wrapper.
function ConfidenceCircle({ value, color, size, stroke }: { value: number; color: string; size: number; stroke: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (value / 100) * c

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-1">
        <span className={cn("font-black leading-none text-white", size >= 100 ? "text-2xl" : "text-xl")}>{value}</span>
        {/* Smaller, tighter label on the small (phone) ring so it clears the ring's inner edge */}
        <span className={cn(
          "mt-0.5 whitespace-nowrap font-semibold uppercase text-gray-500",
          size >= 100 ? "text-[9px] tracking-wide" : "text-[7px] tracking-normal",
        )}>confidence</span>
      </div>
    </div>
  )
}

function ConfidenceRing({ value, color }: { value: number; color: string }) {
  return (
    <div className="shrink-0">
      <div className="sm:hidden">
        <ConfidenceCircle value={value} color={color} size={88} stroke={7} />
      </div>
      <div className="hidden sm:block">
        <ConfidenceCircle value={value} color={color} size={116} stroke={9} />
      </div>
    </div>
  )
}

// NEUTRAL is "no trade", not a low-confidence call, so it gets no percentage
function NoTradeBadge() {
  return (
    <div className="flex size-[88px] shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-amber-400/40 bg-amber-500/[0.06] text-center sm:size-[116px]">
      <Hourglass className="size-5 text-amber-300 sm:size-6" />
      <span className="mt-1 text-xs font-bold text-amber-200 sm:text-sm">No trade</span>
    </div>
  )
}

// Confidence is a setup-quality grade (70-95), not a win probability
function confidenceTier(c: number): string {
  return c >= 90 ? "Strong setup, most confluence factors line up."
    : c >= 80 ? "Solid setup, the key factors line up with a few missing."
    : "Marginal setup, tradeable but thin. Consider a smaller position."
}

function SignalHero({ result }: { result: AnalysisResult }) {
  const theme = SIGNAL_THEME[result.signal]
  const SignalIcon = result.signal === "BUY" ? TrendingUp : result.signal === "SELL" ? TrendingDown : Activity
  // Same tiers as the Risk Calculator (lib/risk-reward.ts)
  const rrColor = result.rrRatio === null ? "text-gray-400" : RR_TIERS[rrTier(result.rrRatio)].text

  const neutral = result.signal === "NEUTRAL"
  const limit = result.entryType === "limit"

  const stats = neutral
    ? [
        { l: "Long above",  v: fmtPrice(result.watch?.longAbove ?? null),  Icon: TrendingUp,   tint: "text-emerald-400" },
        { l: "Short below", v: fmtPrice(result.watch?.shortBelow ?? null), Icon: TrendingDown, tint: "text-red-400"     },
      ]
    : [
        { l: limit ? "Limit Entry" : "Entry", v: fmtPrice(result.entry), Icon: Target, tint: "text-gray-100" },
        { l: "TP1",          v: fmtPrice(result.tp1),   Icon: TrendingUp, tint: "text-emerald-400" },
        { l: "TP2",          v: fmtPrice(result.tp2),   Icon: TrendingUp, tint: "text-emerald-400" },
        { l: "Stop Loss",    v: fmtPrice(result.sl),    Icon: ShieldAlert, tint: "text-red-400"    },
        { l: "Risk : Reward", v: result.rrRatio !== null ? `1:${result.rrRatio}` : "—", Icon: Scale, tint: rrColor },
      ]
  // Every tile's number is fitted to the longest value in the row, so they
  // all shrink together (Risk : Reward too) and stay the same size
  const fitChars = Math.max(...stats.map((s) => s.v.length))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn("relative overflow-hidden rounded-3xl border bg-[#0a0a16] p-5 sm:p-8", theme.border)}
    >
      <div className={cn("pointer-events-none absolute -right-16 -top-16 size-64 rounded-full blur-3xl", theme.blob)} />
      <div className={cn("pointer-events-none absolute inset-0", theme.panel)} />

      <div className="relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1">
            <Zap className="size-3 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-purple-300">AI Signal</span>
          </div>
          <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs font-medium text-gray-400">
            {result.pair} · {result.timeframe}
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 sm:gap-5">
          <div className="flex items-center gap-3 sm:gap-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
              className={cn("flex size-14 shrink-0 items-center justify-center rounded-2xl sm:size-20", theme.badge)}
            >
              <SignalIcon className="size-7 text-white sm:size-10" strokeWidth={2.5} />
            </motion.div>
            <p className={cn("text-3xl font-black leading-none tracking-tight sm:text-6xl", theme.text)}>
              {result.signal}
            </p>
          </div>

          {neutral ? <NoTradeBadge /> : <ConfidenceRing value={result.confidence} color={theme.ring} />}
        </div>

        {/* Mobile: 2 columns (Entry full width, TP1 | TP2, Stop Loss | Risk :
            Reward). Three per row left ~60px inside each tile on a phone, so
            labels wrapped and 5-digit prices overflowed. sm+: one row of 5.
            Tiles are flex columns with the price pinned to the bottom, so
            prices line up across a row even when a label wraps. */}
        <div className={cn("mt-7 grid grid-cols-2 gap-2.5 sm:gap-3", !neutral && "sm:grid-cols-5")}>
          {stats.map(({ l, v, Icon, tint }, i) => (
            <motion.div
              key={l}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.06 }}
              className={cn(
                "@container flex min-w-0 flex-col justify-between gap-2 rounded-xl border border-white/15 bg-white/[0.04] p-3 sm:p-4",
                // Entry leads on phones: it's the level people act on first
                !neutral && i === 0 && "col-span-2 sm:col-span-1",
              )}
            >
              <div className="flex items-start gap-1.5">
                <Icon className={cn("mt-px size-3.5 shrink-0", tint)} />
                <span className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-gray-500">{l}</span>
              </div>
              {/* Sized from the tile's own width (container query units), so a
                  narrow tile (small window, browser zoom) shrinks the price
                  instead of letting it spill out. --fit is the size at which
                  the row's longest value fills the tile (a black-weight digit
                  is ~0.64em wide); the usual sizes stay the maximum. */}
              <p
                className={cn(
                  "whitespace-nowrap font-black leading-none tabular-nums",
                  "text-[length:min(var(--fit),1.125rem)] sm:text-[length:min(var(--fit),1.25rem)]",
                  tint,
                )}
                style={{ "--fit": `${(100 / (fitChars * 0.64)).toFixed(2)}cqi` } as React.CSSProperties}
              >
                {v}
              </p>
            </motion.div>
          ))}
        </div>

        {(neutral || limit) && (
          <p className="mt-4 rounded-xl border border-white/15 bg-white/[0.03] px-3.5 py-2.5 text-xs leading-relaxed text-gray-400">
            {neutral
              ? "No clean setup right now. Wait for a candle to close beyond one of these levels, then run a fresh analysis."
              : `Place a limit order at ${fmtPrice(result.entry)} instead of entering at the current price. If price reaches TP1 without filling your order, the setup is gone, so don't chase it.`}
          </p>
        )}

        {result.tips && result.tips.length > 0 && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] px-3.5 py-2.5">
            <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-amber-300" />
            <p className="text-xs leading-relaxed text-amber-100/80">{result.tips.join(" ")}</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

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
      label: result.signal === "NEUTRAL" ? "Why No Trade?" : "Why This Signal?",
      highlight: result.signal === "NEUTRAL" ? "No trade · Waiting for a better setup" : `${result.confidence}% Confidence · ${result.signal}`,
      body: result.signal === "NEUTRAL"
        ? "The chart doesn't offer a setup with a clear edge and at least 1:1.5 risk to reward right now. Sitting out is a position too."
        : `${result.trendAlignment} trend alignment combined with ${result.patternStrength.toLowerCase()} pattern strength produced this ${result.signal.toLowerCase()} signal.${result.rrRatio !== null ? ` Targets and stop sit at real chart levels, giving 1:${result.rrRatio} risk to reward.` : ""}`,
      note: result.signal === "NEUTRAL"
        ? "Confidence is a setup-quality grade, so a no-trade read has none."
        : `${confidenceTier(result.confidence)} The grade reflects setup quality, not a guaranteed win rate.`,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="mb-1 flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Why the AI reached this conclusion</p>
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
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-widest text-gray-600">{label}</p>
              <p className={cn("mb-2 text-[13px] font-semibold leading-tight", hlText)}>{highlight}</p>
              <p className="text-[12px] leading-relaxed text-gray-400">{body}</p>
              {note && (
                <p className="mt-2 border-t border-white/15 pt-2 text-xs leading-snug text-gray-600">{note}</p>
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
      title: result.signal === "NEUTRAL" ? "Wait For A Trigger" : "Price Invalidation",
      body: result.signal === "NEUTRAL"
        ? `Don't force a trade. A long only makes sense after a close above ${fmtPrice(result.watch?.longAbove ?? null)}, a short after a close below ${fmtPrice(result.watch?.shortBelow ?? null)}.`
        : result.sl !== null
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
      title: result.signal === "NEUTRAL" ? "Protect Your Capital" : "Stop Loss Level",
      body: result.signal === "NEUTRAL"
        ? "When a trigger level breaks, run a new analysis for a fresh entry, stop and target. Don't reuse old levels."
        : result.sl !== null
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
      border: "border-white/15",
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
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-600">Exit or skip the trade if these happen</p>
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
                  <span className={cn("rounded-full border px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide", tagStyle)}>
                    {tag}
                  </span>
                )}
              </div>
              <p className="text-[12px] leading-relaxed text-gray-400">{body}</p>
            </div>
          </div>
        </motion.div>
      ))}

      {result.signal !== "NEUTRAL" && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/[0.07] px-4 py-3">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-red-400" />
          <p className="text-xs font-semibold leading-snug text-red-300/90">
            IF ANY of these conditions are met, the trade idea is invalidated. Do not hold and hope.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Patterns & risk cards ────────────────────────────────────────────────────
// Same card language as the Chart Analyser sidebar (tips / recent analyses):
// dark shell, accent hairline, corner glow, gradient icon tile. Every colored
// element also carries text (type chip labels, meter values), never color alone.

type Tone = "good" | "mid" | "bad"

const TONE = {
  good: { text: "text-emerald-300", cell: "bg-emerald-400", chip: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300" },
  mid:  { text: "text-amber-300",   cell: "bg-amber-400",   chip: "border-amber-400/25 bg-amber-500/10 text-amber-300" },
  bad:  { text: "text-rose-300",    cell: "bg-rose-400",    chip: "border-rose-400/25 bg-rose-500/10 text-rose-300" },
} as const

// Level 1-3 plus whether "more" is good (trend, strength) or bad (risk, volatility)
function levelTone(level: 1 | 2 | 3, moreIsBetter: boolean): Tone {
  if (level === 2) return "mid"
  return (level === 3) === moreIsBetter ? "good" : "bad"
}

function LevelMeter({ label, value, level, moreIsBetter, delay = 0 }: {
  label: string
  value: string
  level: 1 | 2 | 3
  moreIsBetter: boolean
  delay?: number
}) {
  const tone = TONE[levelTone(level, moreIsBetter)]
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
        <span className="text-gray-400">{label}</span>
        <span className={cn("font-semibold", tone.text)}>{value}</span>
      </div>
      <div className="grid grid-cols-3 gap-1" role="meter" aria-label={label} aria-valuemin={1} aria-valuemax={3} aria-valuenow={level} aria-valuetext={value}>
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            {n <= level && (
              <motion.div
                className={cn("h-full origin-left rounded-full", tone.cell)}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: delay + n * 0.08, duration: 0.35, ease: "easeOut" }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const ACCENT = {
  violet:  { line: "via-fuchsia-400/60", blob: "bg-fuchsia-500/10", tile: "border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/5", icon: "text-fuchsia-300" },
  good:    { line: "via-emerald-400/60", blob: "bg-emerald-500/10", tile: "border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 to-teal-600/5",   icon: "text-emerald-300" },
  mid:     { line: "via-amber-400/60",   blob: "bg-amber-500/10",   tile: "border-amber-400/30 bg-gradient-to-br from-amber-500/25 to-yellow-600/5",    icon: "text-amber-300" },
  bad:     { line: "via-rose-400/60",    blob: "bg-rose-500/10",    tile: "border-rose-400/30 bg-gradient-to-br from-rose-500/25 to-red-600/5",         icon: "text-rose-300" },
  sky:     { line: "via-sky-400/60",     blob: "bg-sky-500/10",     tile: "border-sky-400/30 bg-gradient-to-br from-sky-500/25 to-cyan-600/5",          icon: "text-sky-300" },
} as const

function CardShell({ accent, icon: Icon, title, sub, badge, className, children }: {
  accent: keyof typeof ACCENT
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  sub: string
  badge?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  const a = ACCENT[accent]
  return (
    <div className={cn("relative flex flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#070712] p-5", className)}>
      <span className={cn("pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />
      <div className={cn("pointer-events-none absolute -right-14 -top-16 size-40 rounded-full blur-3xl", a.blob)} />
      <div className="relative mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", a.tile)}>
            <Icon className={cn("size-4", a.icon)} strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{title}</h3>
            <p className="text-xs text-gray-500">{sub}</p>
          </div>
        </div>
        {badge}
      </div>
      <div className="relative flex flex-1 flex-col">{children}</div>
    </div>
  )
}

// Pattern families, so a trader sees at a glance what kind of evidence it is
const PATTERN_KIND = {
  smc:     { label: "Smart money",   chip: "border-fuchsia-400/25 bg-fuchsia-500/10 text-fuchsia-300", dot: "bg-fuchsia-400" },
  chart:   { label: "Chart pattern", chip: "border-sky-400/25 bg-sky-500/10 text-sky-300",             dot: "bg-sky-400" },
  level:   { label: "Key level",     chip: "border-amber-400/25 bg-amber-500/10 text-amber-300",       dot: "bg-amber-400" },
  other:   { label: "Pattern",       chip: "border-white/15 bg-white/[0.05] text-gray-300",            dot: "bg-gray-400" },
} as const

function patternKind(name: string): keyof typeof PATTERN_KIND {
  const n = name.toLowerCase()
  if (/sweep|equal (highs|lows)|order block|breaker|fair value|break of structure|change of character|structure shift|displacement|optimal trade/.test(n)) return "smc"
  if (/head and shoulders|double (top|bottom)|triangle|wedge|flag|cup and handle/.test(n)) return "chart"
  if (/support|resistance|trendline|channel|range/.test(n)) return "level"
  return "other"
}

const STRENGTH_LEVEL = { Low: 1, Medium: 2, High: 3 } as const
const RISK_LEVEL     = { Low: 1, Moderate: 2, High: 3 } as const
const VOL_LEVEL      = { Low: 1, Medium: 2, High: 3 } as const
const ALIGN_LEVEL    = { Weak: 1, Moderate: 2, Strong: 3 } as const

function PatternsCard({ result }: { result: AnalysisResult }) {
  return (
    <CardShell
      accent="violet"
      icon={Layers}
      title="Detected patterns"
      sub="Most relevant first"
      badge={
        <span className="shrink-0 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-semibold text-fuchsia-200">
          {result.patterns.length} found
        </span>
      }
    >
      <ul className="mb-4 space-y-2">
        {result.patterns.map((p, i) => {
          const kind = PATTERN_KIND[patternKind(p)]
          const primary = i === 0
          return (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                primary ? "border-fuchsia-400/25 bg-fuchsia-500/[0.07]" : "border-white/15 bg-white/[0.02]",
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold tabular-nums",
                  primary ? "bg-fuchsia-500/25 text-fuchsia-100" : "bg-white/[0.06] text-gray-400",
                )}
              >
                {i + 1}
              </span>
              <span className={cn("min-w-0 flex-1 truncate text-sm", primary ? "font-semibold text-white" : "text-gray-200")}>{p}</span>
              <span className={cn("hidden shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold min-[380px]:inline-flex", kind.chip)}>
                <span className={cn("size-1.5 rounded-full", kind.dot)} aria-hidden="true" />
                {kind.label}
              </span>
            </motion.li>
          )
        })}
      </ul>

      {/* Pinned to the bottom, so a card stretched beside Risk has no dead band under it */}
      <div className="mt-auto border-t border-white/15 pt-4">
        <LevelMeter
          label="Pattern strength"
          value={result.patternStrength}
          level={STRENGTH_LEVEL[result.patternStrength] ?? 2}
          moreIsBetter
          delay={0.3}
        />
      </div>
    </CardShell>
  )
}

function RiskCard({ result }: { result: AnalysisResult }) {
  const riskLevel = RISK_LEVEL[result.risk] ?? 2
  const tone = levelTone(riskLevel, false)
  return (
    <CardShell
      accent={tone}
      icon={tone === "good" ? ShieldAlert : tone === "mid" ? Radar : AlertTriangle}
      title="Risk assessment"
      sub="How much could go against you"
      badge={
        <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold", TONE[tone].chip)}>
          {result.risk} risk
        </span>
      }
    >
      <div className="flex flex-1 flex-col justify-around gap-4">
        <LevelMeter label="Overall risk" value={result.risk} level={riskLevel} moreIsBetter={false} delay={0.1} />
        <LevelMeter label="Volatility" value={result.volatility} level={VOL_LEVEL[result.volatility] ?? 2} moreIsBetter={false} delay={0.2} />
        <LevelMeter label="Trend alignment" value={result.trendAlignment} level={ALIGN_LEVEL[result.trendAlignment] ?? 2} moreIsBetter delay={0.3} />
      </div>
    </CardShell>
  )
}

function StructureCard({ result, className }: { result: AnalysisResult; className?: string }) {
  return (
    <CardShell accent="sky" icon={Waypoints} title="Market structure" sub="How price is moving" className={className}>
      <p className="text-sm leading-relaxed text-gray-300">{result.structure}</p>
    </CardShell>
  )
}

// ─── Results ──────────────────────────────────────────────────────────────────

export function ResultsView({
  preview,
  filename,
  result,
  onReset,
  footer,
}: {
  preview: string | null
  filename: string
  result: AnalysisResult
  onReset: () => void
  // Shown under the full analysis, e.g. the upgrade card after a free one
  footer?: React.ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      {/* Result header: the analysed ticker, not the screenshot's file name */}
      <div className="flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 text-sm text-gray-300">
          <CheckCircle className="size-4 shrink-0 text-emerald-400" />
          <span className="truncate font-semibold text-white">
            {result.pair && result.pair !== "—" ? result.pair : filename}
          </span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300"
        >
          <RefreshCcw className="size-3" />
          Analyze Another
        </button>
      </div>

      {/* Signal hero — the whole reason people use this tool */}
      <SignalHero result={result} />

      {/* Chart preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#08080f]"
      >
        {preview ? (
          <img src={preview} alt="Analyzed chart" className="max-h-[420px] w-full object-contain" />
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
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-400">
          <CheckCircle className="size-3" /> Analyzed
        </span>
      </motion.div>

      {/* Analysis block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.3 }}
        className="rounded-2xl border border-white/15 bg-white/[0.02] p-4 sm:p-5"
      >
        <span className="mb-4 inline-flex items-center rounded-lg bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-400">
          Analysis
        </span>

        <div className="space-y-4">
          {/* Patterns and Risk side by side (similar heights with the usual 2-3
              patterns), Market structure full width under them. Patterns used
              to sit beside Risk + Structure stacked, which left its bottom half
              empty unless 4 patterns were found. */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <PatternsCard result={result} />
            <RiskCard result={result} />
            {result.structure && <StructureCard result={result} className="sm:col-span-2" />}
          </div>
        </div>
      </motion.div>

      {/* Understanding block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.3 }}
        className="rounded-2xl border border-white/15 bg-white/[0.02] p-4 sm:p-5"
      >
        <span className="mb-4 inline-flex items-center rounded-lg bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-400">
          Understanding
        </span>
        <UnderstandTab result={result} />
      </motion.div>

      {/* Risks block */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
        className="rounded-2xl border border-white/15 bg-white/[0.02] p-4 sm:p-5"
      >
        <span className="mb-4 inline-flex items-center rounded-lg bg-purple-500/15 px-3 py-1.5 text-xs font-semibold text-purple-400">
          Risks
        </span>
        <RisksTab result={result} />
      </motion.div>

      {footer}

      <p className="text-center text-xs text-gray-700">
        AI-generated analysis for educational purposes only. Not financial advice.
        Always do your own research before trading.
      </p>
    </motion.div>
  )
}
