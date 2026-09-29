import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { auth } from "@/auth"
import { SUPPORT_CHAT } from "@/config/support-chat"
import { sendSupportRequest } from "@/lib/email"
import { checkRateLimit, clientIp } from "@/lib/rate-limit"

// "Talk to a person" from the support chat: emails the request to support.
// Resend's free plan allows 100 emails a day for the whole site, shared with
// verification and password-reset emails, so the caps here stay well below
// that and a flood of requests can't block those.
const PER_HOUR      = 3
const PER_DAY       = 6
const SITE_WIDE_DAY = 40
const HOUR_MS       = 60 * 60 * 1000
const DAY_MS        = 24 * HOUR_MS

const bodySchema = z.object({
  name:    z.string().trim().min(1, "Please add your name.").max(100),
  email:   z.string().trim().toLowerCase().email("Please enter a valid email.").max(254),
  message: z.string().trim().min(10, "Please add a few more details.").max(2000),
  page:    z.string().max(200).optional(),
  // Hidden field real visitors never see or fill; bots that fill every input do.
  company: z.string().max(200).optional(),
  transcript: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .max(40)
    .optional(),
})

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message
    return NextResponse.json({ error: message && !message.startsWith("Invalid") ? message : "Please check the form and try again." }, { status: 400 })
  }
  const { name, email, message, page, company, transcript } = parsed.data

  // Pretend it worked, so the bot learns nothing.
  if (company) return NextResponse.json({ ok: true })

  const ip = clientIp(req)
  const allowed =
    (await checkRateLimit(`support-contact-hour:${ip}`, PER_HOUR, HOUR_MS)) &&
    (await checkRateLimit(`support-contact-day:${ip}`, PER_DAY, DAY_MS))
  if (!allowed) {
    return NextResponse.json({ error: "You've sent a few requests already. We'll get back to you, or email support@entrixalgo.com." }, { status: 429 })
  }
  if (!(await checkRateLimit("support-contact-site-daily", SITE_WIDE_DAY, DAY_MS))) {
    console.error("[/api/support-contact] site-wide daily cap reached")
    return NextResponse.json({ error: "We couldn't send that right now. Please email support@entrixalgo.com directly." }, { status: 503 })
  }

  const session = await auth()
  const account = session?.user?.id
    ? {
        id:    session.user.id,
        email: session.user.email ?? null,
        plan:  (session.user as { plan?: string }).plan ?? null,
      }
    : null

  try {
    await sendSupportRequest({
      name,
      email,
      message,
      page: page ?? null,
      account,
      transcript: (transcript ?? []).slice(-SUPPORT_CHAT.transcriptMessages).map((m) => ({
        role:    m.role,
        content: m.content.slice(0, 600),
      })),
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[/api/support-contact]", err)
    return NextResponse.json({ error: "We couldn't send that right now. Please email support@entrixalgo.com directly." }, { status: 502 })
  }
}
