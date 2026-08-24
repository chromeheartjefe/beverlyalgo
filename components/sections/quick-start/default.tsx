'use client'

import { motion } from 'framer-motion'
import { Activity, ArrowRight, BookOpen, Bot, Calculator, UserPlus, Zap } from 'lucide-react'
import type { ComponentType } from 'react'

import { Section } from '@/components/ui/section'
import { GlowCard } from '@/components/ui/spotlight-card'

const EASE = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 36, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE },
  },
}

const headingVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
}

interface Tool {
  icon:  ComponentType<{ className?: string }>
  label: string
}

interface Step {
  number:      string
  title:       string
  description: string
  icon?:       ComponentType<{ className?: string }>
  tag?:        string
  tools?:      Tool[]
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Create your account',
    description: 'Sign up in seconds and choose a plan — no card required to explore the free tools.',
    icon: UserPlus,
    tag: 'Free to join',
  },
  {
    number: '02',
    title: 'Free tools, unlocked instantly',
    description: 'Trade Journal and Risk Calculator are free forever — log trades and size positions the moment you sign in.',
    tools: [
      { icon: BookOpen, label: 'Trade Journal' },
      { icon: Calculator, label: 'Risk Calculator' },
    ],
  },
  {
    number: '03',
    title: 'Go Pro for AI signals',
    description: 'Unlock AI Chart Analysis, the AI Trading Bot, and invite-only TradingView Indicator access.',
    tools: [
      { icon: Zap, label: 'Chart Analysis' },
      { icon: Bot, label: 'Trading Bot' },
      { icon: Activity, label: 'Indicator' },
    ],
    tag: 'Pro',
  },
]

export default function QuickStartGuide() {
  return (
    <Section>
      <div className="container mx-auto max-w-5xl px-4">

        {/* Section header */}
        <motion.div
          className="mb-16 space-y-4 text-center"
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

        {/* Step columns */}
        <motion.div
          className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={itemVariants}
              className="flex flex-col gap-4"
            >
              {/* Step label above card */}
              <div className="flex items-center gap-3">
                <span className="text-brand text-[0.65rem] font-bold tracking-[0.35em] uppercase">
                  STEP {step.number}
                </span>
                <span className="from-brand/40 to-transparent h-px flex-1 bg-gradient-to-r" />
              </div>

              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                {step.title}
                {step.tag && (
                  <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-purple-400">
                    {step.tag}
                  </span>
                )}
              </h3>

              {/* Glow card */}
              <GlowCard glowColor="purple" customSize className="h-56 w-full p-5">
                <div className="flex h-full w-full items-center justify-center">
                  {step.icon ? (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border border-purple-500/25 bg-purple-500/10">
                      <step.icon className="size-7 text-purple-400" />
                    </div>
                  ) : (
                    <div className="flex w-full flex-col gap-2.5">
                      {step.tools?.map((tool) => (
                        <div
                          key={tool.label}
                          className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5"
                        >
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-purple-500/20 bg-purple-500/10">
                            <tool.icon className="size-4 text-purple-400" />
                          </div>
                          <span className="text-sm font-medium text-gray-200">{tool.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </GlowCard>

              {/* Description below card */}
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>

              {step.tag === 'Pro' && (
                <a
                  href="#pricing"
                  className="group inline-flex items-center gap-1 text-sm font-medium text-purple-400 transition-colors hover:text-purple-300"
                >
                  See full plan comparison
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              )}
            </motion.div>
          ))}
        </motion.div>

      </div>
    </Section>
  )
}
