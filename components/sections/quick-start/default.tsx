'use client'

import { motion, useInView } from 'framer-motion'
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  Calculator,
  CalendarDays,
  Check,
  Flame,
  Lock,
  Sparkles,
  UserPlus,
  Zap,
} from 'lucide-react'
import { type ComponentType, type ReactNode, useEffect, useRef, useState } from 'react'

import { RevealGroup, revealItem } from '@/components/ui/reveal'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'

const EASE = [0.16, 1, 0.3, 1] as const

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

// ─── Accent themes ────────────────────────────────────────────────────────────
// Same card language as components/ui/features-grid.tsx, with the colors
// progressing across the funnel: join (sky) → free (emerald) → Pro (brand).

const ACCENTS = {
  sky: {
    line:   'via-sky-400/70',
    blob:   'bg-sky-500/15 group-hover:bg-sky-500/25',
    border: 'hover:border-sky-400/50',
    tile:   'border-sky-400/30 bg-gradient-to-br from-sky-500/25 to-cyan-600/5',
    icon:   'text-sky-300',
    text:   'text-sky-300',
    node:   'border-sky-400/40 text-sky-300',
    tag:    'border-sky-400/30 bg-sky-500/10 text-sky-300',
  },
  emerald: {
    line:   'via-emerald-400/70',
    blob:   'bg-emerald-500/15 group-hover:bg-emerald-500/25',
    border: 'hover:border-emerald-400/50',
    tile:   'border-emerald-400/30 bg-gradient-to-br from-emerald-500/25 to-teal-600/5',
    icon:   'text-emerald-300',
    text:   'text-emerald-300',
    node:   'border-emerald-400/40 text-emerald-300',
    tag:    'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  },
  violet: {
    line:   'via-fuchsia-400/70',
    blob:   'bg-fuchsia-500/15 group-hover:bg-fuchsia-500/25',
    border: 'hover:border-fuchsia-400/50',
    tile:   'border-fuchsia-400/30 bg-gradient-to-br from-fuchsia-500/25 to-violet-600/5',
    icon:   'text-fuchsia-300',
    text:   'text-fuchsia-300',
    node:   'border-fuchsia-400/40 text-fuchsia-300',
    tag:    'border-fuchsia-400/30 bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-fuchsia-200',
  },
} as const

type Accent = keyof typeof ACCENTS

// ─── Step 01 visual: sign-up form typing itself in ────────────────────────────

const DEMO_EMAIL = 'you@trader.com'

function SignUpVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [chars, setChars] = useState(0)
  const done = chars >= DEMO_EMAIL.length

  useEffect(() => {
    if (!inView) return
    let i = 0
    let timer: ReturnType<typeof setTimeout>

    // Type the email, hold on "Account ready", then clear and loop
    const tick = () => {
      i = i >= DEMO_EMAIL.length ? 0 : i + 1
      setChars(i)
      timer = setTimeout(tick, i === 0 ? 500 : i === DEMO_EMAIL.length ? 2600 : 85)
    }
    timer = setTimeout(tick, 400)
    return () => clearTimeout(timer)
  }, [inView])

  return (
    <div ref={ref} className="space-y-2.5">
      <div className="rounded-xl border border-white/15 bg-white/[0.03] px-3.5 py-2.5">
        <p className="text-xs text-gray-500">Email</p>
        <p className="mt-0.5 h-5 font-mono text-sm text-gray-200">
          {DEMO_EMAIL.slice(0, chars)}
          {!done && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity }}
              className="ml-px inline-block h-4 w-px translate-y-0.5 bg-sky-300"
            />
          )}
        </p>
      </div>

      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors duration-300',
          done
            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300'
            : 'border-sky-400/30 bg-sky-500/15 text-sky-200',
        )}
      >
        {done ? (
          <>
            <Check className="size-4" />
            Account ready
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Create account
          </>
        )}
      </div>
    </div>
  )
}

// ─── Step 02 visual: free tools unlocking one by one ──────────────────────────

