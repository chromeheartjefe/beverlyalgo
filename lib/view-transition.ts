import { flushSync } from "react-dom"

// React's <ViewTransition> component only ships in the experimental React
// channel on our Next.js version (15.5 — it reached canary later), and
// `experimental.viewTransition` would switch the whole app to that channel.
// Until we upgrade, in-page view transitions use the browser API directly:
// flushSync commits the React update inside the transition callback so the
// browser snapshots the real before/after DOM. Unsupported browsers and
// reduced-motion users just get the instant update.

type Doc = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> }
}

export function withViewTransition(update: () => void): Promise<void> {
  const doc = typeof document === "undefined" ? undefined : (document as Doc)
  const reduced =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

  if (!doc?.startViewTransition || reduced) {
    update()
    return Promise.resolve()
  }

  const vt = doc.startViewTransition(() => {
    flushSync(update)
  })
  return vt.finished.catch(() => {})
}
