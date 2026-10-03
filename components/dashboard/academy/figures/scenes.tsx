"use client"

import {
  AlertTriangle, ArrowRight, Ban, Bitcoin, BookOpen, Bot, Brain, Building2, Calculator, Calendar, CandlestickChart, Check, Clock, Coins,
  Cpu, Dice5, DoorOpen, Droplet, Eye, Filter, Flag, Flame, Gem, Gift, Globe, Hand, Heart, Hourglass, Landmark, Layers, LineChart, ListChecks,
  Lock, type LucideIcon, MessageCircle, Moon, Newspaper, PenLine, Percent, Repeat, Scale, Search, Shield, Smartphone, Sprout, Star, Sun,
  Target, TrendingDown, TrendingUp, User, Users, Wallet, X, Zap,
} from "lucide-react"
import type { CSSProperties, ReactNode } from "react"
import { AbsoluteFill, useCurrentFrame } from "remotion"

import { iv, RemotionFigure } from "@/components/dashboard/academy/figures/remotion-figure"
import type { Candle, SceneIcon, SceneSpec, Tone } from "@/lib/academy/types"

// Animated explainer scenes for lessons (Remotion). A lesson supplies plain
// data (SceneSpec in lib/academy/types.ts); everything about layout and
// motion is here. Rules that keep them readable and honest:
//   - every animation is driven by the frame number (no CSS transitions), so
//     the Player can loop, pause and show a finished frame for reduced motion
//   - the canvas is small (720 x 440) with large type, because most learners
//     are on a phone, where it is shown at about half size
//   - a scene only draws what its lesson's text already says

const W = 720
const H = 440
const PAD = 32
const START = 8
const HOLD = 96

