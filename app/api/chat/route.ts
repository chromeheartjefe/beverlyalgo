import { and, count, desc, eq, gt } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

import { auth } from "@/auth"
import { db } from "@/db"
import { chatMessages, users } from "@/db/schema"
import { isBudgetExceeded, recordAiUsage } from "@/lib/ai-budget"
import { formatSnapshotForPrompt, getMarketSnapshot } from "@/lib/market-data"
import { fetchNews, formatNewsForPrompt, pickNewsQuery } from "@/lib/news"
import { checkRateLimit } from "@/lib/rate-limit"

const DAILY_MESSAGE_LIMIT   = 40
const MAX_INPUT_CHARS       = 400
const CONTEXT_MESSAGES      = 6   // last N messages (user+assistant) sent as context — keeps tokens low
const MAX_COMPLETION_TOKENS = 220 // hard output ceiling — real replies run 60-180

// Only the assets most likely to come up — full 24-symbol ticker list stays
// in market-data.ts for the marquee, but every one of those lines is fixed
// input-token cost on every single chat request, so the prompt gets a
// trimmed core set instead. Long-tail alts (SUI, ARB, etc.) fall back to the
// "don't have that symbol live" rule in SYSTEM if asked about directly.
const CORE_CHAT_LABELS = new Set(["BTC", "ETH", "SOL", "S&P 500", "Nasdaq 100", "EUR/USD", "GBP/USD", "Gold", "DXY proxy", "TLT"])

// ─── System prompt ────────────────────────────────────────────────────────────
// Strict, concise, on-topic only, terminal-desk tone — not a customer-support
// chatbot. Kept as short as the rules allow: this exact text is fixed
// overhead on every single request, so every word here is a recurring cost.
const SYSTEM = `You are EntrixAlgo's trading desk assistant. Answer only trading questions: markets, technical/fundamental analysis, risk management, position sizing, strategy, order types, psychology, platform features. Off-topic: reply exactly "I only handle trading questions." Nothing else.

Style: terminal-note density, not conversational. 1-3 short declarative sentences typical, longer only for an explicit step-by-step or checklist request. No hedging ("it's worth noting", "may potentially"), no filler, no repeating the question back, no AI/advisor disclaimers, no markdown, no em or en dashes (use commas or periods), sentence case. Example: "Dollar down 0.8%, yields falling. Gold broke $2,420 resistance with strong momentum." Match that density.

Prices given below (if any) are live fact you simply know, never call them "a snapshot" or "data provided." Cite the actual price/% change for an asset you're given. If an asset isn't listed, say so in 3-5 words, then answer from general structure.
Headlines given below (if any) are genuine current news, use them directly, don't say you lack news in that case. If none given and asked about news/events, say in one short clause you lack a live headline, then give the useful part: recurring macro events (CPI, NFP, FOMC, PMI, earnings) or cross-asset correlation. Never invent a specific date/time. Never spend more than one short clause on what you lack.
Never state future price direction as fact; frame anything forward-looking as conditional on price action.`

const OFF_TOPIC_REPLY = "I only handle trading questions."

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
    return NextResponse.json(
      { error: "AI service not configured. Add OPENAI_API_KEY to .env.local." },
      { status: 503 },
    )
  }

  // Burst guard on top of the daily cap below — stops the full daily
  // allowance from being spent in a tight loop within seconds.
  const burstAllowed = await checkRateLimit(`chat-burst:${session.user.id}`, 10, 60 * 1000)
  if (!burstAllowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 })
  }

  const { message } = await req.json().catch(() => ({ message: null }))
  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "Message can't be empty." }, { status: 400 })
  }
  const trimmed = message.trim()
  if (trimmed.length > MAX_INPUT_CHARS) {
    return NextResponse.json({ error: `Keep messages under ${MAX_INPUT_CHARS} characters.` }, { status: 400 })
  }

  const [{ value: recentCount }] = await db
    .select({ value: count() })
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.userId, session.user.id),
        eq(chatMessages.role, "user"),
        gt(chatMessages.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )

  if (recentCount >= DAILY_MESSAGE_LIMIT) {
    return NextResponse.json(
      { error: `You've hit today's message limit (${DAILY_MESSAGE_LIMIT}/day). Try again tomorrow.` },
      { status: 429 },
    )
  }

  // Real dollar ceiling across chat + chart analysis combined — see
  // lib/ai-budget.ts. Checked before spending anything on this request.
  if (await isBudgetExceeded()) {
    return NextResponse.json(
      { error: "The AI Trading Bot is temporarily unavailable — this month's usage budget has been reached. It resets next month." },
      { status: 503 },
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
      model: "gpt-5.6-luna",
      max_completion_tokens: MAX_COMPLETION_TOKENS,
      messages: [
        { role: "system", content: SYSTEM },
        ...(coreSnapshot.length > 0
          ? [{ role: "system" as const, content: `Current live prices:\n${formatSnapshotForPrompt(coreSnapshot)}` }]
          : []),
        ...(newsBlock
          ? [{ role: "system" as const, content: `Real recent headlines relevant to this question:\n${newsBlock}` }]
          : []),
        ...history.reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
        { role: "user", content: trimmed },
      ],
    })

    const choice     = completion.choices[0]
    const refusal    = choice?.message?.refusal
    const stopReason = choice?.finish_reason
    let reply        = choice?.message?.content

    if (refusal) reply = OFF_TOPIC_REPLY
    if (stopReason === "length" && reply) reply = reply.trim()
    if (!reply) {
      console.error("[/api/chat] Empty content — finish_reason:", stopReason, "usage:", completion.usage)
      throw new Error("Empty response from AI.")
    }

    await db.insert(chatMessages).values([
      { userId: session.user.id, role: "user",      content: trimmed },
      { userId: session.user.id, role: "assistant", content: reply },
    ])

    if (completion.usage) {
      await recordAiUsage("chat", completion.usage.prompt_tokens, completion.usage.completion_tokens)
    }

    return NextResponse.json({ reply })

  } catch (err) {
    console.error("[/api/chat]", err)

    if (err instanceof OpenAI.APIError) {
      const msg = err.status < 500
        ? "Our servers are experiencing heavy load. Please wait a moment and try again."
        : "The assistant failed due to a temporary service issue. Please try again."
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    const message = err instanceof Error ? err.message : "Something went wrong. Please try again."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
