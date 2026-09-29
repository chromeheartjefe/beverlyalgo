"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowDown, ArrowUp, Check, Flame } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { demoLoop, DemoLiveContext, useDemoLive } from "@/components/ui/demo-live"
import { Reveal } from "@/components/ui/reveal"
import { cn } from "@/lib/utils"

// ─── Types & constants ────────────────────────────────────────────────────────

type Phase = "scanning" | "crypto" | "stocks"

const PHASE_ORDER: Phase[] = ["scanning", "crypto", "stocks"]

const PHASE_DURATION: Record<Phase, number> = {
  scanning: 3200,
  crypto: 4400,
  stocks: 4400,
}

type Direction = "Bullish" | "Bearish" | "Watch"

const GAUGE_LABELS = ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"] as const
type GaugeLabel = (typeof GAUGE_LABELS)[number]

// Same palette as the real gauge in components/dashboard/ai-screener-results.tsx
const GAUGE_COLORS: Record<GaugeLabel, string> = {
  "Strong Sell": "#dc2626",
  "Sell":        "#f87171",
  "Neutral":     "#9ca3af",
  "Buy":         "#34d399",
  "Strong Buy":  "#059669",
}

// Trimmed-down version of the dashboard's DIRECTION_THEME
const DIRECTION_THEME: Record<Direction, { text: string; edge: string; blob: string; panel: string; border: string }> = {
  Bullish: {
    text:   "text-emerald-400",
    edge:   "bg-emerald-400",
    blob:   "bg-emerald-500/20",
    panel:  "bg-gradient-to-br from-emerald-500/[0.12] via-transparent to-transparent",
    border: "border-emerald-500/[0.16]",
  },
  Bearish: {
    text:   "text-red-400",
    edge:   "bg-red-400",
    blob:   "bg-red-500/20",
    panel:  "bg-gradient-to-br from-red-500/[0.12] via-transparent to-transparent",
    border: "border-red-500/[0.16]",
  },
  Watch: {
    text:   "text-amber-400",
    edge:   "bg-amber-400",
    blob:   "bg-amber-500/20",
    panel:  "bg-gradient-to-br from-amber-500/[0.12] via-transparent to-transparent",
    border: "border-amber-500/[0.16]",
  },
}

type DemoTicker = { symbol: string; price: string; change: number; direction: Direction; zone: GaugeLabel }

// Illustrative demo picks — not live data
const DEMO_PICKS: Record<"crypto" | "stocks", DemoTicker[]> = {
  crypto: [
    { symbol: "SOL",  price: "$142.87", change: 8.42,  direction: "Bullish", zone: "Strong Buy" },
    { symbol: "DOGE", price: "$0.1624", change: 5.13,  direction: "Bullish", zone: "Buy" },
    { symbol: "AVAX", price: "$24.31",  change: -6.02, direction: "Bearish", zone: "Sell" },
  ],
  stocks: [
    { symbol: "NVDA", price: "$118.45", change: 4.87,  direction: "Bullish", zone: "Strong Buy" },
    { symbol: "TSLA", price: "$241.10", change: -3.92, direction: "Bearish", zone: "Sell" },
    { symbol: "PLTR", price: "$38.62",  change: 1.15,  direction: "Watch",   zone: "Neutral" },
  ],
}

// ─── Mini signal gauge ────────────────────────────────────────────────────────
// Compact copy of the dashboard's 5-segment gauge: same segment/gap geometry,
// needle sweeps in from the far left and snaps onto the active zone.

const SEGMENT_DEG = 24
const GAP_DEG     = 15

function segmentAngles(index: number) {
  const start = -90 + index * (SEGMENT_DEG + GAP_DEG)
  return { start, end: start + SEGMENT_DEG, center: start + SEGMENT_DEG / 2 }
}

