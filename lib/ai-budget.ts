import { gte, sql } from "drizzle-orm"

import { db } from "@/db"
import { aiUsage } from "@/db/schema"

// gpt-5.6-luna pricing — update these if the model or its rates change.
const INPUT_COST_PER_TOKEN  = 0.20 / 1_000_000
const OUTPUT_COST_PER_TOKEN = 1.20 / 1_000_000

// Real dollar ceiling across every OpenAI-backed feature (chat + chart
// analysis share the same key/billing) — this is the actual safety net.
// Per-feature/per-user daily limits protect against a single abusive user,
// but don't bound total spend as the user base grows; this does, by
// checking real cumulative cost before every call and refusing once the
// month's spend nears the budget instead of continuing to draw it down.
const MONTHLY_BUDGET_USD = Number(process.env.AI_MONTHLY_BUDGET_USD ?? 10)

function monthStartUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

export async function getMonthlySpendUSD(): Promise<number> {
  const [row] = await db
    .select({
      promptTokens:     sql<number>`coalesce(sum(${aiUsage.promptTokens}), 0)`,
      completionTokens: sql<number>`coalesce(sum(${aiUsage.completionTokens}), 0)`,
    })
    .from(aiUsage)
    .where(gte(aiUsage.createdAt, monthStartUTC()))

  return Number(row.promptTokens) * INPUT_COST_PER_TOKEN + Number(row.completionTokens) * OUTPUT_COST_PER_TOKEN
}

export async function isBudgetExceeded(): Promise<boolean> {
  return (await getMonthlySpendUSD()) >= MONTHLY_BUDGET_USD
}

export async function recordAiUsage(feature: "chat" | "chart_analysis", promptTokens: number, completionTokens: number) {
  await db.insert(aiUsage).values({ feature, promptTokens, completionTokens })
}
