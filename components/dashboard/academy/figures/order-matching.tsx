"use client"

import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion"

import { RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): buyers and sellers wait at different prices, then
// eager buyers pay the sellers' price and each match prints the new "last
// trade". Plays in the browser through @remotion/player; no video file.

const W = 960
const H = 540
const FPS = 30
const DURATION = 300

const GREEN = "#34c28a"
const RED = "#D0625F"
const PURPLE = "#a78bfa"
const EASE = Easing.bezier(0.22, 1, 0.36, 1)

const LEFT_X = 215
const RIGHT_X = 745
// Eager buyers arrive on their own row above the queues and the trade
// happens on that row, so nothing slides over the waiting orders
const ROW_Y = [236, 296, 356]
const NEW_BUYER_Y = 168
const CHIP_W = 230
const CHIP_H = 48

/** Clamped interpolate with the house ease */
function iv(frame: number, input: [number, number], output: [number, number]) {
  return interpolate(frame, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE })
}

function Chip({ x, y, text, color, opacity, scale = 1, glow = false }: {
  x: number
  y: number
  text: string
  color: string
  opacity: number
  scale?: number
  glow?: boolean
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - CHIP_W / 2,
        top: y - CHIP_H / 2,
        width: CHIP_W,
        height: CHIP_H,
        opacity,
        scale: String(scale),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: `2px solid ${color}`,
        background: `${color}22`,
        color: "#f3f4f6",
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 0.2,
        boxShadow: glow ? `0 0 28px ${color}66` : "none",
      }}
    >
      {text}
    </div>
  )
}

function Caption({ frame, from, to, text }: { frame: number; from: number; to: number; text: string }) {
  const opacity = Math.min(iv(frame, [from, from + 12], [0, 1]), iv(frame, [to - 12, to], [1, 0]))
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 34,
        textAlign: "center",
        fontSize: 26,
        color: "#d1d5db",
        opacity,
        translate: `0px ${iv(frame, [from, from + 12], [8, 0])}px`,
      }}
    >
      {text}
    </div>
  )
}

/** A buyer arrives, then buyer and the top ask slide together and match */
function matchTimeline(frame: number, start: number) {
  const arrive = iv(frame, [start, start + 18], [0, 1])
  const travel = iv(frame, [start + 25, start + 55], [0, 1])
  const fade = iv(frame, [start + 62, start + 80], [1, 0])
  const flash = Math.min(iv(frame, [start + 55, start + 60], [0, 1]), iv(frame, [start + 75, start + 90], [1, 0]))
  return { arrive, travel, fade, flash }
}

