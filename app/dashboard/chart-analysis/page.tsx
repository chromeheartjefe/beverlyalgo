"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Activity, ArrowUpRight, Bot, CheckCircle, Clock, CloudUpload, Gift, Lightbulb, Loader2, Minus, Ruler, Sparkles, Tag, TrendingDown, TrendingUp, XCircle, Zap, ZoomIn } from "lucide-react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useCallback, useMemo, useState } from "react"
import useSWR from "swr"

import { FeatureLock } from "@/components/dashboard/feature-lock"
import { Collapse, Loaded } from "@/components/ui/motion"
import { ApiError, requestJson, userMessage } from "@/lib/api-client"
import { fmtPrice, timeAgo } from "@/lib/format"
import type { FreeAnalysisState } from "@/lib/free-analysis"
import { resizeForUpload } from "@/lib/resize-image"
import { fetcher } from "@/lib/swr"
import { useFreeAnalysis } from "@/lib/use-free-analysis"
import { cn } from "@/lib/utils"

// Only rendered once a result exists (never on initial tab-open) — split out
// so its framer-motion-heavy JSX + extra icons aren't in this page's own
// chunk on the common "just open the tab" path.
const ResultsView = dynamic(
  () => import("@/components/dashboard/chart-analysis-results").then((m) => m.ResultsView),
  {
    loading: () => (
      <div role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-gray-600">
        <Loader2 className="size-4 animate-spin" />
        Loading results…
      </div>
    ),
  }
)

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = "idle" | "dragging" | "selected" | "analyzing" | "results"

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 // 5 MB

export type AnalysisResult = {
  signal:          "BUY" | "SELL" | "NEUTRAL"
  confidence:      number
  pair:            string
  timeframe:       string
  entry:           number | null
  tp1:             number | null
  tp2:             number | null
  sl:              number | null
  rrRatio:         number | null
  patterns:        string[]
  structure:       string
  risk:            "Low" | "Moderate" | "High"
  volatility:      "Low" | "Medium" | "High"
  patternStrength: "Low" | "Medium" | "High"
  trendAlignment:  "Weak" | "Moderate" | "Strong"
  // v2 only (optional so admin-only v1 results still render)
  entryType?:      "market" | "limit" | null
  /** NEUTRAL: prices that would turn it into a long / short */
  watch?:          { longAbove: number | null; shortBelow: number | null }
  /** Non-blocking screenshot advice, e.g. Heikin Ashi or covered candles */
  tips?:           string[]
  checks?:         Record<string, boolean>
}

// ─── Recent analyses (DB-backed) ─────────────────────────────────────────────

type RecentEntry = {
  id:         string
  pair:       string
  timeframe:  string
  signal:     "BUY" | "SELL" | "NEUTRAL"
  confidence: number
  entry:      number | null
  ts:         number
}

// Shape of a row from GET /api/analyses (also consumed by the Dashboard
// Overview page's own useSWR call on the same key).
type RawAnalysisRow = {
  id:         string
  pair:       string
  timeframe:  string
  signal:     "BUY" | "SELL" | "NEUTRAL"
  confidence: number
  entry:      number | null
  createdAt:  string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Screenshots go up at ≤1536 px on the longest edge, JPEG 0.92. 768 px used to
// be the cap here, but it crushed the Y-axis on sub-$1 pairs: tightly packed
// 4-decimal labels (e.g. 0.2088/0.2086/0.2084 a few px apart) blurred into
// illegibility, so the model guessed a "plausible" price from training priors
// instead of reading the chart. Wrong entry/SL/TP costs real money here, so
// legibility wins over shaving a bit of image-token cost.
const UPLOAD_MAX_PX = 1536
const UPLOAD_JPEG_QUALITY = 0.92

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({
  phase,
  error,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileSelect,
}: {
  phase: Phase
  error?: string | null
  onDragEnter: () => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onFileSelect: (f: File) => void
}) {
  const isDragging = phase === "dragging"

  return (
    <>
    {/* A <label> reliably opens the native file/photo picker on both Android and
        iOS Safari — more so than a JS-triggered click() on a display:none input,
        which is inconsistent on some iOS versions — and it's keyboard/screen
        reader accessible for free, no extra role/tabIndex plumbing needed. */}
    <label
      htmlFor="chart-upload-input"
      onDragOver={(e) => { e.preventDefault(); onDragEnter() }}
      onDragEnter={(e) => { e.preventDefault(); onDragEnter() }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(e) }}
      className={cn(
        "relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 text-center transition-all duration-200 sm:h-72",
        isDragging
          ? "border-purple-500/60 bg-purple-500/[0.06]"
          : "border-white/15 bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/[0.02]",
      )}
    >
      {/* Corner accents */}
      <div className={cn("pointer-events-none absolute left-0 top-0 h-8 w-8 rounded-tl-2xl border-l-2 border-t-2 transition-colors", isDragging ? "border-purple-400" : "border-purple-400/50")} />
      <div className={cn("pointer-events-none absolute right-0 top-0 h-8 w-8 rounded-tr-2xl border-r-2 border-t-2 transition-colors", isDragging ? "border-purple-400" : "border-purple-400/50")} />
      <div className={cn("pointer-events-none absolute bottom-0 left-0 h-8 w-8 rounded-bl-2xl border-b-2 border-l-2 transition-colors", isDragging ? "border-purple-400" : "border-purple-400/50")} />
      <div className={cn("pointer-events-none absolute bottom-0 right-0 h-8 w-8 rounded-br-2xl border-b-2 border-r-2 transition-colors", isDragging ? "border-purple-400" : "border-purple-400/50")} />

      {isDragging && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.10) 0%, transparent 70%)" }}
        />
      )}

      <motion.div
        animate={isDragging ? { scale: 1.1 } : { y: [0, -5, 0] }}
        transition={isDragging ? { duration: 0.2 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl border transition-colors",
          isDragging ? "border-purple-500/40 bg-purple-500/15" : "border-purple-500/20 bg-purple-500/10",
        )}
      >
        <CloudUpload className="size-7 text-purple-400" />
      </motion.div>

      <p className="mt-4 text-sm font-semibold text-gray-200">
        {isDragging ? "Drop to analyze" : "Tap to upload your chart"}
      </p>
      <p className="mt-1 text-xs text-gray-600">or drag and drop · PNG, JPG, WEBP up to 5 MB</p>

      <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.08]">
        Browse files
      </span>

      <input
        id="chart-upload-input"
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Upload a chart image"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFileSelect(f)
          e.target.value = ""
        }}
      />
    </label>

    <Collapse show={!!error} className="pt-3">
      <p role="alert" className="flex items-center gap-1.5 text-xs text-red-400">
        <XCircle className="size-3.5 shrink-0" />
        {error}
      </p>
    </Collapse>
    </>
  )
}

