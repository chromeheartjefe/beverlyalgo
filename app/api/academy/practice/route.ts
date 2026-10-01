import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { completePractice, getPracticeSet } from "@/lib/academy/server"
import { isDay, isPlausibleDay } from "@/lib/academy/xp"
import { checkRateLimit } from "@/lib/rate-limit"

// GET /api/academy/practice?day=YYYY-MM-DD: a practice session (due reviews
// first, then refreshers from finished lessons).
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const day = req.nextUrl.searchParams.get("day")
  const today = isDay(day) && isPlausibleDay(day) ? day : new Date().toISOString().slice(0, 10)
  return NextResponse.json({ items: await getPracticeSet(session.user.id, today) })
}

const bodySchema = z.object({
  day: z.string(),
  results: z
    .array(
      z.object({
        lessonId: z.string().min(1).max(96),
        questionId: z.string().min(1).max(96),
        correct: z.boolean(),
      }),
    )
    .min(1)
    .max(20),
})

// POST /api/academy/practice: a practice session was finished. Moves each
// question through the review boxes, awards capped XP and moves the streak.
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "We couldn't save that practice. Please try again." }, { status: 400 })
  const { day, results } = parsed.data
  if (!isDay(day) || !isPlausibleDay(day)) {
    return NextResponse.json({ error: "Your device's date looks off. Check your clock and try again." }, { status: 400 })
  }

  if (!(await checkRateLimit(`academy-practice:${userId}`, 20, 10 * 60 * 1000))) {
    return NextResponse.json({ error: "Slow down a little: too many practice sessions in a short time." }, { status: 429 })
  }

  return NextResponse.json(await completePractice({ userId, results, today: day }))
}
