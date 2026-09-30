"use client"

import { motion } from "framer-motion"
import { type ReactNode, useSyncExternalStore } from "react"

import { EASE_OUT } from "@/components/ui/motion"

const noopSubscribe = () => () => {}

/**
 * Dashboard tab switches: the new page fades in over 0.18s (opacity only, no
 * slide or stagger, so it doesn't read as lag). Mounted from
 * app/dashboard/template.tsx, which Next.js remounts on every navigation.
 * Not on the first page load: there the server HTML would start invisible
 * until the JS runs (the loading screen covers that moment anyway).
 */
export function PageFade({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  return (
    <motion.div
      className="h-full"
      initial={hydrated ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
