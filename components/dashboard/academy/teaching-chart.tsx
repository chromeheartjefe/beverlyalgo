"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useLayoutEffect, useRef, useState } from "react"

import type { ChartAnnotation, ChartSpec, Series, Tone } from "@/lib/academy/types"
import { cn } from "@/lib/utils"

// Hand-made teaching charts for Entrix Academy: candles or a close line, with
// price lines, trendlines, zones, markers and indicator overlays drawn on top,
// plus an optional volume or indicator pane underneath. Renders at the container's real
// pixel width (not a scaled viewBox) so labels stay readable on phones.
// In tap mode every candle column is a button for "tap the chart" questions.

const UP = "#34c28a"
const DOWN = "#D0625F"

const TONES: Record<Tone, string> = {
  up: UP,
  down: DOWN,
  accent: "#a78bfa",
  neutral: "#9ca3af",
  warn: "#f59e0b",
}

const PAD = { top: 16, right: 56, bottom: 12, left: 8 }

export interface TapState {
  selected: number | null
  onSelect: (index: number) => void
  /** After checking: reveal the answer columns and lock the chart */
  result?: { correct: boolean; targets: number[] } | null
}

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

function annotationPrices(a: ChartAnnotation): number[] {
  if (a.kind === "hline") return [a.price]
  if (a.kind === "zone") return [a.top, a.bottom]
  if (a.kind === "line") return [a.from[1], a.to[1]]
  return []
}

/** Polyline path through a series, broken wherever a value is missing */
function seriesPath(values: (number | null)[], x: (i: number) => number, y: (v: number) => number): string {
  let d = ""
  let pen = false
  values.forEach((v, i) => {
    if (v === null || !Number.isFinite(v)) {
      pen = false
      return
    }
    d += `${pen ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`
    pen = true
  })
  return d
}

const finite = (vs: (number | null)[]) => vs.filter((v): v is number => v !== null && Number.isFinite(v))

