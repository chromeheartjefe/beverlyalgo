"use client"

import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTransition } from "react"

import { refreshData } from "~/app/data-actions"
import { cx } from "~/components/ui"

// Stripe data is cached for 2 minutes; this fetches everything fresh now.
export function RefreshButton() {
  const router = useRouter()
  const [pending, start] = useTransition()
  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          await refreshData()
          router.refresh()
        })
      }
      disabled={pending}
      title="Fetch fresh data now (Stripe is cached for 2 minutes)"
      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60"
    >
      <RefreshCw className={cx("size-4", pending && "animate-spin")} aria-hidden />
      {pending ? "Refreshing" : "Refresh"}
    </button>
  )
}
