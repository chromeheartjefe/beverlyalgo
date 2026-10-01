"use client"

import { AbsoluteFill, useCurrentFrame } from "remotion"

import { Caption, R_GREEN, SvgCandle } from "@/components/dashboard/academy/figures/remotion-candles"
import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): one trading day as a line on the left, and the
// daily candle it builds on the right. Accumulation near the open, a false
// move below the open (manipulation, the Judas swing), then the real move
// (distribution).

const W = 960
const H = 540
const DURATION = 380
const START = 20
const END = 300

// [time 0..1, price]
const PATH: [number, number][] = [
  [0, 100], [0.06, 100.25], [0.12, 99.8], [0.19, 100.2], [0.26, 99.85], [0.31, 100.05],
  [0.37, 99.3], [0.44, 98.6], [0.5, 99.0],
  [0.58, 99.9], [0.66, 101.2], [0.72, 100.8], [0.84, 103.0], [0.92, 102.6], [1, 103.2],
]
const OPEN = 100
const PHASES = [
  { from: 0, to: 0.31, label: "Accumulation", color: "#9ca3af" },
  { from: 0.31, to: 0.5, label: "Manipulation", color: "#f87171" },
  { from: 0.5, to: 1, label: "Distribution", color: R_GREEN },
]

const LX0 = 60
const LX1 = 640
const tx = (t: number) => LX0 + (LX1 - LX0) * t
const y = (p: number) => 440 - (p - 98) * 62

/** Price on the path at time t */
function priceAt(t: number): number {
  for (let i = 1; i < PATH.length; i++) {
    const [t0, p0] = PATH[i - 1]
    const [t1, p1] = PATH[i]
    if (t <= t1) return p0 + ((t - t0) / (t1 - t0)) * (p1 - p0)
  }
  return PATH[PATH.length - 1][1]
}

export function PowerOfThreeScene() {
  const frame = useCurrentFrame()
  const t = iv(frame, [START, END], [0, 1])

  // The line so far
  const pts = PATH.filter(([pt]) => pt <= t).map(([pt, p]) => `${tx(pt)},${y(p)}`)
  pts.push(`${tx(t)},${y(priceAt(t))}`)

  // The daily candle so far: open, highest high, lowest low, current price
  const seen = PATH.filter(([pt]) => pt <= t).map(([, p]) => p).concat(priceAt(t))
  const daily: [number, number, number, number] = [OPEN, Math.max(...seen), Math.min(...seen), priceAt(t)]

  const cap = (from: number, to: number) => Math.min(iv(frame, [from, from + 12], [0, 1]), iv(frame, [to - 12, to], [1, 0]))
  const at = (pt: number) => START + pt * (END - START)

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* Phase bands */}
        {PHASES.map((ph) => (
          <g key={ph.label} opacity={iv(t, [ph.from, ph.from + 0.04], [0, 1])}>
            <rect x={tx(ph.from)} y={60} width={tx(ph.to) - tx(ph.from)} height={400} fill={ph.color} fillOpacity={0.07} />
            <text x={(tx(ph.from) + tx(ph.to)) / 2} y={52} fill={ph.color} fontSize={19} fontWeight={700} textAnchor="middle">
              {ph.label}
            </text>
          </g>
        ))}

        {/* Opening price */}
        <line x1={LX0} x2={880} y1={y(OPEN)} y2={y(OPEN)} stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="6 6" />
        <text x={LX0 + 4} y={y(OPEN) - 8} fill="#9ca3af" fontSize={17}>
          Daily open
        </text>

        {/* Intraday price */}
        <polyline points={pts.join(" ")} fill="none" stroke="#c4b5fd" strokeWidth={3.5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={tx(t)} cy={y(priceAt(t))} r={6} fill="#c4b5fd" />

        {/* Judas swing label */}
        <text x={tx(0.44)} y={y(98.6) + 34} fill="#f87171" fontSize={18} fontWeight={700} textAnchor="middle" opacity={iv(frame, [at(0.44), at(0.44) + 15], [0, 1])}>
          Judas swing
        </text>

        {/* Daily candle */}
        <text x={800} y={52} fill="#9ca3af" fontSize={19} fontWeight={700} textAnchor="middle">
          Daily candle
        </text>
        <SvgCandle x={800} k={daily} y={y} width={70} />
      </svg>

      <Caption opacity={cap(0, at(0.31))} text="Accumulation: price drifts in a tight range around the open." />
      <Caption opacity={cap(at(0.31) + 2, at(0.52))} text="Manipulation: a false move below the open runs the stops under the range." />
      <Caption opacity={cap(at(0.52) + 2, DURATION)} text="Distribution: the real move. The daily candle shows a long lower wick and a strong close." />
    </AbsoluteFill>
  )
}

export default function PowerOfThreeFigure() {
  return <RemotionFigure component={PowerOfThreeScene} durationInFrames={DURATION} width={W} height={H} stillFrame={370} />
}
