"use client"

import { Minus, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

type TickerItem = { label: string; price: number; changePercent: number }

const POLL_MS = 60_000

function formatPrice(price: number) {
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (price >= 1)    return price.toLocaleString(undefined, { maximumFractionDigits: 2 })
  if (price >= 0.01) return price.toLocaleString(undefined, { maximumFractionDigits: 4 })
  return price.toLocaleString(undefined, { maximumFractionDigits: 8 })
}

function TickerRow({ items }: { items: TickerItem[] }) {
  return (
    <>
      {items.map((item, i) => {
        const flat = Math.abs(item.changePercent) < 0.005
        const up   = item.changePercent > 0
        const Icon = flat ? Minus : up ? TrendingUp : TrendingDown
        const color = flat ? "text-gray-500" : up ? "text-emerald-400" : "text-red-400"
        return (
          <div key={`${item.label}-${i}`} className="flex shrink-0 items-center gap-2 px-4 text-xs">
            <span className="font-semibold text-gray-300">{item.label}</span>
            <span className="font-mono text-gray-400">${formatPrice(item.price)}</span>
            <span className={cn("flex items-center gap-0.5 font-medium", color)}>
              <Icon className="size-3" />
              {Math.abs(item.changePercent).toFixed(2)}%
            </span>
          </div>
        )
      })}
    </>
  )
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>([])

  useEffect(() => {
    let cancelled = false

    const load = () => {
      fetch("/api/market-ticker")
        .then((r) => (r.ok ? r.json() : []))
        .then((data: TickerItem[]) => {
          if (!cancelled && data.length > 0) setItems(data)
        })
        .catch(() => {})
    }

    load()
    const interval = setInterval(load, POLL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return (
    <div className="h-full w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]">
      <div
        className={cn(
          "flex h-full w-max items-center animate-marquee transition-opacity duration-700 ease-out",
          items.length > 0 ? "opacity-100" : "opacity-0"
        )}
      >
        <TickerRow items={items} />
        <TickerRow items={items} />
      </div>
    </div>
  )
}
