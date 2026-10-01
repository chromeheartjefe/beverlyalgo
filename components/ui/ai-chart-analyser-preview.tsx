"use client"

import { AnimatePresence, motion, MotionConfig } from "framer-motion"
import { Check, CloudUpload, Layers, Loader2, MousePointer2, Scale, ScanSearch, ShieldAlert, Target, TrendingUp, Zap } from "lucide-react"
import { useContext, useEffect, useRef, useState } from "react"

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { DemoLiveContext, demoLoop, useDemoLive } from "@/components/ui/demo-live"
import { Reveal } from "@/components/ui/reveal"
import { cn } from "@/lib/utils"

// ─── Types & constants ────────────────────────────────────────────────────────
// The demo mirrors the real Chart Analysis tab: its drop zone, its analysing
// view and the Signal hero card from components/dashboard/chart-analysis-results.tsx
// (same pills, gradient signal tile, butt-cap confidence ring, stat tiles and
// pattern chips), shrunk to phone width.

type Phase = "upload" | "analyzing" | "results"

const PHASE_ORDER: Phase[] = ["upload", "analyzing", "results"]

const PHASE_DURATION: Record<Phase, number> = {
  upload: 3400,
  analyzing: 3600,
  results: 5600,
}

const FILE_NAME = "btc_4h.png"

const STEPS = [
  "Detecting chart patterns",
  "Finding support and resistance",
  "Calculating entry and exits",
  "Checking risk to reward",
]
const STEP_MS = 760

// Risk 2,240 per coin. TP1 is 2R and TP2 3R, and R:R uses TP1 like the real
// analyser (lib/chart-analysis/v2.ts): (72,900 - 68,420) / (68,420 - 66,180) = 2
const STATS = [
  { l: "Entry",         v: "$68,420", Icon: Target,      tint: "text-gray-100" },
  { l: "TP1",           v: "$72,900", Icon: TrendingUp,  tint: "text-emerald-400" },
  { l: "TP2",           v: "$75,140", Icon: TrendingUp,  tint: "text-emerald-400" },
  { l: "Stop Loss",     v: "$66,180", Icon: ShieldAlert, tint: "text-red-400" },
  // 1:2 is the "excellent" tier in lib/risk-reward.ts
  { l: "Risk : Reward", v: "1:2",     Icon: Scale,       tint: "text-emerald-400" },
]
// Every price is fitted to the longest value, like the real tiles
const FIT = `${(100 / (Math.max(...STATS.map((s) => s.v.length)) * 0.64)).toFixed(2)}cqi`

const CONFIDENCE = 87

// BTC 4H story the analysis reads: a sell-off sweeps the 66,600 low, price
// rallies, the last down candle before the impulse becomes the order block
// (68,250-68,750), the impulse breaks the 69,400 high (BOS), and price is now
// retesting the order block, which is where the 68,420 entry sits.
type Ohlc = [open: number, high: number, low: number, close: number]
const OHLC: Ohlc[] = [
  [69200, 69400, 68950, 69050],
  [69050, 69350, 68800, 69300],
  [69300, 69350, 68600, 68700],
  [68700, 68850, 68100, 68200],
  [68200, 68450, 67700, 67800],
  [67800, 68000, 67200, 67350],
  [67350, 67500, 66600, 66900],
  [66900, 67600, 66800, 67500],
  [67500, 68200, 67400, 68100],
  [68100, 68700, 68000, 68600],
  [68600, 68750, 68250, 68350], // order block
  [68350, 69100, 68300, 69000],
  [69000, 69800, 68950, 69700], // breaks 69,400
  [69700, 70500, 69600, 70350],
  [70350, 70700, 70000, 70100],
  [70100, 70250, 69500, 69600],
  [69600, 69900, 69200, 69350],
  [69350, 69500, 68800, 68900],
  [68900, 69100, 68400, 68550], // taps the order block
  [68550, 68950, 68380, 68850],
]
const OB_INDEX = 10
const BOS_PRICE = 69400

// Chart geometry (viewBox units): candles on the left, price axis on the right
const VB = { w: 300, h: 150 }
const PLOT_W = 246
const STEP = PLOT_W / (OHLC.length + 1.5)
const BODY_W = STEP * 0.62
const P_TOP = 73400
const P_BOTTOM = 65800
const py = (p: number) => 6 + ((P_TOP - p) / (P_TOP - P_BOTTOM)) * (VB.h - 12)
const cx = (i: number) => STEP * (i + 1)

const UP = "#34d399"
const DOWN = "#f87171"

