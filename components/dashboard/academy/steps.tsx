"use client"

import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react"
import { Fragment, type ReactNode, useMemo, useState } from "react"

import { Figure } from "@/components/dashboard/academy/figures"
import { GlossaryTerm, useGlossaryHint } from "@/components/dashboard/academy/glossary-hint"
import { TeachingChart } from "@/components/dashboard/academy/teaching-chart"
import type {
  CalloutTone,
  ChoiceQuestion,
  LearnStep,
  MatchQuestion,
  NumericQuestion,
  RecapStep,
  TapQuestion,
  TrueFalseQuestion,
  Visual,
} from "@/lib/academy/types"
import { cn } from "@/lib/utils"

// The screens of an Academy lesson. Each one only renders; LessonPlayer owns
// the answer state and the check/continue flow.

/** A bold key term: a glossary pop-up when the lesson has a hint for it */
function Bold({ text }: { text: string }) {
  const hint = useGlossaryHint(text)
  if (hint) return <GlossaryTerm text={text} hint={hint} />
  return <strong className="font-semibold text-white">{text}</strong>
}

/** Paragraph text where **double asterisks** mark a bold key term */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g)
  return (
    <>
      {parts.map((part, i) => (i % 2 === 1 ? <Bold key={i} text={part} /> : <Fragment key={i}>{part}</Fragment>))}
    </>
  )
}

export function Eyebrow({ children, tone = "accent" }: { children: ReactNode; tone?: "accent" | "warn" }) {
  return (
    <p
      className={cn(
        "mb-2 text-xs font-semibold uppercase tracking-[0.16em]",
        tone === "warn" ? "text-amber-300/90" : "text-purple-300/80",
      )}
    >
      {children}
    </p>
  )
}

function VisualView({ visual }: { visual: Visual }) {
  if (visual.type === "chart") return <TeachingChart spec={visual.chart} />
  if (visual.type === "charts") {
    return (
      <div className="space-y-3">
        {visual.charts.map((chart, i) => (
          <TeachingChart key={i} spec={chart} height={chart.height ?? 190} />
        ))}
      </div>
    )
  }
  return (
    <figure>
      <Figure id={visual.id} />
      {visual.caption && <figcaption className="mt-2 text-xs text-gray-500">{visual.caption}</figcaption>}
    </figure>
  )
}

const CALLOUTS: Record<CalloutTone, { Icon: typeof Info; box: string; icon: string; label: string }> = {
  tip:  { Icon: Lightbulb,     box: "border-purple-500/30 bg-purple-500/[0.07]", icon: "text-purple-300", label: "Good to know" },
  warn: { Icon: AlertTriangle, box: "border-amber-500/30 bg-amber-500/[0.07]",   icon: "text-amber-300",  label: "Careful" },
  note: { Icon: Info,          box: "border-sky-500/30 bg-sky-500/[0.07]",       icon: "text-sky-300",    label: "Note" },
}

function Callout({ tone, text }: { tone: CalloutTone; text: string }) {
  const c = CALLOUTS[tone]
  return (
    <div className={cn("flex gap-3 border p-4", c.box)}>
      <c.Icon className={cn("mt-0.5 size-4 shrink-0", c.icon)} aria-hidden />
      <div>
        <p className={cn("text-xs font-semibold uppercase tracking-wider", c.icon)}>{c.label}</p>
        <p className="mt-1 text-sm leading-relaxed text-gray-300">
          <Rich text={text} />
        </p>
      </div>
    </div>
  )
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="text-balance text-2xl font-bold leading-tight text-white sm:text-[1.7rem]">{children}</h2>
}

export function LearnView({ step }: { step: LearnStep }) {
  return (
    <div className="space-y-5">
      <Heading>{step.title}</Heading>
      <div className="space-y-3.5 text-[15px] leading-relaxed text-gray-300 sm:text-base">
        {step.body.map((p, i) => (
          <p key={i}>
            <Rich text={p} />
          </p>
        ))}
      </div>
      {step.visual && <VisualView visual={step.visual} />}
      {step.callout && <Callout tone={step.callout.tone} text={step.callout.text} />}
    </div>
  )
}

/** After checking: the correct option is green, a wrong pick red */
function optionState(index: number, selected: number | null, answer: number, checked: boolean) {
  if (!checked) return selected === index ? "selected" : "idle"
  if (index === answer) return "right"
  if (index === selected) return "wrong"
  return "dim"
}

