"use client"

import { motion } from "framer-motion"
import { ArrowLeftRight, BarChart3, Bitcoin, Building2, FileText, Gem, type LucideIcon } from "lucide-react"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: the six asset classes at a glance.
const CLASSES: { name: string; icon: LucideIcon; examples: string; hours: string; tint: string }[] = [
  { name: "Stocks", icon: Building2, examples: "AAPL, NVDA, TSLA", hours: "Weekdays, 9:30 am to 4 pm NY", tint: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
  { name: "Indices", icon: BarChart3, examples: "S&P 500, Nasdaq-100", hours: "Through ETFs and futures", tint: "text-indigo-300 border-indigo-500/30 bg-indigo-500/10" },
  { name: "Forex", icon: ArrowLeftRight, examples: "EUR/USD, GBP/JPY", hours: "24 hours, Sunday to Friday", tint: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
  { name: "Commodities", icon: Gem, examples: "Gold, oil, silver", hours: "Mostly through futures", tint: "text-amber-300 border-amber-500/30 bg-amber-500/10" },
  { name: "Crypto", icon: Bitcoin, examples: "BTC, ETH, SOL", hours: "24/7, never closes", tint: "text-orange-300 border-orange-500/30 bg-orange-500/10" },
  { name: "Futures", icon: FileText, examples: "NQ, ES, GC, CL", hours: "Almost 24 hours on weekdays", tint: "text-purple-300 border-purple-500/30 bg-purple-500/10" },
]

export default function AssetClassesFigure() {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {CLASSES.map(({ name, icon: Icon, examples, hours, tint }, i) => (
        <motion.div
          key={name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 + i * 0.07, ease: EASE_OUT }}
          className="border border-white/10 bg-white/[0.03] p-3.5"
        >
          <div className={`mb-3 flex size-9 items-center justify-center rounded-xl border ${tint}`}>
            <Icon className="size-4" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-white">{name}</p>
          <p className="mt-0.5 font-mono text-[11px] text-gray-400">{examples}</p>
          <p className="mt-2 text-[11px] leading-snug text-gray-500">{hours}</p>
        </motion.div>
      ))}
    </div>
  )
}
