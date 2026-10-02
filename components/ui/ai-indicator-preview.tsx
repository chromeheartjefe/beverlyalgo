"use client"

import { Activity, Check, TrendingUp } from "lucide-react"

import { IndicatorSignalPreview } from "@/components/dashboard/indicator-signal-preview"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Reveal } from "@/components/ui/reveal"
import { useMediaQuery } from "@/lib/use-media-query"

// Stacked layout (below lg) uses the dashboard's smaller chart, whose signal
// anchors are the component defaults; side by side uses the taller one.
// The chart measures its own box, so it is resized rather than CSS-zoomed.
const LG = "(min-width: 1024px)"

export function AiIndicatorPreview() {
  const wide = useMediaQuery(LG)
  return (
    <section className="relative bg-black pb-3 pt-3 md:pb-4 md:pt-4">
      <div className="mx-auto max-w-7xl px-6">
        {/* Outer card */}
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/25 bg-[#070712] shadow-2xl shadow-black/60">
          <BackgroundGradientAnimation variant="corners" size="45%" containerClassName="absolute inset-0 z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left: copy ── */}
            <div className="flex flex-col justify-center px-6 py-6 lg:px-12 lg:py-10">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs font-medium text-purple-400">
                <Activity className="size-3" />
                AI Trading Indicator
              </div>

              {/* Headline */}
              <h2 className="mt-4 lg:mt-5 text-3xl font-black tracking-tight text-white lg:text-4xl xl:text-[2.6rem] xl:leading-[1.18]">
                Signals painted{" "}
                <span className="text-purple-400">right on your chart</span>
              </h2>

              {/* Body copy */}
              <p className="mt-3 lg:mt-4 text-sm leading-relaxed text-gray-400 sm:text-lg">
                <span className="sm:hidden">Our invite-only TradingView script. Buy and sell signals appear right on your chart as price moves.</span>
                <span className="hidden sm:inline">
                  The invite-only TradingView script this whole product started with.
                  Buy and sell signals appear directly on your chart as price moves.
                  No tab switching, no manual analysis.
                </span>
              </p>

              {/* Feature bullets */}
              <ul className="mt-4 hidden space-y-2 sm:block lg:mt-6 lg:space-y-2.5">
                {[
                  "Invite-only TradingView access",
                  "Real-time buy & sell signals",
                  "Any market, any timeframe",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                      <Check className="size-3 text-purple-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-5 lg:mt-7">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white sm:text-base shadow-lg shadow-purple-950/40 transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-900/50"
                >
                  Get Started
                  <TrendingUp className="size-4" />
                </a>
              </div>
            </div>

            {/* ── Right: animated preview ── */}
            <div className="flex items-center justify-center border-t border-white/15 bg-gradient-to-br from-[#0b0b1e] to-[#050510] p-4 lg:border-l lg:border-t-0 lg:p-10">
              <div className="w-full max-w-md">
                {wide
                  ? <IndicatorSignalPreview height={220} volumeHeight={30} sellTop="21.5%" buyTop="65.5%" captionClassName="hidden sm:block" />
                  : <IndicatorSignalPreview captionClassName="hidden sm:block" />}
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
