"use client"

import { motion } from "framer-motion"

import { EASE_OUT } from "@/components/ui/motion"

// Lesson figure: a bullish and a bearish candle with every part labelled.

const UP = "#34c28a"
const DOWN = "#D0625F"

function Label({ x, y, text, anchor = "start", delay }: { x: number; y: number; text: string; anchor?: "start" | "middle" | "end"; delay: number }) {
  return (
    <motion.text
      x={x}
      y={y}
      fontSize={12}
      fill="#d1d5db"
      textAnchor={anchor}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay, ease: EASE_OUT }}
    >
      {text}
    </motion.text>
  )
}

function Tick({ x1, x2, y, delay }: { x1: number; x2: number; y: number; delay: number }) {
  return (
    <motion.line
      x1={x1}
      x2={x2}
      y1={y}
      y2={y}
      stroke="rgba(196,181,253,0.6)"
      strokeDasharray="3 3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
    />
  )
}

/** One labelled candle; `x` is its centre. Labels go left (bull) or right (bear). */
function Anatomy({ x, bull, side, delay }: { x: number; bull: boolean; side: "left" | "right"; delay: number }) {
  const color = bull ? UP : DOWN
  // Same shape for both: high 30, body 80-170, low 220
  const high = 30
  const low = 220
  const top = 80
  const bottom = 170
  const openY = bull ? bottom : top
  const closeY = bull ? top : bottom
  const lx = side === "left" ? x - 34 : x + 34
  const tx = side === "left" ? x - 40 : x + 40
  const anchor = side === "left" ? "end" : "start"
  const d = (k: number) => delay + 0.35 + k * 0.12
  return (
    <g>
      <motion.g
        initial={{ opacity: 0, scaleY: 0.4 }}
        animate={{ opacity: 1, scaleY: 1 }}
        style={{ transformOrigin: `${x}px 125px` }}
        transition={{ duration: 0.45, delay, ease: EASE_OUT }}
      >
        <line x1={x} x2={x} y1={high} y2={low} stroke={color} strokeWidth={3} />
        <rect x={x - 22} y={top} width={44} height={bottom - top} fill={color} />
      </motion.g>
      <Tick x1={x} x2={lx} y={high} delay={d(0)} />
      <Label x={tx} y={high + 4} text="High" anchor={anchor} delay={d(0)} />
      <Tick x1={x} x2={lx} y={closeY} delay={d(1)} />
      <Label x={tx} y={closeY + 4} text={bull ? "Close" : "Open"} anchor={anchor} delay={d(1)} />
      <Tick x1={x} x2={lx} y={openY} delay={d(2)} />
      <Label x={tx} y={openY + 4} text={bull ? "Open" : "Close"} anchor={anchor} delay={d(2)} />
      <Tick x1={x} x2={lx} y={low} delay={d(3)} />
      <Label x={tx} y={low + 4} text="Low" anchor={anchor} delay={d(3)} />
    </g>
  )
}

export default function CandleAnatomyFigure() {
  return (
    <div className="border border-white/10 bg-[#0b0b13] px-2 py-4">
      <svg viewBox="0 0 360 260" className="mx-auto block w-full max-w-md" role="img" aria-label="A bullish and a bearish candle with open, high, low and close labelled">
        <Anatomy x={115} bull side="left" delay={0} />
        <Anatomy x={245} bull={false} side="right" delay={0.15} />
        {/* Shared part names in the middle */}
        <Label x={180} y={58} text="Upper wick" anchor="middle" delay={1} />
        <Label x={180} y={130} text="Body" anchor="middle" delay={1.1} />
        <Label x={180} y={200} text="Lower wick" anchor="middle" delay={1.2} />
        <text x={115} y={250} fontSize={12} fontWeight={600} fill={UP} textAnchor="middle">
          Bullish: closed higher
        </text>
        <text x={245} y={250} fontSize={12} fontWeight={600} fill={DOWN} textAnchor="middle">
          Bearish: closed lower
        </text>
      </svg>
    </div>
  )
}