const LEVELS = [
  { price: 72900, label: "TP1",   line: "rgba(52,211,153,0.6)",   tag: "#059669" },
  { price: 68420, label: "ENTRY", line: "rgba(251,191,36,0.6)",   tag: "#b45309" },
  { price: 66180, label: "SL",    line: "rgba(248,113,113,0.6)",  tag: "#b91c1c" },
]
const AXIS_PRICES = [73000, 71000, 69000, 67000]
const fmtPrice = (p: number) => p.toLocaleString("en-US")

function Candles({ wick = 1 }: { wick?: number }) {
  return (
    <>
      {OHLC.map(([o, h, l, c], i) => {
        const color = c >= o ? UP : DOWN
        const top = py(Math.max(o, c))
        return (
          <g key={i}>
            <line x1={cx(i)} y1={py(h)} x2={cx(i)} y2={py(l)} stroke={color} strokeWidth={wick} />
            <rect x={cx(i) - BODY_W / 2} y={top} width={BODY_W} height={Math.max(1, py(Math.min(o, c)) - top)} fill={color} />
          </g>
        )
      })}
    </>
  )
}

// ─── Chart SVG ────────────────────────────────────────────────────────────────
// TradingView-style: faint grid and a price axis, then the analysis overlays
// (order block zone, BOS line, TP1 / entry / SL lines with axis price tags)
// draw in once the analyser has "found" them.

