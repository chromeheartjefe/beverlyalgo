"use client"

import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import { Dumbbell, Flame, GraduationCap, Loader2, RotateCcw, Snowflake, Sparkles } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { mutate } from "swr"

import type { LessonFinish } from "@/components/dashboard/academy/lesson-complete"
import { LevelUp } from "@/components/dashboard/academy/level-up"
import { EASE_OUT } from "@/components/ui/motion"
import type { PracticeResult } from "@/lib/academy/server"
import { academyKey } from "@/lib/academy/use-academy"
import { localDay } from "@/lib/academy/xp"
import { requestJson, userMessage } from "@/lib/api-client"

/** One practice question: its step id in the session, where it came from, and its eyebrow label */
export interface PracticeEntry {
  key: string
  lessonId: string
  questionId: string
  label: string
}

// End of a practice session: sends each question's first-try result so the
// server can move it through the review boxes, then shows the outcome.
export function PracticeComplete({
  entries,
  finish,
  onAgain,
}: {
  entries: PracticeEntry[]
  finish: LessonFinish
  /** Starts a fresh session */
  onAgain?: () => void
}) {
  const [saved, setSaved] = useState<PracticeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shownXp, setShownXp] = useState(0)
  const started = useRef(false)

  const save = useCallback(async () => {
    setError(null)
    try {
      const results = entries.map((e) => ({ lessonId: e.lessonId, questionId: e.questionId, correct: finish.firstTry[e.key] ?? false }))
      const res = await requestJson<PracticeResult>("/api/academy/practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: localDay(), results }),
      })
      setSaved(res)
      void mutate(academyKey(), res.state, { revalidate: false })
      setTimeout(() => setShownXp(res.xpEarned), 350)
    } catch (err) {
      setError(userMessage(err, "We couldn't save your practice. Check your connection and try again."))
    }
  }, [entries, finish.firstTry])

  useEffect(() => {
    if (started.current) return
    started.current = true
    void save()
  }, [save])

  const accuracy = finish.total > 0 ? Math.round((finish.correct / finish.total) * 100) : 100

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="relative flex size-24 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/15"
        >
          <div aria-hidden className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl" />
          <Dumbbell className="relative size-11 text-sky-200" aria-hidden />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: EASE_OUT }}
          className="mt-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">Practice complete</p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            {finish.correct} of {finish.total} right first time
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: EASE_OUT }}
          className="mt-8 grid w-full grid-cols-3 gap-2.5"
        >
          <div className="border border-amber-400/30 bg-amber-500/[0.08] px-2 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300/80">XP earned</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold text-amber-200">
              <Sparkles className="size-4" aria-hidden />
              {saved ? <NumberFlow value={shownXp} prefix="+" /> : "..."}
            </p>
          </div>
          <div className="border border-emerald-400/30 bg-emerald-500/[0.08] px-2 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300/80">Accuracy</p>
            <p className="mt-1 text-2xl font-bold text-emerald-200">{accuracy}%</p>
          </div>
          <div className="border border-orange-400/30 bg-orange-500/[0.08] px-2 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-orange-300/80">Streak</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold text-orange-200">
              <Flame className="size-4" aria-hidden />
              {saved ? saved.state.streak : "..."}
            </p>
          </div>
        </motion.div>

        <div className="mt-4 min-h-[3.5rem] w-full space-y-1.5 text-sm">
          {!saved && !error && (
            <p className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Saving your practice
            </p>
          )}
          {error && (
            <div className="space-y-2">
              <p className="text-red-300">{error}</p>
              <button
                type="button"
                onClick={() => void save()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-white/[0.06]"
              >
                <RotateCcw className="size-3.5" /> Try again
              </button>
            </div>
          )}
          {saved && saved.graduated > 0 && (
            <p className="flex items-center justify-center gap-1.5 text-emerald-300">
              <GraduationCap className="size-4" aria-hidden />
              {saved.graduated === 1 ? "1 question is fully learned" : `${saved.graduated} questions are fully learned`} and won&apos;t come back.
            </p>
          )}
          {saved && saved.xpEarned === 0 && finish.correct > 0 && (
            <p className="text-gray-500">You&apos;ve reached today&apos;s practice XP limit. The review still counts.</p>
          )}
          {saved && (
            <p className="text-gray-400">
              {saved.state.dueCount > 0 ? `${saved.state.dueCount} more due for review today.` : "Nothing else is due today."}
            </p>
          )}
          {saved?.usedFreeze && (
            <p className="flex items-center justify-center gap-1.5 text-sky-300">
              <Snowflake className="size-4" aria-hidden /> A streak freeze covered the day you missed.
            </p>
          )}
        </div>

        {saved && <LevelUp xpBefore={saved.state.xp - saved.xpEarned} xpAfter={saved.state.xp} delay={0.9} />}

        <div className="mt-8 flex w-full flex-col gap-2.5">
          {onAgain && (
            <button
              type="button"
              onClick={onAgain}
              disabled={!saved}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Dumbbell className="size-4" /> Practice again
            </button>
          )}
          <Link
            href="/dashboard/academy"
            className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-gray-200 transition-colors hover:bg-white/[0.06]"
          >
            Back to Academy
          </Link>
        </div>
      </div>
    </div>
  )
}
