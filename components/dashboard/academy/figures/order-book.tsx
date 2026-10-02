"use client"

import { motion } from "framer-motion"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: an order book ladder. Sellers' asks above, buyers' bids
// below, the spread between the best of each.

const ASKS = [
  { price: "100.25", size: 300 },
  { price: "100.20", size: 450 },
  { price: "100.15", size: 200 },
  { price: "100.10", size: 500 },
  { price: "100.05", size: 150 },
]
const BIDS = [
  { price: "100.00", size: 250 },
  { price: "99.95", size: 400 },
  { price: "99.90", size: 350 },
  { price: "99.85", size: 600 },
  { price: "99.80", size: 300 },
]
const MAX = 600

function Row({ price, size, side, i, tag }: { price: string; size: number; side: "ask" | "bid"; i: number; tag?: string }) {
  const ask = side === "ask"
  return (
    <motion.div
      initial={{ opacity: 0, x: ask ? 8 : -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: 0.05 + i * 0.05, ease: EASE_OUT }}
      className="relative flex h-8 items-center justify-between px-3 font-mono text-[13px]"
    >
      <motion.div
        aria-hidden
        className={`absolute inset-y-0.5 right-0 origin-right ${ask ? "bg-red-500/15" : "bg-emerald-500/15"}`}
        style={{ width: `${(size / MAX) * 100}%` }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, delay: 0.2 + i * 0.05, ease: EASE_OUT }}
      />
      <span className={`relative flex items-center gap-2 font-semibold ${ask ? "text-red-300" : "text-emerald-300"}`}>
        {price}
        {tag && (
          <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">{tag}</span>
        )}
      </span>
      <span className="relative text-gray-300">{size}</span>
    </motion.div>
  )
}

export default function OrderBookFigure() {
  return (
    <div className="border border-white/10 bg-[#0b0b13] p-3 sm:p-4">
      <div className="mb-1 flex justify-between px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        <span>Price</span>
        <span>Size waiting</span>
      </div>
      <p className="px-3 pb-1 text-xs text-red-300/70">Sellers (asks)</p>
      {ASKS.map((a, i) => (
        <Row key={a.price} {...a} side="ask" i={i} tag={i === ASKS.length - 1 ? "best ask" : undefined} />
      ))}
      <div className="my-1 flex items-center gap-2 px-3 text-xs text-gray-400">
        <span className="h-px flex-1 bg-white/10" />
        Spread 0.05
        <span className="h-px flex-1 bg-white/10" />
      </div>
      {BIDS.map((b, i) => (
        <Row key={b.price} {...b} side="bid" i={i + ASKS.length} tag={i === 0 ? "best bid" : undefined} />
      ))}
      <p className="px-3 pt-1 text-xs text-emerald-300/70">Buyers (bids)</p>
    </div>
  )
}
