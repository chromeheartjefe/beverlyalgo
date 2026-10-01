"use client"

import { AbsoluteFill, useCurrentFrame } from "remotion"

import { Caption, type RCandle, SvgCandle } from "@/components/dashboard/academy/figures/remotion-candles"
import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): a displacement candle leaves a bullish fair value
// gap between candle 1's high and candle 3's low. Price runs on, comes back
// into the gap near its midpoint (consequent encroachment), and continues.

const W = 960
const H = 540
const DURATION = 330

const CANDLES: RCandle[] = [
  [100.0, 100.6, 99.7, 100.4],
  [100.4, 100.9, 100.1, 100.7],
  [100.7, 103.4, 100.6, 103.2],
  [103.2, 104.0, 102.0, 103.8],
  [103.8, 104.6, 103.5, 104.3],
  [104.3, 104.5, 103.0, 103.2],
  [103.2, 103.3, 101.45, 101.7],
  [101.7, 103.0, 101.6, 102.8],
  [102.8, 104.8, 102.6, 104.6],
  [104.6, 105.6, 104.3, 105.4],
]
const GAP_TOP = CANDLES[3][2]
const GAP_BOTTOM = CANDLES[1][1]
const CE = (GAP_TOP + GAP_BOTTOM) / 2

const x = (i: number) => 110 + i * 74
const y = (p: number) => 452 - (p - 99.4) * 60

// Candles 0-3 come in quickly, then a pause to show the gap, then the rest
const appear = (i: number) => (i <= 3 ? 10 + i * 18 : 130 + (i - 4) * 22)

export function FvgFillScene() {
  const frame = useCurrentFrame()
  const box = iv(frame, [92, 110], [0, 1])
  const ce = iv(frame, [110, 124], [0, 1])
  const touch = Math.min(iv(frame, [appear(6) + 10, appear(6) + 18], [0, 1]), iv(frame, [appear(6) + 30, appear(6) + 50], [1, 0.35]))
  const cap = (from: number, to: number) => Math.min(iv(frame, [from, from + 12], [0, 1]), iv(frame, [to - 12, to], [1, 0]))

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* The gap */}
        <g opacity={box}>
          <rect
            x={x(1) - 16}
            y={y(GAP_TOP)}
            width={x(9) - x(1) + 40}
            height={y(GAP_BOTTOM) - y(GAP_TOP)}
            fill="#a78bfa"
            fillOpacity={0.14 + touch * 0.22}
            stroke="#a78bfa"
            strokeOpacity={0.6}
            strokeDasharray="8 6"
          />
          <text x={x(9) + 30} y={y(GAP_TOP) - 10} fill="#c4b5fd" fontSize={20} fontWeight={700} textAnchor="end">
            Fair value gap
          </text>
        </g>
        <g opacity={ce}>
          <line x1={x(1) - 16} x2={x(9) + 24} y1={y(CE)} y2={y(CE)} stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" />
          <text x={x(9) + 30} y={y(CE) + 26} fill="#fbbf24" fontSize={18} fontWeight={600} textAnchor="end">
            50% (CE)
          </text>
        </g>

        {/* Gap edges: candle 1 high and candle 3 low */}
        <g opacity={box * iv(frame, [120, 130], [1, 0])}>
          <text x={x(1)} y={y(GAP_BOTTOM) + 26} fill="#9ca3af" fontSize={17} textAnchor="middle">
            Candle 1 high
          </text>
          <text x={x(3)} y={y(GAP_TOP) - 12} fill="#9ca3af" fontSize={17} textAnchor="middle">
            Candle 3 low
          </text>
        </g>

        {CANDLES.map((k, i) => (
          <SvgCandle
            key={i}
            x={x(i)}
            k={k}
            y={y}
            width={34}
            opacity={iv(frame, [appear(i), appear(i) + 8], [0, 1])}
            grow={iv(frame, [appear(i), appear(i) + 14], [0.15, 1])}
          />
        ))}
      </svg>

      <Caption opacity={cap(0, 88)} text="A fast candle moves so hard that it leaves a gap: candle 1's high and candle 3's low don't overlap." />
      <Caption opacity={cap(90, 182)} text="That gap is a fair value gap. Its midpoint is called consequent encroachment (CE)." />
      <Caption opacity={cap(184, 248)} text="Price often comes back into the gap to rebalance it..." />
      <Caption opacity={cap(250, DURATION)} text="...and then carries on in the direction of the original move." />
    </AbsoluteFill>
  )
}

export default function FvgFillFigure() {
  return <RemotionFigure component={FvgFillScene} durationInFrames={DURATION} width={W} height={H} stillFrame={315} />
}
