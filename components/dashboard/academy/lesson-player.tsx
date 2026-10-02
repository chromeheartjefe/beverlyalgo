"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { GlossaryHintsProvider } from "@/components/dashboard/academy/glossary-hint"
import { LessonComplete, type LessonFinish } from "@/components/dashboard/academy/lesson-complete"
import { PracticeComplete, type PracticeEntry } from "@/components/dashboard/academy/practice-complete"
import {
  ChoiceView,
  Eyebrow,
  LearnView,
  MatchView,
  NumericView,
  RecapView,
  TapView,
  TrueFalseView,
} from "@/components/dashboard/academy/steps"
import { EASE_OUT } from "@/components/ui/motion"
import { type Answer, answerText, EMPTY_ANSWER, grade, isAnswered } from "@/lib/academy/grading"
import { isQuestion, type LessonContent, type Question, type Step } from "@/lib/academy/types"
import type { GlossaryHint } from "@/lib/glossary/hints"
import { cn } from "@/lib/utils"

// One Academy lesson, Duolingo style: one screen at a time, a Check button
// for questions, feedback with the explanation, and every missed question
// coming back once more before the recap. Only first tries count toward the
// score that the API turns into XP.

export interface LessonMeta {
  id: string
  title: string
  unitTitle: string
  /** e.g. "Unit 1 · Lesson 2" */
  position: string
}

type Draft = Answer
const EMPTY_DRAFT: Draft = EMPTY_ANSWER

/** The right answer, spelled out for the feedback panel */
function rightAnswer(q: Question): string | null {
  // Match questions show their pairs on screen instead
  if (q.kind === "match") return "The correct pairs are shown above"
  return answerText(q)
}

function eyebrowFor(step: Step): string | null {
  switch (step.kind) {
    case "choice":
    case "truefalse":
      return "Quick check"
    case "tap":
      return "Tap the chart"
    case "numeric":
      return "Your turn"
    case "match":
      return "Match the pairs"
    default:
      return null
  }
}

