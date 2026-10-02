"use client"

import { motion, useInView } from "framer-motion"
import { Check, MonitorSmartphone, ScanSearch, TrendingDown, TrendingUp, Zap } from "lucide-react"
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from "react"

import { useDemoLive } from "@/components/ui/demo-live"
import { RevealGroup, revealItem } from "@/components/ui/reveal"
import { cn } from "@/lib/utils"

// ─── Accent themes ────────────────────────────────────────────────────────────
// One accent per card so the row reads colorful, while every card keeps the
// same dark shell as the AI preview cards above it. Full class strings only,
// so Tailwind can see them.

const ACCENTS = {
  violet: {
    line:    "via-fuchsia-400/70",
    blob:    "bg-fuchsia-500/15 group-hover:bg-fuchsia-500/25",
    border:  "hover:border-fuchsia-400/50",
    tile:    "border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/5",
    icon:    "text-fuchsia-300",
    eyebrow: "text-fuchsia-300/90",
  },
  sky: {
    line:    "via-sky-400/70",
    blob:    "bg-sky-500/15 group-hover:bg-sky-500/25",
    border:  "hover:border-sky-400/50",
    tile:    "border-sky-400/30 bg-gradient-to-br from-sky-500/25 to-cyan-600/5",
    icon:    "text-sky-300",
    eyebrow: "text-sky-300/90",
  },
  emerald: {
    line:    "via-emerald-400/70",
    blob:    "bg-emerald-500/15 group-hover:bg-emerald-500/25",
    border:  "hover:border-emerald-400/50",
    tile:    "border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 to-teal-600/5",
    icon:    "text-emerald-300",
    eyebrow: "text-emerald-300/90",
  },
} as const

type Accent = keyof typeof ACCENTS

// ─── Card shell ───────────────────────────────────────────────────────────────

function FeatureCard({
  accent,
  icon: Icon,
  eyebrow,
  title,
  description,
  stat,
  className,
  children,
}: {
  accent: Accent
  icon: ComponentType<{ className?: string; strokeWidth?: number }>
  eyebrow: string
  title: string
  description: string
  stat?: ReactNode
  className?: string
  children: ReactNode
}) {
  const a = ACCENTS[accent]

  return (
    <motion.div
      variants={revealItem}
      whileHover={{ y: -4, transition: { type: "spring", stiffness: 300, damping: 20 } }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/25 bg-[#070712] p-6 shadow-2xl shadow-black/60 transition-colors duration-300 lg:p-8",
        a.border,
        className,
      )}
    >
      {/* Accent hairline + corner glow */}
      <span className={cn("pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />
      <div className={cn("pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl transition-colors duration-500", a.blob)} />

      <div className="relative flex items-center gap-3">
        <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl border", a.tile)}>
          <Icon className={cn("size-5", a.icon)} strokeWidth={1.75} />
        </div>
        <span className={cn("text-xs font-semibold uppercase tracking-[0.18em]", a.eyebrow)}>{eyebrow}</span>
      </div>

      {stat && <div className="relative mt-6">{stat}</div>}

      <h3 className={cn("relative text-xl font-semibold tracking-tight text-white lg:text-2xl", stat ? "mt-2" : "mt-6")}>
        {title}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-gray-400">{description}</p>

      <div className="relative mt-auto pt-6">
        <div className="rounded-2xl border border-white/15 bg-black/40 p-4">{children}</div>
      </div>
    </motion.div>
  )
}

// ─── Card 1 visual: pattern being traced ──────────────────────────────────────

const PATTERN_CHIPS = ["Order Blocks", "Fair Value Gaps", "Double Top", "Bull Flag"]

function PatternVisual() {
  // Head-and-shoulders silhouette: left shoulder, head, right shoulder
  const path = "M4 66 L28 50 L44 30 L60 48 L84 12 L108 46 L124 28 L140 50 L166 70 L196 58 L236 76"

  // Watch the HTML wrapper, not the SVG shapes: mobile browsers (iOS Safari
  // especially) don't reliably report <path>/<circle> entering the viewport,
  // so per-shape whileInView never fired there and the line stayed hidden.
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <div ref={ref} className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-gray-500">ETH/USDT · 1H</span>
        <span className="flex items-center gap-1 rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-0.5 text-xs font-medium text-fuchsia-300">
          <Check className="size-3" />
          Head &amp; Shoulders
        </span>
      </div>

      <svg viewBox="0 0 240 84" className="h-20 w-full" aria-hidden="true">
        <defs>
          <linearGradient id="fg-pattern-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>
        </defs>

        {/* Neckline */}
        <line x1={20} y1={49} x2={176} y2={49} stroke="rgba(232,121,249,0.35)" strokeWidth={1} strokeDasharray="4 4" />

        <motion.path
          d={path}
          fill="none"
          stroke="url(#fg-pattern-stroke)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut", delay: 0.3 }}
        />

        {/* Shoulder / head markers */}
        {[[44, 30], [84, 12], [124, 28]].map(([x, y], i) => (
          <motion.circle
            key={x}
            cx={x}
            cy={y}
            r={3.5}
            fill="#070712"
            stroke="#e879f9"
            strokeWidth={1.5}
            initial={{ scale: 0, opacity: 0 }}
            animate={inView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ delay: 1.1 + i * 0.2, type: "spring", stiffness: 260, damping: 16 }}
          />
        ))}
      </svg>

      <div className="flex flex-wrap gap-1.5">
        {PATTERN_CHIPS.map((chip) => (
          <span key={chip} className="rounded-full border border-white/15 bg-white/[0.03] px-2.5 py-1 text-xs text-gray-300">
            {chip}
          </span>
        ))}
        <span className="rounded-full border border-violet-400/25 bg-violet-500/10 px-2.5 py-1 text-xs font-medium text-violet-300">
          +196 more
        </span>
      </div>
    </div>
  )
}

