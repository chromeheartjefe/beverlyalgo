import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { canPickVariant, variantOptions } from "@/lib/chart-analysis"

// Tells the Chart Analysis page whether to show the admin logic switch.
// Non-admins get an empty list, so the switch never renders for them.
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select({ email: users.email, emailVerified: users.emailVerified }).from(users).where(eq(users.id, session.user.id)).limit(1)
  return NextResponse.json({ variants: variantOptions(canPickVariant(user)) })
}
