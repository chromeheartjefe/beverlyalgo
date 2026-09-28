import { desc, eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

import { auth } from "@/auth"
import { db } from "@/db"
import { chatMessages, users } from "@/db/schema"
import { isBudgetExceeded, recordAiUsage } from "@/lib/ai-budget"
import { logEvent } from "@/lib/events"
import { formatSnapshotForPrompt, getMarketSnapshot } from "@/lib/market-data"
import { fetchNews, formatNewsForPrompt, pickNewsQuery } from "@/lib/news"
import { checkRateLimit } from "@/lib/rate-limit"
import { DAILY_MESSAGE_LIMIT, DAY_MS } from "@/lib/usage-limits"
import { UserFacingError } from "@/lib/user-error"

const MAX_INPUT_CHARS       = 400
const CONTEXT_MESSAGES      = 6   // last N messages (user+assistant) sent as context — keeps tokens low
// Covers hidden reasoning + the reply (real replies run 60-180 tokens). Was
// 220 on gpt-5.6-luna; gpt-6-luna's reasoning needs more room even at "low".
const MAX_COMPLETION_TOKENS = 800
const CHAT_MODEL            = "gpt-6-luna"
const CHAT_REASONING        = "low" as const

// Only the assets most likely to come up — full 24-symbol ticker list stays
// in market-data.ts for the marquee, but every one of those lines is fixed
// input-token cost on every single chat request, so the prompt gets a
// trimmed core set instead. Long-tail alts (SUI, ARB, etc.) fall back to the
// "don't have that symbol live" rule in SYSTEM if asked about directly.
const CORE_CHAT_LABELS = new Set(["BTC", "ETH", "SOL", "S&P 500", "Nasdaq 100", "EUR/USD", "GBP/USD", "Gold", "TLT"])

// ─── System prompt ────────────────────────────────────────────────────────────
// Strict, concise, on-topic only, terminal-desk tone — not a customer-support
// chatbot. Kept as short as the rules allow: this exact text is fixed
// overhead on every single request, so every word here is a recurring cost.
const SYSTEM = `You are EntrixAlgo's trading desk assistant. Answer only trading questions: markets, technical/fundamental analysis, risk management, position sizing, strategy, order types, psychology, platform features. Off-topic: reply exactly "I only handle trading questions." Nothing else.

Style: terminal-note density, not conversational. 1-3 short declarative sentences typical, longer only for an explicit step-by-step or checklist request. No hedging ("it's worth noting", "may potentially"), no filler, no repeating the question back, no AI/advisor disclaimers, no markdown, no em or en dashes (use commas or periods), sentence case. Example: "Dollar down 0.8%, yields falling. Gold broke $2,420 resistance with strong momentum." Match that density.

Prices given below (if any) are live fact you simply know, never call them "a snapshot" or "data provided." Cite the actual price/% change for an asset you're given. If an asset isn't listed, say so in 3-5 words, then answer from general structure.
Headlines given below (if any) are genuine recent news, weave the relevant one into the answer naturally.
Never mention what you don't have: no "I lack a live headline", "no live news", "I don't have access to", "no data feed" or similar, not even briefly, in any reply. When no headline fits, explain the move from the live prices themselves: the size of the move, cross-asset context (dollar, yields, gold, equities vs crypto) and which usual drivers fit (CPI, NFP, FOMC, earnings, liquidity, positioning), framed as likely drivers, not confirmed news. Never invent a headline, a specific event or a date/time.
Never state future price direction as fact; frame anything forward-looking as conditional on price action.`

const OFF_TOPIC_REPLY = "I only handle trading questions."

// Safety net for the rule above: removes "I lack a live headline" style
// disclaimers from replies, and from past replies sent back as context (the
// model copied its own earlier disclaimers, so they kept coming back).
// Only the bot talking about its OWN access ("I lack / I don't have / I can't
// see ... headline", "no live/real-time news"), never market commentary:
// "dropped 4% with no major news" or "rallied without any news catalyst" is
// real analysis and must stay (a broader version cut those sentences).
const LACK_OF_NEWS = /\b(?:i\s+(?:lack|don'?t\s+have|do\s+not\s+have|have\s+no|can'?t\s+(?:see|access)|cannot\s+(?:see|access))|(?:no|without)\s+(?=(?:access\s+to\s+)?(?:a\s+|any\s+)?(?:live|real-time)\b))[^.,;!?]{0,30}?\b(?:headlines?|news(?:\s+feed)?|data\s+feed|market\s+feed)\b/i

function stripLackOfNews(text: string): string {
  const kept = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => {
      const m = sentence.match(LACK_OF_NEWS)
      if (!m || m.index === undefined) return sentence
      // "I lack a live headline, but gold is up 1.2%." keeps "Gold is up 1.2%."
      const after = sentence.slice(m.index + m[0].length)
      const rest = after.replace(/^[^,;:]*[,;:]\s*(but |so |though |however,? )?/i, "")
      if (rest === after || !rest.trim()) return ""
      return rest.charAt(0).toUpperCase() + rest.slice(1)
    })
    .filter((s) => s.trim())
  return kept.length > 0 ? kept.join(" ") : text
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const rows = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.userId, session.user.id))
    .orderBy(desc(chatMessages.seq))
    .limit(50)

  return NextResponse.json(rows.reverse())
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db.delete(chatMessages).where(eq(chatMessages.userId, session.user.id))
  await logEvent(session.user.id, "chat_cleared")

  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [user] = await db.select({ plan: users.plan }).from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!user || user.plan === "free") {
    return NextResponse.json({ error: "The AI Trading Bot is a Pro feature." }, { status: 403 })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[/api/chat] OPENAI_API_KEY is not set")
    return NextResponse.json(
      { error: "The AI Trading Bot is temporarily unavailable. Please try again later." },
      { status: 503 },
    )
  }

  // Burst guard on top of the daily cap below — stops the full daily
  // allowance from being spent in a tight loop within seconds.
  const burstAllowed = await checkRateLimit(`chat-burst:${session.user.id}`, 10, 60 * 1000)
  if (!burstAllowed) {
    return NextResponse.json({ error: "You're sending messages too quickly. Please wait a moment and try again." }, { status: 429 })
  }

  const { message } = await req.json().catch(() => ({ message: null }))
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message can't be empty." }, { status: 400 })
  }
  const trimmed = message.trim()
  if (trimmed.length > MAX_INPUT_CHARS) {
    return NextResponse.json({ error: `Keep messages under ${MAX_INPUT_CHARS} characters.` }, { status: 400 })
  }

  // Real dollar ceiling across chat + chart analysis combined — see
  // lib/ai-budget.ts. Checked before spending anything on this request.
  if (await isBudgetExceeded()) {
    return NextResponse.json(
      { error: "The AI Trading Bot is temporarily unavailable due to high demand. Please try again later." },
      { status: 503 },
    )
  }

  // Daily cap, counted in rate_limit_hits rather than chat_messages: users
  // can clear their chat history (DELETE below), which used to reset this
  // counter and allow unlimited paid AI calls.
  const dailyAllowed = await checkRateLimit(`chat-daily:${session.user.id}`, DAILY_MESSAGE_LIMIT, DAY_MS)
  if (!dailyAllowed) {
    return NextResponse.json(
      { error: `You've hit today's message limit (${DAILY_MESSAGE_LIMIT}/day). Try again tomorrow.` },
      { status: 429 },
    )
  }

  try {
    const history = await db
      .select({ role: chatMessages.role, content: chatMessages.content })
      .from(chatMessages)
      .where(eq(chatMessages.userId, session.user.id))
      .orderBy(desc(chatMessages.seq))
      .limit(CONTEXT_MESSAGES)

    // Gate live-price/news context on topic relevance — most trading
    // questions (position sizing, order types, psychology) don't reference
    // any market at all, so skip the fixed token cost of injecting either
    // block when it wouldn't be used.
    const newsQuery = pickNewsQuery(trimmed)

    const [snapshot, news] = await Promise.all([
      newsQuery ? getMarketSnapshot() : Promise.resolve([]),
      newsQuery ? fetchNews(newsQuery) : Promise.resolve([]),
    ])
    const coreSnapshot = snapshot.filter((item) => CORE_CHAT_LABELS.has(item.label))
    const newsBlock = formatNewsForPrompt(news)

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: CHAT_MODEL,
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      reasoning_effort: CHAT_REASONING,
      messages: [
        { role: "system", content: SYSTEM },
        ...(coreSnapshot.length > 0
          ? [{ role: "system" as const, content: `Current live prices (as of ${new Date().toUTCString()}):\n${formatSnapshotForPrompt(coreSnapshot)}` }]
          : []),
        ...(newsBlock
          ? [{ role: "system" as const, content: `Real recent headlines relevant to this question:\n${newsBlock}` }]
          : []),
        ...history.reverse().map((m) => ({
          role:    m.role as "user" | "assistant",
          content: m.role === "assistant" ? stripLackOfNews(m.content) : m.content,
        })),
        { role: "user", content: trimmed },
      ],
    })

    // Recorded before any checks below can throw: every completed call is
    // real spend, whether or not we end up showing the reply.
    if (completion.usage) {
      await recordAiUsage({
        feature:          "chat",
        userId:           session.user.id,
        model:            CHAT_MODEL,
        reasoningEffort:  CHAT_REASONING,
        promptTokens:     completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
      })
    }

    const choice     = completion.choices[0]
    const refusal    = choice?.message?.refusal
    const stopReason = choice?.finish_reason
    let reply        = choice?.message?.content

    if (refusal) reply = OFF_TOPIC_REPLY
    if (stopReason === "length" && reply) reply = reply.trim()
    if (reply && reply !== OFF_TOPIC_REPLY) reply = stripLackOfNews(reply)
    if (!reply) {
      console.error("[/api/chat] Empty content — finish_reason:", stopReason, "usage:", completion.usage)
      throw new UserFacingError("The assistant couldn't answer that. Please try again.")
    }

    await db.insert(chatMessages).values([
      { userId: session.user.id, role: "user",      content: trimmed },
      { userId: session.user.id, role: "assistant", content: reply },
    ])

    return NextResponse.json({ reply })

  } catch (err) {
    console.error("[/api/chat]", err)

    if (err instanceof OpenAI.APIError) {
      const msg = err.status < 500
        ? "Our servers are experiencing heavy load. Please wait a moment and try again."
        : "The assistant hit a temporary problem. Please try again in a moment."
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    const message = err instanceof UserFacingError ? err.message : "Something went wrong. Please try again."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
