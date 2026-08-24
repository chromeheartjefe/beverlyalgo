"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Check, CloudUpload, TrendingUp, Zap } from "lucide-react"
import { useEffect, useState } from "react"

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Reveal } from "@/components/ui/reveal"

// ─── Types & constants ────────────────────────────────────────────────────────

type Phase = "upload" | "analyzing" | "results"

const PHASE_ORDER: Phase[] = ["upload", "analyzing", "results"]

const PHASE_DURATION: Record<Phase, number> = {
  upload: 3000,
  analyzing: 3400,
  results: 5200,
}

const RESULT_ROWS = [
  { label: "Entry",       value: "$68,420", accent: "text-gray-200" },
  { label: "Take Profit", value: "$78,500", accent: "text-emerald-400" },
  { label: "Stop Loss",   value: "$62,100", accent: "text-red-400" },
  { label: "R:R Ratio",   value: "2.6",     accent: "text-gray-200" },
]

// [x, bodyTop, bodyBottom, wickTop, wickBottom, isGreen]
type Candle = [number, number, number, number, number, boolean]
const CANDLES: Candle[] = [
  [12,  108, 120, 104, 125, false],
  [32,   96, 108,  92, 113, false],
  [52,   85,  96,  81, 100, true ],
  [72,   75,  87,  71,  92, true ],
  [92,   72,  82,  68,  87, false],
  [112,  60,  70,  56,  75, true ],
  [132,  50,  60,  46,  65, true ],
  [152,  42,  52,  38,  57, true ],
  [172,  45,  53,  41,  58, false],
  [192,  30,  43,  26,  48, true ],
  [212,  20,  30,  16,  35, true ],
  [232,  18,  28,  14,  33, false],
  [252,   8,  18,   4,  23, true ],
  [272,   2,  12,   0,  17, true ],
]

// ─── Chart SVG ────────────────────────────────────────────────────────────────

function ChartSVG({ dimmed = false }: { dimmed?: boolean }) {
  return (
    <svg
      viewBox="0 0 290 135"
      className="h-full w-full"
      style={{ opacity: dimmed ? 0.35 : 1 }}
    >
      {/* Horizontal grid lines */}
      {[25, 50, 75, 100, 125].map((y) => (
        <line
          key={y} x1={0} y1={y} x2={290} y2={y}
          stroke="rgba(255,255,255,0.04)" strokeWidth={1}
        />
      ))}

      {/* TP dashed line */}
      <line x1={0} y1={5}   x2={265} y2={5}   stroke="rgba(52,211,153,0.45)"  strokeWidth={1} strokeDasharray="5 4" />
      {/* Entry dashed line */}
      <line x1={0} y1={45}  x2={265} y2={45}  stroke="rgba(251,191,36,0.40)"  strokeWidth={1} strokeDasharray="5 4" />
      {/* SL dashed line */}
      <line x1={0} y1={115} x2={265} y2={115} stroke="rgba(248,113,113,0.40)" strokeWidth={1} strokeDasharray="5 4" />

      {/* Level labels */}
      <text x={278} y={8}   fill="rgba(52,211,153,0.75)"  fontSize={7} textAnchor="middle" fontFamily="monospace">TP</text>
      <text x={280} y={49}  fill="rgba(251,191,36,0.70)"  fontSize={6} textAnchor="middle" fontFamily="monospace">ENTRY</text>
      <text x={278} y={118} fill="rgba(248,113,113,0.70)" fontSize={7} textAnchor="middle" fontFamily="monospace">SL</text>

      {/* Candlesticks */}
      {CANDLES.map(([x, bodyTop, bodyBottom, wickTop, wickBottom, isGreen]) => {
        const color = isGreen ? "#34d399" : "#f87171"
        return (
          <g key={x}>
            <line x1={x + 5} y1={wickTop} x2={x + 5} y2={wickBottom} stroke={color} strokeWidth={1.5} />
            <rect x={x} y={bodyTop} width={10} height={bodyBottom - bodyTop} fill={color} fillOpacity={0.9} rx={1} />
          </g>
        )
      })}
    </svg>
  )
}

// ─── Phase: Upload ────────────────────────────────────────────────────────────

function UploadPhase() {
  return (
    <motion.div
      key="upload"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.45 }}
      className="relative flex h-72 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/12 bg-white/[0.012]"
    >
      {/* Corner accents */}
      <div className="pointer-events-none absolute left-0 top-0 h-9 w-9 rounded-tl-2xl border-l-2 border-t-2 border-purple-400/60" />
      <div className="pointer-events-none absolute right-0 top-0 h-9 w-9 rounded-tr-2xl border-r-2 border-t-2 border-purple-400/60" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-9 w-9 rounded-bl-2xl border-b-2 border-l-2 border-purple-400/60" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-9 w-9 rounded-br-2xl border-b-2 border-r-2 border-purple-400/60" />

      {/* Ambient glow */}
      <motion.div
        animate={{ opacity: [0.2, 0.55, 0.2] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.09) 0%, transparent 68%)" }}
      />

      {/* Icon */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="flex size-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10"
      >
        <CloudUpload className="size-7 text-purple-400" />
      </motion.div>

      <p className="mt-4 text-sm font-semibold text-gray-300">Drop your chart here</p>
      <p className="mt-1 text-xs text-gray-600">PNG, JPG — any timeframe</p>
    </motion.div>
  )
}

