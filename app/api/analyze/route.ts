import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

import { auth } from "@/auth"
import { db } from "@/db"
import { chartAnalyses, users } from "@/db/schema"
import { isBudgetExceeded, recordAiUsage } from "@/lib/ai-budget"
import { canPickVariant, resolveVariant } from "@/lib/chart-analysis"
import { normalizeTimeframe } from "@/lib/chart-analysis/timeframe"
import { logEvent } from "@/lib/events"
import { checkRateLimit, countHits } from "@/lib/rate-limit"
import { DAILY_ANALYSIS_LIMIT, DAY_MS } from "@/lib/usage-limits"
import { UserFacingError } from "@/lib/user-error"


// ─── Analysis logic ───────────────────────────────────────────────────────────
// Prompt, model and image settings live in lib/chart-analysis (production v2,
// plus the frozen "v1 aggressive" snapshot that admins can switch to).

// ─── Validation error messages ────────────────────────────────────────────────
const VALIDATION_ERRORS: Record<string, string> = {
  NOT_A_CHART:  "This doesn't look like a trading chart. Please upload a chart screenshot.",
  NO_TICKER:    "Ticker or pair name isn't visible on the chart. Make sure the symbol (e.g. BTC/USDT) is shown.",
  NO_TIMEFRAME: "Timeframe label isn't visible. Make sure the chart timeframe (e.g. 1H, 15m) is displayed.",
  NO_PRICE:     "Price numbers aren't readable. Zoom in so the Y-axis labels are clearly legible, for example with Ctrl+= in TradingView.",
  LOW_QUALITY:  "Image quality is too low to analyze. Try a clearer, higher-resolution screenshot.",
  TOO_FEW_CANDLES: "Too few candles are visible to read the market structure. Zoom out so at least 30 to 40 candles are on screen.",
  MULTIPLE_CHARTS: "This screenshot has several charts. Upload one chart at a time so the analysis reads the right one.",
}

