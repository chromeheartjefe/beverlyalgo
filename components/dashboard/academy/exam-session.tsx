"use client"

import NumberFlow from "@number-flow/react"
import { AnimatePresence, motion } from "framer-motion"
import { Award, CheckCircle2, ChevronDown, Loader2, RotateCcw, ScrollText, X, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { mutate } from "swr"

import { LevelUp } from "@/components/dashboard/academy/level-up"
import { ChoiceView, Eyebrow, NumericView, TapView, TrueFalseView } from "@/components/dashboard/academy/steps"
import { EASE_OUT } from "@/components/ui/motion"
import type { ExamItem, ExamResult } from "@/lib/academy/exam"
import { type Answer, EMPTY_ANSWER, isAnswered } from "@/lib/academy/grading"
import { academyKey } from "@/lib/academy/use-academy"
import { localDay } from "@/lib/academy/xp"
import { requestJson, userMessage } from "@/lib/api-client"
import { cn } from "@/lib/utils"

// The Entrix Academy final exam: 30 questions from across the course, no
// feedback until the end, graded on the server. Pass mark 80%.

type Phase =
  | { kind: "intro" }
  | { kind: "loading" }
  | { kind: "running"; attemptId: string; items: ExamItem[] }
  | { kind: "submitting"; attemptId: string; items: ExamItem[] }
  | { kind: "done"; result: ExamResult }

function Intro({ onStart, error, busy }: { onStart: () => void; error: string | null; busy: boolean }) {
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto p-6">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/10">
          <ScrollText className="size-9 text-amber-200" aria-hidden />
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/80">Final exam</p>
        <h1 className="mt-2 text-2xl font-bold text-white">Earn your Entrix Academy certificate</h1>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-gray-300">
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden /> 30 questions from every unit of the course.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden /> No hints or feedback until you submit.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden /> Score 80% (24 of 30) or more to pass.</li>
          <li className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" aria-hidden /> Up to 3 attempts a day.</li>
        </ul>
        {error && <p className="mt-5 text-sm text-red-300">{error}</p>}
        <div className="mt-8 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onStart}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black transition-colors hover:bg-amber-400 disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
            Start the exam
          </button>
          <Link href="/dashboard/academy" className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]">
            Back to Academy
          </Link>
        </div>
      </div>
    </div>
  )
}

