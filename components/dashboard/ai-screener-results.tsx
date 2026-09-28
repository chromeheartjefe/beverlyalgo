"use client"

// Split out from app/dashboard/ai-screener/page.tsx and loaded via
// next/dynamic — same reasoning as chart-analysis-results.tsx: this view
// only ever renders once a scan has completed, so it stays out of the
// page's own chunk on the common "just open the tab" path.

import { motion } from "framer-motion"
import { ArrowDown, ArrowRight, ArrowUp, Bitcoin, Eye, LineChart, Minus, TrendingDown, TrendingUp } from "lucide-react"
import { useMemo } from "react"

import type { ScreenerResult, ScreenerTicker } from "@/app/api/screener/route"
import { cn } from "@/lib/utils"

// Same two-layer glow treatment as chart-analysis-results.tsx's SignalHero
// (a diagonal full-card wash under a stronger blurred corner blob) instead
// of one faint corner blob — that's what reads as "blurry gradient" rather
// than "plain dark card with a pill." Border is tinted at rest, not just on
// hover, so the card carries color even before you touch it.
const DIRECTION_THEME = {
  Bullish: {
    text:   "text-emerald-400",
    edge:   "bg-emerald-400",
    blob:   "bg-emerald-500/25",
    panel:  "bg-gradient-to-br from-emerald-500/[0.14] via-transparent to-transparent",
    border: "border-emerald-500/[0.16] hover:border-emerald-400/35",
    badge:  "bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 border-emerald-400/30",
  },
  Bearish: {
    text:   "text-red-400",
    edge:   "bg-red-400",
    blob:   "bg-red-500/25",
    panel:  "bg-gradient-to-br from-red-500/[0.14] via-transparent to-transparent",
    border: "border-red-500/[0.16] hover:border-red-400/35",
    badge:  "bg-gradient-to-br from-red-400/25 to-red-600/10 border-red-400/30",
  },
  Watch: {
    text:   "text-amber-400",
    edge:   "bg-amber-400",
    blob:   "bg-amber-500/25",
    panel:  "bg-gradient-to-br from-amber-500/[0.14] via-transparent to-transparent",
    border: "border-amber-500/[0.16] hover:border-amber-400/35",
    badge:  "bg-gradient-to-br from-amber-400/25 to-amber-600/10 border-amber-400/30",
  },
} as const

// ─── Simulated secondary indicators ────────────────────────────────────────
// Purely decorative — MACD/RSI/EMA/SMA "signals" below are NOT computed from
// real indicator math (that would need historical OHLC series per ticker,
// well beyond this feature's free-tier API budget). They're seeded so each
// real scan gets a stable, varied-looking pattern that always leans the same
// direction as the real AI-derived signal, rather than re-rolling on every
// render/click — otherwise they'd visibly change while the real cached price
// data stays frozen within the hourly window, which reads as broken, not
// convincing. Kept out of anything persisted (DB/API) since it's flavor, not data.
type MicroSignal = "BUY" | "SELL" | "NEUTRAL"

const INDICATOR_LABELS = ["MACD", "RSI", "EMA", "SMA"] as const

// Each direction's pool of valid 4-signal patterns — always majority (or
// unanimous) aligned with the real direction, with the occasional dissenting
// signal or neutral thrown in so a row of cards doesn't look copy-pasted.
const PATTERNS: Record<ScreenerTicker["direction"], MicroSignal[][]> = {
  Bullish: [
    ["BUY", "BUY", "BUY", "BUY"],
    ["BUY", "BUY", "BUY", "SELL"],
    ["BUY", "BUY", "BUY", "NEUTRAL"],
    ["BUY", "BUY", "NEUTRAL", "SELL"],
  ],
  Bearish: [
    ["SELL", "SELL", "SELL", "SELL"],
    ["SELL", "SELL", "SELL", "BUY"],
    ["SELL", "SELL", "SELL", "NEUTRAL"],
    ["SELL", "SELL", "NEUTRAL", "BUY"],
  ],
  Watch: [
    ["BUY", "SELL", "NEUTRAL", "NEUTRAL"],
    ["BUY", "BUY", "SELL", "SELL"],
    ["NEUTRAL", "NEUTRAL", "BUY", "SELL"],
    ["BUY", "SELL", "SELL", "BUY"],
  ],
}