// Fit a DB varchar column; ends with "…" when shortened
function clip(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1).trimEnd() + "…"
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Pro-only. The page's FeatureLock is just UI; this is the real gate.
  // Read from the DB, not the session, so a lapsed plan applies immediately.
  const [user] = await db.select({ plan: users.plan, email: users.email, emailVerified: users.emailVerified }).from(users).where(eq(users.id, session.user.id)).limit(1)
  if (!user || user.plan === "free") {
    return NextResponse.json({ error: "Chart Analysis is a Pro feature." }, { status: 403 })
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("[/api/analyze] OPENAI_API_KEY is not set")
    return NextResponse.json(
      { error: "Chart Analysis is temporarily unavailable. Please try again later." },
      { status: 503 },
    )
  }

  // Burst guard on top of the daily cap below — stops the full daily
  // allowance from being spent in a tight loop within seconds.
  const burstAllowed = await checkRateLimit(`analyze-burst:${session.user.id}`, 5, 60 * 1000)
  if (!burstAllowed) {
    return NextResponse.json({ error: "You're sending requests too quickly. Please wait a moment and try again." }, { status: 429 })
  }

  const dailyKey = `analyze-daily:${session.user.id}`
  if ((await countHits(dailyKey, DAY_MS)) >= DAILY_ANALYSIS_LIMIT) {
    return NextResponse.json(
      { error: `You've hit the daily analysis limit (${DAILY_ANALYSIS_LIMIT}/day). Try again later.` },
      { status: 429 },
    )
  }

  // Real dollar ceiling shared with the AI Trading Bot — see lib/ai-budget.ts.
  if (await isBudgetExceeded()) {
    return NextResponse.json(
      { error: "Chart Analysis is temporarily unavailable due to high demand. Please try again later." },
      { status: 503 },
    )
  }

  try {
    const form = await req.formData()
    const file = form.get("image") as File | null
    // The admin-only logic switch on the Chart Analysis page. Everyone else
    // always runs the production variant, whatever this field says.
    const canPick = canPickVariant(user)
    const variant = resolveVariant(form.get("variant") as string | null, canPick)

    if (!file)                           return NextResponse.json({ error: "Please choose a chart screenshot to analyze." }, { status: 400 })
    if (file.size > 5 * 1024 * 1024)    return NextResponse.json({ error: "That image is too large. Please upload a screenshot under 5 MB." }, { status: 400 })
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Please upload an image file, such as a PNG or JPG screenshot." }, { status: 400 })

    const base64 = Buffer.from(await file.arrayBuffer()).toString("base64")
    const mime   = file.type || "image/jpeg"

    // Every AI call counts toward the daily cap, including screenshots the
    // model rejects (not a chart, blurry, ...). Those cost the same as a full
    // analysis, and used to be free to repeat because only saved analyses
    // were counted. The early countHits check above just fails fast; this
    // atomic reserve is what actually enforces the cap under parallel requests.
    if (!(await checkRateLimit(dailyKey, DAILY_ANALYSIS_LIMIT, DAY_MS))) {
      return NextResponse.json(
        { error: `You've hit the daily analysis limit (${DAILY_ANALYSIS_LIMIT}/day). Try again later.` },
        { status: 429 },
      )
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const completion = await openai.chat.completions.create({
      model: variant.model,
      response_format: { type: "json_object" },
      max_completion_tokens: variant.maxCompletionTokens,
      reasoning_effort: variant.reasoningEffort,
      messages: [
        { role: "system", content: variant.system },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              // Forced "high" rather than "auto": low-detail mode caps the
              // image at a 512px tile, which was blurring tightly packed
              // Y-axis labels on sub-$1 pairs (e.g. ADA's 0.2088/0.2086/...)
              // into unreadable text, and the model was guessing a price
              // from training priors instead. Costs more tokens, but a wrong
              // price read means a wrong entry/SL/TP on a paid signal.
              image_url: { url: `data:${mime};base64,${base64}`, detail: variant.imageDetail },
            },
          ],
        },
      ],
    })

    // Recorded before any check below can bail out: rejected or malformed
    // replies are real spend too, and the monthly budget has to see them.
    const promptTokens     = completion.usage?.prompt_tokens ?? 0
    const completionTokens = completion.usage?.completion_tokens ?? 0
    const costUsd = completion.usage
      ? await recordAiUsage({
          feature:         "chart_analysis",
          userId:          session.user.id,
          model:           variant.model,
          reasoningEffort: variant.reasoningEffort,
          promptTokens,
          completionTokens,
        })
      : null

    const choice     = completion.choices[0]
    const raw        = choice?.message?.content
    const refusal    = choice?.message?.refusal
    const stopReason = choice?.finish_reason

    if (refusal) {
      console.error("[/api/analyze] Model refused:", refusal)
      throw new UserFacingError("We couldn't analyze this image. Please try a different chart screenshot.")
    }
    if (stopReason === "length") {
      console.error("[/api/analyze] Response truncated, raise maxCompletionTokens or lower reasoningEffort. usage:", completion.usage)
      throw new UserFacingError("The analysis took too long to finish. Please try again.")
    }
    if (!raw) {
      console.error("[/api/analyze] Null content — finish_reason:", stopReason, "usage:", completion.usage)
      throw new UserFacingError("We couldn't complete the analysis. Please try again.")
    }

    const parsed = JSON.parse(raw)

    // AI returned a validation error — map to user-facing message
    if (parsed.error && typeof parsed.error === "string") {
      const msg = VALIDATION_ERRORS[parsed.error]
        ?? "Image could not be analyzed. Please try a different screenshot."
      await logEvent(session.user.id, "analysis_rejected", { reason: parsed.error, variant: variant.id })
      return NextResponse.json({ error: msg }, { status: 422 })
    }

    // Enforce Sentence case regardless of what casing the model used
    if (Array.isArray(parsed.patterns)) {
      parsed.patterns = parsed.patterns.map((p: unknown) => {
        const s = String(p).trim()
        return s.charAt(0).toUpperCase() + s.slice(1)
      })
    }

    // Sanity-check the analysis shape before returning it
    if (!["BUY", "SELL", "NEUTRAL"].includes(parsed.signal)) {
      throw new UserFacingError("We couldn't complete the analysis. Please try again.")
    }

    // v2+: server-side grading, reward:risk math and level checks
    const data = variant.finalize ? variant.finalize(parsed) : parsed
    // One label format everywhere: "5", "5 minutes", "M5" -> "5m"
    data.timeframe = normalizeTimeframe(data.timeframe)

    await db.insert(chartAnalyses).values({
      userId:     session.user.id,
      // Columns are varchar(32)/varchar(16); long names like "Micro E-mini
      // Nasdaq-100 Index Futures" would fail the insert. Full name stays in result.
      pair:       clip(String(data.pair ?? "—"), 32),
      timeframe:  clip(String(data.timeframe ?? "—"), 16),
      signal:     data.signal,
      confidence: Number(data.confidence) || 0,
      entry:      data.entry ?? null,
      tp1:        data.tp1 ?? null,
      tp2:        data.tp2 ?? null,
      sl:         data.sl ?? null,
      rrRatio:    data.rrRatio ?? null,
      // For the admin console: the exact result the user saw, how it was made
      variant:          variant.id,
      model:            variant.model,
      result:           JSON.stringify(data),
      promptTokens,
      completionTokens,
      costUsd,
    })

    return NextResponse.json(
      canPick ? { analysis: data, variant: variant.id } : { analysis: data },
    )

  } catch (err) {
    console.error("[/api/analyze]", err)

    // OpenAI API errors (rate-limit, quota, auth, bad params…)
    // Never expose API-layer details to the client.
    if (err instanceof OpenAI.APIError) {
      const msg = err.status < 500
        ? "Our servers are experiencing heavy load. Please wait a moment and try again."
        : "Chart Analysis hit a temporary problem. Please try again in a moment."
      return NextResponse.json({ error: msg }, { status: 503 })
    }

    const message =
      err instanceof SyntaxError ? "We couldn't complete the analysis. Please try again."
      : err instanceof UserFacingError ? err.message
      : "Analysis failed. Please try again."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
