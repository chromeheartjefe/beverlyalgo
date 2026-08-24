import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { getMarketSnapshot } from "@/lib/market-data"

// Hidden from the marquee display only — the chat bot still uses this label
// from the shared snapshot for gold/dollar/yields reasoning.
const TICKER_HIDDEN_LABELS = new Set(["DXY proxy"])

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const snapshot = await getMarketSnapshot()
  return NextResponse.json(snapshot.filter((item) => !TICKER_HIDDEN_LABELS.has(item.label)))
}
