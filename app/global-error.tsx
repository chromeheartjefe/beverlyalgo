"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect, useState } from "react"

import { siteConfig } from "@/config/site"

// Crashes that come from the framework or from the DOM being changed under
// React (translation, extensions), not from our own logic. After one of these
// the client router's state is corrupt, so reset() re-renders into the same
// error; a full reload is what actually recovers.
const RECOVERABLE =
  /Rendered (more|fewer) hooks than|Failed to execute '(removeChild|insertBefore)' on 'Node'|ChunkLoadError|Loading chunk [\w-]+ failed/i

const RELOAD_KEY = "entrix:global-error-reload"
const RELOAD_WINDOW_MS = 60_000

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    Sentry.captureException(error, { tags: { global_error_auto_reload: RECOVERABLE.test(error.message) ? "attempted" : "no" } })

    if (!RECOVERABLE.test(error.message)) return
    // At most one automatic reload per minute, so a persistent error can't
    // put the page into a reload loop
    try {
      const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
      if (Date.now() - last < RELOAD_WINDOW_MS) return
      sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
    } catch {
      return
    }
    setReloading(true)
    window.location.reload()
  }, [error])

  return (
    <html lang="en" style={{ colorScheme: "dark" }} className="dark">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center text-white">
        {reloading ? (
          <p className="text-sm text-gray-400">Reloading…</p>
        ) : (
          <>
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="max-w-sm text-sm text-gray-400">
              An unexpected error occurred and our team has been notified. Reload the page to continue.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-400"
              >
                Reload page
              </button>
              <button
                onClick={reset}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06]"
              >
                Try again
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Still not working?{" "}
              <a href={siteConfig.links.email} className="text-purple-400 hover:text-purple-300">
                Contact support
              </a>
            </p>
          </>
        )}
      </body>
    </html>
  )
}
