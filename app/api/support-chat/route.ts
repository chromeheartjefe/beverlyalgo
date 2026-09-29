import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

import { auth } from "@/auth"
import { SUPPORT_CHAT } from "@/config/support-chat"
import { isBudgetExceeded, recordAiUsage } from "@/lib/ai-budget"
import { checkRateLimit, clientIp } from "@/lib/rate-limit"
import {
  parseSupportReply,
  SUPPORT_MAX_COMPLETION_TOKENS,
  SUPPORT_MODEL,
  SUPPORT_REASONING,
  SUPPORT_SYSTEM,
} from "@/lib/support-chat"

// Public: anyone on the site can ask, signed in or not. Cost is bounded by
// short history, a small reply cap, the per-visitor and site-wide daily caps
// below, and the shared monthly AI budget. No chat is stored on our side.
const PER_MINUTE     = 6
const PER_DAY        = 40    // per signed-in account, or per IP when signed out
const SITE_WIDE_DAY  = 2000  // every visitor combined; measured ~$0.00014/message, so under $0.30/day
const HOUR_MS        = 60 * 60 * 1000
const DAY_MS         = 24 * HOUR_MS

const UNAVAILABLE = `The assistant is taking a break right now. You can still reach the team at the link below or at support@entrixalgo.com.`

const bodySchema = z.object({
  messages: z
    .array(z.object({
      role:    z.enum(["user", "assistant"]),
      content: z.string().trim().min(1),
    }))
    .min(1)
    .max(40),
  page: z.string().max(200).optional(),
})

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Please type a message." }, { status: 400 })

  const { messages, page } = parsed.data
  const question = messages[messages.length - 1]
  if (question.role !== "user") return NextResponse.json({ error: "Please type a message." }, { status: 400 })
  if (question.content.length > SUPPORT_CHAT.maxInputChars) {
    return NextResponse.json({ error: `Please keep it under ${SUPPORT_CHAT.maxInputChars} characters.` }, { status: 400 })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[/api/support-chat] OPENAI_API_KEY is not set")
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 })
  }

  const session = await auth()
  const userId  = session?.user?.id ?? null
  const plan    = (session?.user as { plan?: string } | undefined)?.plan ?? null
  const who     = userId ? `user:${userId}` : `ip:${clientIp(req)}`

  if (!(await checkRateLimit(`support-burst:${who}`, PER_MINUTE, 60 * 1000))) {
    return NextResponse.json({ error: "You're sending messages quickly. Give it a few seconds and try again." }, { status: 429 })
  }
  if (!(await checkRateLimit(`support-daily:${who}`, PER_DAY, DAY_MS))) {
    return NextResponse.json({ error: "You've reached today's chat limit. For anything else, contact the team below." }, { status: 429 })
  }
  if (!(await checkRateLimit("support-site-daily", SITE_WIDE_DAY, DAY_MS)) || (await isBudgetExceeded())) {
    return NextResponse.json({ error: UNAVAILABLE }, { status: 503 })
  }

  // Short, per-request facts after the static prompt, so the prompt itself
  // stays cacheable. No name or email goes to the model.
  const context = [
    userId ? `Visitor is signed in, plan: ${plan === "free" ? "free" : "Pro"}.` : "Visitor is not signed in.",
    page ? `Current page: ${page.replace(/[^\w\-/#?=&.]/g, "").slice(0, 100)}` : "",
  ].filter(Boolean).join(" ")

  const history = messages.slice(-SUPPORT_CHAT.contextMessages).map((m) => ({
    role:    m.role,
    content: m.content.slice(0, SUPPORT_CHAT.maxInputChars),
  }))

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const completion = await openai.chat.completions.create({
      model:                 SUPPORT_MODEL,
      reasoning_effort:      SUPPORT_REASONING,
      max_completion_tokens: SUPPORT_MAX_COMPLETION_TOKENS,
      messages: [
        { role: "system", content: SUPPORT_SYSTEM },
        { role: "system", content: context },
        ...history,
      ],
    })

    // Every completed call is real spend, recorded before anything can throw.
    if (completion.usage) {
      await recordAiUsage({
        feature:          "support",
        userId,
        model:            SUPPORT_MODEL,
        reasoningEffort:  SUPPORT_REASONING,
        promptTokens:     completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
      })
    }

    const raw = completion.choices[0]?.message?.content?.trim()
    if (!raw) {
      console.error("[/api/support-chat] empty reply, finish_reason:", completion.choices[0]?.finish_reason)
      return NextResponse.json({
        reply:   "Sorry, I couldn't answer that one. The team can help directly.",
        handoff: question.content.slice(0, 200),
      })
    }

    const { reply, handoff } = parseSupportReply(raw)
    return NextResponse.json({
      reply:   reply || "The team can help with that directly.",
      handoff,
    })
  } catch (err) {
    console.error("[/api/support-chat]", err)
    return NextResponse.json({ error: "Something went wrong on our side. Please try again in a moment." }, { status: 503 })
  }
}
