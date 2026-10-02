"use client"

import * as Sentry from "@sentry/nextjs"
import { useEffect, useState } from "react"

import { SupportEmail } from "@/components/ui/support-email"
import { autoReload, isRecoverable } from "@/lib/error-recovery"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    Sentry.captureException(error, { tags: { global_error_auto_reload: isRecoverable(error) ? "attempted" : "no" } })

    // Framework / DOM crashes recover with one reload (see lib/error-recovery.ts)
    if (autoReload(error)) setReloading(true)
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
              Email us at <SupportEmail />
            </p>
          </>
        )}
      </body>
    </html>
  )
}
