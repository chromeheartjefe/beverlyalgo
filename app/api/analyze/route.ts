import { and, count, eq, gt } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

import { auth } from "@/auth"
import { db } from "@/db"
import { chartAnalyses } from "@/db/schema"
import { isBudgetExceeded, recordAiUsage } from "@/lib/ai-budget"
import { checkRateLimit } from "@/lib/rate-limit"

const DAILY_ANALYSIS_LIMIT = 30

// ─── System prompt ────────────────────────────────────────────────────────────
// Validate the image first; only run full analysis when it passes.
// Keeps tokens low on bad images and produces useful errors for the user.
// OpenAI requires the word "json" to appear in messages when using response_format json_object.
const SYSTEM = `You are a professional trading analyst. Return JSON only, no prose outside it.
Validate first: not a chart→{"error":"NOT_A_CHART"} no ticker→{"error":"NO_TICKER"} no timeframe→{"error":"NO_TIMEFRAME"} price axis unreadable→{"error":"NO_PRICE"} blurry→{"error":"LOW_QUALITY"}
Otherwise return:
{"signal":"BUY|SELL|NEUTRAL","confidence":0-100,"pair":"str","timeframe":"str","entry":num,"tp1":num,"tp2":num,"sl":num,"rrRatio":num|null,"patterns":["exactly 4, from list below"],"structure":"≤2 sentences","risk":"Low|Moderate|High","volatility":"Low|Medium|High","patternStrength":"Low|Medium|High","trendAlignment":"Weak|Moderate|Strong"}
Pattern list, pick exactly 4, most relevant first, never invent others: head and shoulders, inverse head and shoulders, double top, double bottom, ascending triangle, descending triangle, symmetrical triangle, rising wedge, falling wedge, bull flag, bear flag, cup and handle, channel breakout, trendline break, support bounce, resistance rejection, liquidity sweep, order block, fair value gap, break of structure.
Trade logic, apply professional risk management, only null if price axis is unreadable (caught by validation above):
entry: last candle close (right Y-axis)
tp1: nearest visible support (BUY) or resistance (SELL)
tp2: next major support/resistance beyond tp1
sl: beyond the nearest swing low (BUY) or swing high (SELL), sized to invalidate the setup, not tight noise
rrRatio: round((tp1-entry)/(entry-sl),1) BUY; round((entry-tp1)/(sl-entry),1) SELL
signal: BUY or SELL only when structure, trend, and pattern align; use NEUTRAL when signals conflict or price is ranging
Writing style: sentence case, capitalize only the first letter of each sentence, lowercase all other words except tickers and standard acronyms (BTC, USDT, RSI, EMA). Never use em dashes, en dashes, or double hyphens, use commas or periods instead.`