const BG = "#0b0b13"
const INK = "#f3f4f6"
const SOFT = "#d1d5db"
const MUTED = "#9ca3af"
const RULE = "rgba(255,255,255,0.14)"
const PANEL = "rgba(255,255,255,0.035)"
const TONES: Record<Tone, string> = { up: "#34c28a", down: "#e0706c", accent: "#c4b5fd", neutral: "#9ca3af", warn: "#fbbf24" }
const tone = (t: Tone | undefined, fallback: Tone = "accent") => TONES[t ?? fallback]
const tint = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alpha})`
}

const ICONS: Record<SceneIcon, LucideIcon> = {
  user: User, users: Users, building: Building2, bank: Landmark, globe: Globe, chart: LineChart, candles: CandlestickChart, clock: Clock,
  calendar: Calendar, book: BookOpen, pen: PenLine, target: Target, shield: Shield, alert: AlertTriangle, check: Check, x: X,
  "trending-up": TrendingUp, "trending-down": TrendingDown, coins: Coins, wallet: Wallet, scale: Scale, dice: Dice5, seed: Sprout, zap: Zap,
  bot: Bot, search: Search, flame: Flame, eye: Eye, lock: Lock, brain: Brain, heart: Heart, news: Newspaper, percent: Percent, layers: Layers,
  repeat: Repeat, flag: Flag, phone: Smartphone, message: MessageCircle, gift: Gift, ban: Ban, hourglass: Hourglass, calculator: Calculator,
  list: ListChecks, bitcoin: Bitcoin, gold: Gem, oil: Droplet, cpu: Cpu, hand: Hand, door: DoorOpen, "arrow-right": ArrowRight, filter: Filter,
  moon: Moon, sun: Sun, star: Star,
}

/** 0 to 1 as the frame passes `at` */
const pop = (frame: number, at: number, length = 14) => iv(frame, [at, at + length], [0, 1])

const fmt = (value: number, decimals = 0) => value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })

function Stage({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <AbsoluteFill style={{ background: BG, color: INK, fontFamily: "inherit" }}>
      {title && (
        <div style={{ position: "absolute", left: PAD, right: PAD, top: 22, fontSize: 23, fontWeight: 700, color: "#e5e7eb", lineHeight: 1.2 }}>{title}</div>
      )}
      {children}
    </AbsoluteFill>
  )
}

/** The area under the title */
const areaTop = (title?: string) => (title ? 74 : 30)
const abs = (style: CSSProperties): CSSProperties => ({ position: "absolute", ...style })

type Of<K extends SceneSpec["kind"]> = Extract<SceneSpec, { kind: K }>

// ─── bars ─────────────────────────────────────────────────────────────────────

function Bars({ spec }: { spec: Of<"bars"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const rowH = Math.min(70, (H - top - 26) / spec.bars.length)
  const max = spec.max ?? Math.max(...spec.bars.map((b) => b.to ?? b.value))
  const x0 = 236
  const full = W - x0 - 150
  return (
    <Stage title={spec.title}>
      {spec.bars.map((bar, i) => {
        const p = pop(frame, START + i * 16, 26)
        const color = tone(bar.tone)
        const y = top + i * rowH + (rowH - 30) / 2
        const end = bar.to ?? bar.value
        const shown = bar.display ?? `${fmt(end * p, Number.isInteger(end) ? 0 : 1)}${spec.suffix ?? ""}`
        return (
          <div key={i} style={{ opacity: pop(frame, START + i * 16, 8) }}>
            <div style={abs({ left: PAD, top: y, width: x0 - PAD - 14, height: 30, display: "flex", alignItems: "center", justifyContent: "flex-end", textAlign: "right", fontSize: 19, lineHeight: 1.1, color: SOFT })}>{bar.label}</div>
            <div style={abs({ left: x0, top: y, width: full, height: 30, background: PANEL })} />
            <div style={abs({ left: x0, top: y, width: (full * bar.value * p) / max, height: 30, background: color })} />
            {bar.to !== undefined && (
              <div style={abs({ left: x0 + (full * bar.value * p) / max, top: y, width: (full * (bar.to - bar.value) * p) / max, height: 30, background: tint(color, 0.45) })} />
            )}
            <div style={abs({ left: x0 + (full * end * p) / max + 12, top: y, height: 30, display: "flex", alignItems: "center", fontSize: 22, fontWeight: 700, color, whiteSpace: "nowrap" })}>{shown}</div>
          </div>
        )
      })}
    </Stage>
  )
}

// ─── compare ──────────────────────────────────────────────────────────────────

function Compare({ spec }: { spec: Of<"compare"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const n = spec.columns.length
  const gap = 14
  const colW = (W - PAD * 2 - gap * (n - 1)) / n
  const small = n >= 3
  return (
    <Stage title={spec.title}>
      {spec.columns.map((col, ci) => {
        const color = tone(col.tone)
        const Icon = col.icon ? ICONS[col.icon] : null
        const at = START + ci * 10
        return (
          <div
            key={ci}
            style={abs({ left: PAD + ci * (colW + gap), top, width: colW, height: H - top - 28, background: PANEL, borderTop: `3px solid ${color}`, padding: small ? "16px 14px" : "18px 18px", boxSizing: "border-box", opacity: pop(frame, at), translate: `0px ${(1 - pop(frame, at)) * 14}px` })}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, color, fontSize: small ? 21 : 23, fontWeight: 700, lineHeight: 1.15 }}>
              {Icon && <Icon size={small ? 24 : 26} strokeWidth={2} style={{ flexShrink: 0 }} />}
              {col.title}
            </div>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: small ? 11 : 13 }}>
              {col.points.map((point, pi) => (
                <div key={pi} style={{ display: "flex", gap: 9, fontSize: small ? 18 : 20, lineHeight: 1.25, color: SOFT, opacity: pop(frame, at + (pi + 1) * 12) }}>
                  <span style={{ marginTop: small ? 8 : 9, width: 7, height: 7, background: color, flexShrink: 0 }} />
                  {point}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </Stage>
  )
}
const compareLength = (spec: Of<"compare">) => (spec.columns.length - 1) * 10 + (Math.max(...spec.columns.map((c) => c.points.length)) + 1) * 12

// ─── flow ─────────────────────────────────────────────────────────────────────

const FLOW_STEP = 20
const FLOW_BEAT = 24

function Flow({ spec }: { spec: Of<"flow"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const n = spec.nodes.length
  const perRow = n <= 4 ? n : Math.ceil(n / 2)
  const rows = Math.ceil(n / perRow)
  const arrow = 34
  const nodeW = (W - PAD * 2 - arrow * (perRow - 1)) / perRow
  const rowGap = 26
  const nodeH = Math.min(190, (H - top - 30 - rowGap * (rows - 1)) / rows)
  const introEnd = START + n * FLOW_STEP
  // Once everything is on screen, a highlight walks the chain
  const active = frame > introEnd ? Math.floor((frame - introEnd) / FLOW_BEAT) % n : -1
  const compact = perRow >= 4 || rows > 1
  return (
    <Stage title={spec.title}>
      {spec.nodes.map((node, i) => {
        const row = Math.floor(i / perRow)
        const col = i % perRow
        const inRow = Math.min(perRow, n - row * perRow)
        const offset = ((perRow - inRow) * (nodeW + arrow)) / 2
        const x = PAD + offset + col * (nodeW + arrow)
        const y = top + (H - top - 30 - (rows * nodeH + (rows - 1) * rowGap)) / 2 + row * (nodeH + rowGap)
        const color = tone(node.tone)
        const Icon = node.icon ? ICONS[node.icon] : null
        const p = pop(frame, START + i * FLOW_STEP)
        const lit = active === i
        return (
          <div key={node.label + i}>
            <div
              style={abs({ left: x, top: y, width: nodeW, height: nodeH, boxSizing: "border-box", padding: "12px 10px", background: lit ? tint(color, 0.16) : PANEL, border: `2px solid ${lit ? color : RULE}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", opacity: p, scale: `${0.92 + 0.08 * p}` })}
            >
              {Icon && <Icon size={compact ? 26 : 32} color={color} strokeWidth={2} />}
              <div style={{ fontSize: compact ? 19 : 21, fontWeight: 700, lineHeight: 1.15, color: INK }}>{node.label}</div>
              {node.sub && <div style={{ fontSize: compact ? 15.5 : 17, lineHeight: 1.2, color: MUTED }}>{node.sub}</div>}
            </div>
            {col < inRow - 1 && (
              <div style={abs({ left: x + nodeW, top: y, width: arrow, height: nodeH, display: "flex", alignItems: "center", justifyContent: "center", opacity: pop(frame, START + i * FLOW_STEP + 10) })}>
                <ArrowRight size={24} color={active === i ? INK : MUTED} strokeWidth={2.5} />
              </div>
            )}
          </div>
        )
      })}
    </Stage>
  )
}