// ─── Card 2 visual: platforms cycling, same read every time ───────────────────

const PLATFORMS = ["TradingView", "TradingView Mobile", "MetaTrader 4 / 5", "Your exchange", "Your broker"]

const ASSET_TAGS = [
  { label: "Crypto",  className: "border-amber-400/30 bg-amber-500/10 text-amber-300" },
  { label: "Stocks",  className: "border-sky-400/30 bg-sky-500/10 text-sky-300" },
  { label: "Indices", className: "border-violet-400/30 bg-violet-500/10 text-violet-300" },
  { label: "ETFs",    className: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" },
]

function PlatformVisual() {
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const live = useDemoLive(ref)

  // Cycles only while the card is on screen
  useEffect(() => {
    if (!live) return
    const id = setInterval(() => setActive((i) => (i + 1) % PLATFORMS.length), 1800)
    return () => clearInterval(id)
  }, [live])

  return (
    <div ref={ref} className="space-y-3">
      {/* Phones: slim rows so the card isn't so tall (they are a demo, not
          tap targets). From sm up the rows keep their full height. */}
      <ul className="space-y-1 sm:space-y-2">
        {PLATFORMS.map((name, i) => {
          const isActive = i === active
          return (
            <li key={name} className="relative flex items-center justify-between rounded-lg px-3 py-1 sm:py-3">
              {isActive && (
                <motion.span
                  layoutId="fg-platform-active"
                  className="absolute inset-0 rounded-lg border border-sky-400/25 bg-sky-500/10"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className={cn("relative text-sm transition-colors duration-300", isActive ? "text-white" : "text-gray-500")}>
                {name}
              </span>
              <span
                className={cn(
                  "relative flex items-center gap-1 text-xs font-medium transition-opacity duration-300",
                  isActive ? "text-sky-300 opacity-100" : "opacity-0",
                )}
              >
                <Check className="size-3" />
                Read
              </span>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap gap-1.5 border-t border-white/15 pt-3 sm:pt-4">
        {ASSET_TAGS.map((tag) => (
          <span key={tag.label} className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", tag.className)}>
            {tag.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Card 3 visual: two signal calls ──────────────────────────────────────────

type Call = {
  side: "BUY" | "SELL"
  market: string
  confidence: number
  levels: { label: string; value: string; className: string }[]
}

// Illustrative demo calls: crypto long, crypto short, stock long
const CALLS: Call[] = [
  {
    side: "BUY",
    market: "BTC · 4H",
    confidence: 92,
    levels: [
      { label: "Entry",  value: "$68,420", className: "text-gray-200" },
      { label: "Target", value: "$78,500", className: "text-emerald-400" },
      { label: "Stop",   value: "$62,100", className: "text-red-400" },
    ],
  },
  {
    side: "SELL",
    market: "ETH · 1H",
    confidence: 88,
    levels: [
      { label: "Entry",  value: "$3,482", className: "text-gray-200" },
      { label: "Target", value: "$3,215", className: "text-emerald-400" },
      { label: "Stop",   value: "$3,598", className: "text-red-400" },
    ],
  },
  {
    side: "BUY",
    market: "NVDA · 1D",
    confidence: 90,
    levels: [
      { label: "Entry",  value: "$118.40", className: "text-gray-200" },
      { label: "Target", value: "$131.00", className: "text-emerald-400" },
      { label: "Stop",   value: "$112.20", className: "text-red-400" },
    ],
  },
]

const SIDE_STYLE = {
  BUY:  { pill: "border-emerald-400/30 bg-emerald-500/15 text-emerald-300", bar: "from-emerald-500 to-teal-300", icon: TrendingUp },
  SELL: { pill: "border-red-400/30 bg-red-500/15 text-red-300",             bar: "from-red-500 to-rose-300",     icon: TrendingDown },
} as const

function SignalCall({ call, index }: { call: Call; index: number }) {
  const style = SIDE_STYLE[call.side]
  const Icon = style.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 + index * 0.35, duration: 0.45, ease: "easeOut" }}
      className="space-y-2.5"
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-bold", style.pill)}>
          <Icon className="size-3" />
          {call.side}
        </span>
        <span className="font-mono text-xs text-gray-500">{call.market}</span>
        <span className="ml-auto text-xs text-gray-500">
          <span className="font-bold text-white">{call.confidence}%</span> conf.
        </span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn("h-full rounded-full bg-gradient-to-r", style.bar)}
          initial={{ width: 0 }}
          whileInView={{ width: `${call.confidence}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeOut", delay: 0.5 + index * 0.35 }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {call.levels.map((l) => (
          <div key={l.label}>
            <p className="text-xs text-gray-500">{l.label}</p>
            <p className={cn("mt-0.5 font-mono text-xs font-semibold sm:text-sm", l.className)}>{l.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function SignalVisual() {
  return (
    <div className="divide-y divide-white/[0.06] [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      {CALLS.map((call, i) => (
        <SignalCall key={call.market} call={call} index={i} />
      ))}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FeaturesGrid() {
  return (
    <section className="line-x px-4 py-12 sm:py-16 dark:bg-transparent">
      <div className="mx-auto max-w-3xl px-2 lg:max-w-6xl lg:px-6">
        <RevealGroup className="relative z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5" stagger={0.12}>

          <FeatureCard
            accent="violet"
            icon={ScanSearch}
            eyebrow="Pattern engine"
            stat={
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-fuchsia-500 bg-clip-text text-5xl font-black tracking-tight text-transparent lg:text-6xl">
                200+
              </span>
            }
            title="Chart Patterns Recognized"
            description="From head-and-shoulders to order blocks and fair value gaps, the AI checks every chart against 200+ classic setups."
          >
            <PatternVisual />
          </FeatureCard>

          <FeatureCard
            accent="sky"
            icon={MonitorSmartphone}
            eyebrow="Universal input"
            title="Any Chart, Any Platform"
            description="Upload a screenshot from TradingView, MT4, your exchange, or your broker. The AI reads it the same way either way."
          >
            <PlatformVisual />
          </FeatureCard>

          <FeatureCard
            accent="emerald"
            icon={Zap}
            eyebrow="Signal output"
            title="Instant Buy/Sell Calls"
            description="Upload a chart and get a clear signal in seconds, with entry, targets, and stop-loss included. No waiting required."
            className="sm:col-span-2 lg:col-span-1"
          >
            <SignalVisual />
          </FeatureCard>

        </RevealGroup>
      </div>
    </section>
  )
}
