"use client"

import { useState } from "react"

import { TeachingChart } from "@/components/dashboard/academy/teaching-chart"
import { candlesFromCloses, pathCloses } from "@/lib/academy/candles"
import { cn } from "@/lib/utils"

// Lesson figure: the same prices drawn three ways, switchable with tabs.

const DATA = candlesFromCloses(
  pathCloses([[0, 50], [6, 52.4], [10, 51.2], [17, 54.6], [21, 53.1], [24, 54.2]], { noise: 0.35, seed: 11 }),
  { wick: 0.6, seed: 11 },
)

const STYLES = [
  { id: "line", label: "Line", note: "Only the closing prices, joined up. Clean, but it hides the highs and lows." },
  { id: "ohlc", label: "Bar", note: "Each bar shows open (left tick), high, low and close (right tick)." },
  { id: "candles", label: "Candles", note: "The same four prices as a bar, with a coloured body that is easy to read at a glance." },
] as const

export default function ChartTypesFigure() {
  const [style, setStyle] = useState<(typeof STYLES)[number]["id"]>("candles")
  const current = STYLES.find((s) => s.id === style)!
  return (
    <div>
      <div className="mb-2 inline-flex border border-white/15" role="tablist" aria-label="Chart type">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={style === s.id}
            onClick={() => setStyle(s.id)}
            className={cn(
              "px-4 py-2 text-xs font-semibold transition-colors",
              style === s.id ? "bg-purple-500/20 text-purple-200" : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <TeachingChart spec={{ candles: DATA, style, decimals: 1 }} height={220} />
      <p className="mt-2 text-xs text-gray-500">{current.note}</p>
    </div>
  )
}
