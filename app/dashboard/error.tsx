"use client"

import * as Sentry from "@sentry/nextjs"
import { TriangleAlert } from "lucide-react"
import { useEffect, useState } from "react"

import { SupportEmail } from "@/components/ui/support-email"
import { autoReload, isRecoverable } from "@/lib/error-recovery"

// A crash inside one dashboard tab. The sidebar and header stay, so the rest
// of the dashboard is still one click away; without this file the whole
// screen was replaced by the global error page. Crashes in the layout itself
// (sidebar, header) still go there.
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: "dashboard", global_error_auto_reload: isRecoverable(error) ? "attempted" : "no" },
    })

    // Same recovery as the global error page for framework / DOM crashes
    if (autoReload(error)) setReloading(true)
  }, [error])

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      {reloading ? (
        <p className="text-sm text-gray-400">Reloading…</p>
      ) : (
        <div role="alert" className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/[0.03] p-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10">
            <TriangleAlert className="size-5 text-amber-300" aria-hidden="true" />
          </div>
          <h1 className="text-base font-semibold text-white">This page ran into a problem</h1>
          <p className="mt-1.5 text-sm text-gray-400">
            Our team has been notified. Your data is safe, and the rest of the dashboard still works.
          </p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <button
              onClick={reset}
              className="min-h-11 rounded-xl bg-purple-500 px-4 text-sm font-medium text-white transition-colors hover:bg-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="min-h-11 rounded-xl border border-white/15 px-4 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              Reload page
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-500">
            Still not working? Email us at <SupportEmail />
          </p>
        </div>
      )}
    </div>
  )
}
