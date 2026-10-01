"use client"

// Candle drawing shared by the Remotion lesson scenes. Plain SVG driven by
// props, so each scene controls reveal and growth from its own frame.

export type RCandle = [number, number, number, number]

export const R_GREEN = "#34c28a"
export const R_RED = "#D0625F"

export function SvgCandle({
  x,
  k,
  y,
  width = 26,
  opacity = 1,
  grow = 1,
}: {
  x: number
  k: RCandle
  y: (p: number) => number
  width?: number
  opacity?: number
  /** 0..1: how much of the candle has formed, growing out from the open */
  grow?: number
}) {
  const [o, h, l, c] = k
  const color = c >= o ? R_GREEN : R_RED
  // Grow every price out of the open
  const g = (p: number) => o + (p - o) * grow
  return (
    <g opacity={opacity}>
      <line x1={x} x2={x} y1={y(g(h))} y2={y(g(l))} stroke={color} strokeWidth={3} />
      <rect
        x={x - width / 2}
        y={y(Math.max(o, g(c)))}
        width={width}
        height={Math.max(3, Math.abs(y(o) - y(g(c))))}
        fill={color}
      />
    </g>
  )
}

export function Caption({ opacity, text }: { opacity: number; text: string }) {
  return (
    <div style={{ position: "absolute", left: 40, right: 40, bottom: 22, textAlign: "center", fontSize: 25, color: "#d1d5db", opacity }}>
      {text}
    </div>
  )
}
