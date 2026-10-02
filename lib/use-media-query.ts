"use client"

import { useSyncExternalStore } from "react"

/**
 * Whether a CSS media query matches right now, kept in sync as the window
 * changes. The server (and the first client render, to match it) answers
 * `false`, so pair it with CSS visibility classes when a wrong first frame
 * would show.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Below Tailwind's `sm` breakpoint */
export const PHONE_QUERY = "(max-width: 639px)"
