"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Flame, Loader2, RadioTower, XCircle } from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useState } from "react"
import useSWR from "swr"

import type { ScreenerResult } from "@/app/api/screener/route"
import { Collapse } from "@/components/ui/motion"
import { ApiError, requestJson, userMessage } from "@/lib/api-client"
import { timeAgo } from "@/lib/format"
import { fetcher } from "@/lib/swr"

// Only rendered once a scan has completed — see the component's own file
// header for why this is code-split rather than inlined here.
const ScreenerResults = dynamic(
  () => import("@/components/dashboard/ai-screener-results").then((m) => m.ScreenerResults),
  {
    loading: () => (
      <div role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-gray-600">
        <Loader2 className="size-4 animate-spin" />
        Loading results…
      </div>
    ),
  }
)

// Client-side floor on the "scanning" animation so a scan that resolves
// instantly from cache (the common case — see app/api/screener/route.ts's
// hourly gate) still reads as the AI actually doing work, exactly as many
// times in a row as the user wants to press the button.
const MIN_ANIMATION_MS = 1900

// ─── Radar scan animation ──────────────────────────────────────────────────

function RadarScan() {
  const blips = [
    { top: "28%", left: "62%", delay: 0.2 },
    { top: "58%", left: "38%", delay: 0.9 },
    { top: "40%", left: "22%", delay: 1.5 },
    { top: "70%", left: "68%", delay: 0.55 },
    { top: "20%", left: "40%", delay: 1.1 },
  ]

  return (
    <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-xl border border-white/15 bg-[#08080f]">
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
          animate={{ rotate: 360 }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-9 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10">
            <Flame className="size-4 text-purple-400" />
          </div>
        </div>

        {blips.map((b, i) => (
          <motion.span
            key={i}
            className="absolute size-1.5 rounded-full bg-purple-300"
            style={{ top: b.top, left: b.left, boxShadow: "0 0 8px 2px rgba(168,85,247,0.6)" }}
            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5] }}
            transition={{ duration: 1.8, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#08080f] to-transparent" />
    </div>
  )
}

function ScanningView() {
  const steps = [
    "Pulling live market movers",
    "Cross-referencing volume & momentum",
    "Ranking highest-potential setups",
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
          <RadioTower className="size-3.5 text-purple-400" />
          AI Screener
        </div>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.3, repeat: Infinity }}
          className="flex items-center gap-1.5 text-xs text-purple-400"
        >
          <Loader2 className="size-3 animate-spin" />
          Scanning…
        </motion.div>
      </div>

      <RadarScan />

      <div className="space-y-2">
        {steps.map((text, i) => (
          <motion.div
            key={text}
            initial={{ opacity: 0, x: -8 }}
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

function IdleView({ onScan }: { onScan: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-16 text-center"
    >
      <div className="flex size-16 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
        <Flame className="size-7 text-purple-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-200">No scan yet</p>
        <p className="mt-1 max-w-xs text-xs text-gray-600">
          Run a scan to see the AI-ranked stocks and crypto showing the strongest momentum right now.
        </p>
      </div>
      <button
        onClick={onScan}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition-all hover:from-purple-500 hover:to-purple-400"
      >
        <Flame className="size-4" />
        Scan Market
      </button>
    </motion.div>
  )
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function AiScreenerPage() {
  const { data, mutate } = useSWR<{ result: ScreenerResult | null }>("/api/screener", fetcher)

  const [scanning, setScanning] = useState(false)
  const [localResult, setLocalResult] = useState<ScreenerResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const result = localResult ?? data?.result ?? null

  const handleScan = useCallback(async () => {
    setScanning(true)
    setError(null)

    const minDelay = new Promise((resolve) => setTimeout(resolve, MIN_ANIMATION_MS))

    try {
      const [res] = await Promise.all([
        requestJson<{ result?: ScreenerResult }>("/api/screener", { method: "POST" }).then((body) => {
          if (!body.result) throw new ApiError("The scan couldn't be completed. Please try again.")
          return body as { result: ScreenerResult }
        }),
        minDelay,
      ])
      setLocalResult(res.result)
      mutate({ result: res.result }, { revalidate: false })
    } catch (err) {
      setError(userMessage(err))
    } finally {
      setScanning(false)
    }
  }, [mutate])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            <Flame className="size-3" />
            AI Screener
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">Hot Right Now</h1>
          <p className="mt-1 max-w-xl text-sm text-gray-500">
            AI-ranked stocks and crypto showing the strongest real-time momentum.
          </p>
        </div>

        {result && !scanning && (
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span className="text-xs text-gray-600">Last scanned {timeAgo(result.generatedAt)}</span>
            <button
              onClick={handleScan}
              className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-base font-semibold text-gray-200 transition-colors hover:bg-white/[0.08]"
            >
              <Flame className="size-5 text-purple-400" />
              Rescan
            </button>
          </div>
        )}
      </div>

      <div>
        <Collapse show={!!error} className="pb-4">
          <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
            <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </Collapse>

        <AnimatePresence mode="wait">
          {scanning ? (
            <ScanningView key="scanning" />
          ) : result ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ScreenerResults result={result} />
            </motion.div>
          ) : (
            <IdleView key="idle" onScan={handleScan} />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
