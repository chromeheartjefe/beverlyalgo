import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { checkRateLimit } from "@/lib/rate-limit"
import { accountAction, requirePro } from "@/lib/sim/server"

const bodySchema = z.object({ action: z.enum(["next", "retry", "restart"]) })

// POST /api/sim/account: start the next account after a pass, try again after
// a fail, or restart the current one.
export async function POST(req: NextRequest) {
  const who = await requirePro()
  if ("response" in who) return who.response

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "We couldn't do that." }, { status: 400 })

  if (!(await checkRateLimit(`sim-account:${who.userId}`, 60, 60 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many restarts in a short time. Try again in a little while." }, { status: 429 })
  }

  const state = await accountAction(who.userId, parsed.data.action)
  if ("error" in state) return NextResponse.json({ error: state.error }, { status: 409 })
  return NextResponse.json(state)
}