const FREE_TOOLS = [
  { icon: Flame,      label: 'AI Screener',     color: 'text-amber-300',   chip: 'border-amber-400/25 bg-amber-500/10' },
  { icon: BookOpen,   label: 'Trade Journal',   color: 'text-sky-300',     chip: 'border-sky-400/25 bg-sky-500/10' },
  { icon: CalendarDays, label: 'Trade Calendar', color: 'text-violet-300',  chip: 'border-violet-400/25 bg-violet-500/10' },
  { icon: Calculator, label: 'Risk Calculator', color: 'text-emerald-300', chip: 'border-emerald-400/25 bg-emerald-500/10' },
]

function FreeToolsVisual() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  const [unlocked, setUnlocked] = useState(0)

  useEffect(() => {
    if (!inView) return
    const timers = FREE_TOOLS.map((_, i) => setTimeout(() => setUnlocked(i + 1), 500 + i * 450))
    return () => timers.forEach(clearTimeout)
  }, [inView])

  return (
    <div ref={ref} className="space-y-2">
      {FREE_TOOLS.map((tool, i) => {
        const open = i < unlocked
        return (
          <div
            key={tool.label}
            className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2"
          >
            <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg border', tool.chip)}>
              <tool.icon className={cn('size-4', tool.color)} />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-200">{tool.label}</span>
            <motion.span
              key={open ? 'open' : 'locked'}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                open ? 'bg-emerald-500/15 text-emerald-300' : 'bg-white/[0.05] text-gray-500',
              )}
            >
              {open ? <Check className="size-3" /> : <Lock className="size-3" />}
              {open ? 'Free' : 'Locked'}
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 03 visual: Pro tools tile grid with a light sweep ───────────────────

const PRO_TOOLS = [
  { icon: Zap,      label: 'Chart Analysis' },
  { icon: Bot,      label: 'Trading Bot' },
  { icon: Activity, label: 'Indicator' },
]

function ProToolsVisual() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid grid-cols-3 gap-2">
        {PRO_TOOLS.map((tool) => (
          <div
            key={tool.label}
            className="flex flex-col items-center gap-2 rounded-xl border border-fuchsia-400/15 bg-gradient-to-b from-fuchsia-500/[0.08] to-transparent px-2 py-3.5"
          >
            <div className="flex size-9 items-center justify-center rounded-lg border border-fuchsia-400/25 bg-fuchsia-500/10">
              <tool.icon className="size-4 text-fuchsia-300" />
            </div>
            <span className="text-center text-xs font-medium leading-tight text-gray-200">{tool.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-xl border border-fuchsia-400/20 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/15 to-violet-500/15 px-3 py-2 text-xs font-semibold text-fuchsia-200">
        <Sparkles className="size-3.5" />
        Unlocked with Pro
      </div>

      {/* Periodic light sweep across the tiles */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
        initial={{ left: '-40%' }}
        animate={{ left: '140%' }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
      />
    </div>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

interface Step {
  number:      string
  accent:      Accent
  icon:        ComponentType<{ className?: string; strokeWidth?: number }>
  tag:         string
  title:       string
  description: string
  visual:      ReactNode
  cta?:        { label: string; href: string }
}

const steps: Step[] = [
  {
    number: '01',
    accent: 'sky',
    icon: UserPlus,
    tag: 'Free to join',
    title: 'Create your account',
    description: 'Sign up in seconds and choose a plan. No card required to explore the free tools.',
    visual: <SignUpVisual />,
    cta: { label: 'Create free account', href: '/sign-up' },
  },
  {
    number: '02',
    accent: 'emerald',
    icon: Check,
    tag: 'Free forever',
    title: 'Free tools, unlocked instantly',
    description: 'AI Screener, Trade Journal, Trade Calendar, and Risk Calculator are free forever. Spot hot movers, log trades, review your month, and size positions the moment you sign in.',
    visual: <FreeToolsVisual />,
  },
  {
    number: '03',
    accent: 'violet',
    icon: Sparkles,
    tag: 'Pro',
    title: 'Go Pro for AI signals',
    description: 'Unlock AI Chart Analysis, the AI Trading Bot, and invite-only TradingView Indicator access.',
    visual: <ProToolsVisual />,
    cta: { label: 'See full plan comparison', href: '#pricing' },
  },
]

// ─── Step card shell ──────────────────────────────────────────────────────────

function StepCard({ step }: { step: Step }) {
  const a = ACCENTS[step.accent]

  return (
    <motion.div
      variants={revealItem}
      whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/25 bg-[#070712] p-6 shadow-2xl shadow-black/60 transition-colors duration-300 lg:p-8',
        a.border,
      )}
    >
      {/* Accent hairline + corner glow */}
      <span className={cn('pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent to-transparent', a.line)} />
      <div className={cn('pointer-events-none absolute -right-20 -top-24 size-64 rounded-full blur-3xl transition-colors duration-500', a.blob)} />

      <div className="relative flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={cn('flex size-11 shrink-0 items-center justify-center rounded-xl border', a.tile)}>
            <step.icon className={cn('size-5', a.icon)} strokeWidth={1.75} />
          </div>
          <span className={cn('text-xs font-semibold uppercase tracking-[0.18em]', a.text)}>Step {step.number}</span>
        </div>
        <span className={cn('rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide', a.tag)}>
          {step.tag}
        </span>
      </div>

      <h3 className="relative mt-6 text-xl font-semibold tracking-tight text-white lg:text-2xl">{step.title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-gray-400">{step.description}</p>

      <div className="relative mt-auto pt-6">
        <div className="rounded-2xl border border-white/15 bg-black/40 p-4">{step.visual}</div>

        {step.cta && (
          <a
            href={step.cta.href}
            className={cn(
              'group/cta mt-4 inline-flex items-center gap-1 rounded-md text-sm font-medium transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60',
              a.text,
            )}
          >
            {step.cta.label}
            <ArrowRight className="size-3.5 transition-transform group-hover/cta:translate-x-0.5" />
          </a>
        )}
      </div>
    </motion.div>
  )
}

// ─── Progress rail (desktop) ──────────────────────────────────────────────────

function ProgressRail() {
  return (
    <div className="relative mb-6 hidden lg:block" aria-hidden="true">
      {/* Track + animated fill, spanning first node center → last node center */}
      <div className="absolute left-[16.66%] right-[16.66%] top-1/2 h-px -translate-y-1/2 bg-white/[0.08]" />
      <motion.div
        className="absolute left-[16.66%] right-[16.66%] top-1/2 h-px origin-left -translate-y-1/2 bg-gradient-to-r from-sky-400 via-emerald-400 to-fuchsia-400"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.3 }}
      />

      <div className="relative grid grid-cols-3 gap-5">
        {steps.map((step, i) => (
          <div key={step.number} className="flex justify-center">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: 0.3 + i * 0.45, type: 'spring', stiffness: 260, damping: 18 }}
              className={cn(
                'flex size-10 items-center justify-center rounded-full border bg-[#070712] font-mono text-sm font-bold',
                ACCENTS[step.accent].node,
              )}
            >
              {step.number}
            </motion.span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function QuickStartGuide() {
  return (
    <Section>
      <div className="container mx-auto max-w-6xl px-4">

        {/* Section header */}
        <motion.div
          className="mb-14 space-y-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
          }}
        >
          <motion.h2
            variants={headingVariants}
            className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-4xl font-bold text-transparent drop-shadow-[0_0_24px_var(--brand-foreground)] sm:text-5xl md:text-6xl pb-2"
          >
            Quick Start Guide
          </motion.h2>
          <motion.p
            variants={headingVariants}
            className="text-muted-foreground mx-auto max-w-md text-base sm:text-lg"
          >
            Sign up and your free tools are ready instantly. Go Pro whenever you want the AI.
          </motion.p>
        </motion.div>

        <ProgressRail />

        <RevealGroup className="mx-auto grid max-w-xl grid-cols-1 gap-4 lg:max-w-none lg:grid-cols-3 lg:gap-5" stagger={0.15}>
          {steps.map((step) => (
            <StepCard key={step.number} step={step} />
          ))}
        </RevealGroup>

      </div>
    </Section>
  )
}
