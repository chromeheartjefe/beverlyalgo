import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { examEligibility, startExam } from "@/lib/academy/exam"
import { checkRateLimit } from "@/lib/rate-limit"

// POST /api/academy/exam: start a final exam attempt. Needs every written
// lesson finished (admins excepted). Questions come back without answers.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const { eligible, done, total } = await examEligibility(userId)
  if (!eligible) {
    return NextResponse.json({ error: `Finish every lesson first (${done} of ${total} done).`, code: "not_eligible" }, { status: 403 })
  }

  // Three attempts a day keeps it an exam, not a guessing game
  if (!(await checkRateLimit(`academy-exam:${userId}`, 3, 24 * 60 * 60 * 1000))) {
    return NextResponse.json({ error: "You've used today's 3 exam attempts. Practise a little and try again tomorrow.", code: "limit" }, { status: 429 })
  }

  return NextResponse.json(await startExam(userId))
}
