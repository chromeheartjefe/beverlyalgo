"use client"

import { Activity, Construction } from "lucide-react"
import Link from "next/link"

import { FeatureLock } from "@/components/dashboard/feature-lock"
import { IndicatorSignalPreview } from "@/components/dashboard/indicator-signal-preview"

// The indicator is being rebuilt, so the tab stays but its content sits
// behind the same gate as the Pro lock, for every plan. What used to be here
// (access request form, how-to steps) is listed in the restore notes; the
// request API at /api/indicator is still in place for when it comes back.

// Stand-in blocks behind the blur: the shape of the page, no real content
function Placeholder({ lines }: { lines: string[] }) {
  return (
    <div aria-hidden className="rounded-2xl border border-white/25 bg-white/[0.025] p-6">
      <div className="h-3.5 w-32 rounded bg-white/[0.12]" />
      <div className="mt-4 space-y-2.5">
        {lines.map((width, i) => (
          <div key={i} className={`h-2.5 rounded bg-white/[0.07] ${width}`} />
        ))}
      </div>
    </div>
  )
}

export default function IndicatorPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
          <Activity className="size-3" />
          AI Trading Indicator
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">TradingView Indicator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Buy and sell signals on your own TradingView chart. Currently under construction.
        </p>
      </div>

      <FeatureLock
        locked
        feature="AI Trading Indicator"
        card={{
          icon: <Construction className="size-5 text-purple-400" />,
          title: "Under construction",
          description: "We're rebuilding our TradingView indicator, so it isn't available right now.",
          action: (
            <Link
              href="/dashboard/chart-analysis"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15"
            >
              Open AI Chart Analysis
            </Link>
          ),
        }}
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <Placeholder lines={["w-full", "w-5/6", "w-2/3", "w-full", "w-1/2"]} />
          <IndicatorSignalPreview />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Placeholder lines={["w-full", "w-4/5", "w-2/3"]} />
          <Placeholder lines={["w-full", "w-3/4", "w-1/2"]} />
          <Placeholder lines={["w-full", "w-5/6", "w-3/5"]} />
        </div>
      </FeatureLock>
    </div>
  )
}
