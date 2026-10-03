import { NextResponse } from "next/server"

import { getSimState, requirePro } from "@/lib/sim/server"

// GET /api/sim: the player's practice account, completed missions and recent trades
export async function GET() {
  const who = await requirePro()
  if ("response" in who) return who.response
  return NextResponse.json(await getSimState(who.userId))
}