export function TeachingChart({
  spec,
  height: heightProp,
  tap,
  className,
}: {
  spec: ChartSpec
  height?: number
  tap?: TapState
  className?: string
}) {
  const height = heightProp ?? spec.height ?? 260
  const [ref, width] = useWidth<HTMLDivElement>()
  const reduceMotion = useReducedMotion()
  const [hover, setHover] = useState<number | null>(null)

  const { candles, style = "candles", annotations = [], highlight, decimals = 2 } = spec
  const n = candles.length

  const log = spec.scale === "log"
  const volumes = spec.pane ? undefined : spec.volumes
  const pane = spec.pane
  const overlays: Series[] = spec.overlays ?? []

  const prices = [
    ...candles.flatMap((c) => (style === "line" ? [c[3]] : [c[1], c[2]])),
    ...annotations.flatMap(annotationPrices),
    ...overlays.flatMap((o) => finite(o.values)),
  ]
  const rawMin = Math.min(...prices)
  const rawMax = Math.max(...prices)
  const span = rawMax - rawMin || 1
  // Extra room where markers sit above highs or below lows, so their text fits
  const padLow = annotations.some((a) => a.kind === "marker" && a.at === "low") ? 0.18 : 0.08
  const padHigh = annotations.some((a) => a.kind === "marker" && a.at === "high") ? 0.2 : 0.12
  // Log scale pads by ratio (and needs prices above zero)
  const min = log ? rawMin / (1 + padLow) : rawMin - span * padLow
  const max = log ? rawMax * (1 + padHigh) : rawMax + span * padHigh

  const plotW = Math.max(0, width - PAD.left - PAD.right)
  // Room for clock labels under the chart
  const padBottom = spec.timeLabels?.length ? 26 : PAD.bottom
  const plotH = height - PAD.top - padBottom
  // With volume, price gets the top ~3/4 and volume bars the rest; an
  // indicator pane gets a little more room
  const priceH = pane ? plotH * 0.64 : volumes ? plotH * 0.74 : plotH
  const volTop = PAD.top + priceH + 10
  const volH = plotH - priceH - 10
  const maxVol = volumes ? Math.max(...volumes, 1) : 1
  const step = n > 0 ? plotW / n : 0
  const x = (i: number) => PAD.left + step * i + step / 2
  const y = (p: number) =>
    PAD.top +
    (log ? (Math.log(max) - Math.log(p)) / (Math.log(max) - Math.log(min)) : (max - p) / (max - min)) * priceH
  const bodyW = Math.max(1.5, Math.min(14, step * 0.62))

  const gridPrices = Array.from({ length: 4 }, (_, i) =>
    log ? min * Math.pow(max / min, (i + 0.5) / 4) : min + ((max - min) * (i + 0.5)) / 4,
  )
  const animate = spec.reveal && !reduceMotion
  const locked = !!tap?.result
  const answerSet = new Set(tap?.result?.targets ?? [])

  const linePath = candles.map((c, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(c[3]).toFixed(1)}`).join(" ")

  // Indicator pane scale: the data, its reference levels, and zero when it has a histogram
  const paneValues = pane
    ? [
        ...(pane.lines ?? []).flatMap((l) => finite(l.values)),
        ...finite(pane.histogram ?? []),
        ...(pane.levels ?? []),
        ...(pane.histogram ? [0] : []),
      ]
    : []
  const paneMin = pane?.min ?? (paneValues.length ? Math.min(...paneValues) : 0)
  const paneMax = pane?.max ?? (paneValues.length ? Math.max(...paneValues) : 1)
  const paneSpan = paneMax - paneMin || 1
  const py = (v: number) => volTop + 4 + ((paneMax - v) / paneSpan) * (volH - 8)

  return (
    <figure className={cn("w-full", className)}>
      <div
        ref={ref}
        className="relative w-full overflow-hidden border border-white/10 bg-[#0b0b13]"
        style={{ height }}
      >
        {width > 0 && (
          <svg width={width} height={height} className="block select-none" role="img" aria-label={spec.caption ?? "Price chart"}>
            {/* Grid and price axis */}
            {gridPrices.map((p) => (
              <g key={p}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(p)} y2={y(p)} stroke="rgba(255,255,255,0.06)" />
                <text x={width - PAD.right + 8} y={y(p) + 3.5} fontSize={10.5} fill="#6b7280" fontFamily="var(--font-ibm-plex-mono), monospace">
                  {p.toFixed(decimals)}
                </text>
              </g>
            ))}

            {/* Session / killzone shading */}
            {(spec.sessions ?? []).map((sn, k) => {
              const color = TONES[sn.tone ?? "accent"]
              const x0 = PAD.left + step * sn.from
              const w = step * (sn.to - sn.from + 1)
              return (
                <g key={`sn${k}`}>
                  <rect x={x0} y={PAD.top} width={w} height={plotH} fill={color} fillOpacity={0.08} />
                  <line x1={x0} x2={x0} y1={PAD.top} y2={PAD.top + plotH} stroke={color} strokeOpacity={0.35} strokeDasharray="3 3" />
                  <text x={x0 + 4} y={PAD.top + plotH - 6} fontSize={10.5} fontWeight={600} fill={color} opacity={0.9}>
                    {sn.label}
                  </text>
                </g>
              )
            })}

            {/* Clock labels */}
            {(spec.timeLabels ?? []).map((t) => (
              <text
                key={`t${t.index}`}
                x={x(t.index)}
                y={height - 8}
                fontSize={10}
                fill="#6b7280"
                textAnchor="middle"
                fontFamily="var(--font-ibm-plex-mono), monospace"
              >
                {t.text}
              </text>
            ))}

            {/* Tap mode: column highlights */}
            {tap &&
              candles.map((_, i) => {
                const isAnswer = locked && answerSet.has(i)
                const isPick = tap.selected === i
                const fill = isAnswer
                  ? "rgba(52,194,138,0.16)"
                  : isPick && locked && !tap.result?.correct
                    ? "rgba(208,98,95,0.18)"
                    : isPick
                      ? "rgba(167,139,250,0.2)"
                      : hover === i && !locked
                        ? "rgba(255,255,255,0.05)"
                        : "transparent"
                return <rect key={i} x={PAD.left + step * i} y={PAD.top} width={step} height={plotH} fill={fill} />
              })}

            {/* Zones */}
            {annotations.map((a, k) =>
              a.kind === "zone" ? (
                <g key={`z${k}`}>
                  <rect
                    x={PAD.left + step * a.from}
                    y={y(a.top)}
                    width={step * ((a.to ?? n - 1) - a.from + 1)}
                    height={Math.max(2, y(a.bottom) - y(a.top))}
                    fill={TONES[a.tone ?? "accent"]}
                    fillOpacity={0.13}
                    stroke={TONES[a.tone ?? "accent"]}
                    strokeOpacity={0.45}
                    strokeDasharray="4 3"
                  />
                  {a.label && (
                    <text x={PAD.left + step * a.from + 6} y={y(a.top) - 6} fontSize={11} fontWeight={600} fill={TONES[a.tone ?? "accent"]}>
                      {a.label}
                    </text>
                  )}
                </g>
              ) : null,
            )}

            {/* Price */}
            {style === "line" ? (
              <motion.path
                d={linePath}
                fill="none"
                stroke="#c4b5fd"
                strokeWidth={2}
                strokeLinejoin="round"
                initial={animate ? { pathLength: 0 } : false}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
              />
            ) : (
              candles.map(([o, h, l, c], i) => {
                const color = c >= o ? UP : DOWN
                const dim = highlight && !highlight.includes(i)
                return (
                  <motion.g
                    key={i}
                    opacity={dim ? 0.3 : 1}
                    initial={animate ? { opacity: 0 } : false}
                    animate={{ opacity: dim ? 0.3 : 1 }}
                    transition={{ duration: 0.25, delay: animate ? i * 0.035 : 0 }}
                  >
                    {style === "ohlc" ? (
                      // Bar chart: high-low line, open tick left, close tick right
                      <>
                        <line x1={x(i)} x2={x(i)} y1={y(h)} y2={y(l)} stroke={color} strokeWidth={1.6} />
                        <line x1={x(i) - bodyW / 2} x2={x(i)} y1={y(o)} y2={y(o)} stroke={color} strokeWidth={1.6} />
                        <line x1={x(i)} x2={x(i) + bodyW / 2} y1={y(c)} y2={y(c)} stroke={color} strokeWidth={1.6} />
                      </>
                    ) : (
                      <>
                        <line x1={x(i)} x2={x(i)} y1={y(h)} y2={y(l)} stroke={color} strokeWidth={1.2} />
                        <rect
                          x={x(i) - bodyW / 2}
                          y={y(Math.max(o, c))}
                          width={bodyW}
                          height={Math.max(1, Math.abs(y(o) - y(c)))}
                          fill={color}
                        />
                      </>
                    )}
                  </motion.g>
                )
              })
            )}

            {/* Volume pane */}
            {volumes && (
              <g>
                <line x1={PAD.left} x2={width - PAD.right} y1={volTop - 5} y2={volTop - 5} stroke="rgba(255,255,255,0.08)" />
                <text x={width - PAD.right + 8} y={volTop + 9} fontSize={10} fill="#6b7280">
                  Vol
                </text>
                {volumes.map((v, i) => {
                  const [o, , , c] = candles[i] ?? [0, 0, 0, 0]
                  const h = (v / maxVol) * volH
                  const dim = highlight && !highlight.includes(i)
                  return (
                    <rect
                      key={`v${i}`}
                      x={x(i) - bodyW / 2}
                      y={volTop + volH - h}
                      width={bodyW}
                      height={Math.max(1, h)}
                      fill={c >= o ? UP : DOWN}
                      opacity={dim ? 0.15 : 0.5}
                    />
                  )
                })}
              </g>
            )}

            {/* Indicator overlays (moving averages, bands, VWAP) */}
            {overlays.map((o, k) => (
              <path
                key={`o${k}`}
                d={seriesPath(o.values, x, y)}
                fill="none"
                stroke={TONES[o.tone ?? "accent"]}
                strokeWidth={1.6}
                strokeDasharray={o.dashed ? "4 3" : undefined}
                strokeLinejoin="round"
                opacity={0.95}
              />
            ))}
            {overlays
              .filter((o) => o.label)
              .map((o, k) => (
                <text
                  key={`ol${k}`}
                  x={PAD.left + 6 + k * 74}
                  y={PAD.top + 10}
                  fontSize={10.5}
                  fontWeight={600}
                  fill={TONES[o.tone ?? "accent"]}
                  stroke="#0b0b13"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {o.label}
                </text>
              ))}

            {/* Indicator pane */}
            {pane && (
              <g>
                <line x1={PAD.left} x2={width - PAD.right} y1={volTop - 5} y2={volTop - 5} stroke="rgba(255,255,255,0.08)" />
                {(pane.levels ?? []).map((lv) => (
                  <g key={`lv${lv}`}>
                    <line x1={PAD.left} x2={width - PAD.right} y1={py(lv)} y2={py(lv)} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
                    <text x={width - PAD.right + 8} y={py(lv) + 3.5} fontSize={10} fill="#6b7280" fontFamily="var(--font-ibm-plex-mono), monospace">
                      {lv.toFixed(pane.decimals ?? 0)}
                    </text>
                  </g>
                ))}
                {pane.histogram && (
                  <>
                    <line x1={PAD.left} x2={width - PAD.right} y1={py(0)} y2={py(0)} stroke="rgba(255,255,255,0.12)" />
                    {pane.histogram.map((v, i) =>
                      v === null ? null : (
                        <rect
                          key={`hb${i}`}
                          x={x(i) - bodyW / 2}
                          y={Math.min(py(0), py(v))}
                          width={bodyW}
                          height={Math.max(1, Math.abs(py(v) - py(0)))}
                          fill={v >= 0 ? UP : DOWN}
                          opacity={0.45}
                        />
                      ),
                    )}
                  </>
                )}
                {(pane.lines ?? []).map((l, k) => (
                  <path
                    key={`pl${k}`}
                    d={seriesPath(l.values, x, py)}
                    fill="none"
                    stroke={TONES[l.tone ?? "accent"]}
                    strokeWidth={1.5}
                    strokeDasharray={l.dashed ? "4 3" : undefined}
                  />
                ))}
                {(pane.segments ?? []).map((sg, k) => (
                  <line
                    key={`ps${k}`}
                    x1={x(sg.from[0])}
                    y1={py(sg.from[1])}
                    x2={x(sg.to[0])}
                    y2={py(sg.to[1])}
                    stroke={TONES[sg.tone ?? "warn"]}
                    strokeWidth={2}
                  />
                ))}
                <text x={PAD.left + 6} y={volTop + 8} fontSize={10.5} fontWeight={600} fill="#9ca3af" stroke="#0b0b13" strokeWidth={3} paintOrder="stroke">
                  {pane.label}
                </text>
              </g>
            )}

            {/* Line mode: a dot on the picked point and, after checking, on the answer */}
            {tap &&
              style === "line" &&
              candles.map((c, i) => {
                const targets = tap.result?.targets ?? []
                const isAnswer = locked && i === targets[Math.floor(targets.length / 2)]
                const isPick = tap.selected === i
                if (!isAnswer && !isPick) return null
                const color = !locked ? "#c4b5fd" : isAnswer || tap.result?.correct ? UP : DOWN
                return <circle key={`d${i}`} cx={x(i)} cy={y(c[3])} r={5} fill={color} stroke="#0b0b13" strokeWidth={2} />
              })}

            {/* Lines and markers on top of price */}
            {annotations.map((a, k) => {
              if (a.kind === "hline") {
                const color = TONES[a.tone ?? "neutral"]
                return (
                  <g key={`h${k}`}>
                    <line
                      x1={PAD.left}
                      x2={width - PAD.right}
                      y1={y(a.price)}
                      y2={y(a.price)}
                      stroke={color}
                      strokeWidth={1.2}
                      strokeDasharray={a.dashed ? "5 4" : undefined}
                    />
                    {a.label && (
                      <text x={PAD.left + 6} y={y(a.price) - 6} fontSize={11} fontWeight={600} fill={color}>
                        {a.label}
                      </text>
                    )}
                  </g>
                )
              }
              if (a.kind === "line") {
                const color = TONES[a.tone ?? "accent"]
                const [i1, p1] = a.from
                const [i2, p2] = a.to
                // Optionally run on to the right edge along the same slope
                const iEnd = a.extend && i2 !== i1 ? n - 0.5 : i2
                const pEnd = a.extend && i2 !== i1 ? p1 + ((p2 - p1) / (i2 - i1)) * (iEnd - i1) : p2
                const xEnd = a.extend ? PAD.left + step * iEnd + step / 2 : x(i2)
                return (
                  <g key={`l${k}`}>
                    <line
                      x1={x(i1)}
                      y1={y(p1)}
                      x2={Math.min(xEnd, width - PAD.right)}
                      y2={y(pEnd)}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeDasharray={a.dashed ? "5 4" : undefined}
                    />
                    {a.label && (
                      <text
                        x={(x(i1) + x(i2)) / 2}
                        y={Math.min(y(p1), y(p2)) - 6}
                        fontSize={11}
                        fontWeight={600}
                        fill={color}
                        textAnchor="middle"
                        stroke="#0b0b13"
                        strokeWidth={3}
                        paintOrder="stroke"
                      >
                        {a.label}
                      </text>
                    )}
                  </g>
                )
              }
              if (a.kind === "marker") {
                const color = TONES[a.tone ?? "accent"]
                const [, h, l] = candles[a.index] ?? [0, 0, 0, 0]
                const above = a.at === "high"
                const py = above ? y(style === "line" ? candles[a.index][3] : h) - 10 : y(style === "line" ? candles[a.index][3] : l) + 18
                return (
                  <text key={`m${k}`} x={x(a.index)} y={py} fontSize={11} fontWeight={600} fill={color} textAnchor="middle">
                    {a.text}
                  </text>
                )
              }
              return null
            })}

            {/* Tap mode: hit areas last, so they sit above everything */}
            {tap &&
              candles.map((_, i) => (
                <rect
                  key={`hit${i}`}
                  x={PAD.left + step * i}
                  y={0}
                  width={step}
                  height={height}
                  fill="transparent"
                  role="button"
                  tabIndex={locked ? -1 : 0}
                  aria-label={`Point ${i + 1} of ${n}`}
                  aria-pressed={tap.selected === i}
                  className={cn("outline-none", !locked && "cursor-pointer")}
                  onPointerEnter={() => setHover(i)}
                  onPointerLeave={() => setHover((h) => (h === i ? null : h))}
                  // Keyboard focus lights the point up the same way
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover((h) => (h === i ? null : h))}
                  onClick={() => !locked && tap.onSelect(i)}
                  onKeyDown={(e) => {
                    if (!locked && (e.key === " " || e.key === "Enter")) {
                      e.preventDefault()
                      tap.onSelect(i)
                    }
                  }}
                />
              ))}
          </svg>
        )}
      </div>
      {spec.caption && <figcaption className="mt-2 text-xs text-gray-500">{spec.caption}</figcaption>}
    </figure>
  )
}