const OPTION_STYLES = {
  idle:     "border-white/15 bg-white/[0.03] text-gray-200 hover:border-white/30 hover:bg-white/[0.05]",
  selected: "border-purple-400/70 bg-purple-500/15 text-white",
  right:    "border-emerald-400/60 bg-emerald-500/15 text-white",
  wrong:    "border-red-400/60 bg-red-500/15 text-white",
  dim:      "border-white/10 bg-transparent text-gray-500",
} as const

export function ChoiceView({
  q,
  selected,
  onSelect,
  checked,
}: {
  q: ChoiceQuestion
  selected: number | null
  onSelect: (i: number) => void
  checked: boolean
}) {
  return (
    <div className="space-y-5">
      <Heading>{q.prompt}</Heading>
      {q.visual && <VisualView visual={q.visual} />}
      <div className="grid gap-2.5" role="radiogroup" aria-label={q.prompt}>
        {q.options.map((option, i) => {
          const state = optionState(i, selected, q.answer, checked)
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={selected === i}
              disabled={checked}
              onClick={() => onSelect(i)}
              className={cn(
                "flex items-center gap-3 border px-4 py-3.5 text-left text-[15px] transition-colors duration-150",
                OPTION_STYLES[state],
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center border text-xs font-semibold",
                  state === "idle" || state === "dim" ? "border-white/20 text-gray-400" : "border-current",
                )}
              >
                {i + 1}
              </span>
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TrueFalseView({
  q,
  selected,
  onSelect,
  checked,
}: {
  q: TrueFalseQuestion
  selected: boolean | null
  onSelect: (v: boolean) => void
  checked: boolean
}) {
  return (
    <div className="space-y-5">
      <Heading>True or false?</Heading>
      {q.visual && <VisualView visual={q.visual} />}
      <p className="border border-white/15 bg-white/[0.03] p-5 text-lg leading-relaxed text-white">{q.statement}</p>
      <div className="grid grid-cols-2 gap-2.5" role="radiogroup" aria-label="True or false">
        {[true, false].map((value, i) => {
          const state = optionState(i, selected === null ? null : selected ? 0 : 1, q.answer ? 0 : 1, checked)
          return (
            <button
              key={String(value)}
              type="button"
              role="radio"
              aria-checked={selected === value}
              disabled={checked}
              onClick={() => onSelect(value)}
              className={cn("border px-4 py-4 text-base font-semibold transition-colors duration-150", OPTION_STYLES[state])}
            >
              {value ? "True" : "False"}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function TapView({
  q,
  selected,
  onSelect,
  checked,
  correct,
}: {
  q: TapQuestion
  selected: number | null
  onSelect: (i: number) => void
  checked: boolean
  correct: boolean
}) {
  return (
    <div className="space-y-5">
      <Heading>{q.prompt}</Heading>
      <TeachingChart
        spec={q.chart}
        height={280}
        tap={{ selected, onSelect, result: checked ? { correct, targets: q.targets } : null }}
      />
      {!checked && (
        <p className="text-xs text-gray-500">
          {selected === null ? "Tap anywhere on the chart to pick a spot." : "Picked. Tap somewhere else to change it."}
        </p>
      )}
    </div>
  )
}

export function NumericView({
  q,
  value,
  onChange,
  onSubmit,
  checked,
  correct,
}: {
  q: NumericQuestion
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  checked: boolean
  correct: boolean
}) {
  return (
    <div className="space-y-5">
      <Heading>{q.prompt}</Heading>
      {q.visual && <VisualView visual={q.visual} />}
      <div
        className={cn(
          "flex max-w-xs overflow-hidden border bg-white/[0.04] focus-within:border-purple-400/60",
          !checked ? "border-white/15" : correct ? "border-emerald-400/60" : "border-red-400/60",
        )}
      >
        {q.prefix && <span className="flex items-center border-r border-white/15 px-3 text-gray-400">{q.prefix}</span>}
        <input
          autoFocus
          inputMode="decimal"
          aria-label="Your answer"
          placeholder="Type your answer"
          value={value}
          disabled={checked}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onSubmit()
            }
          }}
          className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-lg text-white placeholder:font-sans placeholder:text-sm placeholder:text-gray-600 focus:outline-none"
        />
        {q.suffix && <span className="flex items-center border-l border-white/15 px-3 text-gray-400">{q.suffix}</span>}
      </div>
    </div>
  )
}

/** The right column's order: shuffled, but the same on every render for a question */
function shuffledOrder(id: string, n: number): number[] {
  let seed = 0
  for (const ch of id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  const order = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[order[i], order[j]] = [order[j], order[i]]
  }
  // Never show the pairs already lined up
  if (n > 1 && order.every((v, i) => v === i)) order.push(order.shift()!)
  return order
}

// Colours that tell which left item a right item is paired with
const PAIR_COLORS = [
  "border-purple-400/70 bg-purple-500/15",
  "border-sky-400/70 bg-sky-500/15",
  "border-amber-400/70 bg-amber-500/15",
  "border-pink-400/70 bg-pink-500/15",
  "border-teal-400/70 bg-teal-500/15",
  "border-orange-400/70 bg-orange-500/15",
]

export function MatchView({
  q,
  value,
  onChange,
  checked,
}: {
  q: MatchQuestion
  value: Record<number, number>
  onChange: (v: Record<number, number>) => void
  checked: boolean
}) {
  const order = useMemo(() => shuffledOrder(q.id, q.pairs.length), [q.id, q.pairs.length])
  const [active, setActive] = useState<number | null>(null)
  const leftFor = (right: number) => {
    const hit = Object.entries(value).find(([, r]) => r === right)
    return hit ? Number(hit[0]) : null
  }

  const pickLeft = (i: number) => {
    if (checked) return
    if (i in value) {
      const next = { ...value }
      delete next[i]
      onChange(next)
    }
    setActive(active === i ? null : i)
  }

  const pickRight = (r: number) => {
    if (checked) return
    const owner = leftFor(r)
    if (active === null) {
      // Tapping a paired right item undoes that pair
      if (owner !== null) {
        const next = { ...value }
        delete next[owner]
        onChange(next)
      }
      return
    }
    const next = { ...value }
    if (owner !== null) delete next[owner]
    next[active] = r
    onChange(next)
    setActive(null)
  }

  const allRight = checked && q.pairs.every((_, i) => value[i] === i)

  return (
    <div className="space-y-5">
      <Heading>{q.prompt}</Heading>
      <p className="text-xs text-gray-500">Tap an item on the left, then its partner on the right.</p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="space-y-2.5">
          {q.pairs.map(([left], i) => {
            const paired = i in value
            const style = checked
              ? value[i] === i
                ? OPTION_STYLES.right
                : OPTION_STYLES.wrong
              : active === i
                ? "border-white/60 bg-white/[0.08] text-white"
                : paired
                  ? cn(PAIR_COLORS[i % PAIR_COLORS.length], "text-white")
                  : OPTION_STYLES.idle
            return (
              <button
                key={i}
                type="button"
                disabled={checked}
                aria-pressed={active === i}
                onClick={() => pickLeft(i)}
                className={cn("flex min-h-[3.25rem] w-full items-center border px-3 py-2.5 text-left text-sm transition-colors duration-150", style)}
              >
                {left}
              </button>
            )
          })}
        </div>
        <div className="space-y-2.5">
          {order.map((r) => {
            const owner = leftFor(r)
            const style = checked
              ? owner === r
                ? OPTION_STYLES.right
                : owner !== null
                  ? OPTION_STYLES.wrong
                  : OPTION_STYLES.dim
              : owner !== null
                ? cn(PAIR_COLORS[owner % PAIR_COLORS.length], "text-white")
                : OPTION_STYLES.idle
            return (
              <button
                key={r}
                type="button"
                disabled={checked}
                onClick={() => pickRight(r)}
                className={cn("flex min-h-[3.25rem] w-full items-center border px-3 py-2.5 text-left text-sm transition-colors duration-150", style)}
              >
                {q.pairs[r][1]}
              </button>
            )
          })}
        </div>
      </div>
      {checked && !allRight && (
        <div className="border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Correct pairs</p>
          <ul className="mt-2 space-y-1.5 text-sm text-gray-200">
            {q.pairs.map(([l, r]) => (
              <li key={l}>
                <span className="text-white">{l}</span>
                <span className="text-gray-500"> → </span>
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function RecapView({ step, sources }: { step: RecapStep; sources: string[] }) {
  return (
    <div className="space-y-6">
      <Heading>{step.title}</Heading>
      <ul className="space-y-3">
        {step.points.map((point, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-gray-200">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" aria-hidden />
            <span>
              <Rich text={point} />
            </span>
          </li>
        ))}
      </ul>
      {sources.length > 0 && (
        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Sources</p>
          <ul className="mt-1.5 space-y-1 text-xs text-gray-500">
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
