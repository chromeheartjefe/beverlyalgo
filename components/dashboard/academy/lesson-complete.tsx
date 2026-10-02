"use client"

import NumberFlow from "@number-flow/react"
import { motion } from "framer-motion"
import { ArrowRight, Flame, Loader2, RotateCcw, Snowflake, Sparkles, Trophy } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { mutate } from "swr"

import { LevelUp } from "@/components/dashboard/academy/level-up"
import { EASE_OUT } from "@/components/ui/motion"
import type { CompletionResult } from "@/lib/academy/server"
import { academyKey } from "@/lib/academy/use-academy"
import { localDay, rankFor } from "@/lib/academy/xp"
import { requestJson, userMessage } from "@/lib/api-client"

export interface LessonFinish {
  correct: number
  total: number
  /** Question ids missed on the first try */
  missed: string[]
  /** First-try result per question id */
  firstTry: Record<string, boolean>
}

// End of a lesson: saves it (the API awards the XP and moves the streak),
// then celebrates with the numbers it sent back.
export function LessonComplete({
  lessonId,
  title,
  finish,
  next,
}: {
  lessonId: string
  title: string
  finish: LessonFinish
  next: { href: string; title: string } | null
}) {
  const [saved, setSaved] = useState<CompletionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shownXp, setShownXp] = useState(0)
  const started = useRef(false)

  const save = useCallback(async () => {
    setError(null)
    try {
      const res = await requestJson<CompletionResult>("/api/academy/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, correct: finish.correct, total: finish.total, missed: finish.missed, day: localDay() }),
      })
      setSaved(res)
      void mutate(academyKey(), res.state, { revalidate: false })
      // Let the count-up start after the screen has appeared
      setTimeout(() => setShownXp(res.xpEarned), 350)
    } catch (err) {
      setError(userMessage(err, "We couldn't save your progress. Check your connection and try again."))
    }
  }, [lessonId, finish.correct, finish.total, finish.missed])

  useEffect(() => {
    // Once per finish, also under React's dev double-mount
    if (started.current) return
    started.current = true
    void save()
  }, [save])

  const accuracy = finish.total > 0 ? Math.round((finish.correct / finish.total) * 100) : 100
  const perfect = finish.total > 0 && finish.correct === finish.total
  const rank = saved ? rankFor(saved.state.xp) : null

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="relative flex size-24 items-center justify-center rounded-full border border-purple-400/40 bg-purple-500/15"
        >
          <div aria-hidden className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl" />
          <Trophy className="relative size-11 text-purple-200" aria-hidden />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15, ease: EASE_OUT }}
          className="mt-6"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-300/80">Lesson complete</p>
          <h1 className="mt-2 text-balance text-2xl font-bold text-white">{title}</h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25, ease: EASE_OUT }}
          className="mt-8 grid w-full grid-cols-3 gap-2.5"
        >
          <div className="border border-amber-400/30 bg-amber-500/[0.08] px-2 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-300/80">XP earned</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold text-amber-200">
              <Sparkles className="size-4" aria-hidden />
              {saved ? <NumberFlow value={shownXp} prefix="+" /> : "..."}
            </p>
          </div>
          <div className="border border-emerald-400/30 bg-emerald-500/[0.08] px-2 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300/80">Accuracy</p>
            <p className="mt-1 text-2xl font-bold text-emerald-200">{accuracy}%</p>
          </div>
          <div className="border border-orange-400/30 bg-orange-500/[0.08] px-2 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-orange-300/80">Streak</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold text-orange-200">
              <Flame className="size-4" aria-hidden />
              {saved ? saved.state.streak : "..."}
            </p>
          </div>
        </motion.div>

        <div className="mt-4 min-h-[3.5rem] w-full space-y-1.5 text-sm">
          {!saved && !error && (
            <p className="flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="size-4 animate-spin" aria-hidden /> Saving your progress
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
          {saved && perfect && saved.firstTime && <p className="text-amber-200">Perfect lesson: +5 bonus XP.</p>}
          {saved && !saved.firstTime && saved.xpEarned === 0 && (
            <p className="text-gray-500">Already practised today, so no extra XP this time. Your best score is kept.</p>
          )}
          {saved && finish.missed.length > 0 && (
            <p className="text-gray-400">
              {finish.missed.length === 1 ? "The question you missed" : `The ${finish.missed.length} questions you missed`} will come back in Practice tomorrow.
            </p>
          )}
          {saved?.usedFreeze && (
            <p className="flex items-center justify-center gap-1.5 text-sky-300">
              <Snowflake className="size-4" aria-hidden /> A streak freeze covered the day you missed.
            </p>
          )}
        </div>

        {saved && <LevelUp xpBefore={saved.state.xp - saved.xpEarned} xpAfter={saved.state.xp} delay={0.9} />}

        {/* Rank progress */}
        {rank && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mt-4 w-full border border-white/10 bg-white/[0.03] p-4 text-left"
          >
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-white">{rank.name}</span>
              <span className="text-gray-500">
                {rank.next ? `${saved!.state.xp} / ${rank.next.xp} XP to ${rank.next.name}` : `${saved!.state.xp} XP`}
              </span>
            </div>
            <div className="mt-2 h-2 w-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
                initial={{ width: 0 }}
                animate={{ width: `${rank.progress * 100}%` }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT }}
              />
            </div>
          </motion.div>
        )}

        <div className="mt-8 flex w-full flex-col gap-2.5">
          {next && (
            <Link
              href={next.href}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-purple-400"
            >
              Next: {next.title}
              <ArrowRight className="size-4" />
            </Link>
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
