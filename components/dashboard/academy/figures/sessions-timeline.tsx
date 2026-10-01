"use client"

import { motion } from "framer-motion"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: the four forex sessions on a 24-hour New York clock, with
// the London / New York overlap highlighted. Hours are the usual approximate
// ones; they shift by an hour around daylight saving changes.

const SESSIONS: { name: string; from: number; to: number; color: string }[] = [
  { name: "Sydney", from: 17, to: 2, color: "bg-sky-400/60" },
  { name: "Tokyo", from: 19, to: 4, color: "bg-indigo-400/60" },
  { name: "London", from: 3, to: 12, color: "bg-emerald-400/60" },
  { name: "New York", from: 8, to: 17, color: "bg-amber-400/60" },
]

/** [start%, width%] segments; sessions that cross midnight become two */
function segments(from: number, to: number): [number, number][] {
  const pct = (h: number) => (h / 24) * 100
  if (from < to) return [[pct(from), pct(to - from)]]
  return [
    [pct(from), pct(24 - from)],
    [0, pct(to)],
  ]
}

const TICKS = [0, 3, 6, 9, 12, 15, 18, 21, 24]
const label = (h: number) => (h === 0 || h === 24 ? "12a" : h === 12 ? "12p" : h < 12 ? `${h}a` : `${h - 12}p`)

export default function SessionsTimelineFigure() {
  return (
    <div className="border border-white/10 bg-[#0b0b13] p-4 sm:p-5">
      <div className="relative">
        {/* Overlap highlight: 8 am to 12 pm */}
        <div
          aria-hidden
          className="absolute -bottom-1 -top-1 border-x border-dashed border-purple-400/50 bg-purple-500/10"
          style={{ left: `calc(5.5rem + (100% - 5.5rem) * ${8 / 24})`, width: `calc((100% - 5.5rem) * ${4 / 24})` }}
        />
        <div className="relative space-y-2.5">
          {SESSIONS.map((s, i) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-20 shrink-0 text-xs font-medium text-gray-300">{s.name}</span>
              <div className="relative h-5 flex-1 bg-white/[0.04]">
                {segments(s.from, s.to).map(([left, width], k) => (
                  <motion.div
                    key={k}
                    className={`absolute inset-y-0 origin-left ${s.color}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 + i * 0.12, ease: EASE_OUT }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="relative ml-[5.5rem] mt-2 h-4 text-[10px] text-gray-500">
        {TICKS.map((h) => (
          <span key={h} className="absolute -translate-x-1/2" style={{ left: `${(h / 24) * 100}%` }}>
            {label(h)}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">
        New York time, approximate. The shaded band is the London and New York overlap, usually the busiest hours for forex.
      </p>
    </div>
  )
}
