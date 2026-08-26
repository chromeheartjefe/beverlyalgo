"use client"

import { Activity, Check, TrendingUp } from "lucide-react"

import { IndicatorSignalPreview } from "@/components/dashboard/indicator-signal-preview"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Reveal } from "@/components/ui/reveal"

export function AiIndicatorPreview() {
  return (
    <section className="relative bg-black pb-20 pt-3 md:pb-28 md:pt-4">
      <div className="mx-auto max-w-7xl px-6">
        {/* Outer card */}
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#070712] shadow-2xl shadow-black/60">
          <BackgroundGradientAnimation variant="corners" size="45%" containerClassName="absolute inset-0 z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left: copy ── */}
            <div className="flex flex-col justify-center p-8 lg:p-12 xl:p-16">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[11px] font-medium text-purple-400">
                <Activity className="size-3" />
                AI Trading Indicator
              </div>

              {/* Headline */}
              <h2 className="mt-6 text-3xl font-black tracking-tight text-white lg:text-4xl xl:text-[2.6rem] xl:leading-[1.18]">
                Signals painted{" "}
                <span className="text-purple-400">right on your chart</span>
              </h2>

              {/* Body copy */}
              <p className="mt-5 text-base leading-relaxed text-gray-400">
                The invite-only TradingView script this whole product started with.
                Buy and sell signals appear directly on your chart as price moves —
                no tab switching, no manual analysis.
              </p>

              {/* Feature bullets */}
              <ul className="mt-8 space-y-3">
                {[
                  "Invite-only TradingView indicator access",
                  "Real-time BUY & SELL signals with confidence",
                  "Works on any market or timeframe",
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
              <div className="mt-10">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-900/50"
                >
                  Get Started
                  <TrendingUp className="size-4" />
                </a>
                <p className="mt-3 text-xs text-gray-600">
                  Available in Pro plan · Live now in your dashboard
                </p>
              </div>
            </div>

            {/* ── Right: animated preview ── */}
            <div className="flex items-center justify-center border-t border-white/[0.05] bg-gradient-to-br from-[#0b0b1e] to-[#050510] p-8 lg:border-l lg:border-t-0 lg:p-12">
              <div className="w-full max-w-md">
                <IndicatorSignalPreview height={220} volumeHeight={30} sellTop="21.5%" buyTop="65.5%" />
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