// ─── Selected (file chosen) ───────────────────────────────────────────────────

function SelectedView({
  filename,
  preview,
  error,
  onAnalyze,
  onReset,
}: {
  filename: string
  preview: string | null
  error: string | null
  onAnalyze: () => void
  onReset: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div className="max-h-80 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.02]">
        {preview && (
          <img src={preview} alt="Selected chart" className="w-full" />
        )}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10">
              <CloudUpload className="size-4 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{filename}</p>
              <p className="text-xs text-gray-600">Ready to analyze</p>
            </div>
          </div>
          <button onClick={onReset} className="text-xs text-gray-600 hover:text-gray-400">
            Remove
          </button>
        </div>
      </div>

      {/* API error banner */}
      <Collapse show={!!error} className="pb-4">
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
          <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </Collapse>

      <button
        onClick={onAnalyze}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition-all hover:from-purple-500 hover:to-purple-400"
      >
        <Zap className="size-4" />
        {error ? "Retry Analysis" : "Analyze Chart"}
      </button>
    </motion.div>
  )
}

// ─── Analyzing ────────────────────────────────────────────────────────────────

function AnalyzingView({ filename }: { filename: string }) {
  const steps = [
    "Detecting chart patterns",
    "Identifying support & resistance levels",
    "Calculating entry and exit points",
    "Assessing risk/reward ratio",
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="inline-block size-2 rounded-full bg-purple-400" />
          {filename}
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="flex items-center gap-1.5 text-xs text-purple-400"
        >
          <Loader2 className="size-3 animate-spin" />
          Analyzing…
        </motion.div>
      </div>

      {/* Chart skeleton + scan line */}
      <div className="relative h-52 overflow-hidden rounded-xl border border-white/15 bg-[#08080f]">
        <svg viewBox="0 0 400 180" className="h-full w-full opacity-15">
          {[
            [20,  100, 118, 95,  123],
            [46,  88,  104, 83,  109],
            [72,  75,  90,  70,  96 ],
            [98,  60,  76,  55,  82 ],
            [124, 62,  75,  57,  80 ],
            [150, 46,  60,  41,  66 ],
            [176, 36,  52,  31,  58 ],
            [202, 28,  44,  23,  50 ],
            [228, 30,  44,  25,  50 ],
            [254, 16,  30,  11,  36 ],
            [280, 10,  24,  5,   30 ],
            [306, 14,  26,  9,   32 ],
            [332, 6,   18,  2,   24 ],
            [358, 2,   14,  0,   20 ],
          ].map(([x, bT, bB, wT, wB]) => (
            <g key={x}>
              <line x1={x + 5} y1={wT} x2={x + 5} y2={wB} stroke="#a855f7" strokeWidth={1.5} />
              <rect x={x} y={bT} width={10} height={bB - bT} fill="#a855f7" rx={1} />
            </g>
          ))}
        </svg>

        <motion.div
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute inset-x-0 z-10 h-px"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(168,85,247,0.9) 50%, transparent 100%)",
            boxShadow: "0 0 20px 8px rgba(168,85,247,0.2)",
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#08080f] to-transparent" />
      </div>

      <div className="space-y-2">
        {steps.map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.65, duration: 0.35 }}
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

// ─── Results (code-split — only ever rendered post-analysis) ─────────────────
// Moved to components/dashboard/chart-analysis-results.tsx and loaded via
// next/dynamic below, so this page's own chunk stays lean for the common
// "just open the tab" path.

// ─── Visual tip cards ─────────────────────────────────────────────────────────

// Same accent language as the landing features grid (hairline, corner glow,
// gradient icon tile). Full class strings only, so Tailwind can see them.
const TIP_ACCENTS = {
  sky: {
    line:    "via-sky-400/70",
    blob:    "bg-sky-500/10 group-hover:bg-sky-500/20",
    border:  "hover:border-sky-400/30",
    tile:    "border-sky-400/30 bg-gradient-to-br from-sky-500/25 to-cyan-600/5",
    icon:    "text-sky-300",
    eyebrow: "text-sky-300/90",
  },
  violet: {
    line:    "via-fuchsia-400/70",
    blob:    "bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20",
    border:  "hover:border-fuchsia-400/30",
    tile:    "border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/5",
    icon:    "text-fuchsia-300",
    eyebrow: "text-fuchsia-300/90",
  },
  emerald: {
    line:    "via-emerald-400/70",
    blob:    "bg-emerald-500/10 group-hover:bg-emerald-500/20",
    border:  "hover:border-emerald-400/30",
    tile:    "border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 to-teal-600/5",
    icon:    "text-emerald-300",
    eyebrow: "text-emerald-300/90",
  },
} as const

function TipCard({ step, accent, icon: Icon, graphic, title, desc }: {
  step: string
  accent: keyof typeof TIP_ACCENTS
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  graphic: React.ReactNode
  title: string
  desc: string
}) {
  const a = TIP_ACCENTS[accent]
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-white/15 bg-[#070712] transition-colors duration-300",
      a.border,
    )}>
      <span className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />
      <div className={cn("pointer-events-none absolute -right-12 -top-14 size-32 rounded-full blur-2xl transition-colors duration-500", a.blob)} />

      <div className="relative flex items-start gap-3 px-3.5 pt-3.5">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", a.tile)}>
          <Icon className={cn("size-4", a.icon)} strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <span className={cn("text-[11px] font-semibold uppercase tracking-[0.18em]", a.eyebrow)}>Tip {step}</span>
          <p className="text-[13px] font-semibold leading-snug text-white">{title}</p>
        </div>
      </div>
      <p className="relative px-3.5 pt-2 text-xs leading-relaxed text-gray-400">{desc}</p>

      <div className="relative mx-3.5 mb-3.5 mt-3 rounded-lg border border-white/15 bg-[#05050f] p-2">
        {graphic}
        {/* Columns line up with the SVG's two 80/168-wide panels */}
        <div className="mt-1.5 grid grid-cols-2 gap-x-[4.8%] text-[11px] font-semibold uppercase tracking-wider">
          <span className="text-red-400/80">Avoid</span>
          <span className="text-emerald-400/90">Do this</span>
        </div>
      </div>
    </div>
  )
}

