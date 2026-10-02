"use client"

import { MotionConfig } from "framer-motion"

// reducedMotion="user" makes every Framer Motion animation in the app respect
// the OS-level prefers-reduced-motion setting automatically: transform-based
// motion (translate/scale/rotate) is skipped for users who've asked for it,
// without touching each animation individually.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