function ChartSVG({ showLevels }: { showLevels: boolean }) {
  const reveal = (i: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: showLevels ? 1 : 0 },
    transition: { duration: 0.35, delay: showLevels ? i * 0.12 : 0 },
  })
  const obLeft = cx(OB_INDEX) - BODY_W / 2
  const obTop = py(OHLC[OB_INDEX][1])
  const obBottom = py(OHLC[OB_INDEX][2])

  return (
    <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="h-full w-full" aria-hidden="true">
      {/* Grid and axis */}
      {AXIS_PRICES.map((p) => (
        <g key={p}>
          <line x1={0} y1={py(p)} x2={PLOT_W} y2={py(p)} stroke="rgba(255,255,255,0.05)" strokeWidth={0.6} />
          <text x={VB.w - 3} y={py(p) + 2.5} fill="rgba(255,255,255,0.3)" fontSize={7} textAnchor="end" fontFamily="ui-monospace, monospace">
            {fmtPrice(p)}
          </text>
        </g>
      ))}
      {[5, 10, 15].map((i) => (
        <line key={i} x1={cx(i)} y1={0} x2={cx(i)} y2={VB.h} stroke="rgba(255,255,255,0.03)" strokeWidth={0.6} />
      ))}
      <line x1={PLOT_W} y1={0} x2={PLOT_W} y2={VB.h} stroke="rgba(255,255,255,0.08)" strokeWidth={0.6} />

      {/* Order block zone, behind the candles */}
      <motion.g {...reveal(0)}>
        <rect
          x={obLeft}
          y={obTop}
          width={PLOT_W - obLeft}
          height={obBottom - obTop}
          fill="rgba(217,70,239,0.14)"
          stroke="rgba(232,121,249,0.45)"
          strokeWidth={0.6}
        />
        <text x={PLOT_W - 2} y={obBottom - 2} fill="rgba(240,171,252,0.9)" fontSize={6} fontWeight={700} textAnchor="end" fontFamily="ui-sans-serif, sans-serif">
          OB
        </text>
      </motion.g>

      <Candles />

      {/* Break of structure */}
      <motion.g {...reveal(1)}>
        <line x1={cx(0)} y1={py(BOS_PRICE)} x2={cx(12)} y2={py(BOS_PRICE)} stroke="rgba(255,255,255,0.45)" strokeWidth={0.6} strokeDasharray="2 2" />
        <text x={(cx(5) + cx(9)) / 2} y={py(BOS_PRICE) - 2.5} fill="rgba(255,255,255,0.6)" fontSize={6} fontWeight={700} textAnchor="middle" fontFamily="ui-sans-serif, sans-serif">
          BOS
        </text>
      </motion.g>

      {/* Trade levels with axis price tags */}
      {LEVELS.map((lv, i) => (
        <motion.g key={lv.label} {...reveal(i + 2)}>
          <line x1={0} y1={py(lv.price)} x2={PLOT_W} y2={py(lv.price)} stroke={lv.line} strokeWidth={0.8} strokeDasharray="4 3" />
          <text x={3} y={py(lv.price) - 2.5} fill={lv.line} fontSize={6} fontWeight={700} fontFamily="ui-sans-serif, sans-serif">
            {lv.label}
          </text>
          <rect x={PLOT_W + 1} y={py(lv.price) - 5} width={VB.w - PLOT_W - 1} height={10} rx={1.5} fill={lv.tag} />
          <text x={VB.w - 3} y={py(lv.price) + 2.5} fill="#fff" fontSize={7} fontWeight={700} textAnchor="end" fontFamily="ui-monospace, monospace">
            {fmtPrice(lv.price)}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}

// ─── Phase: Upload ────────────────────────────────────────────────────────────
// Same drop zone as the real tab. A chart file is dragged in by a cursor, the
// zone lights up ("Drop to analyze") and the file drops into it.

const DRAG_AT = 1500

function UploadPhase() {
  const live = useContext(DemoLiveContext)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    if (!live) return
    const t = setTimeout(() => setDragging(true), DRAG_AT)
    return () => clearTimeout(t)
  }, [live])

  const corner = cn("pointer-events-none absolute h-8 w-8 transition-colors duration-300", dragging ? "border-purple-400" : "border-purple-400/50")

  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35 }}
      className={cn(
        "relative flex h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-colors duration-300",
        dragging ? "border-purple-500/60 bg-purple-500/[0.06]" : "border-white/15 bg-white/[0.02]",
      )}
    >
      <div className={cn(corner, "left-0 top-0 rounded-tl-2xl border-l-2 border-t-2")} />
      <div className={cn(corner, "right-0 top-0 rounded-tr-2xl border-r-2 border-t-2")} />
      <div className={cn(corner, "bottom-0 left-0 rounded-bl-2xl border-b-2 border-l-2")} />
      <div className={cn(corner, "bottom-0 right-0 rounded-br-2xl border-b-2 border-r-2")} />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.14) 0%, transparent 70%)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: dragging ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      <motion.div
        {...(dragging
          ? { animate: { scale: 1.1, y: 0 }, transition: { duration: 0.2 } }
          : demoLoop(live, { y: [0, -5, 0] }, { y: 0 }, { duration: 2.2, repeat: Infinity, ease: "easeInOut" }))}
        className={cn(
          "relative flex size-16 items-center justify-center rounded-2xl border transition-colors duration-300",
          dragging ? "border-purple-500/40 bg-purple-500/15" : "border-purple-500/20 bg-purple-500/10",
        )}
      >
        <CloudUpload className="size-7 text-purple-400" />
      </motion.div>

      <p className="relative mt-4 text-sm font-semibold text-gray-200">{dragging ? "Drop to analyze" : "Tap to upload your chart"}</p>
      <p className="relative mt-1 text-xs text-gray-600">or drag and drop · PNG, JPG, WEBP up to 5 MB</p>
      <span className="relative mt-5 inline-flex items-center rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-gray-300">
        Browse files
      </span>

      {/* The file being dragged in: flies in from the top right, hovers over
          the zone, then drops into it and fades */}
      {live && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -ml-[68px] -mt-[52px] w-[136px] rounded-lg border border-white/25 bg-[#0d0d1c] p-1.5 shadow-2xl shadow-black/70"
          initial={{ opacity: 0, x: 120, y: -120, rotate: 10 }}
          animate={{ opacity: [0, 1, 1, 0], x: [120, 4, 0, 0], y: [-120, -8, 0, 22], rotate: [10, -4, -2, 0], scale: [1, 1, 1, 0.55] }}
          transition={{ duration: 2.3, times: [0, 0.48, 0.72, 1], delay: 0.45, ease: "easeInOut" }}
        >
          <div className="h-14 overflow-hidden rounded-md bg-[#08080f]">
            <svg viewBox={`0 0 ${PLOT_W} ${VB.h}`} className="h-full w-full" preserveAspectRatio="none">
              <Candles wick={2} />
            </svg>
          </div>
          <p className="mt-1 truncate px-0.5 text-left font-mono text-[10px] text-gray-400">{FILE_NAME}</p>
          <MousePointer2 className="absolute -bottom-3 -right-2 size-5 fill-white text-black" strokeWidth={1.5} />
        </motion.div>
      )}
    </motion.div>
  )
}

// ─── Phase: Analyzing ─────────────────────────────────────────────────────────
// The real analysing view plus visible progress: a bar and steps that tick
// off one by one, with the trade levels drawing onto the chart.

