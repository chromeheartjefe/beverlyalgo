"use client"

import { motion } from "framer-motion"
import { ShieldAlert, Target, TrendingUp } from "lucide-react"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: an example Chart Analysis readout, laid out like the real
// results card, with illustrative numbers. Labels point at each part.
// Keep the numbers possible: the product measures Risk : Reward from the entry
// to TP1 and never returns a trade under 1:1.5 (lib/chart-analysis/v2.ts).

const ROWS = [
  { l: "Limit Entry", v: "103.65", tint: "text-gray-100", Icon: Target },
  { l: "TP1", v: "106.40", tint: "text-emerald-400", Icon: TrendingUp },
  { l: "TP2", v: "107.20", tint: "text-emerald-400", Icon: TrendingUp },
  { l: "Stop Loss", v: "102.30", tint: "text-red-400", Icon: ShieldAlert },
  { l: "Risk : Reward", v: "1:2", tint: "text-emerald-300", Icon: Target },
]

export default function AnalysisReadoutFigure() {
  return (
    <div className="border border-white/10 bg-[#0b0b13] p-4 sm:p-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">Example readout (illustrative numbers)</p>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
        className="flex flex-wrap items-center gap-3"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-sm font-bold text-emerald-300">
          <TrendingUp className="size-4" aria-hidden /> BUY
        </span>
        <span className="text-sm text-gray-300">
          84% confidence <span className="text-gray-500">· a setup-quality grade</span>
        </span>
      </motion.div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {ROWS.map(({ l, v, tint, Icon }, i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.06, ease: EASE_OUT }}
            className={`border border-white/10 bg-white/[0.03] p-2.5 ${i === 0 ? "col-span-2 sm:col-span-1" : ""}`}
          >
            <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <Icon className="size-3" aria-hidden /> {l}
            </p>
            <p className={`mt-1 font-mono text-sm font-semibold ${tint}`}>{v}</p>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-3 text-xs leading-relaxed text-gray-400"
      >
        Below the levels, the analysis explains the trend, any patterns, the market structure, why it reached this signal, and
        what would invalidate it.
      </motion.p>
    </div>
  )
}