export function OrderMatchingScene() {
  const frame = useCurrentFrame()

  const m1 = matchTimeline(frame, 70)
  const m2 = matchTimeline(frame, 165)
  // After the first match, the remaining asks move up one row
  const shift = iv(frame, [150, 168], [0, 1])

  const lastPrice = frame < 125 ? null : frame < 220 ? "100.50" : "100.75"
  const tick = Math.max(
    Math.min(iv(frame, [125, 130], [0, 1]), iv(frame, [140, 160], [1, 0])),
    Math.min(iv(frame, [220, 225], [0, 1]), iv(frame, [235, 255], [1, 0])),
  )

  const intro = (i: number) => iv(frame, [i * 6, i * 6 + 20], [0, 1])
  const meetLeft = 480 - CHIP_W / 2 - 4
  const meetRight = 480 + CHIP_W / 2 + 4

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      {/* Last trade */}
      <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontSize: 17, letterSpacing: 3, color: "#9ca3af", textTransform: "uppercase" }}>Last trade</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 52,
            fontWeight: 700,
            color: tick > 0.05 ? GREEN : "#f9fafb",
            textShadow: tick > 0.05 ? `0 0 ${24 * tick}px ${GREEN}` : "none",
          }}
        >
          {lastPrice ?? "--"}
        </div>
      </div>

      {/* Column headers */}
      <div style={{ position: "absolute", left: LEFT_X - CHIP_W / 2, top: 108, width: CHIP_W, textAlign: "center", fontSize: 18, fontWeight: 700, color: GREEN, opacity: intro(0) }}>
        BUYERS
      </div>
      <div style={{ position: "absolute", left: RIGHT_X - CHIP_W / 2, top: 108, width: CHIP_W, textAlign: "center", fontSize: 18, fontWeight: 700, color: RED, opacity: intro(0) }}>
        SELLERS
      </div>

      {/* Waiting bids */}
      {["Buy at 100.00", "Buy at 99.75", "Buy at 99.50"].map((t, i) => (
        <Chip key={t} x={LEFT_X - 60 * (1 - intro(i))} y={ROW_Y[i]} text={t} color={GREEN} opacity={intro(i) * 0.85} />
      ))}

      {/* Asks: 100.50 trades first, 100.75 second, 101.00 stays */}
      <Chip
        x={RIGHT_X + 60 * (1 - intro(0)) + (meetRight - RIGHT_X) * m1.travel}
        y={ROW_Y[0] + (NEW_BUYER_Y - ROW_Y[0]) * m1.travel}
        text="Sell at 100.50"
        color={RED}
        opacity={intro(0) * m1.fade}
        glow={m1.travel > 0.95}
      />
      <Chip
        x={RIGHT_X + 60 * (1 - intro(1)) + (meetRight - RIGHT_X) * m2.travel}
        y={ROW_Y[1] - (ROW_Y[1] - ROW_Y[0]) * shift + (NEW_BUYER_Y - ROW_Y[0]) * m2.travel}
        text="Sell at 100.75"
        color={RED}
        opacity={intro(1) * m2.fade}
        glow={m2.travel > 0.95}
      />
      <Chip
        x={RIGHT_X + 60 * (1 - intro(2))}
        y={ROW_Y[2] - (ROW_Y[2] - ROW_Y[1]) * shift}
        text="Sell at 101.00"
        color={RED}
        opacity={intro(2) * 0.85}
      />

      {/* Eager buyers */}
      <Chip
        x={LEFT_X - 80 * (1 - m1.arrive) + (meetLeft - LEFT_X) * m1.travel}
        y={NEW_BUYER_Y}
        text="Buy at 100.50"
        color={PURPLE}
        opacity={m1.arrive * m1.fade}
        glow
      />
      <Chip
        x={LEFT_X - 80 * (1 - m2.arrive) + (meetLeft - LEFT_X) * m2.travel}
        y={NEW_BUYER_Y}
        text="Buy at 100.75"
        color={PURPLE}
        opacity={m2.arrive * m2.fade}
        glow
      />

      {/* Match bursts */}
      {[{ m: m1, price: "100.50" }, { m: m2, price: "100.75" }].map(({ m, price }) => (
        <div
          key={price}
          style={{
            position: "absolute",
            left: 480 - 110,
            top: NEW_BUYER_Y + CHIP_H / 2 + 10,
            width: 220,
            textAlign: "center",
            fontSize: 22,
            fontWeight: 700,
            color: "#fde68a",
            opacity: m.flash,
            scale: String(0.9 + 0.1 * m.flash),
          }}
        >
          Trade at {price}
        </div>
      ))}

      <Caption frame={frame} from={0} to={78} text="Buyers want to pay less. Sellers want more. No trade yet." />
      <Caption frame={frame} from={80} to={168} text="An eager buyer pays the seller's price. A trade prints." />
      <Caption frame={frame} from={170} to={DURATION} text="Each trade becomes the new price. Eager buyers push it up." />
    </AbsoluteFill>
  )
}

export default function OrderMatchingFigure() {
  return <RemotionFigure component={OrderMatchingScene} durationInFrames={DURATION} width={W} height={H} fps={FPS} stillFrame={260} />
}
