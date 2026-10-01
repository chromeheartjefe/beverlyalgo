"use client"

import { Dumbbell, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

import { LessonPlayer } from "@/components/dashboard/academy/lesson-player"
import type { PracticeEntry } from "@/components/dashboard/academy/practice-complete"
import type { PracticeItem } from "@/lib/academy/server"
import type { LessonContent } from "@/lib/academy/types"
import { localDay } from "@/lib/academy/xp"
import { requestJson, userMessage } from "@/lib/api-client"

// The Practice tab: loads a session of due reviews and refreshers, then runs
// it through the normal lesson player in practice mode. Question ids are
// only unique inside a lesson, so each step gets a "lessonId::questionId" key.
export function PracticeSession() {
  const [items, setItems] = useState<PracticeItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Bumped by "Practice again" to load a fresh session
  const [round, setRound] = useState(0)

  useEffect(() => {
    let live = true
    requestJson<{ items: PracticeItem[] }>(`/api/academy/practice?day=${localDay()}`)
      .then((r) => live && setItems(r.items))
      .catch((err) => live && setError(userMessage(err, "We couldn't load your practice. Please try again.")))
    return () => {
      live = false
    }
  }, [round])

  const again = () => {
    setItems(null)
    setError(null)
    setRound((r) => r + 1)
  }

  const session = useMemo(() => {
    if (!items || items.length === 0) return null
    const entries: PracticeEntry[] = items.map((it) => ({
      key: `${it.lessonId}::${it.question.id}`,
      lessonId: it.lessonId,
      questionId: it.question.id,
      label: `${it.due ? "Review" : "Refresher"} · ${it.lessonTitle}`,
    }))
    const lesson: LessonContent = {
      id: "practice",
      sources: [],
      steps: items.map((it, i) => ({ ...it.question, id: entries[i].key })),
    }
    return { entries, lesson }
  }, [items])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div>
          <p className="text-sm text-red-300">{error}</p>
          <Link href="/dashboard/academy" className="mt-4 inline-block text-sm font-semibold text-purple-300 underline underline-offset-2">
            Back to Academy
          </Link>
        </div>
      </div>
    )
  }

  if (!items) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-gray-500">
        <Loader2 className="size-4 animate-spin" aria-hidden /> Building your practice session
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10">
            <Dumbbell className="size-6 text-sky-300" aria-hidden />
          </div>
          <p className="mt-4 text-base font-semibold text-white">Nothing to practise yet</p>
          <p className="mt-1 text-sm text-gray-400">Finish a lesson first. Any question you miss comes back here for review.</p>
          <Link
            href="/dashboard/academy"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-purple-500 px-6 py-3 text-sm font-bold text-white hover:bg-purple-400"
          >
            Go to lessons
          </Link>
        </div>
      </div>
    )
  }

  return (
    <LessonPlayer
      key={round}
      lesson={session.lesson}
      meta={{ id: "practice", title: "Practice", unitTitle: "", position: `${session.entries.length} questions` }}
      next={null}
      practice={session.entries}
      onPracticeAgain={again}
    />
  )
}
