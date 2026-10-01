"use client"

import { AbsoluteFill, useCurrentFrame } from "remotion"

import { Caption, type RCandle, SvgCandle } from "@/components/dashboard/academy/figures/remotion-candles"
import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): equal highs collect buy stops above them; price
// wicks above, triggers them all, and reverses. A liquidity sweep.

const W = 960
const H = 540
const DURATION = 340

const CANDLES: RCandle[] = [
  [100.5, 101.6, 100.3, 101.4],
  [101.4, 102.9, 101.2, 102.7],
  [102.7, 103.6, 102.4, 103.4],
  [103.4, 104.0, 102.9, 103.1],
  [103.1, 103.3, 102.0, 102.2],
  [102.2, 102.6, 101.6, 102.4],
  [102.4, 103.5, 102.2, 103.3],
  [103.3, 104.0, 103.0, 103.2],
  [103.2, 103.5, 102.6, 102.9],
  [102.9, 103.8, 102.7, 103.6],
  [103.6, 105.2, 103.3, 103.4],
  [103.4, 103.5, 101.8, 102.0],
  [102.0, 102.2, 100.6, 100.9],
  [100.9, 101.2, 99.8, 100.1],
]
const SWEEP = 10
const EQH = 104.0

const x = (i: number) => 90 + i * 58
const y = (p: number) => 452 - (p - 99.5) * 66

const appear = (i: number) => 12 + i * 14
// Buy stops waiting above the equal highs
const STOPS = [0, 1, 2, 3, 4, 5, 6].map((k) => ({ x: x(3) + 20 + k * 44, p: 104.25 + (k % 3) * 0.17 }))

export function LiquiditySweepScene() {
  const frame = useCurrentFrame()
  const sweepStart = appear(SWEEP)
  const sweepGrow = iv(frame, [sweepStart, sweepStart + 22], [0, 1])
  // How high the sweep wick has reached so far
  const wickTop = CANDLES[SWEEP][0] + (CANDLES[SWEEP][1] - CANDLES[SWEEP][0]) * sweepGrow

  const cap = (from: number, to: number) => Math.min(iv(frame, [from, from + 12], [0, 1]), iv(frame, [to - 12, to], [1, 0]))

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* Equal highs line */}
        <g opacity={iv(frame, [appear(7) + 8, appear(7) + 24], [0, 1])}>
          <line x1={x(3)} x2={x(SWEEP) + 30} y1={y(EQH)} y2={y(EQH)} stroke="#9ca3af" strokeWidth={2} strokeDasharray="8 6" />
          <text x={x(3)} y={y(EQH) + 26} fill="#9ca3af" fontSize={19} fontWeight={600}>
            Equal highs
          </text>
        </g>

        {/* Stops above them */}
        {STOPS.map((s, k) => {
          const shown = iv(frame, [appear(7) + 14 + k * 4, appear(7) + 24 + k * 4], [0, 1])
          const hit = wickTop >= s.p - 0.05 && s.x <= x(SWEEP) + 200
          const pop = hit ? iv(frame, [sweepStart + 6 + k * 2, sweepStart + 16 + k * 2], [1, 0]) : 1
          return (
            <g key={k} opacity={shown * pop}>
              <circle cx={s.x} cy={y(s.p)} r={hit ? 9 + (1 - pop) * 10 : 8} fill="#fbbf24" fillOpacity={hit ? 0.5 : 0.85} />
            </g>
          )
        })}
        <text x={x(3) + 20} y={y(104.85) - 6} fill="#fbbf24" fontSize={19} fontWeight={700} opacity={iv(frame, [appear(7) + 30, appear(7) + 42], [0, 1]) * iv(frame, [sweepStart + 10, sweepStart + 24], [1, 0])}>
          Buy stops (buy-side liquidity)
        </text>

        {/* Candles */}
        {CANDLES.map((k, i) => {
          if (i === SWEEP) return <SvgCandle key={i} x={x(i)} k={k} y={y} grow={sweepGrow} opacity={sweepGrow > 0 ? 1 : 0} />
          return <SvgCandle key={i} x={x(i)} k={k} y={y} opacity={iv(frame, [appear(i), appear(i) + 8], [0, 1])} grow={iv(frame, [appear(i), appear(i) + 12], [0.2, 1])} />
        })}

        <text x={x(SWEEP)} y={y(105.2) - 14} fill="#fde68a" fontSize={21} fontWeight={700} textAnchor="middle" opacity={iv(frame, [sweepStart + 22, sweepStart + 34], [0, 1])}>
          Sweep
        </text>
      </svg>

      <Caption opacity={cap(0, 128)} text="Equal highs: stops from short sellers and breakout buyers pile up just above." />
      <Caption opacity={cap(130, 212)} text="Price runs above the highs and triggers them all: a liquidity sweep." />
      <Caption opacity={cap(214, DURATION)} text="Big sellers fill against that burst of buying, and price reverses hard." />
    </AbsoluteFill>
  )
}

export default function LiquiditySweepFigure() {
  return <RemotionFigure component={LiquiditySweepScene} durationInFrames={DURATION} width={W} height={H} stillFrame={320} />
}
