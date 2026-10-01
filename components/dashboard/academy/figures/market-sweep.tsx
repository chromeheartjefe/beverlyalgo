"use client"

import { AbsoluteFill, useCurrentFrame } from "remotion"

import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): a market buy for 600 fills against the order
// book, using up the best ask and part of the next level, so the average
// price ends up worse than the price on screen. That gap is slippage.

const W = 960
const H = 540
const DURATION = 330

const GREEN = "#34c28a"
const RED = "#D0625F"
const PURPLE = "#a78bfa"

const ROW_H = 44
const BOOK_X = 520
const BOOK_W = 380
const BAR_MAX = 600

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
]
const ASK_TOP = 52
const SPREAD_Y = ASK_TOP + ASKS.length * ROW_H
const BID_TOP = SPREAD_Y + 30

function Row({ y, price, size, color, opacity = 1, flash = 0 }: {
  y: number
  price: string
  size: number
  color: string
  opacity?: number
  flash?: number
}) {
  return (
    <div style={{ position: "absolute", left: BOOK_X, top: y, width: BOOK_W, height: ROW_H - 6, opacity }}>
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: (size / BAR_MAX) * BOOK_W,
          background: `${color}2e`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `rgba(253,230,138,${0.25 * flash})`,
        }}
      />
      <div style={{ position: "absolute", left: 14, top: 7, fontSize: 21, fontWeight: 600, color }}>{price}</div>
      <div style={{ position: "absolute", right: 14, top: 7, fontSize: 21, color: "#e5e7eb" }}>{Math.round(size)}</div>
    </div>
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

export function MarketSweepScene() {
  const frame = useCurrentFrame()
  const intro = iv(frame, [0, 25], [0, 1])

  // 150 at 100.05, then 450 of the 500 at 100.10
  const fill1 = iv(frame, [100, 130], [0, 150])
  const fill2 = iv(frame, [140, 175], [0, 450])
  const left = 600 - fill1 - fill2
  const flash1 = Math.min(iv(frame, [100, 106], [0, 1]), iv(frame, [126, 140], [1, 0]))
  const flash2 = Math.min(iv(frame, [140, 146], [0, 1]), iv(frame, [171, 185], [1, 0]))
  const result = iv(frame, [200, 222], [0, 1])

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      {/* Order book */}
      <div style={{ position: "absolute", left: BOOK_X, top: 16, width: BOOK_W, display: "flex", justifyContent: "space-between", fontSize: 16, color: "#9ca3af", letterSpacing: 2, opacity: intro }}>
        <span>PRICE</span>
        <span>SIZE</span>
      </div>
      {ASKS.map((a, i) => {
        const isBest = i === ASKS.length - 1
        const isNext = i === ASKS.length - 2
        const size = isBest ? a.size - fill1 : isNext ? a.size - fill2 : a.size
        return (
          <Row
            key={a.price}
            y={ASK_TOP + i * ROW_H}
            price={a.price}
            size={size}
            color={RED}
            opacity={intro * (isBest ? 1 - 0.75 * iv(frame, [130, 140], [0, 1]) : 1)}
            flash={isBest ? flash1 : isNext ? flash2 : 0}
          />
        )
      })}
      <div style={{ position: "absolute", left: BOOK_X, top: SPREAD_Y + 2, width: BOOK_W, textAlign: "center", fontSize: 16, color: "#6b7280", opacity: intro }}>
        spread
      </div>
      {BIDS.map((b, i) => (
        <Row key={b.price} y={BID_TOP + i * ROW_H} price={b.price} size={b.size} color={GREEN} opacity={intro} />
      ))}

      {/* Your order */}
      <div style={{ position: "absolute", left: 60, top: 40, fontSize: 17, letterSpacing: 2, color: "#9ca3af", opacity: iv(frame, [35, 50], [0, 1]) }}>
        YOUR ORDER
      </div>
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 72,
          width: 360,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${PURPLE}`,
          background: `${PURPLE}22`,
          boxShadow: `0 0 28px ${PURPLE}55`,
          fontSize: 26,
          fontWeight: 700,
          color: "#f3f4f6",
          opacity: iv(frame, [40, 60], [0, 1]),
          translate: `${iv(frame, [40, 60], [-40, 0])}px 0px`,
        }}
      >
        Market BUY 600
      </div>
      <div style={{ position: "absolute", left: 60, top: 148, fontSize: 20, color: "#9ca3af", opacity: iv(frame, [60, 75], [0, 1]) }}>
        Left to fill: <span style={{ color: "#f9fafb", fontWeight: 700 }}>{Math.round(left)}</span>
      </div>

      {/* Fills */}
      <div style={{ position: "absolute", left: 60, top: 200, fontSize: 22, color: "#e5e7eb", opacity: iv(frame, [128, 140], [0, 1]) }}>
        150 filled at <span style={{ color: RED, fontWeight: 700 }}>100.05</span>
      </div>
      <div style={{ position: "absolute", left: 60, top: 238, fontSize: 22, color: "#e5e7eb", opacity: iv(frame, [173, 185], [0, 1]) }}>
        450 filled at <span style={{ color: RED, fontWeight: 700 }}>100.10</span>
      </div>

      {/* Result */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 296,
          width: 360,
          padding: "16px 18px",
          border: "2px solid #fbbf2466",
          background: "#fbbf2414",
          opacity: result,
          translate: `0px ${(1 - result) * 10}px`,
        }}
      >
        <div style={{ fontSize: 18, color: "#fcd34d", letterSpacing: 1 }}>AVERAGE PRICE</div>
        <div style={{ fontSize: 34, fontWeight: 700, color: "#fef3c7", marginTop: 2 }}>100.0875</div>
        <div style={{ fontSize: 18, color: "#d1d5db", marginTop: 6 }}>Screen showed 100.05. You paid 0.0375 more per unit.</div>
      </div>

      <Caption frame={frame} from={0} to={95} text="A market order fills right away, against the orders waiting in the book." />
      <Caption frame={frame} from={97} to={198} text="It eats through each price level until it is completely filled." />
      <Caption frame={frame} from={200} to={DURATION} text="The gap between the price you saw and the price you got is slippage." />
    </AbsoluteFill>
  )
}

export default function MarketSweepFigure() {
  return <RemotionFigure component={MarketSweepScene} durationInFrames={DURATION} width={W} height={H} stillFrame={300} />
}