function AnalyzingPhase() {
  const live = useContext(DemoLiveContext)
  const [done, setDone] = useState(0)

  useEffect(() => {
    if (!live || done >= STEPS.length) return
    const t = setTimeout(() => setDone((d) => d + 1), STEP_MS)
    return () => clearTimeout(t)
  }, [live, done])

  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full space-y-3"
    >
      {/* File row */}
      <div className="overflow-hidden rounded-xl border border-white/15 bg-white/[0.03]">
        <div className="flex items-center justify-between px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-xs text-gray-400">
            <span className="inline-block size-2 shrink-0 rounded-full bg-purple-400" />
            <span className="truncate font-mono">{FILE_NAME}</span>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-xs text-purple-400">
            <Loader2 className="size-3 animate-spin" />
            Analyzing…
          </span>
        </div>
        {/* Progress, flat ends */}
        <div className="h-0.5 bg-white/[0.06]">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-purple-600 to-fuchsia-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: done / STEPS.length }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Chart + scan line */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/15 bg-[#08080f] p-1.5">
        <ChartSVG showLevels={done >= 3} />
        <motion.div
          className="pointer-events-none absolute inset-x-0 z-10 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.9) 50%, transparent 100%)",
            boxShadow: "0 0 18px 6px rgba(168,85,247,0.22)",
          }}
          initial={{ top: 0 }}
          {...demoLoop(live, { top: "100%" }, { top: 0 }, { duration: 1.8, repeat: Infinity, ease: "linear" })}
        />
      </div>

      {/* Steps */}
      <ul className="space-y-2">
        {STEPS.map((text, i) => {
          const state = i < done ? "done" : i === done ? "active" : "pending"
          return (
            <li key={text} className="flex items-center gap-2.5 text-xs">
              <span className="flex size-4 shrink-0 items-center justify-center">
                {state === "done" ? (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}
                    className="flex size-4 items-center justify-center rounded-full bg-emerald-500/15"
                  >
                    <Check className="size-2.5 text-emerald-400" strokeWidth={3} />
                  </motion.span>
                ) : state === "active" ? (
                  <motion.span
                    className="size-1.5 rounded-full bg-purple-400"
                    {...demoLoop(live, { opacity: [0.3, 1, 0.3] }, { opacity: 1 }, { duration: 1, repeat: Infinity })}
                  />
                ) : (
                  <span className="size-1.5 rounded-full bg-white/15" />
                )}
              </span>
              <span className={cn("transition-colors duration-300", state === "done" ? "text-gray-300" : state === "active" ? "text-gray-400" : "text-gray-600")}>
                {text}
              </span>
            </li>
          )
        })}
      </ul>
    </motion.div>
  )
}

// ─── Phase: Results ───────────────────────────────────────────────────────────
// A compact copy of the real Signal hero (BUY theme) with the top detected pattern

const RING = { size: 76, stroke: 7 }

function ConfidenceRing() {
  const r = (RING.size - RING.stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div className="relative flex shrink-0 items-center justify-center" style={{ width: RING.size, height: RING.size }}>
      <svg width={RING.size} height={RING.size} viewBox={`0 0 ${RING.size} ${RING.size}`} className="-rotate-90" aria-hidden="true">
        <circle cx={RING.size / 2} cy={RING.size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={RING.stroke} />
        <motion.circle
          cx={RING.size / 2}
          cy={RING.size / 2}
          r={r}
          fill="none"
          stroke="#34d399"
          strokeWidth={RING.stroke}
          strokeLinecap="butt"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (CONFIDENCE / 100) * c }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.35 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-black leading-none text-white">{CONFIDENCE}</span>
        <span className="mt-0.5 text-[6.5px] font-semibold uppercase tracking-wide text-gray-500">confidence</span>
      </div>
    </div>
  )
}

