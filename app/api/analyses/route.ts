import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { chartAnalyses } from "@/db/schema"
import { normalizeTimeframe } from "@/lib/chart-analysis/timeframe"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(chartAnalyses)
    .where(eq(chartAnalyses.userId, session.user.id))
    .orderBy(desc(chartAnalyses.createdAt))
    .limit(50)

  // Older analyses were saved with the label as read ("5", "5 minutes")
  return NextResponse.json(rows.map((r) => ({ ...r, timeframe: normalizeTimeframe(r.timeframe) })))
}