// ─── Phase: Analyzing ─────────────────────────────────────────────────────────

function AnalyzingPhase() {
  const steps = ["Detecting chart patterns", "Identifying key levels", "Calculating risk/reward"]

  return (
    <motion.div
      key="analyzing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full space-y-3"
    >
      {/* Header row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-600">BTC/USDT · 4H</span>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] text-purple-400"
        >
          <span className="inline-block size-1.5 rounded-full bg-purple-400" />
          Analyzing...
        </motion.div>
      </div>

      {/* Chart with scan line */}
      <div className="relative h-48 w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#08080f]">
        <ChartSVG dimmed />

        {/* Horizontal scan line */}
        <motion.div
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-x-0 z-10 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.85) 50%, transparent 100%)",
            boxShadow: "0 0 18px 7px rgba(168,85,247,0.22)",
          }}
        />

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
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.3 }}
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

function ResultsPhase() {
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
        <span className="font-mono text-xs text-gray-600">BTC/USDT · 4H</span>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", bounce: 0.35 }}
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] text-emerald-400"
        >
          <Check className="size-3" />
          Analyzed
        </motion.div>
      </div>

      {/* Chart (full opacity) */}
      <div className="relative h-36 w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#08080f]">
        <ChartSVG />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#08080f] to-transparent" />
      </div>

      {/* AI results card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.45 }}
        className="overflow-hidden rounded-xl border border-white/8 bg-[#0d0d1c]"
      >
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
              <Zap className="size-3 text-purple-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">AI Analysis</p>
              <p className="text-[10px] leading-none text-gray-600">BTC/USDT</p>
            </div>
          </div>

          {/* Signal + confidence */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", bounce: 0.45 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/12 px-2 py-0.5">
              <TrendingUp className="size-3 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">BUY</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-black leading-none text-white">87%</p>
              <p className="text-[9px] leading-tight text-gray-600">Confidence</p>
            </div>
          </motion.div>
        </div>

        {/* Metric rows */}
        <div className="divide-y divide-white/[0.035] px-4">
          {RESULT_ROWS.map(({ label, value, accent }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 + i * 0.12, duration: 0.3 }}
              className="flex items-center justify-between py-2.5"
            >
              <span className="text-xs text-gray-500">{label}</span>
              <span className={`text-xs font-semibold ${accent}`}>{value}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AiChartAnalyserPreview() {
  const [phase, setPhase] = useState<Phase>("upload")

  useEffect(() => {
    // Local ref to avoid stale closures in the cycle
    let current: Phase = "upload"
    let timer: ReturnType<typeof setTimeout>

    const advance = () => {
      const idx = PHASE_ORDER.indexOf(current)
      current = PHASE_ORDER[(idx + 1) % PHASE_ORDER.length]
      setPhase(current)
      timer = setTimeout(advance, PHASE_DURATION[current])
    }

    timer = setTimeout(advance, PHASE_DURATION["upload"])
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative bg-black pb-3 pt-20 md:pb-4 md:pt-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Outer card */}
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#070712] shadow-2xl shadow-black/60">
          <BackgroundGradientAnimation variant="corners" size="45%" containerClassName="absolute inset-0 z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left: copy ── */}
            <div className="flex flex-col justify-center p-8 lg:p-12 xl:p-16">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[11px] font-medium text-purple-400">
                <Zap className="size-3" />
                AI Chart Analysis
              </div>

              {/* Headline */}
              <h2 className="mt-6 text-3xl font-black tracking-tight text-white lg:text-4xl xl:text-[2.6rem] xl:leading-[1.18]">
                Upload your chart for{" "}
                <span className="text-purple-400">instant analysis</span>
              </h2>

              {/* Body copy */}
              <p className="mt-5 text-base leading-relaxed text-gray-400">
                Drag and drop any chart screenshot and get AI-powered entry points,
                targets, and risk levels in seconds.
              </p>

              {/* Feature bullets */}
              <ul className="mt-8 space-y-3">
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
              <div className="mt-10">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-900/50"
                >
                  Get Early Access
                  <TrendingUp className="size-4" />
                </a>
                <p className="mt-3 text-xs text-gray-600">
                  Available in Pro plan · Live now in your dashboard
                </p>
              </div>
            </div>

            {/* ── Right: animated preview ── */}
            <div className="flex items-center justify-center border-t border-white/[0.05] bg-gradient-to-br from-[#0b0b1e] to-[#050510] p-8 lg:border-l lg:border-t-0 lg:p-12">
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
              <div className="w-full max-w-sm">
                <AnimatePresence mode="wait">
                  {phase === "upload"    && <UploadPhase    key="upload" />}
                  {phase === "analyzing" && <AnalyzingPhase key="analyzing" />}
                  {phase === "results"   && <ResultsPhase   key="results" />}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
