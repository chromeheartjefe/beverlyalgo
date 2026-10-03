"use client"

import {
  CandlestickSeries, ColorType, createChart, createSeriesMarkers, CrosshairMode, type IChartApi, type IPriceLine, type ISeriesApi,
  type ISeriesMarkersPluginApi, LineStyle, type Time, type UTCTimestamp,
} from "lightweight-charts"
import { GripHorizontal } from "lucide-react"
import { type RefObject, useEffect, useImperativeHandle, useRef, useState } from "react"

import type { SimCandle } from "@/lib/sim/market"
import { cn } from "@/lib/utils"

// The Paper Trading chart. Candles are drawn by Lightweight Charts (Apache 2.0,
// credited on the page as its licence asks); everything on top of them is ours:
// the colours, the entry / stop / target lines and the handles that drag them.

const UP = "#34d399"
const DOWN = "#fb7185"
const ENTRY = "#a78bfa"
const STOP = "#fb7185"
const TARGET = "#34d399"

export interface ChartLines {
  entry: number
  stop: number
  target: number | null
}

export interface SimChartHandle {
  /** Replace everything on the chart */
  reset: (candles: SimCandle[]) => void
  /** Add a candle, or redraw the one being built */
  update: (candle: SimCandle) => void
  /** Mark candles in which a news spike happened */
  setSpikes: (times: number[]) => void
  /** Show (or with null, remove) the lines of the open trade */
  setLines: (lines: ChartLines | null) => void
  /** Scroll back to the newest candle */
  toLatest: () => void
}

const toBar = (c: SimCandle) => ({ time: c.time as UTCTimestamp, open: c.open, high: c.high, low: c.low, close: c.close })

