import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { getLessonContent, questionCount } from "@/content/academy"
import { canCompleteLesson, completeLesson } from "@/lib/academy/server"
import { isDay, isPlausibleDay } from "@/lib/academy/xp"
import { checkRateLimit } from "@/lib/rate-limit"

const bodySchema = z.object({
  lessonId: z.string().min(1).max(96),
  // Questions answered right on the first try
  correct: z.number().int().min(0),
  total: z.number().int().min(0),
  // Question ids missed on the first try; they go into Practice
  missed: z.array(z.string().min(1).max(96)).max(50).default([]),
  day: z.string(),
})

// POST /api/academy/complete: a lesson was finished. Awards XP and moves the
// streak. The score is checked against the lesson itself.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "We couldn't save that lesson. Please try again." }, { status: 400 })
  const { lessonId, correct, total, missed, day } = parsed.data

  const lesson = getLessonContent(lessonId)
  if (!lesson) return NextResponse.json({ error: "That lesson doesn't exist." }, { status: 404 })
  // First-try misses plus first-try rights always add up to the lesson's questions
  if (total !== questionCount(lesson) || correct > total || new Set(missed).size !== total - correct) {
    return NextResponse.json({ error: "We couldn't save that lesson. Please reload and try again." }, { status: 400 })
  }
  if (!isDay(day) || !isPlausibleDay(day)) {
    return NextResponse.json({ error: "Your device's date looks off. Check your clock and try again." }, { status: 400 })
  }

  // A lesson takes minutes; this only stops scripted XP farming
  if (!(await checkRateLimit(`academy-complete:${userId}`, 30, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Slow down a little: too many lessons finished in a short time." }, { status: 429 })
  }

  if (!(await canCompleteLesson(userId, lessonId))) {
    return NextResponse.json({ error: "Finish the lessons before this one first." }, { status: 403 })
  }

  return NextResponse.json(await completeLesson({ userId, lessonId, correct, total, missed, today: day }))
}