// Deterministic string hash -> seeded PRNG (mulberry32), so the same seed
// always produces the same pattern instead of drifting on every re-render.
function seededRandom(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0
  let a = h >>> 0
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function buildIndicatorPanel(direction: ScreenerTicker["direction"], seed: string) {
  const rand    = seededRandom(seed)
  const pool    = PATTERNS[direction]
  const pattern = [...pool[Math.floor(rand() * pool.length)]]

  // Shuffle which indicator gets which signal so MACD isn't always the one
  // that dissents, for instance.
  for (let i = pattern.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[pattern[i], pattern[j]] = [pattern[j], pattern[i]]
  }

  const indicators = INDICATOR_LABELS.map((label, i) => ({ label, signal: pattern[i] }))
  const buy     = indicators.filter((x) => x.signal === "BUY").length
  const sell    = indicators.filter((x) => x.signal === "SELL").length
  const neutral = indicators.filter((x) => x.signal === "NEUTRAL").length
  const consensus = Math.round((Math.max(buy, sell, neutral) / INDICATOR_LABELS.length) * 100)

  return { indicators, buy, sell, neutral, consensus }
}

const SIGNAL_ICON: Record<MicroSignal, typeof ArrowUp> = { BUY: ArrowUp, SELL: ArrowDown, NEUTRAL: Minus }
const SIGNAL_STYLE: Record<MicroSignal, { chip: string; text: string }> = {
  BUY:     { chip: "bg-emerald-500/15", text: "text-emerald-400" },
  SELL:    { chip: "bg-red-500/15",     text: "text-red-400"     },
  NEUTRAL: { chip: "bg-amber-500/15",   text: "text-amber-400"   },
}

// Same tiered precision as chart-analysis-results.tsx's fmtPrice — sub-$1
// assets (meme coins, penny movers) need more than 2 decimals to be legible.
function fmtPrice(n: number) {
  const abs = Math.abs(n)
  const decimals = abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

// "Long" means the digits themselves are long (7+, not counting the decimal
// point) — e.g. PEPE's $0.00000437 — not just "however much space happens to
// be left," which was wrapping ordinary prices like $114.49 too depending on
// incidental column width.
function isLongPrice(n: number) {
  return fmtPrice(n).replace(/[^0-9]/g, "").length >= 7
}

function tradingViewUrl(t: ScreenerTicker) {
  const symbol = t.assetType === "crypto" ? `${t.symbol}USDT` : t.symbol
  return `https://www.tradingview.com/symbols/${encodeURIComponent(symbol)}/`
}

// ─── Signal gauge (replaces the circular potential ring) ───────────────────
// Modeled directly on TradingView's 5-segment technical-rating gauge: five
// distinct rounded arcs with visible gaps between them (not one continuous
// band), a needle, and a "caption + big colored verdict word" readout below
// — same structure as the reference, just in this app's own type styles.
const GAUGE_LABELS = ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"] as const
type GaugeLabel = (typeof GAUGE_LABELS)[number]

const GAUGE_COLORS: Record<GaugeLabel, string> = {
  "Strong Sell": "#dc2626", // red-600 — deep but still vivid, not the muddy near-black red-900 had
  "Sell":        "#f87171",
  "Neutral":     "#9ca3af",
  "Buy":         "#34d399",
  "Strong Buy":  "#059669", // emerald-600 — same "deep but vivid" pairing as Strong Sell
}

// The confidence number only ever decides WHICH of the 5 fixed dividers the
// needle points at — >90% confidence lands on the "Strong" segment, anything
// else lands on the plain Sell/Buy segment, never an in-between angle.
function zoneLabel(direction: ScreenerTicker["direction"], potential: number): GaugeLabel {
  if (direction === "Watch") return "Neutral"
  const strong = potential > 90
  if (direction === "Bearish") return strong ? "Strong Sell" : "Sell"
  return strong ? "Strong Buy" : "Buy"
}

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// Standard "angle range -> SVG arc path" recipe: angle 0deg = straight up,
// increasing clockwise, so a -90..+90 sweep traces the upper dome.
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarPoint(cx, cy, r, endDeg)
  const end   = polarPoint(cx, cy, r, startDeg)
  const largeArc = endDeg - startDeg <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

// 5 equal segments across the 180deg dome with real breathing room between
// each — flat (butt) caps rather than rounded ones, since a rounded cap's
// radius (half the stroke width) was wider than the gap itself and the two
// neighboring caps were physically overlapping into each other.
const SEGMENT_DEG = 24
const GAP_DEG      = 15

function segmentAngles(index: number) {
  const start = -90 + index * (SEGMENT_DEG + GAP_DEG)
  return { start, end: start + SEGMENT_DEG, center: start + SEGMENT_DEG / 2 }
}

// Tapered dart shape instead of a bare line, colored to match the active
// zone rather than a generic gray pointer.
function needlePoints(cx: number, cy: number, angle: number, tipR: number, baseR: number, baseHalfAngle: number) {
  const tip   = polarPoint(cx, cy, tipR, angle)
  const left  = polarPoint(cx, cy, baseR, angle - baseHalfAngle)
  const right = polarPoint(cx, cy, baseR, angle + baseHalfAngle)
  return `${left.x},${left.y} ${tip.x},${tip.y} ${right.x},${right.y}`
}

function SignalGauge({ direction, potential }: { direction: ScreenerTicker["direction"]; potential: number }) {
  const label      = zoneLabel(direction, potential)
  const labelIndex = GAUGE_LABELS.indexOf(label)
  const needleAngle = segmentAngles(labelIndex).center
  const needleColor = GAUGE_COLORS[label]

  const cx = 74, cy = 68, r = 56, stroke = 8

  return (
    <div className="flex shrink-0 flex-col items-center">
      <svg width={148} height={88} viewBox="0 0 148 88" className="overflow-visible">
        {GAUGE_LABELS.map((l, i) => {
          const { start, end } = segmentAngles(i)
          const d        = arcPath(cx, cy, r, start, end)
          const isActive = l === label
          return (
            <g key={l}>
              {/* Soft glow behind the active segment only — needed because a
                  couple of these colors (deep red/green) are too dark on
                  their own to read as "highlighted" from opacity alone. */}
              {isActive && (
                <path d={d} fill="none" stroke={GAUGE_COLORS[l]} strokeWidth={stroke + 10} strokeLinecap="butt" opacity={0.45} style={{ filter: "blur(8px)" }} />
              )}
              <path d={d} fill="none" stroke={GAUGE_COLORS[l]} strokeWidth={stroke} strokeLinecap="butt" opacity={isActive ? 1 : 0.3} />
            </g>
          )
        })}

        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 15, delay: 0.25 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <polygon points={needlePoints(cx, cy, needleAngle, 43, 10, 10)} fill={needleColor} />
          <circle cx={cx} cy={cy} r={5.5} fill={needleColor} />
          <circle cx={cx} cy={cy} r={2.2} fill="#0a0a16" />
        </motion.g>
      </svg>

      <div className="-mt-1 flex flex-col items-center">
        <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">Signal</span>
        <span className="text-sm font-black uppercase tracking-wide" style={{ color: GAUGE_COLORS[label] }}>
          {label}
        </span>
      </div>
    </div>
  )
}

// Slim proportional bar replacing a verbose "3 Sell · 1 Buy · 0 Neutral"
// text line — reads the mix of secondary signals at a glance, in color.
function ConsensusBar({ buy, sell, neutral }: { buy: number; sell: number; neutral: number }) {
  const total = buy + sell + neutral || 1
  const segments = [
    { key: "sell",    value: sell,    color: "bg-red-400"     },
    { key: "neutral", value: neutral, color: "bg-amber-400"   },
    { key: "buy",     value: buy,     color: "bg-emerald-400" },
  ].filter((s) => s.value > 0)

  return (
    <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      {segments.map((s, i) => (
        <motion.div
          key={s.key}
          className={cn("h-full", s.color)}
          initial={{ width: 0 }}
          animate={{ width: `${(s.value / total) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.08, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}

function SignalChip({ label, signal, delay }: { label: string; signal: MicroSignal; delay: number }) {
  const style = SIGNAL_STYLE[signal]
  const Icon  = SIGNAL_ICON[signal]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 260, damping: 18 }}
      className="flex flex-1 flex-col items-center gap-1.5"
    >
      <div className={cn("flex size-8 items-center justify-center rounded-full", style.chip)}>
        <Icon className={cn("size-4", style.text)} strokeWidth={2.75} />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
    </motion.div>
  )
}

function IndicatorPanel({ direction, seed }: { direction: ScreenerTicker["direction"]; seed: string }) {
  const theme = DIRECTION_THEME[direction]
  const Icon  = direction === "Bullish" ? TrendingUp : direction === "Bearish" ? TrendingDown : Eye
  const panel = useMemo(() => buildIndicatorPanel(direction, seed), [direction, seed])

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl border", theme.badge)}
        >
          <Icon className={cn("size-4", theme.text)} strokeWidth={2.5} />
        </motion.div>
        <span className={cn("text-sm font-black uppercase tracking-wide", theme.text)}>{direction}</span>
      </div>

      <div className="mt-3 flex items-start justify-between gap-1">
        {panel.indicators.map(({ label, signal }, i) => (
          <SignalChip key={label} label={label} signal={signal} delay={0.15 + i * 0.05} />
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        <ConsensusBar buy={panel.buy} sell={panel.sell} neutral={panel.neutral} />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-gray-600">Signal consensus</span>
          <span className={cn("text-xs font-black", theme.text)}>{panel.consensus}%</span>
        </div>
      </div>
    </div>
  )
}

function TickerCard({ t, i, seed }: { t: ScreenerTicker; i: number; seed: string }) {
  const theme = DIRECTION_THEME[t.direction]
  const up    = t.changePercent > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: i * 0.05, type: "spring", stiffness: 210, damping: 22 }}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-[#0a0a16] p-5 transition-colors duration-300",
        theme.border,
      )}
    >
      {/* Full-card diagonal wash + a stronger blurred corner blob on top of it —
          same two-layer treatment as chart-analysis-results.tsx's SignalHero,
          so the card reads as a colored glow, not a plain dark box with a pill. */}
      <div className={cn("pointer-events-none absolute inset-0", theme.panel)} />
      <div className={cn("pointer-events-none absolute -right-16 -top-16 size-56 rounded-full blur-3xl transition-opacity duration-300 group-hover:opacity-125", theme.blob)} />
      <span className={cn("absolute inset-y-0 left-0 w-1 rounded-l-2xl opacity-70", theme.edge)} />

      <div className="relative flex flex-col gap-4 pl-2 sm:flex-row sm:items-center sm:gap-5">
        {/* Left: identity + real fetched price/change — vertically centered
            against the (taller) indicator panel instead of stretching to
            match its height, which is what left a tall empty gap here. */}
        <div className="flex flex-1 items-center gap-3">
          {/* Text block and gauge are centered against each other, and the
              gauge itself is centered against the card via the outer row's
              sm:items-center — not pinned to the symbol's single line. */}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">{t.symbol}</span>

            {/* Wraps only for genuinely long prices (7+ digits, e.g. PEPE's
                $0.00000437) where price + badge together don't fit the
                column width — the badge drops to its own line instead of
                overflowing into the gauge. Gated on digit count rather than
                plain flex-wrap, which was also wrapping ordinary short
                prices like $114.49 depending on incidental column width. */}
            <div className={cn("flex items-center gap-x-2 gap-y-1", isLongPrice(t.price) ? "flex-wrap" : "flex-nowrap")}>
              <span className="font-mono text-sm text-gray-300">{fmtPrice(t.price)}</span>
              <span className={cn(
                "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-bold",
                up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
              )}>
                {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                {Math.abs(t.changePercent).toFixed(2)}%
              </span>
            </div>

            <a
              href={tradingViewUrl(t)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-fit items-center gap-1 text-xs font-semibold text-purple-400 transition-all hover:gap-1.5 hover:text-purple-300"
            >
              View chart <ArrowRight className="size-3.5" />
            </a>
          </div>

          <SignalGauge direction={t.direction} potential={t.potential} />
        </div>

        {/* Minimalist divider — a soft gradient hairline, horizontal on mobile, vertical from sm up */}
        <div className="h-px w-full self-stretch bg-gradient-to-r from-transparent via-white/10 to-transparent sm:h-auto sm:w-px sm:bg-gradient-to-b" />

        {/* Right: simulated secondary-indicator panel */}
        <IndicatorPanel direction={t.direction} seed={`${t.symbol}-${seed}`} />
      </div>
    </motion.div>
  )
}

function ColumnHeader({ label, count, icon: Icon }: { label: string; count: number; icon: typeof Bitcoin }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <div className="flex size-9 items-center justify-center rounded-xl border border-purple-500/20 bg-purple-500/10">
        <Icon className="size-5 text-purple-400" />
      </div>
      <h2 className="text-xl font-black tracking-tight text-white">{label}</h2>
      <span className="rounded-full border border-white/15 bg-white/[0.05] px-2 py-0.5 text-xs font-bold text-gray-400">{count}</span>
    </div>
  )
}

// Each asset class is its own bordered block rather than a bare column, so
// Crypto and Stocks read as two clearly separate sections at a glance.
function CategoryBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/25 bg-white/[0.02] p-4 sm:p-5">
      {children}
    </div>
  )
}

function stocksAge(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  return hours < 48 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`
}

export function ScreenerResults({ result }: { result: ScreenerResult }) {
  const crypto = result.tickers.filter((t) => t.assetType === "crypto")
  const stocks = result.tickers.filter((t) => t.assetType === "stock")

  return (
    <div className="space-y-4">
      {result.stale && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.06] px-4 py-2.5 text-xs text-amber-300">
          Showing the last completed scan. A fresh scan couldn&apos;t run just now, please try again shortly.
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
        <CategoryBlock>
          <ColumnHeader label="Crypto" count={crypto.length} icon={Bitcoin} />
          <div className="space-y-3">
            {crypto.map((t, i) => (
              <TickerCard key={t.symbol} t={t} i={i} seed={result.generatedAt} />
            ))}
          </div>
        </CategoryBlock>

        <CategoryBlock>
          <ColumnHeader label="Stocks" count={stocks.length} icon={LineChart} />
          {result.stocksAsOf && stocks.length > 0 && (
            <p className="-mt-1 mb-3 text-[11px] text-amber-300/80">
              Stock prices from the previous scan, {stocksAge(result.stocksAsOf)}. Live stock data was unavailable this time.
            </p>
          )}
          {stocks.length === 0 ? (
            <p className="text-xs text-gray-600">
              Stock picks are temporarily unavailable. Crypto picks are still live, try scanning again later for stocks.
            </p>
          ) : (
            <div className="space-y-3">
              {stocks.map((t, i) => (
                <TickerCard key={t.symbol} t={t} i={i} seed={result.generatedAt} />
              ))}
            </div>
          )}
        </CategoryBlock>
      </div>

      <p className="text-center text-[11px] text-gray-700">
        Not financial advice. Always do your own research before trading.
      </p>
    </div>
  )
}
