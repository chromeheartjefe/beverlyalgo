"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"

// Frosted cover over the dashboard while it loads: on a page's first load
// (right after signing in, a refresh) and when entering the dashboard from
// the site. The page renders under it and shows through blurred, so the
// reveal feels like the screen coming into focus rather than placeholders
// popping into real names, plans and numbers.
//
// It lifts once the session is known AND the page's own data requests have
// all finished (plus a short settle so the results get drawn), never later
// than MAX_MS. Tab switches inside the dashboard keep the layout mounted, so
// they never show it.
const MARK_DELAY_MS = 250  // logo + ring only if the wait is noticeable
const SETTLE_MS     = 250  // network quiet this long before lifting
const MIN_MS        = 300  // no blink-and-gone cover
const MAX_MS        = 4000 // a slow or stuck request never traps anyone

// ─── Same-origin request tracking ─────────────────────────────────────────────
// Installed when this module loads, which is before the dashboard's
// components start fetching, so none of their requests slip past. It only
// counts; every request passes through unchanged.
let inFlight = 0

function sameOriginTracked(input: RequestInfo | URL): boolean {
  try {
    const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
    const url = new URL(raw, window.location.href)
    return url.origin === window.location.origin && !url.pathname.startsWith("/monitoring") // Sentry tunnel
  } catch {
    return false
  }
}

if (typeof window !== "undefined" && !(window as { __eaFetchTracked?: boolean }).__eaFetchTracked) {
  ;(window as { __eaFetchTracked?: boolean }).__eaFetchTracked = true
  const originalFetch = window.fetch.bind(window)
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (!sameOriginTracked(input)) return originalFetch(input, init)
    inFlight += 1
    return originalFetch(input, init).finally(() => {
      inFlight = Math.max(0, inFlight - 1)
    })
  }
}

// ─── Shared visuals (also used by the sign-out cover in lib/sign-out.tsx) ─────

/** The frosted cover itself: page colour tint over a strong blur of the page. */
export const COVER_CLASS = "fixed inset-0 flex items-center justify-center bg-[#09090f]/45 backdrop-blur-xl"

/** Glowing EntrixAlgo mark with the rotating ring, and a short line of text. */
export function LoadingMark({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-4" aria-hidden="true">
      <div className="relative size-16">
        {/* Soft purple glow behind the mark */}
        <span className="absolute -inset-4 rounded-full bg-purple-600/25 blur-2xl" />
        {/* Track */}
        <span className="absolute inset-0 rounded-full border-2 border-white/[0.07]" />
        {/* Rotating arc: a conic sweep masked to a ring, so its ends are flat */}
        <span
          className="absolute inset-0 animate-spin rounded-full motion-reduce:animate-none"
          style={{
            animationDuration: "1.1s",
            background: "conic-gradient(from 0deg, rgba(168,85,247,0) 0deg, rgba(168,85,247,0.15) 150deg, #a855f7 300deg, #d8b4fe 360deg)",
            WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2px))",
            filter: "drop-shadow(0 0 6px rgba(168,85,247,0.55))",
          }}
        />
        <span className="absolute inset-0 flex items-center justify-center">
          <Image src="/logo_transparent.png" alt="" width={28} height={28} priority className="size-7 object-contain" />
        </span>
      </div>
      <p className="text-xs tracking-wide text-gray-400">{label}</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionLoadingScreen() {
  const { status } = useSession()
  const reduceMotion = useReducedMotion()
  const statusRef = useRef(status)
  statusRef.current = status

  const [done, setDone] = useState(false)
  useEffect(() => {
    if (done) return
    const t0 = performance.now()
    let quietSince: number | null = null
    const id = setInterval(() => {
      const now = performance.now()
      if (inFlight === 0) quietSince ??= now
      else quietSince = null
      const sessionKnown = statusRef.current !== "loading"
      const settled = sessionKnown && quietSince !== null && now - quietSince >= SETTLE_MS && now - t0 >= MIN_MS
      if (settled || now - t0 >= MAX_MS) {
        clearInterval(id)
        setDone(true)
      }
    }, 50)
    return () => clearInterval(id)
  }, [done])

  const [showMark, setShowMark] = useState(false)
  useEffect(() => {
    if (done) return
    const t = setTimeout(() => setShowMark(true), MARK_DELAY_MS)
    return () => clearTimeout(t)
  }, [done])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="session-loading"
          initial={false}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          className={`${COVER_CLASS} z-[70]`}
        >
          <span className="sr-only">Loading your dashboard</span>
          <AnimatePresence>
            {showMark && (
              <motion.div
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <LoadingMark label="Loading your dashboard…" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
