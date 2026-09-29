import { gte, sql } from "drizzle-orm"

import { db } from "@/db"
import { aiUsage } from "@/db/schema"

// gpt-6-luna list pricing (permanent, since 2026-09-22). Every feature runs
// on it; update these if the model or its rates change. Each call's cost is
// stored in ai_usage.cost_usd at the rate that applied when it was made.
const INPUT_COST_PER_TOKEN  = 0.10 / 1_000_000
const OUTPUT_COST_PER_TOKEN = 0.50 / 1_000_000

// Rows from before 2026-09-28 have no cost_usd and were all gpt-5.6-luna
// calls ($0.20 / $1.20 per 1M). Pricing them at the new rates counted that
// spend at about half, so the monthly cap would have allowed well over $50.
const LEGACY_INPUT_COST_PER_TOKEN  = 0.20 / 1_000_000
const LEGACY_OUTPUT_COST_PER_TOKEN = 1.20 / 1_000_000

// Real dollar ceiling across every OpenAI-backed feature (chat + chart
// analysis share the same key/billing) — this is the actual safety net.
// Per-feature/per-user daily limits protect against a single abusive user,
// but don't bound total spend as the user base grows; this does, by
// checking real cumulative cost before every call and refusing once the
// month's spend nears the budget instead of continuing to draw it down.
const MONTHLY_BUDGET_USD = Number(process.env.AI_MONTHLY_BUDGET_USD ?? 50)

function monthStartUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export async function getMonthlySpendUSD(): Promise<number> {
  const [row] = await db
    .select({
      spend: sql<number>`coalesce(sum(coalesce(${aiUsage.costUsd},
        ${aiUsage.promptTokens} * ${LEGACY_INPUT_COST_PER_TOKEN}::float8
        + ${aiUsage.completionTokens} * ${LEGACY_OUTPUT_COST_PER_TOKEN}::float8)), 0)`,
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, monthStartUTC()))

  return Number(row.spend)
}

export async function isBudgetExceeded(): Promise<boolean> {
  return (await getMonthlySpendUSD()) >= MONTHLY_BUDGET_USD
}

export function aiCostUSD(promptTokens: number, completionTokens: number): number {
  return promptTokens * INPUT_COST_PER_TOKEN + completionTokens * OUTPUT_COST_PER_TOKEN
}

/** Records one AI call's spend, and returns its cost in USD. */
export async function recordAiUsage(usage: {
  feature:          "chat" | "chart_analysis" | "screener" | "support"
  userId:           string | null // null: signed-out visitor (support chat)
  model:            string
  reasoningEffort:  string
  promptTokens:     number
  completionTokens: number
}): Promise<number> {
  const costUsd = aiCostUSD(usage.promptTokens, usage.completionTokens)
  await db.insert(aiUsage).values({ ...usage, costUsd })
  return costUsd
}