function Runner({
  items,
  submitting,
  error,
  onSubmit,
}: {
  items: ExamItem[]
  submitting: boolean
  error: string | null
  onSubmit: (answers: Record<string, Answer>) => void
}) {
  const [pos, setPos] = useState(0)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  const item = items[pos]
  const q = item.question
  const a = answers[item.key] ?? EMPTY_ANSWER
  const set = (patch: Partial<Answer>) => setAnswers((prev) => ({ ...prev, [item.key]: { ...(prev[item.key] ?? EMPTY_ANSWER), ...patch } }))
  const answered = isAnswered(q, a)
  const last = pos === items.length - 1

  const next = () => {
    if (!answered || submitting) return
    if (last) onSubmit(answers)
    else setPos((p) => p + 1)
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center gap-4">
          <Link
            href="/dashboard/academy"
            aria-label="Leave exam"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
          >
            <X className="size-5" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="mb-1.5 text-xs font-medium text-gray-400">
              Final exam · question {pos + 1} of {items.length}
            </p>
            <div className="h-2 w-full bg-white/10">
              <motion.div
                className="h-full bg-amber-400"
                initial={false}
                animate={{ width: `${Math.max(2, (pos / items.length) * 100)}%` }}
                transition={{ duration: 0.4, ease: EASE_OUT }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pos}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
            >
              <Eyebrow>{item.lessonTitle}</Eyebrow>
              {q.kind === "choice" && <ChoiceView q={q} selected={a.choice} checked={false} onSelect={(i) => set({ choice: i })} />}
              {q.kind === "truefalse" && <TrueFalseView q={q} selected={a.tf} checked={false} onSelect={(v) => set({ tf: v })} />}
              {q.kind === "tap" && <TapView q={q} selected={a.tap} checked={false} correct={false} onSelect={(i) => set({ tap: i })} />}
              {q.kind === "numeric" && (
                <NumericView q={q} value={a.numeric} checked={false} correct={false} onChange={(v) => set({ numeric: v })} onSubmit={next} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 border-t border-white/10 bg-[#09090f] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {error ? <p className="text-sm text-red-300">{error}</p> : <span className="hidden sm:block" />}
          <div className="flex gap-2.5 sm:ml-auto">
            {pos > 0 && (
              <button
                type="button"
                onClick={() => setPos((p) => p - 1)}
                disabled={submitting}
                className="rounded-xl border border-white/15 px-5 py-3.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              disabled={!answered || submitting}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-bold uppercase tracking-wider transition-colors sm:flex-none",
                !answered || submitting ? "cursor-not-allowed bg-white/[0.06] text-gray-600" : "bg-amber-500 text-black hover:bg-amber-400",
              )}
            >
              {submitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
              {last ? "Submit" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Results({ result, onRetry }: { result: ExamResult; onRetry: () => void }) {
  const [open, setOpen] = useState(false)
  const missed = result.review.filter((r) => !r.correct)
  const pct = Math.round((result.correct / Math.max(1, result.total)) * 100)
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex w-full max-w-lg flex-col items-center px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className={cn(
            "flex size-24 items-center justify-center rounded-full border",
            result.passed ? "border-amber-400/50 bg-amber-500/15" : "border-white/15 bg-white/[0.04]",
          )}
        >
          {result.passed ? <Award className="size-11 text-amber-200" aria-hidden /> : <RotateCcw className="size-10 text-gray-400" aria-hidden />}
        </motion.div>
        <p className={cn("mt-6 text-xs font-semibold uppercase tracking-[0.18em]", result.passed ? "text-amber-300/80" : "text-gray-400")}>
          {result.passed ? "You passed" : "Not this time"}
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">
          <NumberFlow value={result.correct} /> / {result.total}
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {pct}% · pass mark {result.passMark} of {result.total}
          {result.xpEarned > 0 ? ` · +${result.xpEarned} XP` : ""}
        </p>

        <div className="mt-8 flex w-full flex-col gap-2.5">
          {result.certificateId ? (
            <Link
              href="/dashboard/academy/certificate"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              <Award className="size-4" /> View your certificate
            </Link>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-sm font-bold text-black hover:bg-amber-400"
            >
              <RotateCcw className="size-4" /> Try again
            </button>
          )}
          <Link href="/dashboard/academy" className="rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]">
            Back to Academy
          </Link>
        </div>

        {result.xpEarned > 0 && <LevelUp xpBefore={result.xpTotal - result.xpEarned} xpAfter={result.xpTotal} delay={0.9} />}

        {missed.length > 0 && (
          <div className="mt-8 w-full text-left">
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className="flex w-full items-center justify-between border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-gray-200"
            >
              Review the {missed.length} you missed
              <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
            </button>
            {open && (
              <ul className="space-y-2.5 border-x border-b border-white/10 p-4">
                {missed.map((m) => (
                  <li key={m.key} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">{m.lessonTitle}</p>
                    <p className="mt-1 flex gap-2 text-sm text-gray-200">
                      <XCircle className="mt-0.5 size-4 shrink-0 text-red-400" aria-hidden />
                      {m.prompt}
                    </p>
                    <p className="mt-1 pl-6 text-sm text-emerald-300">Answer: {m.rightAnswer}</p>
                    <p className="mt-1 pl-6 text-xs leading-relaxed text-gray-400">{m.explain}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function ExamSession() {
  const [phase, setPhase] = useState<Phase>({ kind: "intro" })
  const [error, setError] = useState<string | null>(null)

  const start = async () => {
    setError(null)
    setPhase({ kind: "loading" })
    try {
      const res = await requestJson<{ attemptId: string; items: ExamItem[] }>("/api/academy/exam", { method: "POST" })
      setPhase({ kind: "running", attemptId: res.attemptId, items: res.items })
    } catch (err) {
      setError(userMessage(err, "We couldn't start the exam. Please try again."))
      setPhase({ kind: "intro" })
    }
  }

  const submit = async (attemptId: string, items: ExamItem[], answers: Record<string, Answer>) => {
    setError(null)
    setPhase({ kind: "submitting", attemptId, items })
    try {
      const result = await requestJson<ExamResult>("/api/academy/exam/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, day: localDay(), answers }),
      })
      void mutate(academyKey())
      setPhase({ kind: "done", result })
    } catch (err) {
      setError(userMessage(err, "We couldn't submit your exam. Check your connection and try again."))
      setPhase({ kind: "running", attemptId, items })
    }
  }

  if (phase.kind === "intro" || phase.kind === "loading") {
    return <Intro onStart={() => void start()} error={error} busy={phase.kind === "loading"} />
  }
  if (phase.kind === "done") {
    return (
      <Results
        result={phase.result}
        onRetry={() => {
          setError(null)
          setPhase({ kind: "intro" })
        }}
      />
    )
  }
  return (
    <Runner
      key={phase.attemptId}
      items={phase.items}
      submitting={phase.kind === "submitting"}
      error={error}
      onSubmit={(answers) => void submit(phase.attemptId, phase.items, answers)}
    />
  )
}
