"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import type { ReactNode } from "react"

// Shared with components/sections/quick-start/default.tsx
export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const

// Used directly as `variants` on individual grid/list items (e.g. pricing
// cards, backtest cards). Framer's app-wide `MotionConfig reducedMotion="user"`
// (set in components/contexts/theme-provider.tsx) already strips the y-shift
// for users who prefer reduced motion, leaving a plain fade.
//
// Fade and slide only, no blur: an animated blur has to be recomputed over the
// whole block every frame, and these run exactly while the page is scrolling
// (over sections that contain the animated gradient backgrounds), which is
// where the scroll jitter came from.
export const revealItem: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: REVEAL_EASE },
  },
}

/** Fades a single block up into view once, the first time it scrolls into the viewport. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  margin = "-80px",
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  margin?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin }}
      transition={{ duration: shouldReduceMotion ? 0.25 : 0.6, ease: REVEAL_EASE, delay: shouldReduceMotion ? 0 : delay }}
    >
      {children}
    </motion.div>
  )
}

/** Wrap a row/grid of children with this, then give each child `variants={revealItem}` to stagger them in. */
export function RevealGroup({
  children,
  className,
  stagger = 0.12,
  margin = "-80px",
}: {
  children: ReactNode
  className?: string
  stagger?: number
  margin?: string
}) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      variants={{ hidden: {}, visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : stagger } } }}
    >
      {children}
    </motion.div>
  )
}