function ResultsPhase() {
  return (
    <motion.div
      key="results"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-2.5"
    >
      {/* Signal hero */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#0a0a16] p-4">
        <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full bg-emerald-500/25 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-500/[0.12] via-transparent to-transparent" />

        <div className="relative">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-0.5">
              <Zap className="size-3 text-purple-400" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-purple-300">AI Signal</span>
            </div>
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-medium text-gray-400">BTC/USDT · 4H</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 240, damping: 15 }}
                className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_10px_34px_-10px_rgba(52,211,153,0.6)]"
              >
                <TrendingUp className="size-6 text-white" strokeWidth={2.5} />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.35 }}
                className="text-4xl font-black leading-none tracking-tight text-emerald-400"
              >
                BUY
              </motion.p>
            </div>
            <ConfidenceRing />
          </div>

          {/* Stat tiles: Entry, TP1, TP2 / Stop Loss, Risk : Reward */}
          <div className="mt-3.5 grid grid-cols-6 gap-2">
            {STATS.map(({ l, v, Icon, tint }, i) => (
              <motion.div
                key={l}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 + i * 0.07, duration: 0.3 }}
                className={cn(
                  "@container flex min-w-0 flex-col justify-between gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] p-2.5",
                  i < 3 ? "col-span-2" : "col-span-3",
                )}
              >
                <div className="flex items-center gap-1">
                  <Icon className={cn("size-3 shrink-0", tint)} />
                  <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-gray-500">{l}</span>
                </div>
                <p
                  className={cn("whitespace-nowrap font-black leading-none tabular-nums text-[length:min(var(--fit),15px)]", tint)}
                  style={{ "--fit": FIT } as React.CSSProperties}
                >
                  {v}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Top detected pattern, styled like the Patterns card's primary row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.35 }}
        className="flex items-center gap-2.5 rounded-xl border border-fuchsia-400/25 bg-fuchsia-500/[0.07] px-3 py-2"
      >
        <Layers className="size-3.5 shrink-0 text-fuchsia-300" />
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-white">Bullish order block retest</span>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-fuchsia-400/25 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-300">
          <span className="size-1.5 rounded-full bg-fuchsia-400" aria-hidden="true" />
          Smart money
        </span>
      </motion.div>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AiChartAnalyserPreview() {
  const [phase, setPhase] = useState<Phase>("upload")
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
    <section ref={sectionRef} className="relative bg-black pb-3 pt-20 md:pb-4 md:pt-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Outer card */}
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/25 bg-[#070712] shadow-2xl shadow-black/60">
          <BackgroundGradientAnimation variant="corners" size="45%" containerClassName="absolute inset-0 z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left: copy ── */}
            <div className="flex flex-col justify-center px-6 py-6 lg:px-12 lg:py-10">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-medium text-purple-400">
                <Zap className="size-3" />
                AI Chart Analysis
              </div>

              {/* Headline */}
              <h2 className="mt-4 lg:mt-5 text-3xl font-black tracking-tight text-white lg:text-4xl xl:text-[2.6rem] xl:leading-[1.18]">
                Upload your chart for{" "}
                <span className="text-purple-400">instant analysis</span>
              </h2>

              {/* Body copy */}
              <p className="mt-3 lg:mt-4 text-sm leading-relaxed text-gray-400 sm:text-lg">
                Drag and drop any chart screenshot and get AI-powered entry points,
                targets, and risk levels in seconds.
              </p>

              {/* Feature bullets */}
              <ul className="mt-4 hidden space-y-2 sm:block lg:mt-6 lg:space-y-2.5">
                {[
                  "Works with any timeframe",
                  "Auto-detects patterns & trends",
                  "Entry, TP & SL levels instantly",
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
              <div className="mt-5 lg:mt-7">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white sm:text-base shadow-lg shadow-purple-950/40 transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-900/50"
                >
                  Get Started
                  <ScanSearch className="size-4" />
                </a>
              </div>
            </div>

            {/* ── Right: animated preview ── */}
            <div className="flex items-center justify-center border-t border-white/15 bg-gradient-to-br from-[#0b0b1e] to-[#050510] p-4 lg:border-l lg:border-t-0 lg:p-10">
              {/*
               * ─────────────────────────────────────────────────────────────
               * TODO: Replace the animated demo below with your looped video
               * or GIF once it's ready. Swap out the entire <div> wrapper
               * and <AnimatePresence> block with:
               *
               *   <video autoPlay loop muted playsInline className="w-full rounded-2xl">
               *     <source src="/ai-chart-analyser-demo.mp4" type="video/mp4" />
               *   </video>
               *
               * Or for a GIF:
               *   <img
               *     src="/ai-chart-analyser-demo.gif"
               *     alt="AI Chart Analyser demo"
               *     className="w-full rounded-2xl"
               *   />
               * ─────────────────────────────────────────────────────────────
               */}
              <div className="flex h-[340px] w-full max-w-sm max-lg:[zoom:0.85] flex-col justify-center overflow-hidden lg:h-[400px] lg:overflow-visible">
                <DemoLiveContext.Provider value={live}>
                  <MotionConfig reducedMotion="user">
                    <AnimatePresence mode="wait">
                      {phase === "upload"    && <UploadPhase    key="upload" />}
                      {phase === "analyzing" && <AnalyzingPhase key="analyzing" />}
                      {phase === "results"   && <ResultsPhase   key="results" />}
                    </AnimatePresence>
                  </MotionConfig>
                </DemoLiveContext.Provider>
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