export function LessonPlayer({
  lesson,
  meta,
  next,
  practice,
  onPracticeAgain,
  glossary,
}: {
  lesson: LessonContent
  meta: LessonMeta
  next: { href: string; title: string } | null
  /** Practice mode: each question's step id maps to its lesson and a label */
  practice?: PracticeEntry[]
  /** Practice mode: start another session from the finish screen */
  onPracticeAgain?: () => void
  /** Glossary pop-ups for this lesson's bold terms, keyed by match key */
  glossary?: Record<string, GlossaryHint>
}) {
  const { steps } = lesson
  const [queue, setQueue] = useState<number[]>(() => steps.map((_, i) => i))
  const [pos, setPos] = useState(0)
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)
  const [result, setResult] = useState<boolean | null>(null)
  const [firstTry, setFirstTry] = useState<Record<string, boolean>>({})
  const [finish, setFinish] = useState<LessonFinish | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const total = useMemo(() => steps.filter(isQuestion).length, [steps])
  const stepIndex = queue[pos]
  const step = steps[stepIndex]
  const question = step && isQuestion(step) ? step : null
  const checked = result !== null
  const isRetry = queue.indexOf(stepIndex) < pos
  const isLast = pos === queue.length - 1

  const canCheck = question ? isAnswered(question, draft) : false
  const primaryLabel = question && !checked ? "Check" : isLast ? "Finish" : "Continue"
  const primaryEnabled = question && !checked ? canCheck : true

  const check = useCallback(() => {
    if (!question || checked || !isAnswered(question, draft)) return
    const correct = grade(question, draft)
    setResult(correct)
    setFirstTry((prev) => (question.id in prev ? prev : { ...prev, [question.id]: correct }))
    if (!correct) {
      // Comes back once more, before the recap if the lesson ends with one
      setQueue((q) => {
        const endsWithRecap = steps[q[q.length - 1]]?.kind === "recap"
        const at = Math.max(pos + 1, endsWithRecap ? q.length - 1 : q.length)
        return [...q.slice(0, at), stepIndex, ...q.slice(at)]
      })
    }
  }, [question, checked, draft, pos, stepIndex, steps])

  const advance = useCallback(() => {
    if (pos >= queue.length - 1) {
      const correct = Object.values(firstTry).filter(Boolean).length
      const missed = Object.entries(firstTry)
        .filter(([, ok]) => !ok)
        .map(([id]) => id)
      setFinish({ correct, total, missed, firstTry })
      return
    }
    setPos((p) => p + 1)
    setDraft(EMPTY_DRAFT)
    setResult(null)
    scrollRef.current?.scrollTo({ top: 0 })
  }, [pos, queue.length, firstTry, total])

  const primary = useCallback(() => {
    if (question && !checked) check()
    else advance()
  }, [question, checked, check, advance])

  // Keyboard: Enter = the main button, 1-9 picks an option
  useEffect(() => {
    if (finish) return
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA"
      // Answer options are buttons too, but Enter on one should check, not re-pick it
      const onControl = target?.closest("button:not([role='radio']), a, [role='button']")
      if (e.key === "Enter" && !onControl && !typing) {
        if (primaryEnabled) {
          e.preventDefault()
          primary()
        }
        return
      }
      if (typing || checked || !question) return
      const n = Number(e.key)
      if (!Number.isInteger(n) || n < 1) return
      if (question.kind === "choice" && n <= question.options.length) setDraft((d) => ({ ...d, choice: n - 1 }))
      if (question.kind === "truefalse" && n <= 2) setDraft((d) => ({ ...d, tf: n === 1 }))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [finish, primary, primaryEnabled, checked, question])

  if (finish) {
    if (practice) return <PracticeComplete entries={practice} finish={finish} onAgain={onPracticeAgain} />
    return <LessonComplete lessonId={meta.id} title={meta.title} finish={finish} next={next} />
  }

  const progress = queue.length > 0 ? pos / queue.length : 0
  const practiceLabel = practice?.find((e) => e.key === (question?.id ?? ""))?.label
  const eyebrow = isRetry ? "One more try" : (practiceLabel ?? eyebrowFor(step))

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Top bar */}
      <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/dashboard/academy"
            aria-label="Leave lesson"
            className="relative tap-44 flex size-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
          >
            <X className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
              <p className="truncate text-xs font-medium text-gray-400">
                <span className="text-gray-500">{meta.position} · </span>
                {meta.title}
              </p>
            </div>
            <div
              className="h-2 w-full bg-white/10"
              role="progressbar"
              aria-label="Lesson progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
            >
              <motion.div
                className="h-full bg-purple-500"
                initial={false}
                animate={{ width: `${Math.max(progress * 100, 2)}%` }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Screen */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pos}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <GlossaryHintsProvider hints={glossary}>
              {eyebrow && <Eyebrow tone={isRetry ? "warn" : "accent"}>{eyebrow}</Eyebrow>}
              {step.kind === "learn" && <LearnView step={step} />}
              {step.kind === "recap" && <RecapView step={step} sources={lesson.sources} />}
              {step.kind === "choice" && (
                <ChoiceView q={step} selected={draft.choice} checked={checked} onSelect={(i) => setDraft((d) => ({ ...d, choice: i }))} />
              )}
              {step.kind === "truefalse" && (
                <TrueFalseView q={step} selected={draft.tf} checked={checked} onSelect={(v) => setDraft((d) => ({ ...d, tf: v }))} />
              )}
              {step.kind === "tap" && (
                <TapView
                  q={step}
                  selected={draft.tap}
                  checked={checked}
                  correct={result === true}
                  onSelect={(i) => setDraft((d) => ({ ...d, tap: i }))}
                />
              )}
              {step.kind === "match" && (
                <MatchView q={step} value={draft.match} checked={checked} onChange={(m) => setDraft((d) => ({ ...d, match: m }))} />
              )}
              {step.kind === "numeric" && (
                <NumericView
                  q={step}
                  value={draft.numeric}
                  checked={checked}
                  correct={result === true}
                  onChange={(v) => setDraft((d) => ({ ...d, numeric: v }))}
                  onSubmit={primary}
                />
              )}
              </GlossaryHintsProvider>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer: feedback + main button */}
      <div
        className={cn(
          "shrink-0 border-t px-4 py-4 transition-colors duration-200 sm:px-6",
          result === true
            ? "border-emerald-500/30 bg-emerald-500/[0.08]"
            : result === false
              ? "border-red-500/30 bg-red-500/[0.08]"
              : "border-white/10 bg-[#09090f]",
        )}
      >
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <AnimatePresence initial={false}>
            {checked && question && (
              <motion.div
                key={`fb${pos}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
                className="min-w-0 flex-1"
                aria-live="polite"
              >
                <p className={cn("text-base font-bold", result ? "text-emerald-300" : "text-red-300")}>
                  {result ? "Correct!" : "Not quite"}
                </p>
                {!result && (
                  <p className="mt-1 text-sm text-gray-200">
                    <span className="text-gray-400">Answer: </span>
                    {rightAnswer(question)}
                  </p>
                )}
                <p className="mt-1 text-sm leading-relaxed text-gray-300">{question.explain}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={primary}
            disabled={!primaryEnabled}
            className={cn(
              "w-full shrink-0 rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors sm:ml-auto sm:w-auto",
              !primaryEnabled
                ? "cursor-not-allowed bg-white/[0.06] text-gray-600"
                : result === false
                  ? "bg-red-500 text-white hover:bg-red-400"
                  : result === true
                    ? "bg-emerald-500 text-white hover:bg-emerald-400"
                    : "bg-purple-500 text-white hover:bg-purple-400",
            )}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
