import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { ExamError, submitExam } from "@/lib/academy/exam"
import { isDay, isPlausibleDay } from "@/lib/academy/xp"

const answerSchema = z
  .object({
    choice: z.number().int().min(0).max(20).nullable().optional(),
    tf: z.boolean().nullable().optional(),
    tap: z.number().int().min(0).max(1000).nullable().optional(),
    numeric: z.string().max(32).optional(),
    match: z.record(z.string(), z.number().int().min(0).max(20)).optional(),
  })
  .strict()

const bodySchema = z.object({
  attemptId: z.string().min(1).max(64),
  day: z.string(),
  answers: z.record(z.string().max(200), answerSchema),
})

// POST /api/academy/exam/submit: grade a final exam attempt on the server.
// A pass issues the certificate (once) and awards bonus XP.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "We couldn't read your answers. Please try again." }, { status: 400 })
  const { attemptId, day, answers } = parsed.data
  if (!isDay(day) || !isPlausibleDay(day)) {
    return NextResponse.json({ error: "Your device's date looks off. Check your clock and try again." }, { status: 400 })
  }

  // Answer keys are "lessonId::questionId"; match keys are left indexes
  const cleaned = Object.fromEntries(
    Object.entries(answers).map(([key, a]) => [
      key,
      {
        ...a,
        match: a.match ? Object.fromEntries(Object.entries(a.match).map(([k, v]) => [Number(k), v])) : undefined,
      },
    ]),
  )

  try {
    return NextResponse.json(await submitExam({ userId: session.user.id, attemptId, answers: cleaned, today: day }))
  } catch (err) {
    if (err instanceof ExamError) return NextResponse.json({ error: err.message }, { status: 409 })
    throw err
  }
}
