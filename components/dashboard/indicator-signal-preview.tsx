"use client"

import CandleChart from "@/components/ui/candle-chart"

function SignalMarker({
  label,
  variant,
  left,
  top,
}: {
  label: string
  variant: "buy" | "sell"
  left: string
  top: string
}) {
  const up = variant === "buy"

  return (
    // Outer div is a zero-size anchor at the exact (left, top) target — always
    // a percentage of the chart's own SVG box (see CandleChart usage below),
    // so it stays glued to the same candle at every screen size/zoom level.
    <div className="pointer-events-none absolute z-20" style={{ left, top }}>
      {/* Centering this on the anchor (rather than the outer div) means the
          DOT's center — not some corner of the label pill — is the point that
          actually sits on the anchor; the pill floats a fixed 6px above it via
          `bottom-full`, so its own (variable, font-dependent) height never
          throws off the glued position. */}
      <div className="relative flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span
          className={`absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-lg shadow-black/40 backdrop-blur-sm ${
            up
              ? "border-emerald-400/40 bg-emerald-500/25 text-emerald-300"
              : "border-rose-400/40 bg-rose-500/25 text-rose-300"
          }`}
        >
          {label}
        </span>
        <span className="relative flex size-2.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${up ? "bg-emerald-400" : "bg-rose-400"}`} />
          <span className={`relative inline-flex size-2.5 rounded-full ring-2 ring-[#0c0c14] ${up ? "bg-emerald-400" : "bg-rose-400"}`} />
        </span>
      </div>
    </div>
  )
}

export function IndicatorSignalPreview({
  height = 170,
  volumeHeight = 24,
  className,
  // Anchors for the two badges' dots, glued to the exact candle wick they
  // call out (seed=51's local peak/trough within the default 6M/80-candle
  // view). Percentages are of the chart's OWN SVG box — CandleChart is
  // rendered with chrome=false/showDateAxis=false so that box has no extra
  // fixed-height chrome mixed in, which is what keeps these accurate at
  // every width instead of drifting on narrower/wider screens.
  // Horizontal position doesn't depend on height/volumeHeight (only vertical
  // does, since it's a fraction of the price-axis scale), so it's fixed here.
  sellLeft = "20.1%",
  sellTop = "21.1%",
  buyLeft = "75.2%",
  buyTop = "64.3%",
}: {
  height?: number
  volumeHeight?: number
  className?: string
  sellLeft?: string
  sellTop?: string
  buyLeft?: string
  buyTop?: string
}) {
  return (
    <div className={`relative flex h-full flex-col justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-purple-500/[0.06] to-transparent p-5 ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.12),transparent_60%)]" />

      {/* CandleChart's `fill` mode measures this box in 1:1 px (ResizeObserver)
          instead of drawing a fixed-size viewBox and scaling it with CSS — so
          the chart genuinely fills the card at any width, on any screen size,
          without either leaving empty space (the old max-w-[600px] cap) or
          getting blurrily magnified (plain CSS width:100% on a fixed viewBox
          would scale candles/text up on very wide screens). Height still has
          to come from us: fill mode has nothing to measure without it. */}
      <div
        className="relative w-full"
        style={{ height: height + volumeHeight + 8, ["--surface" as string]: "#0c0c14" }}
      >
        <CandleChart
          seed={51}
          symbol="BTCUSD"
          exchange="ENTRIXALGO"
          chrome={false}
          interactive={false}
          showLastClose={false}
          showDateAxis={false}
          fill
          volumeHeight={volumeHeight}
          topPad={0.35}
        />

        {/* SELL: fires at the seeded series' local peak */}
        <SignalMarker label="SELL 88%" variant="sell" left={sellLeft} top={sellTop} />
        {/* BUY: fires at the seeded series' deepest low */}
        <SignalMarker label="BUY 91%" variant="buy" left={buyLeft} top={buyTop} />
      </div>

      <p className="relative z-10 mt-4 text-center text-[11px] text-gray-600">
        Live example — signals render directly on your TradingView chart
      </p>
    </div>
  )
}
