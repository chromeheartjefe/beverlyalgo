import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { getMarketSnapshot } from "@/lib/market-data"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snapshot = await getMarketSnapshot()
  // No shared/CDN caching: this reply sits behind sign-in, and a public
  // cache would serve it (and possibly a session cookie) to anyone. The work
  // here is already cheap: one DB cache read, Twelve Data is budgeted.
  return NextResponse.json(snapshot, { headers: { "Cache-Control": "private, no-store" } })
}