// ─── Recent analysis cards ────────────────────────────────────────────────────
// Same shell as the tip cards, but the accent follows the signal, not the step.

const SIGNAL_ACCENTS = {
  BUY: {
    icon:  TrendingUp,
    line:  "via-emerald-400/70",
    blob:  "bg-emerald-500/10",
    tile:  "border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 to-teal-600/5 text-emerald-300",
    badge: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
    bar:   "from-emerald-500 to-teal-300",
  },
  SELL: {
    icon:  TrendingDown,
    line:  "via-rose-400/70",
    blob:  "bg-rose-500/10",
    tile:  "border-rose-400/30 bg-gradient-to-br from-rose-500/25 to-red-600/5 text-rose-300",
    badge: "border-rose-400/25 bg-rose-500/10 text-rose-300",
    bar:   "from-rose-500 to-red-300",
  },
  NEUTRAL: {
    icon:  Minus,
    line:  "via-amber-400/70",
    blob:  "bg-amber-500/10",
    tile:  "border-amber-400/30 bg-gradient-to-br from-amber-500/25 to-yellow-600/5 text-amber-300",
    badge: "border-amber-400/25 bg-amber-500/10 text-amber-300",
    bar:   "from-amber-500 to-yellow-300",
  },
} as const

function RecentCard({ r }: { r: RecentEntry }) {
  const a = SIGNAL_ACCENTS[r.signal] ?? SIGNAL_ACCENTS.NEUTRAL
  const Icon = a.icon
  const conf = Math.max(0, Math.min(100, Math.round(r.confidence)))
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/15 bg-[#070712] px-3.5 py-3">
      <span className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />
      <div className={cn("pointer-events-none absolute -right-10 -top-12 size-24 rounded-full blur-2xl", a.blob)} />

      <div className="relative flex items-center gap-3">
        <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", a.tile)}>
          <Icon className="size-4" strokeWidth={1.75} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-white">{r.pair}</span>
            <span className="shrink-0 rounded-md border border-white/15 bg-white/[0.05] px-1.5 py-0.5 text-[11px] font-medium text-gray-400">
              {r.timeframe}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500">
            Entry{" "}
            <span className="font-mono font-medium text-gray-200">{fmtPrice(r.entry)}</span>
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold leading-none tracking-wide", a.badge)}>
            {r.signal}
          </span>
          <span className="text-xs text-gray-500">{timeAgo(r.ts)}</span>
        </div>
      </div>

      {/* Confidence (NEUTRAL is "no trade" and has none) */}
      {r.signal === "NEUTRAL" ? (
        <p className="relative mt-3 text-xs text-amber-200/70">No trade, waiting for a better setup</p>
      ) : (
      <div className="relative mt-3 flex items-center gap-2.5">
        <div
          className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
          role="meter"
          aria-label="Confidence"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={conf}
        >
          <div className={cn("h-full rounded-full bg-gradient-to-r", a.bar)} style={{ width: `${conf}%` }} />
        </div>
        <span className="w-16 text-right text-xs text-gray-500">
          <span className="font-semibold text-gray-300">{conf}%</span> conf.
        </span>
      </div>
      )}
    </div>
  )
}

// [wickTop, bodyTop, bodyBot, wickBot, isBull] — y↓ so smaller y = higher price
type CandleRow = readonly [number, number, number, number, boolean]

// 5-candle uptrend — fits viewBox 168×44, chart area y ≈ 3–38
const ILL: readonly CandleRow[] = [
  [24, 27, 33, 35, false],
  [17, 21, 28, 30, true ],
  [12, 15, 22, 24, true ],
  [ 7, 10, 17, 19, true ],
  [ 3,  6, 13, 15, true ],
]

