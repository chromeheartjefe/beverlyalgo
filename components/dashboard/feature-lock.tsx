"use client"

import { Lock } from "lucide-react"
import Link from "next/link"
import { useLayoutEffect, useRef, useState } from "react"

import { FadeIn, Loaded } from "@/components/ui/motion"

// Below this the card itself would not fit, so the page is allowed to scroll again.
const MIN_LOCKED_HEIGHT = 320

export function FeatureLock({
  locked,
  feature,
  card,
  pending = false,
  children,
}: {
  locked: boolean
  feature: string
  // Replaces the default "is a Pro feature" copy, its lock icon and/or its Upgrade button
  card?: { icon?: React.ReactNode; title?: string; description?: React.ReactNode; action?: React.ReactNode }
  // What the lock should say isn't known yet: a same-size placeholder card
  // instead of copy that might flash and then change
  pending?: boolean
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number | null>(null)
  // Unlocking after a pending placeholder fades the page in rather than
  // swapping it in one frame
  const startedPending = useRef(pending).current

  // Fit the locked preview to the visible part of the dashboard's scroll area,
  // so the upgrade card sits in the middle of the first screen and nothing scrolls.
  useLayoutEffect(() => {
    if (!locked) return
    const el = ref.current
    const main = document.getElementById("main-content")
    if (!el || !main) return

    const measure = () => {
      const top = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop
      const parent = el.parentElement
      const bottomGap = parent ? parseFloat(getComputedStyle(parent).paddingBottom) || 0 : 0
      setHeight(Math.max(MIN_LOCKED_HEIGHT, Math.floor(main.clientHeight - top - bottomGap)))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(main)
    // main resizes with the window and the verify/announcement banners; the page
    // resizes when the header above the lock changes height.
    if (el.parentElement) observer.observe(el.parentElement)
    return () => observer.disconnect()
  }, [locked])

  if (!locked) return startedPending ? <FadeIn y={0}>{children}</FadeIn> : <>{children}</>

  return (
    <div ref={ref} className="relative overflow-hidden" style={height ? { height } : undefined}>
      <div className="pointer-events-none select-none opacity-40 grayscale">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-[#09090f]/60 backdrop-blur-sm">
        <div className="mx-4 max-w-sm rounded-2xl border border-white/25 bg-white/[0.04] p-6 text-center">
          <Loaded
            loading={pending}
            fallback={
            <div aria-busy="true" aria-label="Loading" className="flex flex-col items-center">
              <div className="mb-3 size-12 animate-pulse rounded-2xl bg-white/[0.06]" />
              <div className="h-4 w-44 animate-pulse rounded bg-white/[0.06]" />
              <div className="mt-2.5 h-3 w-56 max-w-full animate-pulse rounded bg-white/[0.04]" />
              <div className="mt-1.5 h-3 w-40 animate-pulse rounded bg-white/[0.04]" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-white/[0.05]" />
            </div>
            }
          >
            <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
              {card?.icon ?? <Lock className="size-5 text-purple-400" />}
            </div>
            <h3 className="text-sm font-semibold text-white">{card?.title ?? `${feature} is a Pro feature`}</h3>
            <p className="mt-1.5 text-xs text-gray-500">
              {card?.description ?? `Upgrade to unlock ${feature.toLowerCase()} and every other tool in the dashboard.`}
            </p>
            {card?.action ?? (
              <Link
                href="/#pricing"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2.5 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15"
              >
                Upgrade to Pro
              </Link>
            )}
          </Loaded>
        </div>
      </div>
    </div>
  )
}
