"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, Award, Check, ChevronDown, Clock, Dumbbell, Flame, GraduationCap, Lock, ScrollText, Snowflake, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { LevelUp } from "@/components/dashboard/academy/level-up"
import { EASE_OUT, Loaded } from "@/components/ui/motion"
import { ALL_LESSONS, CURRICULUM, lessonHref,type LessonRef } from "@/lib/academy/curriculum"
import type { AcademyState } from "@/lib/academy/server"
import { useAcademy } from "@/lib/academy/use-academy"
import { rankFor,RANKS, XP_LESSON } from "@/lib/academy/xp"
import { cn } from "@/lib/utils"

type LessonStatus = "done" | "next" | "open" | "locked" | "soon"

// Lessons unlock in course order: a written lesson opens once the one before
// it is finished. Unwritten lessons show as "Coming soon". Admin accounts
// (state.unlockAll, decided on the server) can open every written lesson.
function useStatuses(state: AcademyState | undefined, available: Set<string>) {
  return useMemo(() => {
    const completed = state?.completed ?? {}
    const status = new Map<string, LessonStatus>()
    let next: LessonRef | null = null
    for (const ref of ALL_LESSONS) {
      const id = ref.lesson.id
      if (completed[id]) {
        status.set(id, "done")
        continue
      }
      if (!available.has(id)) {
        status.set(id, "soon")
        continue
      }
      const prev = ALL_LESSONS[ref.index - 1]
      const open = !prev || !!completed[prev.lesson.id] || !!state?.unlockAll
      if (open && !next) {
        next = ref
        status.set(id, "next")
      } else {
        status.set(id, open ? "open" : "locked")
      }
    }
    return { status, next, doneCount: Object.keys(completed).length }
  }, [state, available])
}

function Ring({ value, size = 56 }: { value: number; size?: number }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#34c28a"
        strokeWidth={stroke}
        strokeLinecap="butt"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c * (1 - value) }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
      />
    </svg>
  )
}

function StatCard({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("relative overflow-hidden rounded-2xl border border-white/15 bg-white/[0.025] p-5", className)}>{children}</div>
}

function Stats({ state, doneCount }: { state: AcademyState; doneCount: number }) {
  const rank = rankFor(state.xp)
  const total = ALL_LESSONS.length
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <Sparkles className="size-3.5 text-amber-300" aria-hidden /> Rank
        </div>
        <p className="mt-2 text-xl font-bold text-white">{rank.name}</p>
        <div className="mt-3 h-1.5 w-full bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400"
            initial={{ width: 0 }}
            animate={{ width: `${rank.progress * 100}%` }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {state.xp} XP{rank.next ? ` · ${rank.next.xp - state.xp} to ${rank.next.name}` : " · top rank"}
        </p>
      </StatCard>

      <StatCard>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
          <Flame className="size-3.5 text-orange-400" aria-hidden /> Daily streak
        </div>
        <p className="mt-2 text-xl font-bold text-white">
          {state.streak} {state.streak === 1 ? "day" : "days"}
        </p>
        <p className={cn("mt-3 text-xs", state.todayCount > 0 ? "text-emerald-300" : "text-gray-400")}>
          {state.todayCount > 0 ? "Done for today. Nice work." : "Finish a lesson today to keep it going."}
        </p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
          <Snowflake className={cn("size-3", state.freezeAvailable ? "text-sky-300" : "text-gray-600")} aria-hidden />
          {state.freezeAvailable ? "Streak freeze ready" : "Streak freeze recharging"}
          {state.bestStreak > 0 && <span className="text-gray-600">· best: {state.bestStreak}</span>}
        </p>
      </StatCard>

      <StatCard className="flex items-center gap-4">
        <Ring value={doneCount / total} />
        <div>
          <p className="text-xs font-medium text-gray-400">Course progress</p>
          <p className="mt-1 text-xl font-bold text-white">{Math.round((doneCount / total) * 100)}%</p>
          <p className="text-xs text-gray-500">
            {doneCount} of {total} lessons
          </p>
        </div>
      </StatCard>
    </div>
  )
}

