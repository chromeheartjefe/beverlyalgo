"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { BookOpen, ChartCandlestick, ChartLine, Crosshair, Crown, type LucideIcon, Sprout, Trophy } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { rankFor,RANKS } from "@/lib/academy/xp"

// Level-up celebration for Entrix Academy ranks. Shown when an XP award moves
// the learner into a new rank. Kept cheap on purpose: only transform and
// opacity animate (no animated blur or filters), a fixed handful of sparkles,
// glow made of static gradients, and nothing keeps running once it closes.
// Reduced motion gets a calm fade with no particles.

const RANK_ICONS: Record<(typeof RANKS)[number]["name"], LucideIcon> = {
  Novice: Sprout,
  Apprentice: BookOpen,
  "Chart Reader": ChartCandlestick,
  Analyst: ChartLine,
  Strategist: Crosshair,
  "Pro Trader": Trophy,
  "Market Wizard": Crown,
}

/** Did this XP change cross into a higher rank? */
function leveledUp(xpBefore: number, xpAfter: number): boolean {
  return rankFor(xpAfter).index > rankFor(xpBefore).index
}

const BURST = 14
const TWINKLES = 6

function Spark({ size, className }: { size: number; className?: string }) {
  // A four-point star
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <path d="M12 0c.6 5.6 2.4 8 12 12-9.6 4-11.4 6.4-12 12-.6-5.6-2.4-8-12-12C9.6 8 11.4 5.6 12 0z" fill="currentColor" />
    </svg>
  )
}

export function LevelUp({ xpBefore, xpAfter, delay = 0.6 }: { xpBefore: number; xpAfter: number; delay?: number }) {
  const reduce = useReducedMotion()
  const show = leveledUp(xpBefore, xpAfter)
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rank = rankFor(xpAfter)
  const Icon = RANK_ICONS[rank.name]

  // Wait for the completion screen's own entrance before celebrating
  useEffect(() => {
    if (!show) return
    const id = setTimeout(() => setOpen(true), delay * 1000)
    return () => clearTimeout(id)
  }, [show, delay])

  useEffect(() => {
    if (!open) return
    buttonRef.current?.focus({ preventScroll: true })
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  // Burst directions and distances, fixed per mount
  const burst = useMemo(
    () =>
      Array.from({ length: BURST }, (_, i) => {
        const angle = (i / BURST) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1)
        const dist = 110 + (i % 3) * 28
        return { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, size: 8 + (i % 3) * 4, hue: i % 3 }
      }),
    [],
  )
  const twinkles = useMemo(
    () =>
      Array.from({ length: TWINKLES }, (_, i) => {
        const angle = (i / TWINKLES) * Math.PI * 2 + 0.5
        return { x: Math.cos(angle) * 92, y: Math.sin(angle) * 92, delay: i * 0.35 }
      }),
    [],
  )

  if (!show || typeof document === "undefined") return null

  const hueClass = ["text-amber-300", "text-purple-300", "text-fuchsia-300"]

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.18 } }}
          transition={{ duration: 0.25 }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
        >
          <div className="relative flex w-full max-w-sm flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
            {/* Emblem stage */}
            <div className="relative flex size-72 items-center justify-center">
              {/* Slowly turning rays: a static conic gradient, only rotated */}
              {!reduce && (
                <motion.div
                  aria-hidden
                  className="absolute inset-0 rounded-full opacity-60 [background:repeating-conic-gradient(from_0deg,rgba(251,191,36,0.22)_0deg_8deg,transparent_8deg_24deg)] [mask-image:radial-gradient(circle,black_25%,transparent_68%)]"
                  initial={{ scale: 0.4, rotate: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ scale: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }, rotate: { duration: 24, ease: "linear", repeat: Infinity } }}
                  style={{ willChange: "transform" }}
                />
              )}
              {/* Glow: pre-softened radial gradient, animated by opacity and scale only */}
              <motion.div
                aria-hidden
                className="absolute size-64 rounded-full [background:radial-gradient(circle,rgba(251,191,36,0.45)_0%,rgba(168,85,247,0.28)_42%,transparent_70%)]"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={reduce ? { opacity: 1, scale: 1 } : { opacity: [0, 1, 0.75, 1], scale: [0.5, 1.08, 1, 1.04] }}
                transition={reduce ? { duration: 0.3 } : { duration: 2.4, times: [0, 0.25, 0.6, 1], repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                style={{ willChange: "transform, opacity" }}
              />

              {/* Sparkle burst, once */}
              {!reduce &&
                burst.map((p, i) => (
                  <motion.span
                    key={`b${i}`}
                    className={`absolute ${hueClass[p.hue]}`}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.2 }}
                    animate={{ x: p.x, y: p.y, opacity: [0, 1, 0], scale: [0.2, 1, 0.6] }}
                    transition={{ duration: 1.1, delay: 0.15 + (i % 4) * 0.04, ease: [0.16, 1, 0.3, 1] }}
                    style={{ willChange: "transform, opacity" }}
                  >
                    <Spark size={p.size} />
                  </motion.span>
                ))}

              {/* A few twinkles around the emblem while it is open */}
              {!reduce &&
                twinkles.map((t, i) => (
                  <motion.span
                    key={`t${i}`}
                    className="absolute text-amber-200"
                    style={{ x: t.x, y: t.y, willChange: "transform, opacity" }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.6, delay: 0.9 + t.delay, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
                  >
                    <Spark size={10} />
                  </motion.span>
                ))}

              {/* The new rank's badge */}
              <motion.div
                className="relative flex size-28 items-center justify-center rounded-full border-2 border-amber-300/80 bg-gradient-to-br from-amber-400/30 via-purple-500/30 to-fuchsia-500/30 shadow-[0_0_40px_rgba(251,191,36,0.35)]"
                initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -25 }}
                animate={reduce ? { opacity: 1 } : { scale: 1, rotate: 0 }}
                transition={reduce ? { duration: 0.3 } : { type: "spring", stiffness: 260, damping: 13, delay: 0.1 }}
              >
                <div className="absolute inset-2 rounded-full border border-white/15" aria-hidden />
                <Icon className="size-12 text-amber-100" strokeWidth={1.75} aria-hidden />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: reduce ? 0.1 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="-mt-6"
            >
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300">Level up</p>
              <h2 id="level-up-title" className="mt-2 bg-gradient-to-r from-amber-200 via-white to-purple-200 bg-clip-text text-4xl font-extrabold text-transparent">
                {rank.name}
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                Rank {rank.index + 1} of {RANKS.length} · {xpAfter} XP
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {rank.next ? `Next: ${rank.next.name} at ${rank.next.xp} XP` : "You've reached the top rank."}
              </p>
              <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-amber-500 px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Keep going
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