// Smooth MA bezier through ILL close prices (ox=3, step=8)
const MA_L = "M 4.5,33 C 7,29 10,25 12.5,21 C 15,19 18,17 20.5,15 C 23,13 26,12 28.5,10 C 31,9 34,7 36.5,6"
// Same offset for right panel (ox=91)
const MA_R = "M 92.5,33 C 95,29 98,25 100.5,21 C 103,19 106,17 108.5,15 C 111,13 114,12 116.5,10 C 119,9 122,7 124.5,6"

function PanelGrid({ x, w }: { x: number; w: number }) {
  return (
    <>
      {[12, 22, 32].map(y => (
        <line key={y} x1={x} y1={y} x2={x + w} y2={y}
          stroke="#fff" strokeWidth="0.2" opacity="0.038" />
      ))}
    </>
  )
}

function CandleGroup({ ox, candles = ILL }: { ox: number; candles?: readonly CandleRow[] }) {
  return (
    <>
      {candles.map(([wT, bT, bB, wB, bull], i) => {
        const x = ox + i * 8
        const c = bull ? "#34d399" : "#f87171"
        return (
          <g key={i}>
            <line x1={x + 1.5} y1={wT} x2={x + 1.5} y2={wB} stroke={c} strokeWidth="0.5" opacity="0.6" />
            <rect x={x} y={bT} width="3" height={bB - bT} rx="0.4" fill={c} opacity="0.62" />
          </g>
        )
      })}
    </>
  )
}

// Square ✗/✓ badge — 8×8, symbol centred with SVG text anchors
function BadgeX({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="8" height="8" rx="1.5" fill="none" stroke="#ef4444" strokeWidth="0.4" opacity="0.55" />
      <text x={x + 4} y={y + 4} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill="#ef4444" opacity="0.85">✗</text>
    </>
  )
}
function BadgeOk({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x} y={y} width="8" height="8" rx="1.5" fill="none" stroke="#10b981" strokeWidth="0.4" opacity="0.55" />
      <text x={x + 4} y={y + 4} textAnchor="middle" dominantBaseline="middle" fontSize="5.5" fill="#10b981" opacity="0.85">✓</text>
    </>
  )
}

function TipZoomSVG() {
  return (
    <svg viewBox="0 0 168 44" className="w-full">

      {/* ── ✗ Left: same chart but tiny, barely-legible price numbers ─── */}
      <rect x="0.5" y="0.5" width="79" height="42" rx="3" fill="#07070d" stroke="#ffffff0e" />
      <PanelGrid x={0.5} w={79} />
      <CandleGroup ox={3} />
      <path d={MA_L} fill="none" stroke="#818cf8" strokeWidth="0.65" opacity="0.6" strokeLinecap="round" />
      <line x1="44" y1="3" x2="44" y2="41" stroke="#fff" strokeWidth="0.3" opacity="0.06" />
      {/* Actual numbers, just tiny + dim = unreadable at a glance */}
      <text x="46" y="12" fontSize="3.8" fontWeight="500" fill="#252850" fontFamily="monospace">1,919</text>
      <text x="46" y="22" fontSize="3.8" fontWeight="500" fill="#252850" fontFamily="monospace">1,915</text>
      <text x="46" y="32" fontSize="3.8" fontWeight="500" fill="#252850" fontFamily="monospace">1,911</text>
      <BadgeX x={2} y={2} />

      {/* ── ✓ Right: same chart, numbers large + readable ─── */}
      <rect x="88.5" y="0.5" width="79" height="42" rx="3" fill="#07070d" stroke="#ffffff0e" />
      <PanelGrid x={88.5} w={79} />
      <CandleGroup ox={91} />
      <path d={MA_R} fill="none" stroke="#818cf8" strokeWidth="0.65" opacity="0.6" strokeLinecap="round" />
      <line x1="88.5" y1="6" x2="132" y2="6" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.4" />
      <line x1="132" y1="3" x2="132" y2="41" stroke="#fff" strokeWidth="0.3" opacity="0.06" />
      <line x1="130.5" y1="12" x2="132" y2="12" stroke="#fff" strokeWidth="0.3" opacity="0.18" />
      <line x1="130.5" y1="22" x2="132" y2="22" stroke="#fff" strokeWidth="0.3" opacity="0.18" />
      <line x1="130.5" y1="32" x2="132" y2="32" stroke="#fff" strokeWidth="0.3" opacity="0.18" />
      <text x="134" y="14" fontSize="4.8" fontWeight="600" fill="#7a8494" fontFamily="monospace">1,919</text>
      <text x="134" y="24" fontSize="4.8" fontWeight="600" fill="#7a8494" fontFamily="monospace">1,915</text>
      <text x="134" y="34" fontSize="4.8" fontWeight="600" fill="#7a8494" fontFamily="monospace">1,911</text>
      <rect x="132" y="3.5" width="21" height="5.5" rx="1.2" fill="#ec499920" stroke="#ec499945" strokeWidth="0.35" />
      <text x="142.5" y="6.25" textAnchor="middle" dominantBaseline="middle" fontSize="4.3" fontFamily="monospace" fontWeight="700" fill="#a855f7">1,922</text>
      <BadgeOk x={90.5} y={2} />

    </svg>
  )
}