// The unit's lessons as a little Duolingo-style road: finished, current, to go
function UnitRoad({ next, completed }: { next: LessonRef; completed: AcademyState["completed"] }) {
  const lessons = next.unit.lessons
  return (
    <ol className="flex items-center" aria-label={`Lessons in ${next.unit.title}`}>
      {lessons.map((l, i) => {
        const done = !!completed[l.id]
        const current = l.id === next.lesson.id
        return (
          <li key={l.id} className={cn("flex items-center", i > 0 && "flex-1")}>
            {i > 0 && (
              <span
                aria-hidden
                className={cn("h-0.5 min-w-1.5 flex-1", done || current ? "bg-gradient-to-r from-emerald-400/70 to-purple-400/70" : "bg-white/10")}
              />
            )}
            <span
              title={`${i + 1}. ${l.title}`}
              className={cn(
                "relative flex shrink-0 items-center justify-center rounded-full",
                current
                  ? "size-7 bg-purple-500 text-white shadow-[0_0_18px_rgba(168,85,247,0.55)] ring-4 ring-purple-500/25"
                  : done
                    ? "size-5 bg-emerald-500/90 text-white"
                    : "size-5 border border-white/20 bg-white/[0.03] text-gray-600",
              )}
            >
              {current && <span aria-hidden className="absolute inset-0 rounded-full bg-purple-400/60 motion-safe:animate-ping" />}
              {done ? (
                <Check className="size-3" strokeWidth={3} aria-hidden />
              ) : (
                <span className={cn("relative font-bold tabular-nums", current ? "text-xs" : "text-[10px]")}>{i + 1}</span>
              )}
              <span className="sr-only">{done ? "finished" : current ? "up next" : "to do"}</span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function UpNext({ next, completed }: { next: LessonRef | null; completed: AcademyState["completed"] }) {
  if (!next) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/[0.025] p-5 sm:p-6">
        <p className="text-sm font-semibold text-white">You&apos;re all caught up</p>
        <p className="mt-1 text-sm text-gray-400">New lessons are added every few days. Replay any finished lesson to practise.</p>
      </div>
    )
  }
  const unitNumber = next.unit.id.slice(1)
  const lessonNumber = next.unit.lessons.indexOf(next.lesson) + 1
  const unitDone = next.unit.lessons.filter((l) => completed[l.id]).length
  return (
    <div className="relative flex flex-col justify-between gap-5 overflow-hidden rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/[0.16] via-purple-500/[0.05] to-transparent p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-purple-500/20 blur-3xl" />
      {/* Faint dot grid, fading out to the left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:linear-gradient(to_left,black,transparent_65%)]"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-300/90">
            Up next · Unit {unitNumber}, lesson {lessonNumber}
          </p>
          <p className="mt-1.5 text-xl font-bold text-white">{next.lesson.title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
            <span>{next.unit.title}</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden /> {next.lesson.minutes} min
            </span>
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-300">
          <Sparkles className="size-3" aria-hidden /> +{XP_LESSON} XP
        </span>
      </div>

      <div className="relative">
        <UnitRoad next={next} completed={completed} />
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-400">
            <span className="font-semibold text-white">{unitDone}</span> of {next.unit.lessons.length} lessons done in Unit {unitNumber}
          </p>
          <Link
            href={lessonHref(next)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-purple-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-400"
          >
            {lessonNumber === 1 && unitNumber === "1" ? "Start learning" : "Start lesson"}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function PracticeCard({ dueCount, ready }: { dueCount: number; ready: boolean }) {
  return (
    <div className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-sky-400/25 bg-sky-500/[0.06] p-5 sm:p-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-300/90">
          <Dumbbell className="size-3.5" aria-hidden /> Practice
        </div>
        <p className="mt-1.5 text-lg font-bold text-white">
          {!ready ? "Unlocks after a lesson" : dueCount > 0 ? `${dueCount} due for review` : "Keep it fresh"}
        </p>
        <p className="mt-1 text-sm text-gray-400">
          {!ready
            ? "Questions you miss come back here to review."
            : dueCount > 0
              ? "Questions you missed, spaced out so they stick."
              : "A quick mix of questions from lessons you've finished."}
        </p>
      </div>
      {ready ? (
        <Link
          href="/dashboard/academy/practice"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-sky-400"
        >
          Practice
          <ArrowRight className="size-4" />
        </Link>
      ) : (
        <span className="inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-white/[0.06] px-5 py-2.5 text-sm font-bold text-gray-600">
          Practice
        </span>
      )}
    </div>
  )
}

const NODE_STYLES: Record<LessonStatus, string> = {
  done:   "border-emerald-400/60 bg-emerald-500/20 text-emerald-300",
  next:   "border-purple-400 bg-purple-500 text-white",
  open:   "border-purple-400/50 bg-purple-500/10 text-purple-200",
  locked: "border-white/15 bg-white/[0.04] text-gray-500",
  soon:   "border-dashed border-white/15 bg-transparent text-gray-600",
}

function LessonRow({
  refItem,
  status,
  score,
  last,
}: {
  refItem: LessonRef
  status: LessonStatus
  score?: { bestCorrect: number; total: number }
  last: boolean
}) {
  const clickable = status === "done" || status === "next" || status === "open"
  const inner = (
    <>
      {/* Timeline node + connector */}
      <div className="relative flex w-8 shrink-0 justify-center self-stretch">
        {!last && <span aria-hidden className="absolute left-1/2 top-9 -bottom-2 w-px -translate-x-1/2 bg-white/10" />}
        <span className={cn("relative mt-1 flex size-8 items-center justify-center rounded-full border", NODE_STYLES[status])}>
          {status === "next" && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-purple-500/30" />}
          {status === "done" ? (
            <Check className="size-4" />
          ) : status === "locked" ? (
            <Lock className="size-3.5" />
          ) : status === "soon" ? (
            <Clock className="size-3.5" />
          ) : (
            <span className="text-xs font-bold">{refItem.unit.lessons.indexOf(refItem.lesson) + 1}</span>
          )}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <p className={cn("truncate text-sm font-medium", status === "soon" || status === "locked" ? "text-gray-500" : "text-gray-100")}>
            {refItem.lesson.title}
          </p>
          <p className="text-xs text-gray-600">{refItem.lesson.minutes} min</p>
        </div>
        <span
          className={cn(
            "shrink-0 text-xs font-semibold",
            status === "next" || status === "open" ? "text-purple-300" : status === "done" ? "text-emerald-300/80" : "text-gray-600",
          )}
        >
          {status === "next" || status === "open" ? "Start" : status === "done" ? (score ? `${score.bestCorrect}/${score.total} · Review` : "Review") : status === "soon" ? "Soon" : ""}
        </span>
      </div>
    </>
  )
  return clickable ? (
    <Link href={lessonHref(refItem)} className="-mx-2 flex gap-3 rounded-xl px-2 transition-colors hover:bg-white/[0.04]">
      {inner}
    </Link>
  ) : (
    <div className="-mx-2 flex gap-3 px-2" aria-disabled>
      {inner}
    </div>
  )
}

function Path({ state, status, nextUnitId }: { state: AcademyState; status: Map<string, LessonStatus>; nextUnitId: string | null }) {
  const [open, setOpen] = useState<Set<string>>(() => new Set([nextUnitId ?? "u1"]))
  const toggle = (id: string) =>
    setOpen((prev) => {
      const s = new Set(prev)
      if (s.has(id)) s.delete(id)
      else s.add(id)
      return s
    })

  return (
    <div className="space-y-10">
      {CURRICULUM.map((level, li) => {
        const levelLessons = level.units.flatMap((u) => u.lessons)
        const levelDone = levelLessons.filter((l) => state.completed[l.id]).length
        return (
          <section key={level.id}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-purple-300/80">Level {li + 1}</p>
                <h2 className="mt-1 text-lg font-bold text-white">{level.title}</h2>
                <p className="mt-0.5 text-sm text-gray-500">{level.summary}</p>
              </div>
              <p className="text-xs text-gray-500">
                {levelDone}/{levelLessons.length} lessons
              </p>
            </div>

            <div className="space-y-3">
              {level.units.map((u) => {
                const unitDone = u.lessons.filter((l) => state.completed[l.id]).length
                const isOpen = open.has(u.id)
                const written = u.lessons.some((l) => status.get(l.id) !== "soon")
                return (
                  <div key={u.id} className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.025]">
                    <button
                      type="button"
                      onClick={() => toggle(u.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/[0.02] sm:p-5"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.04] text-sm font-bold text-gray-300">
                        {u.id.slice(1)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-semibold text-white">{u.title}</p>
                          {!written && (
                            <span className="border border-white/10 px-1.5 py-px text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                              Coming soon
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{u.summary}</p>
                        <div className="mt-2.5 h-1 w-full max-w-xs bg-white/10">
                          <div className="h-full bg-emerald-400/80" style={{ width: `${(unitDone / u.lessons.length) * 100}%` }} />
                        </div>
                      </div>
                      <span className="hidden text-xs text-gray-500 sm:block">
                        {unitDone}/{u.lessons.length}
                      </span>
                      <ChevronDown className={cn("size-4 shrink-0 text-gray-500 transition-transform duration-200", isOpen && "rotate-180")} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: EASE_OUT }}
                        >
                          <div className="space-y-1 border-t border-white/10 px-4 pb-4 pt-3 sm:px-5">
                            {u.lessons.map((lesson, i) => {
                              const refItem = ALL_LESSONS.find((r) => r.lesson.id === lesson.id)!
                              return (
                                <LessonRow
                                  key={lesson.id}
                                  refItem={refItem}
                                  status={status.get(lesson.id) ?? "soon"}
                                  score={state.completed[lesson.id]}
                                  last={i === u.lessons.length - 1}
                                />
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function FinalExamCard({ state, written, doneCount }: { state: AcademyState; written: number; doneCount: number }) {
  const ready = doneCount >= written || state.unlockAll
  const passed = !!state.certificateId
  return (
    <section className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-br from-amber-500/[0.12] via-amber-500/[0.04] to-transparent p-5 sm:p-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-amber-400/40 bg-amber-500/15">
            {passed ? <Award className="size-6 text-amber-200" aria-hidden /> : <ScrollText className="size-6 text-amber-200" aria-hidden />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/90">Capstone</p>
            <p className="mt-1 text-lg font-bold text-white">{passed ? "You're certified" : "Final exam and certificate"}</p>
            <p className="mt-1 text-sm text-gray-400">
              {passed
                ? "You passed the final exam. Share your certificate."
                : ready
                  ? "30 questions from the whole course. Score 80% to earn your certificate."
                  : `Unlocks when you finish every lesson (${doneCount} of ${written} done).`}
            </p>
          </div>
        </div>
        {passed ? (
          <Link
            href="/dashboard/academy/certificate"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
          >
            View certificate <ArrowRight className="size-4" />
          </Link>
        ) : ready ? (
          <Link
            href="/dashboard/academy/final-exam"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-400"
          >
            Take the exam <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span className="inline-flex shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-6 py-3 text-sm font-bold text-gray-600">
            <Lock className="size-4" /> Locked
          </span>
        )}
      </div>
    </section>
  )
}

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
      <div className="h-64 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]" />
    </div>
  )
}

export function AcademyHome({ availableIds }: { availableIds: string[] }) {
  const { state, error, loading, mutate } = useAcademy()
  const available = useMemo(() => new Set(availableIds), [availableIds])
  const { status, next, doneCount } = useStatuses(state, available)

  // Admin preview of the level-up celebration: ?preview=levelup (optionally &rank=1..6)
  const [preview, setPreview] = useState<number | null>(null)
  useEffect(() => {
    if (!state?.unlockAll) return
    const params = new URLSearchParams(window.location.search)
    if (params.get("preview") !== "levelup") return
    const r = Math.min(RANKS.length - 1, Math.max(1, Number(params.get("rank")) || 2))
    setPreview(r)
  }, [state?.unlockAll])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-start gap-3 sm:mb-8">
          <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 sm:flex">
            <GraduationCap className="size-5 text-purple-300" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Entrix Academy</h1>
            <p className="mt-1 text-sm text-gray-500">
              From your first trade to Smart Money concepts, in short lessons with quick checks. Free for every account.
            </p>
          </div>
        </div>

        {error && !state ? (
          <div className="rounded-2xl border border-red-500/25 bg-red-500/[0.06] p-5 text-sm text-red-200">
            We couldn&apos;t load your progress.{" "}
            <button type="button" onClick={() => void mutate()} className="font-semibold underline underline-offset-2">
              Try again
            </button>
          </div>
        ) : (
          <Loaded loading={loading || !state} fallback={<Skeleton />}>
            {state && (
              <div className="space-y-6">
                <Stats state={state} doneCount={doneCount} />
                <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
                  <UpNext next={next} completed={state.completed} />
                  <PracticeCard dueCount={state.dueCount} ready={doneCount > 0} />
                </div>
                <div className="pt-4">
                  <Path state={state} status={status} nextUnitId={next?.unit.id ?? null} />
                </div>
                <FinalExamCard state={state} written={available.size} doneCount={doneCount} />
              </div>
            )}
          </Loaded>
        )}

        {preview !== null && <LevelUp xpBefore={RANKS[preview].xp - 1} xpAfter={RANKS[preview].xp} delay={0.3} />}

        <p className="mt-12 border-t border-white/10 pt-4 text-xs leading-relaxed text-gray-600">
          Entrix Academy is educational content, not financial advice. Trading involves substantial risk of loss.
          Charts in lessons are illustrative unless stated otherwise.
        </p>
      </div>
    </div>
  )
}
