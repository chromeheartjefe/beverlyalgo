"use client"

import CandleChart from "@/components/ui/candle-chart"

function SignalMarker({
  label,
  variant,
  style,
}: {
  label: string
  variant: "buy" | "sell"
  style: React.CSSProperties
}) {
  const up = variant === "buy"

  return (
    <div className="pointer-events-none absolute z-20 flex flex-col items-center" style={style}>
      <span
        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-lg shadow-black/40 backdrop-blur-sm ${
          up
            ? "border-emerald-400/40 bg-emerald-500/25 text-emerald-300"
            : "border-rose-400/40 bg-rose-500/25 text-rose-300"
        }`}
      >
        {label}
      </span>
      <span className="relative mt-1.5 flex size-2.5">
        <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${up ? "bg-emerald-400" : "bg-rose-400"}`} />
        <span className={`relative inline-flex size-2.5 rounded-full ring-2 ring-[#0c0c14] ${up ? "bg-emerald-400" : "bg-rose-400"}`} />
      </span>
    </div>
  )
}

export function IndicatorSignalPreview({
  height = 170,
  volumeHeight = 24,
  className,
  // Vertical anchors for the two badges — the wick geometry shifts as
  // `height`/`volumeHeight` change, so these must be recalibrated per size
  // (measured against actual rendered candle positions, not guessed).
  sellTop = "3%",
  buyTop = "39%",
}: {
  height?: number
  volumeHeight?: number
  className?: string
  sellTop?: string
  buyTop?: string
}) {
  return (
    <div className={`relative flex h-full flex-col justify-center overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-purple-500/[0.06] to-transparent p-5 ${className ?? ""}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(168,85,247,0.12),transparent_60%)]" />

      <div className="relative" style={{ ["--surface" as string]: "#0c0c14" }}>
        <CandleChart
          seed={51}
          symbol="BTCUSD"
          exchange="ENTRIXALGO"
          chrome={false}
          interactive={false}
          showLastClose={false}
          height={height}
          volumeHeight={volumeHeight}
          topPad={0.35}
        />

        {/* SELL: fires at the seeded series' local peak, ~20% across the visible candles */}
        <SignalMarker label="SELL 88%" variant="sell" style={{ left: "20%", top: sellTop, transform: "translateX(-50%)" }} />
        {/* BUY: fires at the seeded series' deepest low, ~75% across the visible candles */}
        <SignalMarker label="BUY 91%" variant="buy" style={{ left: "75%", top: buyTop, transform: "translateX(-50%)" }} />
      </div>

      <p className="relative z-10 mt-4 text-center text-[11px] text-gray-600">
        Live example — signals render directly on your TradingView chart
      </p>
    </div>
  )
}