function TipTickerSVG() {
  // Candles compressed below header (header ends ~y=13.5, candles start at y≥18,
  // bottom stays clear of the panel's y=42.5 border)
  const tickerIll: readonly CandleRow[] = [
    [33.1, 35.3, 39.6, 41.0, false],
    [28.1, 30.9, 36.0, 37.4, true ],
    [24.5, 26.6, 31.7, 33.1, true ],
    [20.9, 23.0, 28.1, 29.5, true ],
    [18.0, 20.2, 25.2, 26.6, true ],
  ]
  return (
    <svg viewBox="0 0 168 44" className="w-full">

      {/* ── ✗ Left: no ticker/timeframe info ─── */}
      <rect x="0.5" y="0.5" width="79" height="42" rx="3" fill="#07070d" stroke="#ffffff0e" />
      <PanelGrid x={0.5} w={79} />
      <CandleGroup ox={3} />
      <path d={MA_L} fill="none" stroke="#818cf8" strokeWidth="0.65" opacity="0.6" strokeLinecap="round" />
      <BadgeX x={2} y={2} />

      {/* ── ✓ Right: header — [✓] ETH/USDT [5m] ─── */}
      <rect x="88.5" y="0.5" width="79" height="42" rx="3" fill="#07070d" stroke="#ffffff0e" />
      {/* Grid drawn before the header so its opaque fill fully covers the gridline
          behind it, instead of the line painting on top of the header chrome */}
      <PanelGrid x={88.5} w={79} />
      {/* Header strip (top corners rounded, bottom squared) */}
      <rect x="88.5" y="0.5" width="79" height="13" rx="3" fill="#0b0b1e" />
      <rect x="88.5" y="10"  width="79" height="3.5" fill="#0b0b1e" />
      <line x1="88.5" y1="13.5" x2="167.5" y2="13.5" stroke="#fff" strokeWidth="0.2" opacity="0.05" />
      {/* ✓ badge first (leftmost), vertically centred in header (header mid = y≈7) */}
      <BadgeOk x={90.5} y={2.5} />
      {/* ETH/USDT after badge */}
      <text x="101" y="6.75" dominantBaseline="middle" fontSize="5.5" fontWeight="700" fill="#c8d0dc">ETH/USDT</text>
      {/* 5m pill — right side of header, vertically centred. dy (em-based) is used
          instead of relying on dominantBaseline="middle" for the vertical centring,
          since that renders "5m" hugging the top of the pill with no descenders to
          balance it. */}
      <rect x="133" y="3" width="14" height="7" rx="1.5" fill="#a855f710" stroke="#a855f728" strokeWidth="0.35" />
      <text x="140" y="6.5" dy="0.35em" textAnchor="middle" fontSize="5" fill="#a855f7">5m</text>
      {/* Candles — start at y≥18, well below header bottom at y=13.5 */}
      <CandleGroup ox={91} candles={tickerIll} />
      <path d="M 92.5,39.6 C 95,36.7 98,33.8 100.5,30.9 C 103,29.5 106,28.1 108.5,26.6 C 111,25.2 114,24.5 116.5,23 C 119,22.3 122,20.9 124.5,20.2"
        fill="none" stroke="#818cf8" strokeWidth="0.65" opacity="0.6" strokeLinecap="round" />

    </svg>
  )
}

function TipPriceAxisSVG() {
  const wide: readonly CandleRow[] = [
    [ 5,  8, 14, 16, true ],
    [10, 13, 19, 21, false],
    [ 8, 11, 17, 19, true ],
    [14, 17, 22, 24, false],
    [12, 15, 20, 22, true ],
    [18, 21, 26, 28, false],
    [16, 19, 24, 26, true ],
    [12, 15, 20, 22, true ],
  ]
  return (
    <svg viewBox="0 0 168 44" className="w-full">

      {/* ── ✗ Left: dense candles, axis scrolled off-screen ─── */}
      <rect x="0.5" y="0.5" width="79" height="42" rx="3" fill="#07070d" stroke="#ffffff0e" />
      <PanelGrid x={0.5} w={79} />
      <CandleGroup ox={2} candles={wide} />
      <path d="M 3.5,8 C 6,12 9,15 11.5,19 C 14,16 17,14 19.5,11 C 22,15 25,18 27.5,22 C 30,20 33,17 35.5,15 C 38,19 41,22 43.5,26 C 46,24 49,21 51.5,19 C 54,18 57,16 59.5,15"
        fill="none" stroke="#818cf8" strokeWidth="0.65" opacity="0.6" strokeLinecap="round" />
      <defs>
        <linearGradient id="priceAxisFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#07070d" stopOpacity="0" />
          <stop offset="100%" stopColor="#07070d" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="51" y="0.5" width="29" height="42" fill="url(#priceAxisFade)" />
      <BadgeX x={2} y={2} />

      {/* ── ✓ Right: visible axis, readable prices ─── */}
      <rect x="88.5" y="0.5" width="79" height="42" rx="3" fill="#07070d" stroke="#ffffff0e" />
      <PanelGrid x={88.5} w={79} />
      <CandleGroup ox={91} />
      <path d={MA_R} fill="none" stroke="#818cf8" strokeWidth="0.65" opacity="0.6" strokeLinecap="round" />
      <line x1="88.5" y1="6" x2="132" y2="6" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.4" />
      <line x1="132" y1="3" x2="132" y2="41" stroke="#fff" strokeWidth="0.3" opacity="0.06" />
      <line x1="130.5" y1="12" x2="132" y2="12" stroke="#fff" strokeWidth="0.3" opacity="0.18" />
      <line x1="130.5" y1="22" x2="132" y2="22" stroke="#fff" strokeWidth="0.3" opacity="0.18" />
      <line x1="130.5" y1="32" x2="132" y2="32" stroke="#fff" strokeWidth="0.3" opacity="0.18" />
      <text x="134" y="14" fontSize="4.8" fontWeight="600" fill="#7a8494" fontFamily="monospace">3,418</text>
      <text x="134" y="24" fontSize="4.8" fontWeight="600" fill="#7a8494" fontFamily="monospace">3,414</text>
      <text x="134" y="34" fontSize="4.8" fontWeight="600" fill="#7a8494" fontFamily="monospace">3,410</text>
      <rect x="132" y="3.5" width="21" height="5.5" rx="1.2" fill="#ec499920" stroke="#ec499945" strokeWidth="0.35" />
      <text x="142.5" y="6.25" textAnchor="middle" dominantBaseline="middle" fontSize="4.3" fontFamily="monospace" fontWeight="700" fill="#a855f7">3,421</text>
      <BadgeOk x={90.5} y={2} />

    </svg>
  )
}

