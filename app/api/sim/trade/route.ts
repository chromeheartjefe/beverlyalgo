import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { isDay, isPlausibleDay } from "@/lib/academy/xp"
import { checkRateLimit } from "@/lib/rate-limit"
import { recordTrade, requirePro } from "@/lib/sim/server"

const price = z.number().finite().positive().max(1_000_000)

const bodySchema = z.object({
  side: z.enum(["long", "short"]),
  entry: price,
  exit: price,
  qty: z.number().finite().positive().max(100_000_000),
  stop: price,
  target: price.nullable(),
  reason: z.enum(["target", "stop", "manual"]),
  spike: z.boolean(),
  lockedIn: z.boolean(),
  day: z.string(),
})

// POST /api/sim/trade: a practice trade closed. Works out its result, applies
// the account rules and checks the missions.
export async function POST(req: NextRequest) {
  const who = await requirePro()
  if ("response" in who) return who.response

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "We couldn't save that trade." }, { status: 400 })
  const { day, ...report } = parsed.data
  if (!isDay(day) || !isPlausibleDay(day)) {
    return NextResponse.json({ error: "Your device's date looks off. Check your clock and try again." }, { status: 400 })
  }

  // The practice market can close a trade every few seconds; this only stops scripts
  if (!(await checkRateLimit(`sim-trade:${who.userId}`, 240, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "That is a lot of trades in one hour. Take a short break and come back." }, { status: 429 })
  }

  const outcome = await recordTrade(who.userId, report, day)
  if ("error" in outcome) return NextResponse.json({ error: outcome.error }, { status: 409 })
  return NextResponse.json(outcome)
}