/** Simulated clock: the market has no date, only a time of day */
const clock = (time: Time) => {
  const minutes = Math.floor((Number(time) / 60) % 1440)
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`
}

type DragKind = "stop" | "target"

// The handle is passed as a plain prop (not `ref`): this component is loaded
// with next/dynamic, which doesn't pass refs through.
export function SimChart({
  api, className, onDrag, onReady,
}: {
  api: RefObject<SimChartHandle | null>
  className?: string
  /** Called while a handle is dragged. Return false to refuse the new price. */
  onDrag?: (kind: DragKind, price: number) => boolean
  /** The chart exists and can take data */
  onReady?: () => void
}) {
  const box = useRef<HTMLDivElement>(null)
  const chart = useRef<IChartApi | null>(null)
  const series = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const markers = useRef<ISeriesMarkersPluginApi<Time> | null>(null)
  const priceLines = useRef<Partial<Record<"entry" | DragKind, IPriceLine>>>({})
  const lines = useRef<ChartLines | null>(null)
  const dragCallback = useRef(onDrag)
  dragCallback.current = onDrag
  const readyCallback = useRef(onReady)
  readyCallback.current = onReady
  // Where the drag handles sit, in pixels from the top of the chart
  const [handles, setHandles] = useState<{ stop: number | null; target: number | null }>({ stop: null, target: null })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const c = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontFamily: "inherit",
        fontSize: 12,
        attributionLogo: false, // credited in the page footer instead
      },
      grid: { vertLines: { color: "rgba(255,255,255,0.035)" }, horzLines: { color: "rgba(255,255,255,0.035)" } },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(167,139,250,0.45)", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#4c1d95" },
        horzLine: { color: "rgba(167,139,250,0.45)", width: 1, style: LineStyle.Dashed, labelBackgroundColor: "#4c1d95" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)", scaleMargins: { top: 0.12, bottom: 0.12 } },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        rightOffset: 8,
        barSpacing: 9,
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: clock,
      },
      localization: { timeFormatter: clock },
      handleScroll: { mouseWheel: false, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { mouseWheel: true, pinch: true, axisPressedMouseMove: { time: true, price: true } },
    })
    const s = c.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineColor: "rgba(255,255,255,0.35)",
      priceFormat: { type: "price", precision: 2, minMove: 0.01 },
    })
    chart.current = c
    series.current = s
    markers.current = createSeriesMarkers(s, [])

    // The handles follow their lines through every zoom, scroll and new candle
    let frame = 0
    const follow = () => {
      const l = lines.current
      const y = (price: number | null | undefined) => (price == null ? null : (s.priceToCoordinate(price) as number | null))
      const stop = y(l?.stop)
      const target = y(l?.target)
      setHandles((prev) => (prev.stop === stop && prev.target === target ? prev : { stop, target }))
      frame = requestAnimationFrame(follow)
    }
    frame = requestAnimationFrame(follow)
    readyCallback.current?.()

    return () => {
      cancelAnimationFrame(frame)
      c.remove()
      chart.current = null
      series.current = null
      markers.current = null
      priceLines.current = {}
    }
  }, [])

  useImperativeHandle(api, () => ({
    reset(candles) {
      series.current?.setData(candles.map(toBar))
      chart.current?.timeScale().scrollToRealTime()
    },
    update(candle) {
      series.current?.update(toBar(candle))
    },
    setSpikes(times) {
      markers.current?.setMarkers(
        times.map((time) => ({ time: time as UTCTimestamp, position: "aboveBar" as const, shape: "circle" as const, color: "#fbbf24", text: "News", size: 0.6 })),
      )
    },
    setLines(next) {
      const s = series.current
      if (!s) return
      lines.current = next
      const wanted: [keyof typeof priceLines.current, number | null, string, string][] = [
        ["entry", next?.entry ?? null, ENTRY, "Entry"],
        ["stop", next?.stop ?? null, STOP, "Stop"],
        ["target", next?.target ?? null, TARGET, "Target"],
      ]
      for (const [key, price, color, title] of wanted) {
        const line = priceLines.current[key]
        if (price === null) {
          if (line) s.removePriceLine(line)
          delete priceLines.current[key]
        } else if (line) {
          line.applyOptions({ price })
        } else {
          priceLines.current[key] = s.createPriceLine({
            price,
            color,
            lineWidth: 2,
            lineStyle: key === "entry" ? LineStyle.Solid : LineStyle.Dashed,
            axisLabelVisible: true,
            title,
          })
        }
      }
    },
    toLatest() {
      chart.current?.timeScale().scrollToRealTime()
    },
  }))

  const startDrag = (kind: DragKind) => (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    const handle = e.currentTarget
    handle.setPointerCapture(e.pointerId)
    const move = (ev: PointerEvent) => {
      const el = box.current
      const s = series.current
      if (!el || !s) return
      const price = s.coordinateToPrice(ev.clientY - el.getBoundingClientRect().top)
      if (price != null) dragCallback.current?.(kind, Math.round(Number(price) * 100) / 100)
    }
    const end = () => {
      handle.removeEventListener("pointermove", move)
      handle.removeEventListener("pointerup", end)
      handle.removeEventListener("pointercancel", end)
    }
    handle.addEventListener("pointermove", move)
    handle.addEventListener("pointerup", end)
    handle.addEventListener("pointercancel", end)
  }

  return (
    <div className={cn("relative", className)}>
      <div ref={box} className="absolute inset-0" />
      {onDrag &&
        (["stop", "target"] as const).map((kind) => {
          const y = handles[kind]
          if (y === null || y < 14 || !box.current || y > box.current.clientHeight - 40) return null
          return (
            <button
              key={kind}
              type="button"
              onPointerDown={startDrag(kind)}
              aria-label={kind === "stop" ? "Drag to move the stop" : "Drag to move the target"}
              style={{ top: y }}
              className={cn(
                "absolute left-2 z-10 flex h-8 -translate-y-1/2 cursor-ns-resize touch-none items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold backdrop-blur-sm",
                kind === "stop" ? "border-rose-400/50 bg-rose-500/20 text-rose-100" : "border-emerald-400/50 bg-emerald-500/20 text-emerald-100",
              )}
            >
              <GripHorizontal className="size-3.5" aria-hidden />
              {kind === "stop" ? "Stop" : "Target"}
            </button>
          )
        })}
    </div>
  )
}