// ─── Admin logic switch ───────────────────────────────────────────────────────
// Picks which lib/chart-analysis variant the API runs, to compare the frozen
// v1 aggressive logic against production v2. GET /api/analyze/variants only
// returns options for admin accounts (and local dev with
// NEXT_PUBLIC_SHOW_DEV_LOGIC_SWITCH=1), and /api/analyze re-checks on the
// server, so everyone else neither sees this nor can use it.
type VariantOption = { id: string; label: string }

function AdminLogicSwitch({ options, value, onChange }: { options: VariantOption[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-8 border-t border-white/15 pt-6">
      <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-amber-400/40 bg-amber-500/[0.06] px-3 py-2">
        <span className="text-xs font-semibold text-amber-300">Admin only</span>
        <span className="text-xs text-amber-200/70">Analysis logic:</span>
        <div className="flex gap-1">
          {options.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => onChange(v.id)}
              aria-pressed={value === v.id}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
                value === v.id ? "bg-amber-400/20 text-amber-100" : "text-amber-200/60 hover:text-amber-100",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Free analysis (Free accounts) ────────────────────────────────────────────
// Free accounts get one analysis (lib/free-analysis.ts). These are the notes
// around it: the offer above the uploader, the lock cards once it's out of
// reach, and the upgrade card under the finished result.

const UPGRADE_BUTTON =
  "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15"

function FreeOfferBanner() {
  return (
    // Same pill as the dashboard's "What's new" banner (announcement-banner.tsx),
    // in green. Centered over the full-width uploader until xl, where the
    // uploader moves into the left column and the pill lines up with it.
    <aside
      aria-label="Free analysis"
      className="mx-auto flex w-fit max-w-full items-center gap-2.5 rounded-full border border-emerald-500/25 bg-gradient-to-r from-emerald-500/[0.12] via-teal-500/[0.05] to-emerald-500/[0.12] py-1 pl-1.5 pr-4 shadow-lg shadow-emerald-950/30 sm:gap-3 xl:mx-0"
    >
      <span className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
        <Gift className="size-3" aria-hidden="true" />
        Free
      </span>
      <p className="min-w-0 truncate py-1 text-xs text-gray-200 sm:text-sm">
        Your first analysis is on us
      </p>
    </aside>
  )
}

function ResendVerification() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "limited">("idle")
  const resend = async () => {
    setStatus("sending")
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" })
      setStatus(res.ok ? "sent" : res.status === 429 ? "limited" : "idle")
    } catch {
      setStatus("idle")
    }
  }
  if (status === "sent") {
    return (
      <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle className="size-3.5" /> Sent. Open the link, then come back to this tab.
      </p>
    )
  }
  if (status === "limited") {
    return <p className="mt-4 text-xs text-amber-300">Resend limit reached. Check your spam folder for the email.</p>
  }
  return (
    <button type="button" onClick={resend} disabled={status === "sending"} className={cn(UPGRADE_BUTTON, "disabled:opacity-60")}>
      {status === "sending" && <Loader2 className="size-3.5 animate-spin" />}
      Resend verification email
    </button>
  )
}

function lockCard(state: FreeAnalysisState | undefined) {
  if (state === "verify") {
    return {
      title: "Verify your email to get a free analysis",
      description: "Free accounts get one AI chart analysis. Confirm your email with the link we sent you to unlock it.",
      action: <ResendVerification />,
    }
  }
  if (state === "used") {
    return {
      title: "You've used your free analysis",
      description: "Upgrade to Pro to keep analyzing your charts, plus the AI Trading Bot and the TradingView indicator.",
    }
  }
  return undefined
}

// Fintech look: faint grid, glow orbs as baked radial gradients (no blur
// filter, see the landing performance work), glowing icon chips and button.
const PRO_PERKS = [
  { icon: Zap,      text: "Chart Analysis",        chip: "bg-purple-500/20 text-purple-200 ring-purple-400/40 shadow-[0_0_18px_-2px_rgba(168,85,247,0.65)]" },
  { icon: Bot,      text: "AI Trading Bot",        chip: "bg-fuchsia-500/20 text-fuchsia-200 ring-fuchsia-400/40 shadow-[0_0_18px_-2px_rgba(217,70,239,0.65)]" },
  { icon: Activity, text: "TradingView indicator", chip: "bg-sky-500/20 text-sky-200 ring-sky-400/40 shadow-[0_0_18px_-2px_rgba(56,189,248,0.6)]" },
]

function FreeUsedUpsell() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-[#0c0a1c] p-5 shadow-[0_0_40px_-12px_rgba(168,85,247,0.45)] sm:p-6">
      {/* Glow orbs, grid and a lit top edge */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(420px_circle_at_100%_0%,rgba(217,70,239,0.22),transparent_60%),radial-gradient(380px_circle_at_0%_100%,rgba(124,58,237,0.22),transparent_60%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_78%)]" />
      <div aria-hidden className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/70 to-transparent" />

      <div className="relative flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/20 ring-1 ring-purple-400/40 shadow-[0_0_20px_-2px_rgba(168,85,247,0.7)]">
          <Sparkles className="size-5 text-purple-100" aria-hidden />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">That was your free analysis</h3>
          <p className="text-xs text-purple-200/70">Keep going with Pro, from $49/month or $299 lifetime</p>
        </div>
      </div>

      <ul className="relative mt-5 grid gap-2.5 sm:grid-cols-3">
        {PRO_PERKS.map(({ icon: Icon, text, chip }) => (
          // Solid fill (not translucent) so the grid doesn't show through
          <li key={text} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#121026] px-3.5 py-3 text-sm font-medium text-white">
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg ring-1", chip)}>
              <Icon className="size-4" aria-hidden />
            </span>
            {text}
          </li>
        ))}
      </ul>

      <Link
        href="/#pricing"
        className="relative mt-5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 text-sm font-semibold text-white shadow-[0_0_28px_-4px_rgba(217,70,239,0.7)] transition-[filter,box-shadow] hover:shadow-[0_0_36px_-4px_rgba(217,70,239,0.9)] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 sm:ml-auto sm:w-fit"
      >
        Upgrade to Pro
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>
    </section>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChartAnalysisPage() {
  const { data: session, status: sessionStatus } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const { state: freeState, setState: setFreeState, refresh: refreshFree } = useFreeAnalysis()
  // Set once this visit's free analysis succeeds: keeps its result on screen
  // (unlocked) with the upgrade card under it, until "Analyze Another"
  const [freeJustUsed, setFreeJustUsed] = useState(false)

  const [phase,    setPhase]    = useState<Phase>("idle")
  const [variant,  setVariant]  = useState("v2")
  const [file,     setFile]     = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [result,   setResult]   = useState<AnalysisResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  // Lock only once the plan is known: while the session loads, a Pro user
  // would otherwise see the "Pro feature" lock flash over their own page.
  // Free accounts stay unlocked while their free analysis is available.
  const freeOffer = freeState === "available"
  const locked = sessionStatus === "authenticated" && plan === "free" && !freeOffer && !(freeJustUsed && phase === "results")
  // Cached via SWR (shared with the Dashboard Overview page's own useSWR call
  // on this same key) so returning to this tab shows the already-fetched
  // analyses instantly instead of flashing back to an empty/loading state.
  const { data: analysesData, isLoading: recentLoading, mutate: mutateAnalyses } = useSWR<RawAnalysisRow[]>("/api/analyses", fetcher)
  // Admin-only logic switch options; empty for everyone else (see AdminLogicSwitch)
  const { data: variantData } = useSWR<{ variants: VariantOption[] }>(
    locked ? null : "/api/analyze/variants",
    fetcher,
    { revalidateOnFocus: false },
  )
  const variantOpts = variantData?.variants ?? []
  const recent: RecentEntry[] = useMemo(
    () =>
      (analysesData ?? []).slice(0, 3).map((r) => ({
        id:         r.id,
        pair:       r.pair,
        timeframe:  r.timeframe,
        signal:     r.signal,
        confidence: r.confidence,
        entry:      r.entry,
        ts:         new Date(r.createdAt).getTime(),
      })),
    [analysesData]
  )

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) {
      setUploadError("Please choose an image file (PNG, JPG, or WEBP).")
      setPhase("idle")
      return
    }
    if (f.size > MAX_UPLOAD_BYTES) {
      setUploadError("That image is over 5 MB — please choose a smaller one.")
      setPhase("idle")
      return
    }
    setUploadError(null)
    setFile(f)
    setApiError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
    setPhase("selected")
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
    else    setPhase("idle")
  }, [handleFile])

  const handleAnalyze = async () => {
    if (!file) return
    setPhase("analyzing")
    setApiError(null)

    try {
      // Downscale client-side before sending, mainly to cap upload size —
      // see resizeForUpload for why the cap itself is 1536 px, not smaller.
      const resized = await resizeForUpload(file, UPLOAD_MAX_PX, UPLOAD_JPEG_QUALITY).catch(() => {
        throw new ApiError("We couldn't read that image file. Please upload a PNG or JPG screenshot.")
      })
      const form = new FormData()
      form.append("image", resized, file.name.replace(/\.[^.]+$/, ".jpg"))
      if (variantOpts.length > 1) form.append("variant", variant)

      const data = await requestJson<{ analysis?: AnalysisResult }>("/api/analyze", { method: "POST", body: form })
      if (!data.analysis?.signal) throw new ApiError("We couldn't complete the analysis. Please try again.")

      const analysis = data.analysis
      setResult(analysis)
      if (freeOffer) {
        setFreeJustUsed(true)
        setFreeState("used")
      }

      // Refetch the saved rows rather than adding a client-made one: its
      // made-up id got swapped for the real one on the next refresh, which the
      // list's enter animation would then play a second time
      void mutateAnalyses()
      setPhase("results")
    } catch (err) {
      setApiError(userMessage(err))
      setPhase("selected")
      // The server says the free analysis is out of reach: show the right card
      if (err instanceof ApiError && err.code?.startsWith("free_")) refreshFree()
    }
  }

  const handleReset = () => {
    setFreeJustUsed(false)
    setPhase("idle")
    setFile(null)
    setPreview(null)
    setResult(null)
    setApiError(null)
    setUploadError(null)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
          <Zap className="size-3" />
          AI Chart Analysis
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">Chart Analyser</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload any chart screenshot for instant AI-powered pattern recognition and entry/exit signals.
        </p>
      </div>

      <Collapse show={freeOffer && phase !== "results"} className="pb-5">
        <FreeOfferBanner />
      </Collapse>

      {/* 2-column layout */}
      <FeatureLock
        locked={locked}
        feature="Chart Analysis"
        card={lockCard(freeState)}
        // Free account whose free-analysis status hasn't loaded yet
        pending={sessionStatus === "authenticated" && plan === "free" && freeState === undefined}
      >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main analyser */}
        <div className="xl:col-span-2">
          {/* Framed from sm up only: on phones the frame was a third nested box
              (page > frame > inner cards), so the content sits on the page */}
          <div className="sm:rounded-2xl sm:border sm:border-white/25 sm:bg-white/[0.025] sm:p-6" aria-busy={phase === "analyzing"}>
            {/* initial={false}: the drop zone is there on first paint, like the rest
                of the page. Its fade-in used to start it invisible (even in the
                server HTML) until the JS ran, so on phones it showed up late.
                Later swaps (preview, results, back) still cross-fade. */}
            <AnimatePresence mode="wait" initial={false}>
              {(phase === "idle" || phase === "dragging") && (
                <motion.div key="dropzone" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <DropZone
                    phase={phase}
                    error={uploadError}
                    onDragEnter={() => setPhase("dragging")}
                    onDragLeave={() => setPhase("idle")}
                    onDrop={handleDrop}
                    onFileSelect={handleFile}
                  />
                </motion.div>
              )}

              {phase === "selected" && (
                <SelectedView
                  key="selected"
                  filename={file?.name ?? ""}
                  preview={preview}
                  error={apiError}
                  onAnalyze={handleAnalyze}
                  onReset={handleReset}
                />
              )}

              {phase === "analyzing" && (
                <AnalyzingView key="analyzing" filename={file?.name ?? ""} />
              )}

              {phase === "results" && result && (
                <ResultsView
                  key="results"
                  preview={preview}
                  filename={file?.name ?? ""}
                  result={result}
                  onReset={handleReset}
                  footer={freeJustUsed ? <FreeUsedUpsell /> : undefined}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="sm:rounded-2xl sm:border sm:border-white/25 sm:bg-white/[0.025] sm:p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg border border-sky-400/30 bg-gradient-to-br from-sky-500/25 to-cyan-600/5">
                <Clock className="size-4 text-sky-300" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Recent Analyses</h2>
                <p className="text-xs text-gray-500">Your latest AI signals.</p>
              </div>
            </div>

            <Loaded
              loading={recentLoading}
              fallback={
              <div className="space-y-2.5" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-xl border border-white/15 bg-[#070712] px-3.5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 shrink-0 animate-pulse rounded-lg bg-white/[0.06]" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-20 animate-pulse rounded bg-white/[0.06]" />
                        <div className="h-3 w-28 animate-pulse rounded bg-white/[0.04]" />
                      </div>
                      <div className="h-4 w-10 animate-pulse rounded-full bg-white/[0.06]" />
                    </div>
                    <div className="mt-3 h-1 w-full animate-pulse rounded-full bg-white/[0.04]" />
                  </div>
                ))}
              </div>
              }
            >
            {recent.length === 0 ? (
              <div className="relative flex flex-col items-center gap-2 overflow-hidden rounded-xl border border-dashed border-white/20 bg-[#070712] py-7 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl border border-sky-400/20 bg-gradient-to-br from-sky-500/15 to-cyan-600/5">
                  <Clock className="size-4 text-sky-300/80" strokeWidth={1.75} />
                </div>
                <p className="text-xs font-medium text-gray-400">No recent analyses yet.</p>
                <p className="text-xs text-gray-600">Your results will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* A new analysis slides in on top, the others move down */}
                <AnimatePresence initial={false}>
                  {recent.map((r) => (
                    <motion.div
                      key={r.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <RecentCard r={r} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
            </Loaded>
          </div>

          <div className="sm:rounded-2xl sm:border sm:border-white/25 sm:bg-white/[0.025] sm:p-5">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg border border-purple-400/30 bg-gradient-to-br from-purple-500/25 to-fuchsia-600/5">
                <Lightbulb className="size-4 text-purple-300" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Tips for best results</h2>
                <p className="text-xs text-gray-500">Sharper screenshots, more accurate levels.</p>
              </div>
            </div>
            <div className="space-y-3">
              <TipCard
                step="01"
                accent="sky"
                icon={ZoomIn}
                graphic={<TipZoomSVG />}
                title="Zoom price text to 125%+"
                desc="Press Ctrl+= in TradingView until price numbers are clearly legible."
              />
              <TipCard
                step="02"
                accent="violet"
                icon={Tag}
                graphic={<TipTickerSVG />}
                title="Show ticker name & timeframe"
                desc="Make sure the pair (e.g. ETH/USDT) and timeframe (5m, 1H…) labels are visible."
              />
              <TipCard
                step="03"
                accent="emerald"
                icon={Ruler}
                graphic={<TipPriceAxisSVG />}
                title="Keep price axis on screen"
                desc="Don't scroll the Y-axis off screen. Price numbers let the AI calculate exact levels."
              />
            </div>
          </div>
        </div>
      </div>
      </FeatureLock>

      {variantOpts.length > 1 && (
        <AdminLogicSwitch options={variantOpts} value={variant} onChange={setVariant} />
      )}
    </div>
  )
}