// ─── Validation error messages ────────────────────────────────────────────────
const VALIDATION_ERRORS: Record<string, string> = {
  NOT_A_CHART:  "This doesn't look like a trading chart. Please upload a chart screenshot.",
  NO_TICKER:    "Ticker or pair name isn't visible on the chart. Make sure the symbol (e.g. BTC/USDT) is shown.",
  NO_TIMEFRAME: "Timeframe label isn't visible. Make sure the chart timeframe (e.g. 1H, 15m) is displayed.",
  NO_PRICE:     "Price numbers aren't readable. Zoom in so the Y-axis labels are clearly legible — press Ctrl+= in TradingView.",
  LOW_QUALITY:  "Image quality is too low to analyze. Try a clearer, higher-resolution screenshot.",
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured. Add OPENAI_API_KEY to .env.local." },
      { status: 503 },
    )
  }

  // Burst guard on top of the daily cap below — stops the full daily
  // allowance from being spent in a tight loop within seconds.
  const burstAllowed = await checkRateLimit(`analyze-burst:${session.user.id}`, 5, 60 * 1000)
  if (!burstAllowed) {
    return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 })
  }

  const [{ value: recentCount }] = await db
    .select({ value: count() })
    .from(chartAnalyses)
    .where(
      and(
        eq(chartAnalyses.userId, session.user.id),
        gt(chartAnalyses.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)),
      ),
    )

  if (recentCount >= DAILY_ANALYSIS_LIMIT) {
    return NextResponse.json(
      { error: `You've hit the daily analysis limit (${DAILY_ANALYSIS_LIMIT}/day). Try again later.` },
      { status: 429 },
    )
  }

  // Real dollar ceiling shared with the AI Trading Bot — see lib/ai-budget.ts.
  if (await isBudgetExceeded()) {
    return NextResponse.json(
      { error: "Chart Analysis is temporarily unavailable — this month's AI usage budget has been reached. It resets next month." },
      { status: 503 },
    )
  }

  try {
    const form = await req.formData()
    const file = form.get("image") as File | null

    if (!file)                           return NextResponse.json({ error: "No image provided."        }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)    return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image."    }, { status: 400 })

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
    const mime   = file.type || "image/jpeg"

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: "gpt-5.6-luna",
      response_format: { type: "json_object" },
      max_completion_tokens: 1200,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              // detail:"auto" lets OpenAI pick tile count based on image dimensions.
              // Client resizes to ≤768 px before upload, so "auto" stays at 1–2 tiles.
              image_url: { url: `data:${mime};base64,${base64}`, detail: "auto" },
            },
          ],
        },
      ],
    })

    const choice     = completion.choices[0]
    const raw        = choice?.message?.content
    const refusal    = choice?.message?.refusal
    const stopReason = choice?.finish_reason

    if (refusal) {
      console.error("[/api/analyze] Model refused:", refusal)
      throw new Error("Model refused to analyze this image.")
    }
    if (stopReason === "length") {
      console.error("[/api/analyze] Response truncated — increase max_completion_tokens")
      throw new Error("Analysis was truncated. Please try again.")
    }
    if (!raw) {
      console.error("[/api/analyze] Null content — finish_reason:", stopReason, "usage:", completion.usage)
      throw new Error("Empty response from AI.")
    }

    const data = JSON.parse(raw)

    // AI returned a validation error — map to user-facing message
    if (data.error && typeof data.error === "string") {
      const msg = VALIDATION_ERRORS[data.error]
        ?? "Image could not be analyzed. Please try a different screenshot."
      return NextResponse.json({ error: msg }, { status: 422 })
    }

    // Enforce Sentence case regardless of what casing the model used
    if (Array.isArray(data.patterns)) {
      data.patterns = data.patterns.map((p: unknown) => {
        const s = String(p).trim()
        return s.charAt(0).toUpperCase() + s.slice(1)
      })
    }

    // Sanity-check the analysis shape before returning it
    if (!["BUY", "SELL", "NEUTRAL"].includes(data.signal)) {
      throw new Error("Unexpected AI response shape.")
    }

    await db.insert(chartAnalyses).values({
      userId:     session.user.id,
      pair:       String(data.pair ?? "—"),
      timeframe:  String(data.timeframe ?? "—"),
      signal:     data.signal,
      confidence: Number(data.confidence) || 0,
      entry:      data.entry ?? null,
      tp1:        data.tp1 ?? null,
      tp2:        data.tp2 ?? null,
      sl:         data.sl ?? null,
      rrRatio:    data.rrRatio ?? null,
    })

    if (completion.usage) {
      await recordAiUsage("chart_analysis", completion.usage.prompt_tokens, completion.usage.completion_tokens)
    }

    return NextResponse.json({ analysis: data })

  } catch (err) {
    console.error("[/api/analyze]", err)

    // OpenAI API errors (rate-limit, quota, auth, bad params…)
    // Never expose API-layer details to the client.
    if (err instanceof OpenAI.APIError) {
      const msg = err.status < 500
        ? "Our servers are experiencing heavy load. Please wait a moment and try again."
        : "Analysis failed due to a temporary service issue. Please try again."
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    const message =
      err instanceof SyntaxError ? "AI returned an unexpected format. Please try again."
      : err instanceof Error     ? err.message
      : "Analysis failed. Please try again."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
