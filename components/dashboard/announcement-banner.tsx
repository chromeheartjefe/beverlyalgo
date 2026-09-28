"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

// ─── Current announcement ─────────────────────────────────────────────────────
// To announce the next update: change ANNOUNCEMENT_ID and edit the copy in
// <Message /> below. A new id shows the banner again to everyone, including
// people who closed the previous one. Set the id to null to show nothing.
const ANNOUNCEMENT_ID: string | null = "2026-09-release"

function Message() {
  const link = "font-medium text-purple-300 underline decoration-purple-400/40 underline-offset-2 hover:text-white"
  return (
    <>
      <span className="md:hidden">
        New: <Link href="/dashboard/ai-screener" className={link}>AI Screener</Link>
        {" & "}
        <Link href="/dashboard/trade-calendar" className={link}>Trade Calendar</Link>
      </span>
      <span className="hidden md:inline">
        A big update is live: meet the new{" "}
        <Link href="/dashboard/ai-screener" className={link}>AI Screener</Link> and{" "}
        <Link href="/dashboard/trade-calendar" className={link}>Trade Calendar</Link>, plus a refreshed design.
      </span>
    </>
  )
}

// Remembered per account in this browser, like the onboarding checklist.
const storageKey = (userId: string) => `ea_announcement_${userId}`

export function AnnouncementBanner() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const reduceMotion = useReducedMotion()
  // Starts hidden: localStorage is only readable after mount, and showing it
  // on the server render would flash it for people who already closed it.
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!userId || !ANNOUNCEMENT_ID) return
    let dismissedId: string | null = null
    try {
      dismissedId = localStorage.getItem(storageKey(userId))
    } catch {}
    setVisible(dismissedId !== ANNOUNCEMENT_ID)
  }, [userId])

  const handleClose = () => {
    setVisible(false)
    if (!userId || !ANNOUNCEMENT_ID) return
    try {
      localStorage.setItem(storageKey(userId), ANNOUNCEMENT_ID)
    } catch {}
  }

  return (
    <AnimatePresence initial={!reduceMotion}>
      {visible && (
        <motion.div
          key={ANNOUNCEMENT_ID}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
          transition={{ duration: reduceMotion ? 0.15 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 overflow-hidden"
        >
          <div className="px-4 pt-3 sm:px-6 lg:px-8">
            <aside
              aria-label="Product update"
              className="mx-auto flex max-w-3xl items-center gap-2.5 rounded-full border border-purple-500/25 bg-gradient-to-r from-purple-500/[0.12] via-fuchsia-500/[0.05] to-purple-500/[0.12] py-1 pl-1.5 pr-1 shadow-lg shadow-purple-950/30 backdrop-blur-sm sm:gap-3"
            >
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-purple-500/20 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-200">
                <Sparkles className="size-3" aria-hidden="true" />
                New
              </span>
              <p className="min-w-0 flex-1 truncate text-xs text-gray-200 sm:text-sm">
                <Message />
              </p>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close announcement"
                className="flex size-8 shrink-0 items-center justify-center rounded-full text-purple-300/70 transition-colors hover:bg-purple-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </aside>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
