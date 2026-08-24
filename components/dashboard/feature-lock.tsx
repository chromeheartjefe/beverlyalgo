"use client"

import { Lock } from "lucide-react"
import Link from "next/link"

export function FeatureLock({
  locked,
  feature,
  children,
}: {
  locked: boolean
  feature: string
  children: React.ReactNode
}) {
  if (!locked) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 grayscale">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#09090f]/60 backdrop-blur-sm">
        <div className="mx-4 max-w-sm rounded-2xl border border-white/[0.07] bg-white/[0.04] p-6 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
            <Lock className="size-5 text-purple-400" />
          </div>
          <h3 className="text-sm font-semibold text-white">{feature} is a Pro feature</h3>
          <p className="mt-1.5 text-xs text-gray-500">
            Upgrade to unlock {feature.toLowerCase()} and every other tool in the dashboard.
          </p>
          <Link
            href="/#pricing"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    </div>
  )
}
