"use client"

import { AbsoluteFill, useCurrentFrame } from "remotion"

import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"

// Lesson figure (Remotion): price draws an uptrend of higher highs and higher
// lows, each new high breaks structure (BOS), then a break of the last higher
// low marks the change of character (CHoCH) and a downtrend follows.

const W = 960
const H = 540
const DURATION = 420
const DRAW_END = 330

const GREEN = "#34c28a"
const RED = "#D0625F"
const AMBER = "#fbbf24"

// Swing prices; x is evenly spaced
const PRICES = [100, 108, 104, 114, 109, 119, 106, 115, 101]
const LABELS = ["", "", "HL", "HH", "HL", "HH", "LL", "LH", "LL"]
const LABEL_TONE = ["", "", GREEN, GREEN, GREEN, GREEN, RED, RED, RED]
const X0 = 70
const DX = 102
const px = (i: number) => X0 + DX * i
const py = (p: number) => 440 - (p - 98) * 15.5

const POINTS = PRICES.map((p, i) => [px(i), py(p)] as const)

// Cumulative path length at each swing point
const CUM: number[] = POINTS.reduce<number[]>((acc, [x, y], i) => {
  if (i === 0) return [0]
  const [x0, y0] = POINTS[i - 1]
  return [...acc, acc[i - 1] + Math.hypot(x - x0, y - y0)]
}, [])
const TOTAL = CUM[CUM.length - 1]

/** Where along the path (length) price first crosses `level` on segment from swing `a` to a + 1 */
function crossing(a: number, level: number): { len: number; x: number } {
  const [x0, y0] = POINTS[a]
  const [x1, y1] = POINTS[a + 1]
  const t = (PRICES[a] - level) / (PRICES[a] - PRICES[a + 1])
  return { len: CUM[a] + t * Math.hypot(x1 - x0, y1 - y0), x: x0 + t * (x1 - x0) }
}

// Structure breaks: [from swing, broken level, crossing segment, label, colour]
const BREAKS = [
  { from: 1, level: PRICES[1], seg: 2, label: "BOS", color: GREEN },
  { from: 3, level: PRICES[3], seg: 4, label: "BOS", color: GREEN },
  { from: 4, level: PRICES[4], seg: 5, label: "CHoCH", color: AMBER },
  { from: 6, level: PRICES[6], seg: 7, label: "BOS", color: RED },
].map((b) => ({ ...b, ...crossing(b.seg, b.level) }))

function Caption({ frame, from, to, text }: { frame: number; from: number; to: number; text: string }) {
  const opacity = Math.min(iv(frame, [from, from + 12], [0, 1]), iv(frame, [to - 12, to], [1, 0]))
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 22, textAlign: "center", fontSize: 25, color: "#d1d5db", opacity }}>
      {text}
    </div>
  )
}

function StructureStoryScene() {
  const frame = useCurrentFrame()
  const drawn = iv(frame, [10, DRAW_END], [0, TOTAL])
  const shown = (len: number) => iv(drawn, [len, len + 25], [0, 1])

  const path = POINTS.map(([x, y], i) => `${i ? "L" : "M"}${x},${y}`).join(" ")

  // Captions follow the drawing
  const choch = BREAKS[2]
  const chochFrame = 10 + (choch.len / TOTAL) * (DRAW_END - 10)

  return (
    <AbsoluteFill style={{ background: "#0b0b13", fontFamily: "inherit" }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {/* Break lines from the swing to where price crossed it */}
        {BREAKS.map((b, i) => {
          const o = shown(b.len)
          const [sx, sy] = POINTS[b.from]
          return (
            <g key={i} opacity={o}>
              <line x1={sx} y1={sy} x2={sx + (b.x - sx) * o} y2={sy} stroke={b.color} strokeWidth={3} strokeDasharray="10 7" />
              <text x={(sx + b.x) / 2} y={sy + (b.label === "CHoCH" || b.color === RED ? 30 : -12)} fill={b.color} fontSize={22} fontWeight={700} textAnchor="middle">
                {b.label}
              </text>
            </g>
          )
        })}

        {/* Price */}
        <path
          d={path}
          fill="none"
          stroke="#c4b5fd"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={TOTAL}
          strokeDashoffset={TOTAL - drawn}
        />

        {/* Swing labels */}
        {POINTS.map(([x, y], i) => {
          if (!LABELS[i]) return null
          const o = shown(CUM[i])
          const isHigh = i % 2 === 1
          return (
            <g key={i} opacity={o}>
              <circle cx={x} cy={y} r={7} fill={LABEL_TONE[i]} />
              <text x={x} y={isHigh ? y - 18 : y + 34} fill={LABEL_TONE[i]} fontSize={22} fontWeight={700} textAnchor="middle">
                {LABELS[i]}
              </text>
            </g>
          )
        })}
      </svg>

      <Caption frame={frame} from={0} to={chochFrame - 10} text="Uptrend: higher highs (HH) and higher lows (HL). Each new high breaks structure." />
      <Caption frame={frame} from={chochFrame - 8} to={chochFrame + 75} text="Price breaks the last higher low: a change of character (CHoCH)." />
      <Caption frame={frame} from={chochFrame + 77} to={DURATION} text="Lower highs and lower lows confirm the new downtrend." />
    </AbsoluteFill>
  )
}

export default function StructureStoryFigure() {
  return <RemotionFigure component={StructureStoryScene} durationInFrames={DURATION} width={W} height={H} stillFrame={400} />
}
