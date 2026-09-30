import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { freeAnalysisState } from "@/lib/free-analysis"

// Where a Free account stands with its one free Chart Analysis, so the
// dashboard shows the right thing (try it / verify email / upgrade). Pro
// accounts get "pro". /api/analyze re-checks everything on its own.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db
    .select({ id: users.id, plan: users.plan, email: users.email, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  return NextResponse.json({ state: await freeAnalysisState(user) })
}