function polarPoint(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarPoint(cx, cy, r, endDeg)
  const end   = polarPoint(cx, cy, r, startDeg)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`
}

function MiniGauge({ zone, delay }: { zone: GaugeLabel; delay: number }) {
  const W = 76, H = 44, cx = 38, cy = 38, r = 30, stroke = 5
  const color = GAUGE_COLORS[zone]
  const angle = segmentAngles(GAUGE_LABELS.indexOf(zone)).center

  // Needle is drawn pointing straight up, then rotated by an HTML wrapper so
  // the pivot is exactly (cx, cy) — SVG transform-origin is unreliable here.
  const tip   = polarPoint(cx, cy, 23, 0)
  const left  = polarPoint(cx, cy, 5, -14)
  const right = polarPoint(cx, cy, 5, 14)

  return (
    <div className="flex shrink-0 flex-col items-center">
      <div className="relative" style={{ width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 overflow-visible">
          {GAUGE_LABELS.map((l, i) => {
            const { start, end } = segmentAngles(i)
            const d = arcPath(cx, cy, r, start, end)
            const isActive = l === zone
            return (
              <g key={l}>
                {isActive && (
                  <path d={d} fill="none" stroke={GAUGE_COLORS[l]} strokeWidth={stroke + 6} opacity={0.45} style={{ filter: "blur(5px)" }} />
                )}
                <path d={d} fill="none" stroke={GAUGE_COLORS[l]} strokeWidth={stroke} opacity={isActive ? 1 : 0.28} />
              </g>
            )
          })}
        </svg>

        <motion.div
          className="absolute inset-0"
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: angle, opacity: 1 }}
          transition={{ delay, type: "spring", stiffness: 120, damping: 11 }}
        >
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
            <polygon points={`${left.x},${left.y} ${tip.x},${tip.y} ${right.x},${right.y}`} fill={color} />
            <circle cx={cx} cy={cy} r={3.5} fill={color} />
            <circle cx={cx} cy={cy} r={1.4} fill="#0a0a16" />
          </svg>
        </motion.div>
      </div>

      <span className="mt-0.5 text-[9px] font-black uppercase tracking-wide" style={{ color }}>
        {zone}
      </span>
    </div>
  )
}

// ─── Phase: Scanning ──────────────────────────────────────────────────────────

const BLIPS = [
  { top: "26%", left: "64%", delay: 0.2,  tag: "SOL"  },
  { top: "60%", left: "34%", delay: 0.9,  tag: "NVDA" },
  { top: "38%", left: "20%", delay: 1.5,  tag: "DOGE" },
  { top: "70%", left: "66%", delay: 0.55, tag: "TSLA" },
  { top: "18%", left: "38%", delay: 1.15, tag: "AVAX" },
]

function ScanningPhase() {
  const steps = ["Pulling live market movers", "Cross-referencing volume & momentum", "Ranking highest-potential setups"]
  const live = useContext(DemoLiveContext)

  return (
    <motion.div
      key="scanning"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-3"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-600">Crypto · Stocks</span>
        <motion.div
          {...demoLoop(live, { opacity: [0.5, 1, 0.5] }, { opacity: 1 }, { duration: 1.3, repeat: Infinity })}
          className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] text-purple-400"
        >
          <span className="inline-block size-1.5 rounded-full bg-purple-400" />
          Scanning...
        </motion.div>
      </div>

      {/* Radar */}
      <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#08080f]">
        <div className="relative size-40">
          {[1, 0.68, 0.36].map((scale) => (
            <div
              key={scale}
              className="absolute inset-0 rounded-full border border-purple-500/20"
              style={{ transform: `scale(${scale})` }}
            />
          ))}

          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "conic-gradient(from 0deg, rgba(168,85,247,0) 0deg, rgba(168,85,247,0) 260deg, rgba(168,85,247,0.55) 340deg, rgba(168,85,247,0.9) 360deg)",
            }}
            {...demoLoop(live, { rotate: 360 }, { rotate: 0 }, { duration: 2.4, repeat: Infinity, ease: "linear" })}
          />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-9 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10">
              <Flame className="size-4 text-purple-400" />
            </div>
          </div>

          {BLIPS.map((b) => (
            <motion.div
              key={b.tag}
              className="absolute flex items-center gap-1"
              style={{ top: b.top, left: b.left }}
              {...demoLoop(live, { opacity: [0, 1, 0] }, { opacity: 0 }, { duration: 1.8, repeat: Infinity, delay: b.delay, ease: "easeInOut" })}
            >
              <span className="size-1.5 rounded-full bg-purple-300" style={{ boxShadow: "0 0 8px 2px rgba(168,85,247,0.6)" }} />
              <span className="font-mono text-[9px] font-semibold text-purple-200/80">{b.tag}</span>
            </motion.div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-[#08080f] to-transparent" />
      </div>

      {/* Step indicators */}
      <div className="space-y-1.5 pt-1">
        {steps.map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.55, duration: 0.35 }}
            className="flex items-center gap-2.5 text-xs text-gray-500"
          >
            <motion.span
              {...demoLoop(live, { opacity: [0.3, 1, 0.3] }, { opacity: 1 }, { duration: 1.3, repeat: Infinity, delay: i * 0.3 })}
              className="inline-block size-1.5 shrink-0 rounded-full bg-purple-400"
            />
            {text}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Phase: Results ───────────────────────────────────────────────────────────

function TickerRow({ t, i }: { t: DemoTicker; i: number }) {
  const theme = DIRECTION_THEME[t.direction]
  const up = t.change > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.15 + i * 0.12, type: "spring", stiffness: 210, damping: 22 }}
      className={cn("relative overflow-hidden rounded-xl border bg-[#0a0a16] px-4 py-3", theme.border)}
    >
      <div className={cn("pointer-events-none absolute inset-0", theme.panel)} />
      <div className={cn("pointer-events-none absolute -right-10 -top-10 size-28 rounded-full blur-2xl", theme.blob)} />
      <span className={cn("absolute inset-y-0 left-0 w-1 opacity-70", theme.edge)} />

      <div className="relative flex items-center gap-3 pl-1">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black tracking-tight text-white">{t.symbol}</span>
            <span className={cn("text-[10px] font-black uppercase tracking-wide", theme.text)}>{t.direction}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-mono text-xs text-gray-300">{t.price}</span>
            <span
              className={cn(
                "flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold",
                up ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400",
              )}
            >
              {up ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
              {Math.abs(t.change).toFixed(2)}%
            </span>
          </div>
        </div>

        <MiniGauge zone={t.zone} delay={0.35 + i * 0.12} />
      </div>
    </motion.div>
  )
}

function ResultsPhase({ market }: { market: "crypto" | "stocks" }) {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-3"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.35 }}
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400"
        >
          <Check className="size-3" />
          Hot right now
        </motion.div>

        {/* Market toggle */}
        <div className="flex items-center rounded-full border border-white/15 bg-white/[0.03] p-0.5">
          {(["crypto", "stocks"] as const).map((m) => (
            <div key={m} className="relative px-2.5 py-0.5 text-[11px] font-medium capitalize">
              {market === m && (
                <motion.span
                  layoutId="screener-preview-tab"
                  className="absolute inset-0 rounded-full bg-purple-500/20"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className={cn("relative", market === m ? "text-purple-300" : "text-gray-600")}>{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Ranked picks */}
      <AnimatePresence mode="wait">
        <motion.div
          key={market}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="space-y-2.5"
        >
          {DEMO_PICKS[market].map((t, i) => (
            <TickerRow key={t.symbol} t={t} i={i} />
          ))}
        </motion.div>
      </AnimatePresence>

      <p className="pt-1 text-center text-[10px] text-gray-600">
        Top 5 crypto & top 5 stocks each scan · prices verified live
      </p>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AiScreenerPreview() {
  const [phase, setPhase] = useState<Phase>("scanning")
  const sectionRef = useRef<HTMLElement>(null)
  const live = useDemoLive(sectionRef)

  // Each phase schedules the next; off screen the cycle holds where it is
  useEffect(() => {
    if (!live) return
    const timer = setTimeout(
      () => setPhase(PHASE_ORDER[(PHASE_ORDER.indexOf(phase) + 1) % PHASE_ORDER.length]),
      PHASE_DURATION[phase],
    )
    return () => clearTimeout(timer)
  }, [live, phase])

  return (
    <section ref={sectionRef} className="relative bg-black pb-20 pt-3 md:pb-28 md:pt-4">
      <div className="mx-auto max-w-7xl px-6">
        {/* Outer card */}
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/25 bg-[#070712] shadow-2xl shadow-black/60">
          <BackgroundGradientAnimation variant="corners" size="45%" containerClassName="absolute inset-0 z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left: animated preview ── */}
            <div className="order-2 flex items-center justify-center border-t border-white/15 bg-gradient-to-br from-[#0b0b1e] to-[#050510] p-8 lg:order-1 lg:border-l-0 lg:border-r lg:border-t-0 lg:p-12">
              <div className="flex h-[400px] w-full max-w-sm flex-col justify-center overflow-hidden lg:h-auto lg:overflow-visible">
                <DemoLiveContext.Provider value={live}>
                  <AnimatePresence mode="wait">
                    {phase === "scanning"
                      ? <ScanningPhase key="scanning" />
                      : <ResultsPhase key="results" market={phase} />}
                  </AnimatePresence>
                </DemoLiveContext.Provider>
              </div>
            </div>

            {/* ── Right: copy ── */}
            <div className="order-1 flex flex-col justify-center p-8 lg:order-2 lg:p-12 xl:p-16">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[11px] font-medium text-purple-400">
                <Flame className="size-3" />
                AI Screener
              </div>

              {/* Headline */}
              <h2 className="mt-6 text-3xl font-black tracking-tight text-white lg:text-4xl xl:text-[2.6rem] xl:leading-[1.18]">
                Find what&apos;s moving{" "}
                <span className="text-purple-400">before you open a chart</span>
              </h2>

              {/* Body copy */}
              <p className="mt-5 text-base leading-relaxed text-gray-400">
                One click scans live crypto and stock movers, weighs volume and
                momentum, and ranks the hottest setups. Each one gets a
                clear bullish, bearish, or watch call.
              </p>

              {/* Feature bullets */}
              <ul className="mt-8 space-y-3">
                {[
                  "Top 5 crypto & top 5 stocks every scan",
                  "Live prices verified before every pick",
                  "Signal gauge from Strong Sell to Strong Buy",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                      <Check className="size-3 text-purple-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-10">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-900/50"
                >
                  Get Started
                  <Flame className="size-4" />
                </a>
                <p className="mt-3 text-xs text-gray-600">
                  Free on every plan · Live now in your dashboard
                </p>
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
