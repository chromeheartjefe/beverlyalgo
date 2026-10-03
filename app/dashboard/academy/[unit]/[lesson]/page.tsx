import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { LessonPlayer } from "@/components/dashboard/academy/lesson-player"
import { getLessonContent } from "@/content/academy"
import { ALL_LESSONS, findLesson, lessonHref } from "@/lib/academy/curriculum"
import { glossaryHintsForLesson } from "@/lib/glossary/lesson-hints"

type Params = Promise<{ unit: string; lesson: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { unit, lesson } = await params
  const ref = findLesson(unit, lesson)
  return { title: ref ? `${ref.lesson.title} – Academy` : "Academy" }
}

export default async function LessonPage({ params }: { params: Params }) {
  const { unit, lesson } = await params
  const ref = findLesson(unit, lesson)
  const content = ref && getLessonContent(ref.lesson.id)
  if (!ref || !content) notFound()

  const nextRef = ALL_LESSONS[ref.index + 1]
  const next = nextRef && getLessonContent(nextRef.lesson.id) ? { href: lessonHref(nextRef), title: nextRef.lesson.title } : null

  return (
    <LessonPlayer
      key={ref.lesson.id}
      lesson={content}
      meta={{
        id: ref.lesson.id,
        title: ref.lesson.title,
        unitTitle: ref.unit.title,
        position: `Unit ${ref.unit.id.slice(1)} · Lesson ${ref.unit.lessons.indexOf(ref.lesson) + 1}`,
      }}
      next={next}
      glossary={glossaryHintsForLesson(content)}
    />
  )
}
