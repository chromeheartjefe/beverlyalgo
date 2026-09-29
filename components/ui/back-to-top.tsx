"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { useEffect, useState } from "react"

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          whileHover={{ y: -3 }}
          className="fixed bottom-[4.5rem] right-4 z-40 flex size-12 sm:bottom-[5.25rem] sm:right-6 items-center justify-center rounded-full border border-white/25 bg-white/[0.05] text-purple-300 backdrop-blur-sm transition-colors hover:border-purple-500/30 hover:bg-purple-500/15 hover:text-purple-200"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}
        >
          <ArrowUp className="size-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