// ─── cycle ────────────────────────────────────────────────────────────────────

const CYCLE_STEP = 12
const CYCLE_BEAT = 24

function Cycle({ spec }: { spec: Of<"cycle"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const n = spec.nodes.length
  const cx = W / 2
  const cy = top + (H - top - 24) / 2
  const rx = 236
  const ry = (H - top - 24) / 2 - 34
  const boxW = 176
  const boxH = 54
  const introEnd = START + n * CYCLE_STEP
  const active = frame > introEnd ? Math.floor((frame - introEnd) / CYCLE_BEAT) % n : -1
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  return (
    <Stage title={spec.title}>
      <svg width={W} height={H} style={abs({ inset: 0 })}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={RULE} strokeWidth={2} strokeDasharray="5 7" />
        {/* A dot that keeps travelling round the loop */}
        {frame > introEnd && (() => {
          const a = angle(((frame - introEnd) / CYCLE_BEAT) % n)
          return <rect x={cx + rx * Math.cos(a) - 6} y={cy + ry * Math.sin(a) - 6} width={12} height={12} fill={INK} />
        })()}
      </svg>
      {spec.center && (
        <div style={abs({ left: cx - 120, top: cy - 44, width: 240, height: 88, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 19, lineHeight: 1.25, color: MUTED, opacity: pop(frame, introEnd) })}>{spec.center}</div>
      )}
      {spec.nodes.map((node, i) => {
        const color = tone(node.tone)
        const lit = active === i
        const p = pop(frame, START + i * CYCLE_STEP)
        return (
          <div
            key={node.label + i}
            style={abs({ left: cx + rx * Math.cos(angle(i)) - boxW / 2, top: cy + ry * Math.sin(angle(i)) - boxH / 2, width: boxW, height: boxH, boxSizing: "border-box", padding: "0 8px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 18, fontWeight: 600, lineHeight: 1.15, color: INK, background: lit ? tint(color, 0.22) : "#12121d", border: `2px solid ${lit ? color : tint(color, 0.5)}`, opacity: p, scale: `${0.9 + 0.1 * p}` })}
          >
            {node.label}
          </div>
        )
      })}
    </Stage>
  )
}

// ─── line ─────────────────────────────────────────────────────────────────────

function LineScene({ spec }: { spec: Of<"line"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title) + 34
  const x0 = 78
  const x1 = W - 96
  const y1 = H - (spec.xLabels ? 58 : 34)
  const all = spec.series.flatMap((s) => s.points).concat(spec.baseline ?? [])
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const span = hi - lo || 1
  const len = Math.max(...spec.series.map((s) => s.points.length))
  const x = (i: number) => x0 + ((x1 - x0) * i) / Math.max(1, len - 1)
  const y = (v: number) => y1 - ((y1 - top) * (v - lo)) / span
  const t = iv(frame, [START + 6, START + 86], [0, len - 1])
  const label = (v: number) => `${spec.prefix ?? ""}${fmt(v, spec.decimals ?? 0)}${spec.suffix ?? ""}`
  return (
    <Stage title={spec.title}>
      <svg width={W} height={H} style={abs({ inset: 0 })}>
        <line x1={x0} x2={x1} y1={y1} y2={y1} stroke={RULE} strokeWidth={2} />
        <line x1={x0} x2={x0} y1={top} y2={y1} stroke={RULE} strokeWidth={2} />
        <text x={x0 - 10} y={top + 6} fill={MUTED} fontSize={16} textAnchor="end">{label(hi)}</text>
        <text x={x0 - 10} y={y1 + 4} fill={MUTED} fontSize={16} textAnchor="end">{label(lo)}</text>
        {spec.baseline !== undefined && (
          <>
            <line x1={x0} x2={x1} y1={y(spec.baseline)} y2={y(spec.baseline)} stroke={MUTED} strokeWidth={1.5} strokeDasharray="6 6" />
            <text x={x0 - 10} y={y(spec.baseline) + 5} fill={MUTED} fontSize={16} textAnchor="end">{label(spec.baseline)}</text>
          </>
        )}
        {spec.xLabels?.map((text, i, list) => (
          <text key={text + i} x={x0 + ((x1 - x0) * i) / Math.max(1, list.length - 1)} y={y1 + 26} fill={MUTED} fontSize={16} textAnchor={i === 0 ? "start" : i === list.length - 1 ? "end" : "middle"}>{text}</text>
        ))}
        {spec.series.map((s, si) => {
          const color = tone(s.tone)
          const whole = Math.min(Math.floor(t), s.points.length - 1)
          const pts = s.points.slice(0, whole + 1).map((v, i) => `${x(i)},${y(v)}`)
          const frac = t - whole
          let headX = x(whole)
          let headV = s.points[whole]
          if (whole < s.points.length - 1 && frac > 0) {
            headV = s.points[whole] + (s.points[whole + 1] - s.points[whole]) * frac
            headX = x(whole + frac)
            pts.push(`${headX},${y(headV)}`)
          }
          return (
            <g key={si}>
              <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="miter" />
              <rect x={headX - 5} y={y(headV) - 5} width={10} height={10} fill={color} />
              <text x={headX + 12} y={y(headV) + 6} fill={color} fontSize={19} fontWeight={700}>{label(headV)}</text>
            </g>
          )
        })}
      </svg>
      <div style={abs({ left: x0 + 8, top: top - 34, display: "flex", gap: 18 })}>
        {spec.series.map((s, si) => (
          <div key={si} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 18, color: SOFT }}>
            <span style={{ width: 14, height: 14, background: tone(s.tone) }} />
            {s.label}
          </div>
        ))}
      </div>
    </Stage>
  )
}

// ─── checklist ────────────────────────────────────────────────────────────────

const CHECK_STEP = 17

function Checklist({ spec }: { spec: Of<"checklist"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const rowH = Math.min(60, (H - top - 24) / spec.items.length)
  return (
    <Stage title={spec.title}>
      {spec.items.map((item, i) => {
        const at = START + i * CHECK_STEP
        const p = pop(frame, at)
        const mark = item.mark ?? "ok"
        const color = mark === "ok" ? TONES.up : mark === "bad" ? TONES.down : TONES.accent
        const Icon = mark === "ok" ? Check : mark === "bad" ? X : null
        return (
          <div key={i} style={abs({ left: PAD, right: PAD, top: top + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: 14, opacity: p, translate: `${(1 - p) * -14}px 0px` })}>
            <span style={{ width: 30, height: 30, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: tint(color, 0.18), border: `2px solid ${color}`, boxSizing: "border-box" }}>
              {Icon ? <Icon size={20} color={color} strokeWidth={3} style={{ opacity: pop(frame, at + 8, 8) }} /> : <span style={{ width: 10, height: 10, background: color }} />}
            </span>
            <span style={{ fontSize: rowH < 50 ? 19.5 : 21.5, lineHeight: 1.2, color: SOFT }}>{item.text}</span>
          </div>
        )
      })}
    </Stage>
  )
}

// ─── stat ─────────────────────────────────────────────────────────────────────

function Stat({ spec }: { spec: Of<"stat"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const n = spec.stats.length
  const colW = (W - PAD * 2) / n
  const size = n === 1 ? 120 : n === 2 ? 92 : 68
  return (
    <Stage title={spec.title}>
      {spec.stats.map((stat, i) => {
        const at = START + i * 18
        const value = stat.value * iv(frame, [at, at + 44], [0, 1])
        return (
          <div key={i} style={abs({ left: PAD + i * colW, top, width: colW, height: H - top - 26, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 10px", boxSizing: "border-box", opacity: pop(frame, at, 10) })}>
            <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1, color: tone(stat.tone), fontVariantNumeric: "tabular-nums" }}>
              {stat.prefix}
              {fmt(value, stat.decimals ?? 0)}
              {stat.suffix}
            </div>
            <div style={{ marginTop: 16, fontSize: n === 3 ? 18 : 21, lineHeight: 1.25, color: SOFT, maxWidth: 420 }}>{stat.label}</div>
          </div>
        )
      })}
    </Stage>
  )
}

// ─── timeline ─────────────────────────────────────────────────────────────────

const TIME_STEP = 18

function Timeline({ spec }: { spec: Of<"timeline"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const n = spec.events.length
  const x0 = 66
  const x1 = W - 66
  const axis = top + (H - top - 26) / 2
  const x = (i: number) => (n === 1 ? W / 2 : x0 + ((x1 - x0) * i) / (n - 1))
  const head = iv(frame, [START, START + (n - 1) * TIME_STEP + 8], [x0, x1])
  const labelW = Math.min(200, ((x1 - x0) / Math.max(1, n - 1)) * 1.8)
  return (
    <Stage title={spec.title}>
      <div style={abs({ left: x0, top: axis - 1.5, width: x1 - x0, height: 3, background: RULE })} />
      <div style={abs({ left: x0, top: axis - 1.5, width: head - x0, height: 3, background: TONES.accent })} />
      {spec.events.map((event, i) => {
        const p = pop(frame, START + i * TIME_STEP)
        const color = tone(event.tone)
        const up = i % 2 === 0
        // A label that would hang off the canvas lines up with its marker's outer edge instead
        const offLeft = x(i) - labelW / 2 < 8
        const offRight = x(i) + labelW / 2 > W - 8
        const labelLeft = offLeft ? x(i) - 8 : offRight ? x(i) + 8 - labelW : x(i) - labelW / 2
        return (
          <div key={event.label + i} style={{ opacity: p }}>
            <div style={abs({ left: x(i) - 8, top: axis - 8, width: 16, height: 16, background: color })} />
            <div style={abs({ left: x(i) - 1, top: up ? axis - 34 : axis + 8, width: 2, height: 26, background: tint(color, 0.6) })} />
            <div style={abs({ left: labelLeft, width: labelW, ...(up ? { bottom: H - axis + 38 } : { top: axis + 38 }), textAlign: offLeft ? "left" : offRight ? "right" : "center" })}>
              <div style={{ fontSize: 17, fontWeight: 700, color, fontVariantNumeric: "tabular-nums" }}>{event.time}</div>
              <div style={{ marginTop: 3, fontSize: 18.5, lineHeight: 1.2, color: SOFT }}>{event.label}</div>
            </div>
          </div>
        )
      })}
    </Stage>
  )
}

// ─── grid ─────────────────────────────────────────────────────────────────────

const GRID_STEP = 4

function Grid({ spec }: { spec: Of<"grid"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const labelW = 150
  const headH = 42
  const cellW = (W - PAD * 2 - labelW) / spec.cols.length
  const cellH = Math.min(58, (H - top - 26 - headH) / spec.rows.length)
  const show = (cell: string | number) => (typeof cell === "number" ? `${spec.signed && cell > 0 ? "+" : ""}${fmt(cell, Number.isInteger(cell) ? 0 : 2)}${spec.suffix ?? ""}` : cell)
  return (
    <Stage title={spec.title}>
      <div style={abs({ left: PAD, top, width: labelW, height: headH, display: "flex", alignItems: "center", fontSize: 16, color: MUTED, lineHeight: 1.15 })}>{spec.corner}</div>
      {spec.cols.map((col, ci) => (
        <div key={ci} style={abs({ left: PAD + labelW + ci * cellW, top, width: cellW, height: headH, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700, color: SOFT, opacity: pop(frame, START + ci * 3) })}>{col}</div>
      ))}
      {spec.rows.map((row, ri) => (
        <div key={ri}>
          <div style={abs({ left: PAD, top: top + headH + ri * cellH, width: labelW - 10, height: cellH, display: "flex", alignItems: "center", fontSize: 18, fontWeight: 700, color: SOFT, lineHeight: 1.15, opacity: pop(frame, START + ri * spec.cols.length * GRID_STEP) })}>{row.label}</div>
          {row.cells.map((cell, ci) => {
            const color = row.tones?.[ci] ? TONES[row.tones[ci]] : typeof cell === "number" && spec.signed ? (cell > 0 ? TONES.up : cell < 0 ? TONES.down : TONES.neutral) : TONES.neutral
            const p = pop(frame, START + 10 + (ri * spec.cols.length + ci) * GRID_STEP, 10)
            return (
              <div key={ci} style={abs({ left: PAD + labelW + ci * cellW + 3, top: top + headH + ri * cellH + 3, width: cellW - 6, height: cellH - 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: color === TONES.neutral ? SOFT : color, background: tint(color, 0.16), opacity: p, scale: `${0.9 + 0.1 * p}` })}>
                {show(cell)}
              </div>
            )
          })}
        </div>
      ))}
    </Stage>
  )
}

// ─── donut ────────────────────────────────────────────────────────────────────

function Donut({ spec }: { spec: Of<"donut"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const cx = 196
  const cy = top + (H - top - 24) / 2
  const r = Math.min(118, (H - top - 24) / 2 - 26)
  const circ = 2 * Math.PI * r
  const total = spec.slices.reduce((a, s) => a + s.value, 0)
  const sweep = iv(frame, [START, START + 56], [0, 1])
  let before = 0
  return (
    <Stage title={spec.title}>
      <svg width={W} height={H} style={abs({ inset: 0 })}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={PANEL} strokeWidth={46} />
        {spec.slices.map((slice, i) => {
          const start = before / total
          before += slice.value
          const share = slice.value / total
          const shown = Math.max(0, Math.min(share, sweep - start))
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={tone(slice.tone)}
              strokeWidth={46}
              strokeDasharray={`${shown * circ} ${circ}`}
              strokeDashoffset={-start * circ}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          )
        })}
      </svg>
      {spec.center && (
        <div style={abs({ left: cx - 80, top: cy - 40, width: 160, height: 80, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 21, fontWeight: 700, lineHeight: 1.2, color: SOFT })}>{spec.center}</div>
      )}
      <div style={abs({ left: 372, right: PAD, top, height: H - top - 24, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 })}>
        {spec.slices.map((slice, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, opacity: pop(frame, START + 14 + i * 12) }}>
            <span style={{ width: 18, height: 18, background: tone(slice.tone), flexShrink: 0 }} />
            <span style={{ fontSize: 20, lineHeight: 1.2, color: SOFT, flex: 1 }}>{slice.label}</span>
            <span style={{ fontSize: 23, fontWeight: 800, color: tone(slice.tone), fontVariantNumeric: "tabular-nums" }}>
              {fmt(slice.value, Number.isInteger(slice.value) ? 0 : 1)}
              {spec.suffix ?? "%"}
            </span>
          </div>
        ))}
      </div>
    </Stage>
  )
}

// ─── path ─────────────────────────────────────────────────────────────────────

function PathScene({ spec }: { spec: Of<"path"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title) + 40
  const x0 = 46
  const x1 = W - 46
  const y1 = H - 62
  const all = spec.points.concat(spec.levels?.map((l) => l.price) ?? [])
  const lo = Math.min(...all)
  const hi = Math.max(...all)
  const n = spec.points.length
  const x = (i: number) => x0 + ((x1 - x0) * i) / (n - 1)
  const y = (v: number) => y1 - ((y1 - top) * (v - lo)) / (hi - lo || 1)
  const t = iv(frame, [START + 4, START + 104], [0, n - 1])
  const whole = Math.min(Math.floor(t), n - 1)
  const pts = spec.points.slice(0, whole + 1).map((v, i) => `${x(i)},${y(v)}`)
  let headX = x(whole)
  let headY = y(spec.points[whole])
  if (whole < n - 1) {
    const frac = t - whole
    headX = x(whole + frac)
    headY = y(spec.points[whole] + (spec.points[whole + 1] - spec.points[whole]) * frac)
    pts.push(`${headX},${headY}`)
  }
  return (
    <Stage title={spec.title}>
      <svg width={W} height={H} style={abs({ inset: 0 })}>
        {spec.levels?.map((level, i) => (
          <g key={i}>
            <line x1={x0} x2={x1} y1={y(level.price)} y2={y(level.price)} stroke={tone(level.tone, "neutral")} strokeWidth={2} strokeDasharray="7 6" opacity={0.8} />
            <text x={x1} y={y(level.price) - 8} fill={tone(level.tone, "neutral")} fontSize={17} fontWeight={700} textAnchor="end">{level.label}</text>
          </g>
        ))}
        <polyline points={pts.join(" ")} fill="none" stroke={INK} strokeWidth={3.5} strokeLinejoin="miter" />
        <rect x={headX - 5} y={headY - 5} width={10} height={10} fill={INK} />
        {spec.marks?.map((mark, mi) => {
          const p = pop(frame, START + 4 + (100 * mark.at) / (n - 1), 10)
          const color = tone(mark.tone)
          const below = mark.side === "below"
          const mx = x(mark.at)
          const my = y(spec.points[mark.at])
          const anchor = mx < x0 + 90 ? "start" : mx > x1 - 90 ? "end" : "middle"
          return (
            <g key={mi} opacity={p}>
              <rect x={mx - 7} y={my - 7} width={14} height={14} fill={color} />
              <line x1={mx} x2={mx} y1={below ? my + 9 : my - 9} y2={below ? my + 24 : my - 24} stroke={color} strokeWidth={2} />
              <text x={mx} y={below ? my + 44 : my - 32} fill={color} fontSize={18} fontWeight={700} textAnchor={anchor}>{mark.label}</text>
            </g>
          )
        })}
      </svg>
    </Stage>
  )
}

// ─── rr ───────────────────────────────────────────────────────────────────────

function RiskReward({ spec }: { spec: Of<"rr"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const unit = Math.min(64, 420 / (spec.risk + spec.reward))
  const wins = spec.wins ?? 0
  const losses = spec.losses ?? 0
  const trades = wins + losses
  const blocksEnd = START + 16 + spec.reward * 8
  // Winners and losers mixed evenly, so the row doesn't read as "first all wins"
  const order: boolean[] = []
  let w = 0
  for (let i = 0; i < trades; i++) {
    const win = wins > 0 && (w + 1) / wins <= (i + 1) / trades + 1e-9
    order.push(win && w < wins)
    if (order[i]) w++
  }
  const total = wins * spec.reward - losses * spec.risk
  const resultAt = blocksEnd + 12 + trades * 6
  const size = Math.min(52, (W - PAD * 2 - (trades - 1) * 8) / Math.max(1, trades))
  return (
    <Stage title={spec.title}>
      <div style={abs({ left: PAD, top: top + 6, display: "flex", alignItems: "flex-end", gap: 28 })}>
        <div style={{ opacity: pop(frame, START) }}>
          <div style={{ fontSize: 18, color: MUTED, marginBottom: 8 }}>You risk</div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: spec.risk }, (_, i) => (
              <div key={i} style={{ width: unit, height: 54, background: tint(TONES.down, 0.3), border: `2px solid ${TONES.down}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: TONES.down }}>1R</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 18, color: MUTED, marginBottom: 8, opacity: pop(frame, START + 14) }}>You aim to make</div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: spec.reward }, (_, i) => (
              <div key={i} style={{ width: unit, height: 54, background: tint(TONES.up, 0.3), border: `2px solid ${TONES.up}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: TONES.up, opacity: pop(frame, START + 16 + i * 8), scale: `${0.8 + 0.2 * pop(frame, START + 16 + i * 8)}` }}>1R</div>
            ))}
          </div>
        </div>
        {/* Written the way the lessons write it: reward first */}
        <div style={{ paddingBottom: 4, opacity: pop(frame, blocksEnd) }}>
          <div style={{ fontSize: 16, color: MUTED }}>reward to risk</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: INK }}>
            {spec.reward}:{spec.risk}
          </div>
        </div>
      </div>
      {trades > 0 && (
        <>
          <div style={abs({ left: PAD, top: top + 132, fontSize: 18, color: MUTED, opacity: pop(frame, blocksEnd + 6) })}>
            {trades} trades: {wins} {wins === 1 ? "win" : "wins"}, {losses} {losses === 1 ? "loss" : "losses"}
          </div>
          <div style={abs({ left: PAD, top: top + 166, display: "flex", gap: 8 })}>
            {order.map((win, i) => {
              const p = pop(frame, blocksEnd + 12 + i * 6, 10)
              const color = win ? TONES.up : TONES.down
              return (
                <div key={i} style={{ width: size, height: size, background: tint(color, 0.25), border: `2px solid ${color}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 44 ? 17 : 14, fontWeight: 800, color, opacity: p, scale: `${0.8 + 0.2 * p}` }}>
                  {win ? `+${spec.reward}R` : `-${spec.risk}R`}
                </div>
              )
            })}
          </div>
          <div style={abs({ left: PAD, right: PAD, top: top + 166 + size + 26, fontSize: 25, fontWeight: 700, color: SOFT, opacity: pop(frame, resultAt) })}>
            {wins} x {spec.reward}R minus {losses} x {spec.risk}R ={" "}
            <span style={{ color: total > 0 ? TONES.up : total < 0 ? TONES.down : SOFT, fontSize: 32, fontWeight: 800 }}>
              {total > 0 ? "+" : ""}
              {total}R
            </span>
          </div>
        </>
      )}
    </Stage>
  )
}
const rrLength = (spec: Of<"rr">) => 16 + spec.reward * 8 + 12 + ((spec.wins ?? 0) + (spec.losses ?? 0)) * 6 + 24

// ─── quote ────────────────────────────────────────────────────────────────────

function Quote({ spec }: { spec: Of<"quote"> }) {
  const frame = useCurrentFrame()
  const words = spec.text.split(" ")
  const size = spec.text.length > 150 ? 25 : spec.text.length > 90 ? 29 : 34
  const end = START + 10 + words.length * 3
  return (
    <Stage>
      <div style={abs({ left: PAD + 4, top: 22, fontSize: 130, lineHeight: 1, fontWeight: 800, color: tint(TONES.accent, 0.55), opacity: pop(frame, START) })}>&ldquo;</div>
      <div style={abs({ left: PAD + 14, right: PAD + 14, top: 112, bottom: 96, display: "flex", alignItems: "center" })}>
        <div style={{ fontSize: size, lineHeight: 1.35, fontWeight: 600, color: INK }}>
          {words.map((word, i) => (
            <span key={i} style={{ opacity: pop(frame, START + 10 + i * 3, 10) }}>{word} </span>
          ))}
        </div>
      </div>
      <div style={abs({ left: PAD + 14, right: PAD + 14, bottom: 34, display: "flex", alignItems: "center", gap: 14, opacity: pop(frame, end) })}>
        <span style={{ width: 34, height: 3, background: TONES.accent, flexShrink: 0 }} />
        <span style={{ fontSize: 20, color: SOFT }}>
          <span style={{ fontWeight: 700 }}>{spec.author}</span>
          {spec.source ? `, ${spec.source}` : ""}
        </span>
      </div>
    </Stage>
  )
}

// ─── ticks ────────────────────────────────────────────────────────────────────

const TICK_STEP = 34

function Ticks({ spec }: { spec: Of<"ticks"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const rowH = Math.min(92, (H - top - 24) / spec.rows.length)
  return (
    <Stage title={spec.title}>
      {spec.rows.map((row, i) => {
        const at = START + i * TICK_STEP
        const flip = pop(frame, at + 16, 8)
        // Digits that stay the same, then the ones that move
        let same = 0
        while (same < row.from.length && same < row.to.length && row.from[same] === row.to[same]) same++
        const price = flip < 0.5 ? row.from : row.to
        return (
          <div key={i} style={abs({ left: PAD, right: PAD, top: top + i * rowH, height: rowH, display: "flex", alignItems: "center", gap: 16, opacity: pop(frame, at), borderBottom: i < spec.rows.length - 1 ? `1px solid ${RULE}` : undefined })}>
            <span style={{ width: 150, fontSize: 19, lineHeight: 1.15, color: MUTED, flexShrink: 0 }}>{row.market}</span>
            <span style={{ flex: 1, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 36, fontWeight: 700, color: INK, fontVariantNumeric: "tabular-nums", opacity: 0.35 + 0.65 * Math.abs(flip - 0.5) * 2 }}>
              {price.slice(0, same)}
              <span style={{ color: flip >= 0.5 ? TONES.up : INK }}>{price.slice(same)}</span>
            </span>
            <span style={{ fontSize: 19, fontWeight: 700, color: TONES.accent, background: tint(TONES.accent, 0.16), border: `2px solid ${tint(TONES.accent, 0.6)}`, padding: "6px 12px", whiteSpace: "nowrap", opacity: pop(frame, at + 22), scale: `${0.85 + 0.15 * pop(frame, at + 22)}` }}>{row.unit}</span>
          </div>
        )
      })}
    </Stage>
  )
}

// ─── candles ──────────────────────────────────────────────────────────────────

const CANDLE_STEP = 20

/** A candle part-way through forming: price leaves the open, visits both extremes, then settles at the close */
function forming([o, h, l, c]: Candle, t: number) {
  const route = c >= o ? [o, l, h, c] : [o, h, l, c]
  const s = Math.min(t, 1) * 3
  const leg = Math.min(2, Math.floor(s))
  const now = route[leg] + (route[leg + 1] - route[leg]) * (s - leg)
  const seen = route.slice(0, leg + 1).concat(now)
  return { now, high: Math.max(...seen), low: Math.min(...seen) }
}

function Candles({ spec }: { spec: Of<"candles"> }) {
  const frame = useCurrentFrame()
  const top = areaTop(spec.title)
  const n = spec.groups.length
  const gap = 14
  const panelW = (W - PAD * 2 - gap * (n - 1)) / n
  const panelH = H - top - 28
  const textH = spec.groups.some((g) => g.note) ? (n >= 4 ? 102 : 92) : 50
  const plotTop = top + 20
  const plotBottom = top + panelH - textH - 8
  let before = 0
  return (
    <Stage title={spec.title}>
      {spec.groups.map((group, gi) => {
        const first = before
        before += group.candles.length
        const left = PAD + gi * (panelW + gap)
        const prices = group.candles.flatMap(([, h, l]) => [h, l]).concat(group.lines?.map((line) => line.price) ?? [])
        const lo = Math.min(...prices)
        const hi = Math.max(...prices)
        const y = (v: number) => plotBottom - ((plotBottom - plotTop) * (v - lo)) / (hi - lo || 1)
        const slot = Math.min(78, (panelW - 24) / group.candles.length)
        const bodyW = Math.min(40, slot * 0.6)
        const x0 = left + (panelW - slot * group.candles.length) / 2
        const done = START + (first + group.candles.length) * CANDLE_STEP
        return (
          <div key={group.label + gi}>
            <div style={abs({ left, top, width: panelW, height: panelH, background: PANEL })} />
            {group.lines?.map((line, li) => (
              <div key={li} style={{ opacity: pop(frame, done - 8) }}>
                <div style={abs({ left: left + 8, top: y(line.price) - 1, width: panelW - 16, height: 0, borderTop: `2px dashed ${tone(line.tone, "neutral")}` })} />
                {line.label && <div style={abs({ left: left + 10, top: y(line.price) - 24, fontSize: 15.5, fontWeight: 700, color: tone(line.tone, "neutral") })}>{line.label}</div>}
              </div>
            ))}
            {group.candles.map((candle, ci) => {
              const at = START + (first + ci) * CANDLE_STEP
              if (frame < at) return null
              const { now, high, low } = forming(candle, pop(frame, at, CANDLE_STEP - 2))
              const open = candle[0]
              const color = now > open ? TONES.up : now < open ? TONES.down : SOFT
              const cx = x0 + slot * (ci + 0.5)
              const bodyTop = y(Math.max(open, now))
              return (
                <div key={ci}>
                  <div style={abs({ left: cx - 1.5, top: y(high), width: 3, height: Math.max(0, y(low) - y(high)), background: color })} />
                  <div style={abs({ left: cx - bodyW / 2, top: bodyTop - 1.5, width: bodyW, height: Math.max(3, y(Math.min(open, now)) - bodyTop), background: color })} />
                </div>
              )
            })}
            <div style={abs({ left: left + 8, top: plotBottom + 18, width: panelW - 16, textAlign: "center", opacity: pop(frame, done - 6) })}>
              <div style={{ fontSize: n >= 4 ? 18 : 20, fontWeight: 700, lineHeight: 1.15, color: group.tone ? TONES[group.tone] : INK }}>{group.label}</div>
              {group.note && <div style={{ marginTop: 5, fontSize: n >= 3 ? 16 : 17.5, lineHeight: 1.2, color: MUTED }}>{group.note}</div>}
            </div>
          </div>
        )
      })}
    </Stage>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────

function SceneRoot({ spec }: { spec: SceneSpec }) {
  switch (spec.kind) {
    case "bars": return <Bars spec={spec} />
    case "compare": return <Compare spec={spec} />
    case "flow": return <Flow spec={spec} />
    case "cycle": return <Cycle spec={spec} />
    case "line": return <LineScene spec={spec} />
    case "checklist": return <Checklist spec={spec} />
    case "stat": return <Stat spec={spec} />
    case "timeline": return <Timeline spec={spec} />
    case "grid": return <Grid spec={spec} />
    case "donut": return <Donut spec={spec} />
    case "path": return <PathScene spec={spec} />
    case "rr": return <RiskReward spec={spec} />
    case "quote": return <Quote spec={spec} />
    case "ticks": return <Ticks spec={spec} />
    case "candles": return <Candles spec={spec} />
  }
}

/** Frames until everything in the scene is on screen (before the closing pause) */
function contentLength(spec: SceneSpec): number {
  switch (spec.kind) {
    case "bars": return spec.bars.length * 16 + 26
    case "compare": return compareLength(spec) + 14
    case "flow": return spec.nodes.length * FLOW_STEP + spec.nodes.length * FLOW_BEAT
    case "cycle": return spec.nodes.length * CYCLE_STEP + spec.nodes.length * CYCLE_BEAT
    case "line": return 92
    case "checklist": return spec.items.length * CHECK_STEP + 16
    case "stat": return (spec.stats.length - 1) * 18 + 48
    case "timeline": return spec.events.length * TIME_STEP + 14
    case "grid": return 20 + spec.rows.length * spec.cols.length * GRID_STEP + 10
    case "donut": return 64 + spec.slices.length * 12
    case "path": return 110
    case "rr": return rrLength(spec)
    case "quote": return 10 + spec.text.split(" ").length * 3 + 24
    case "ticks": return spec.rows.length * TICK_STEP + 30
    case "candles": return spec.groups.reduce((sum, g) => sum + g.candles.length, 0) * CANDLE_STEP + 12
  }
}

export default function SceneFigure({ spec }: { spec: SceneSpec }) {
  const ready = START + contentLength(spec)
  // flow and cycle spend their pause walking the highlight, so they need less of it
  const duration = ready + (spec.kind === "flow" || spec.kind === "cycle" ? 30 : HOLD)
  return <RemotionFigure component={SceneRoot} inputProps={{ spec }} durationInFrames={duration} width={W} height={H} stillFrame={ready + 8} />
}
