"use client"

import { motion } from "framer-motion"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: the ICT killzones on a 24-hour New York clock, with the
// three Silver Bullet hours marked. Windows are the commonly taught ones;
// teachers differ by up to an hour.

const ZONES: { name: string; from: number; to: number; color: string }[] = [
  { name: "Asian", from: 20, to: 22, color: "bg-sky-400/60" },
  { name: "London open", from: 2, to: 5, color: "bg-emerald-400/60" },
  { name: "New York open", from: 7, to: 10, color: "bg-amber-400/60" },
  { name: "London close", from: 10, to: 12, color: "bg-purple-400/60" },
]
const SILVER = [3, 10, 14]

const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
const label = (h: number) => (h === 0 || h === 24 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`)
const pct = (h: number) => (h / 24) * 100

export default function KillzonesFigure() {
  return (
    <div className="border border-white/10 bg-[#0b0b13] p-4 sm:p-5">
      <div className="space-y-2.5">
        {ZONES.map((z, i) => (
          <div key={z.name} className="flex items-center gap-2">
            <span className="w-24 shrink-0 text-xs font-medium text-gray-300">{z.name}</span>
            <div className="relative h-5 flex-1 bg-white/[0.04]">
              <motion.div
                className={`absolute inset-y-0 origin-left ${z.color}`}
                style={{ left: `${pct(z.from)}%`, width: `${pct(z.to - z.from)}%` }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.12, ease: EASE_OUT }}
              />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="w-24 shrink-0 text-xs font-medium text-yellow-200">Silver Bullet</span>
          <div className="relative h-5 flex-1 bg-white/[0.04]">
            {SILVER.map((h, i) => (
              <motion.div
                key={h}
                className="absolute inset-y-0 bg-yellow-300/80"
                style={{ left: `${pct(h)}%`, width: `${pct(1)}%` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.7 + i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="relative ml-[6.5rem] mt-2 h-4 text-[10px] text-gray-500">
        {TICKS.map((h) => (
          <span key={h} className="absolute -translate-x-1/2" style={{ left: `${pct(h)}%` }}>
            {label(h)}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        New York time. These are the commonly taught windows; different teachers shift them by up to an hour.
      </p>
    </div>
  )
}
