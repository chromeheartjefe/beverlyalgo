"use client"

import { AbsoluteFill, useCurrentFrame } from "remotion"

import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): four 15-minute candles become one 1-hour candle.
// Open = first open, high = highest high, low = lowest low, close = last close.

const W = 960
const H = 540
const DURATION = 300

const GREEN = "#34c28a"
const RED = "#D0625F"

type C = { o: number; h: number; l: number; c: number }
const SMALL: C[] = [
  { o: 100, h: 101.2, l: 99.6, c: 100.8 },
  { o: 100.8, h: 101.0, l: 99.2, c: 99.5 },
  { o: 99.5, h: 100.4, l: 99.0, c: 100.2 },
  { o: 100.2, h: 102.0, l: 100.0, c: 101.6 },
]
const BIG: C = { o: 100, h: 102.0, l: 99.0, c: 101.6 }

const TOP = 92
const PX_PER_POINT = 92
const y = (p: number) => TOP + (102.4 - p) * PX_PER_POINT

const SMALL_X = [150, 225, 300, 375]
const BIG_X = 650

function Candle({ x, k, width, grow, opacity = 1 }: { x: number; k: C; width: number; grow: number; opacity?: number }) {
  const color = k.c >= k.o ? GREEN : RED
  const mid = (y(k.h) + y(k.l)) / 2
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity, scale: `1 ${grow}`, transformOrigin: `${x}px ${mid}px` }}>
      <div style={{ position: "absolute", left: x - 1.5, top: y(k.h), width: 3, height: y(k.l) - y(k.h), background: color }} />
      <div
        style={{
          position: "absolute",
          left: x - width / 2,
          top: y(Math.max(k.o, k.c)),
          width,
          height: Math.max(3, Math.abs(y(k.o) - y(k.c))),
          background: color,
        }}
      />
    </div>
  )
}

function Guide({ frame, from, price, label, startX }: { frame: number; from: number; price: number; label: string; startX: number }) {
  const draw = iv(frame, [from, from + 22], [0, 1])
  const endX = BIG_X - 70
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: startX,
          top: y(price),
          width: (endX - startX) * draw,
          borderTop: "2px dashed rgba(196,181,253,0.55)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: BIG_X + 70,
          top: y(price) - 13,
          fontSize: 20,
          color: "#c4b5fd",
          opacity: iv(frame, [from + 18, from + 30], [0, 1]),
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </>
  )
}

function Caption({ frame, from, to, text }: { frame: number; from: number; to: number; text: string }) {
  const opacity = Math.min(iv(frame, [from, from + 12], [0, 1]), iv(frame, [to - 12, to], [1, 0]))
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 26, textAlign: "center", fontSize: 25, color: "#d1d5db", opacity }}>
      {text}
    </div>
  )
}

export function CandleMergeScene() {
  const frame = useCurrentFrame()
  const bigGrow = iv(frame, [175, 215], [0, 1])

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      <div style={{ position: "absolute", left: 100, top: 28, width: 330, textAlign: "center", fontSize: 20, letterSpacing: 2, color: "#9ca3af", opacity: iv(frame, [0, 15], [0, 1]) }}>
        FOUR 15-MIN CANDLES
      </div>
      <div style={{ position: "absolute", left: BIG_X - 140, top: 28, width: 280, textAlign: "center", fontSize: 20, letterSpacing: 2, color: "#9ca3af", opacity: iv(frame, [170, 185], [0, 1]) }}>
        ONE 1-HOUR CANDLE
      </div>

      {SMALL.map((k, i) => (
        <Candle key={i} x={SMALL_X[i]} k={k} width={40} grow={iv(frame, [8 + i * 12, 26 + i * 12], [0, 1])} />
      ))}

      {/* Where each part of the hourly candle comes from */}
      <Guide frame={frame} from={75} price={BIG.o} label="Open: first open" startX={SMALL_X[0] - 20} />
      <Guide frame={frame} from={100} price={BIG.h} label="High: highest high" startX={SMALL_X[3]} />
      <Guide frame={frame} from={125} price={BIG.l} label="Low: lowest low" startX={SMALL_X[2]} />
      <Guide frame={frame} from={150} price={BIG.c} label="Close: last close" startX={SMALL_X[3] + 20} />

      <Candle x={BIG_X} k={BIG} width={84} grow={bigGrow} />

      <Caption frame={frame} from={0} to={72} text="Each candle covers one slice of time. Here: 15 minutes each." />
      <Caption frame={frame} from={74} to={172} text="Zoom out to 1 hour and those four slices become one candle." />
      <Caption frame={frame} from={174} to={DURATION} text="Same trades, same prices. Just a wider window of time." />
    </AbsoluteFill>
  )
}

export default function CandleMergeFigure() {
  return <RemotionFigure component={CandleMergeScene} durationInFrames={DURATION} width={W} height={H} stillFrame={290} />
}
