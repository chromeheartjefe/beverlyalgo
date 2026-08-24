"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  Clock,
  CloudUpload,
  Eye,
  Layers,
  Loader2,
  RefreshCcw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { useCallback, useEffect, useState } from "react"

import { FeatureLock } from "@/components/dashboard/feature-lock"
import { cn } from "@/lib/utils"

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

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000)
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtPrice = (n: number | null) =>
  n !== null ? `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "—"

// Downscale to ≤768 px on the longest edge and re-encode as JPEG 0.85.
// 768 px still keeps price labels legible while halving tile count under
// detail:"auto" (1–2 tiles, ~255–425 tokens vs ~425–765 at 1024 px).
function resizeForUpload(file: File, maxPx = 768): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(src)
      const scale  = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Resize failed")), "image/jpeg", 0.85)
    }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error("Image load failed")) }
    img.src = src
  })
}

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
          : "border-white/[0.12] bg-white/[0.02] hover:border-purple-500/30 hover:bg-purple-500/[0.02]",
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

      <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/[0.10] bg-white/[0.05] px-5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.08]">
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

    {error && (
      <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
        <XCircle className="size-3.5 shrink-0" />
        {error}
      </p>
    )}
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
      <div className="max-h-80 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
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
      {error && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3"
        >
          <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{error}</p>
        </motion.div>
      )}

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
      <div className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
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
      <div className="relative h-52 overflow-hidden rounded-xl border border-white/[0.07] bg-[#08080f]">
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

function ResultsView({
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

// ─── Visual tip cards ─────────────────────────────────────────────────────────

function TipCard({ graphic, title, desc }: {
  graphic: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/[0.07]">
      <div className="bg-[#05050f] p-2">{graphic}</div>
      <div className="border-t border-white/[0.04] px-2.5 py-1.5">
        <p className="text-[10px] font-semibold tracking-wide text-white/90">{title}</p>
        <p className="text-[9px] leading-snug text-white/30">{desc}</p>
      </div>
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
            <line x1={x + 1.5} y1={wT} x2={x + 1.5} y2={wB} stroke={c} strokeWidth="0.5" opacity="0.4" />
            <rect x={x} y={bT} width="3" height={bB - bT} rx="0.4" fill={c} opacity="0.36" />
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
      <path d={MA_L} fill="none" stroke="#6d66f0" strokeWidth="0.65" opacity="0.3" strokeLinecap="round" />
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
      <path d={MA_R} fill="none" stroke="#6d66f0" strokeWidth="0.65" opacity="0.3" strokeLinecap="round" />
      <line x1="88.5" y1="6" x2="132" y2="6" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.18" />
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
      <path d={MA_L} fill="none" stroke="#6d66f0" strokeWidth="0.65" opacity="0.3" strokeLinecap="round" />
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
        fill="none" stroke="#6d66f0" strokeWidth="0.65" opacity="0.3" strokeLinecap="round" />

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
        fill="none" stroke="#6d66f0" strokeWidth="0.65" opacity="0.3" strokeLinecap="round" />
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
      <path d={MA_R} fill="none" stroke="#6d66f0" strokeWidth="0.65" opacity="0.3" strokeLinecap="round" />
      <line x1="88.5" y1="6" x2="132" y2="6" stroke="#a855f7" strokeWidth="0.3" strokeDasharray="1.5 1.5" opacity="0.18" />
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ChartAnalysisPage() {
  const { data: session } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const locked = plan === "free"

  const [phase,    setPhase]    = useState<Phase>("idle")
  const [file,     setFile]     = useState<File | null>(null)
  const [preview,  setPreview]  = useState<string | null>(null)
  const [result,   setResult]   = useState<AnalysisResult | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [recent,   setRecent]   = useState<RecentEntry[]>([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    fetch("/api/analyses")
      .then((r) => r.json())
      .then((rows) => {
        if (!Array.isArray(rows)) return
        setRecent(
          rows.slice(0, 3).map((r) => ({
            id:         r.id,
            pair:       r.pair,
            timeframe:  r.timeframe,
            signal:     r.signal,
            confidence: r.confidence,
            entry:      r.entry,
            ts:         new Date(r.createdAt).getTime(),
          }))
        )
      })
      .catch(() => {})
      .finally(() => setRecentLoading(false))
  }, [])

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
      // Downscale client-side before sending: reduces upload size and
      // keeps image ≤800 px so detail:"low" (512 px tile, 85 tokens) is optimal.
      const resized = await resizeForUpload(file)
      const form = new FormData()
      form.append("image", resized, file.name.replace(/\.[^.]+$/, ".jpg"))

      const res = await fetch("/api/analyze", { method: "POST", body: form })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? "Analysis failed. Please try again.")
      }

      const analysis = data.analysis as AnalysisResult
      setResult(analysis)

      const entry: RecentEntry = {
        id:         crypto.randomUUID(),
        pair:       analysis.pair,
        timeframe:  analysis.timeframe,
        signal:     analysis.signal,
        confidence: analysis.confidence,
        entry:      analysis.entry,
        ts:         Date.now(),
      }
      setRecent((prev) => [entry, ...prev].slice(0, 3))
      setPhase("results")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong."
      setApiError(msg)
      setPhase("selected")
    }
  }

  const handleReset = () => {
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

      {/* 2-column layout */}
      <FeatureLock locked={locked} feature="Chart Analysis">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main analyser */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:p-6" aria-busy={phase === "analyzing"}>
            <AnimatePresence mode="wait">
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
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
              <Clock className="size-4 text-gray-500" />
              Recent Analyses
            </h2>

            {recentLoading ? (
              <div className="space-y-2.5" aria-hidden="true">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="space-y-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="h-3.5 w-16 animate-pulse rounded bg-white/[0.06]" />
                      <div className="h-4 w-10 animate-pulse rounded-full bg-white/[0.06]" />
                    </div>
                    <div className="h-3 w-24 animate-pulse rounded bg-white/[0.04]" />
                  </div>
                ))}
              </div>
            ) : recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <div className="flex size-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03]">
                  <Clock className="size-4 text-gray-600" />
                </div>
                <p className="text-xs text-gray-600">No recent analyses yet.</p>
                <p className="text-[11px] text-gray-700">Your results will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recent.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3.5 py-3"
                  >
                    {/* Top row: pair + signal badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-white">{r.pair}</span>
                        <span className="rounded-md border border-white/[0.08] bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-gray-500">
                          {r.timeframe}
                        </span>
                      </div>
                      <span className={cn(
                        "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-bold leading-none",
                        r.signal === "BUY"     ? "bg-emerald-500/10 text-emerald-400"
                        : r.signal === "SELL"  ? "bg-red-500/10 text-red-400"
                        : "bg-yellow-500/10 text-yellow-400",
                      )}>
                        {r.signal}
                      </span>
                    </div>

                    {/* Bottom row: entry price + time */}
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[11px] text-gray-500">
                        Entry{" "}
                        <span className="font-medium text-gray-300">{fmtPrice(r.entry)}</span>
                      </span>
                      <span className="text-[10px] text-gray-700">{timeAgo(r.ts)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-gray-500">Tips for best results</h2>
            <div className="space-y-2">
              <TipCard
                graphic={<TipZoomSVG />}
                title="Zoom price text to 125%+"
                desc="Press Ctrl+= in TradingView until price numbers are clearly legible."
              />
              <TipCard
                graphic={<TipTickerSVG />}
                title="Show ticker name & timeframe"
                desc="Make sure the pair (e.g. ETH/USDT) and timeframe (5m, 1H…) labels are visible."
              />
              <TipCard
                graphic={<TipPriceAxisSVG />}
                title="Keep price axis on screen"
                desc="Don't scroll the Y-axis off screen — price numbers let the AI calculate exact levels."
              />
            </div>
          </div>
        </div>
      </div>
      </FeatureLock>
    </div>
  )
}
