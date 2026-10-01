"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: buying vs selling pressure, and what it does to the price.
// Cycles through a few market moods; static on reduced motion.

const PHASES = [
  { buyers: 72, label: "Buyers more eager", move: 0.25 },
  { buyers: 64, label: "Buyers still pushing", move: 0.25 },
  { buyers: 50, label: "Evenly matched", move: 0 },
  { buyers: 30, label: "Sellers more eager", move: -0.25 },
  { buyers: 36, label: "Sellers still pushing", move: -0.25 },
  { buyers: 50, label: "Evenly matched", move: 0 },
] as const

export default function PriceTugFigure() {
  const reduceMotion = useReducedMotion()
  const [{ step, price }, setState] = useState({ step: 0, price: 100.25 })

  useEffect(() => {
    if (reduceMotion) return
    const id = setInterval(() => {
      setState(({ step: s, price: p }) => {
        const next = (s + 1) % PHASES.length
        return { step: next, price: Number((p + PHASES[next].move).toFixed(2)) }
      })
    }, 1700)
    return () => clearInterval(id)
  }, [reduceMotion])

  const phase = PHASES[step]
  const Arrow = phase.move > 0 ? ArrowUp : phase.move < 0 ? ArrowDown : ArrowRight
  const color = phase.move > 0 ? "text-emerald-300" : phase.move < 0 ? "text-red-300" : "text-gray-300"

  return (
    <div className="border border-white/10 bg-[#0b0b13] p-4 sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-gray-500">Price</p>
          <p className={`mt-0.5 flex items-center gap-1.5 font-mono text-2xl font-semibold tabular-nums ${color}`}>
            {price.toFixed(2)}
            <Arrow className="size-5" aria-hidden />
          </p>
        </div>
        <motion.p
          key={step}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="text-right text-sm font-medium text-gray-300"
        >
          {phase.label}
        </motion.p>
      </div>

      {/* Pressure meter: buyers fill from the left, sellers from the right */}
      <div className="flex h-9 w-full overflow-hidden border border-white/10">
        <motion.div
          className="flex items-center bg-emerald-500/25 pl-3 text-xs font-semibold text-emerald-200"
          animate={{ width: `${phase.buyers}%` }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          Buyers
        </motion.div>
        <div className="flex flex-1 items-center justify-end bg-red-500/20 pr-3 text-xs font-semibold text-red-200">Sellers</div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        The more eager side wins: price moves until enough traders on the other side are willing to deal.
      </p>
    </div>
  )
}
