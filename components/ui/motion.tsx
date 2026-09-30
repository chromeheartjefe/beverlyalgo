"use client"

import { AnimatePresence, motion } from "framer-motion"
import { type ReactNode, useRef } from "react"

// Small, shared UI motion for the app (dashboard, auth, support). Short and
// opacity/transform-led so nothing reads as lag; the app-wide MotionConfig
// reducedMotion="user" (theme-provider.tsx) turns the movement off for people
// who ask for less motion, leaving plain fades.

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/**
 * Skeleton → content. The content fades in, but only if this mount actually
 * showed the skeleton: returning to a tab with cached data stays instant
 * (a fade on every tab switch read as lag).
 */
export function Loaded({
  loading,
  fallback,
  className,
  children,
}: {
  loading: boolean
  fallback: ReactNode
  // Layout classes for the content wrapper (e.g. "flex flex-1 flex-col")
  className?: string
  children: ReactNode
}) {
  // Did this mount start out loading? Read once, on the first render.
  const startedLoading = useRef(loading).current
  if (loading) return <>{fallback}</>
  if (!startedLoading) return className ? <div className={className}>{children}</div> : <>{children}</>
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Something that appears or disappears inside a page (an error message, a
 * notice, a card): it opens and closes in height, so what's below slides
 * instead of jumping. Not animated on first render.
 */
export function Collapse({
  show,
  className,
  children,
}: {
  show: boolean
  // Spacing belongs here (e.g. "mt-3"), inside the animated box, so the gap
  // opens and closes with the content
  className?: string
  children: ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ height: { duration: 0.25, ease: EASE_OUT }, opacity: { duration: 0.2 } }}
          // margin 0 overrides a parent's space-y-*, which would otherwise
          // snap its gap open while the height animates
          style={{ overflow: "hidden", margin: 0 }}
        >
          <div className={className}>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** A single element fading in when it mounts (a new chat message, a badge swap). */
export function FadeIn({ className, children, y = 6 }: { className?: string; children: ReactNode; y?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
