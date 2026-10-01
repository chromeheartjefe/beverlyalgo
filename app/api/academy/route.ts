import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { getAcademyState } from "@/lib/academy/server"
import { isDay, isPlausibleDay } from "@/lib/academy/xp"

// GET /api/academy?day=YYYY-MM-DD: XP, streak and finished lessons. `day` is
// the learner's local day, so the streak shown follows their own midnight.
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const day = req.nextUrl.searchParams.get("day")
  const today = isDay(day) && isPlausibleDay(day) ? day : new Date().toISOString().slice(0, 10)

  return NextResponse.json(await getAcademyState(session.user.id, today))
}
