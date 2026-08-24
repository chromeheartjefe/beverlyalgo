import { desc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { chartAnalyses } from "@/db/schema"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(chartAnalyses)
    .where(eq(chartAnalyses.userId, session.user.id))
    .orderBy(desc(chartAnalyses.createdAt))
    .limit(50)

  return NextResponse.json(rows)
}
