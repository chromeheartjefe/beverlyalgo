import "server-only"

import OpenAI from "openai"

import { readStore, updateStore } from "~/lib/store"

// The console's own OpenAI calls (AI analyst, idea evaluation). They use the
// same model family as the site but are logged locally in admin/data, not in
// the site's ai_usage table (the console can't write there), so they don't
// count against the site's monthly AI budget.

export const AI_MODEL = process.env.ADMIN_AI_MODEL || "gpt-6-luna"
const EFFORT = "medium" as const
// gpt-6-luna list prices; a different ADMIN_AI_MODEL is estimated at these
const COST_IN = 0.1 / 1_000_000
const COST_OUT = 0.5 / 1_000_000

export function aiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

type AiLogEntry = { at: string; feature: string; model: string; promptTokens: number; completionTokens: number; costUsd: number }

export class AiError extends Error {}

/** One JSON-mode call. The system prompt must mention JSON. */
export async function askJson<T>(feature: string, system: string, user: string, maxTokens = 8000): Promise<{ data: T; costUsd: number }> {
  if (!aiConfigured()) throw new AiError("Add OPENAI_API_KEY to admin/.env.local to use AI features.")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const completion = await openai.chat.completions.create({
    model: AI_MODEL,
    reasoning_effort: EFFORT,
    max_completion_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  })

  const usage = completion.usage
  const costUsd = usage ? usage.prompt_tokens * COST_IN + usage.completion_tokens * COST_OUT : 0
  if (usage) {
    await updateStore<AiLogEntry[]>("ai-log", [], (log) =>
      [{ at: new Date().toISOString(), feature, model: AI_MODEL, promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens, costUsd }, ...log].slice(0, 500),
    )
  }

  const choice = completion.choices[0]
  if (choice?.finish_reason === "length") throw new AiError("The AI ran out of room before finishing. Try again.")
  const text = choice?.message?.content
  if (!text) throw new AiError("The AI returned an empty answer. Try again.")
  try {
    return { data: JSON.parse(text) as T, costUsd }
  } catch {
    throw new AiError("The AI answer wasn't valid JSON. Try again.")
  }
}

export async function aiSpend(): Promise<{ total: number; month: number; calls: number }> {
  const log = await readStore<AiLogEntry[]>("ai-log", [])
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  return {
    total: log.reduce((t, e) => t + e.costUsd, 0),
    month: log.filter((e) => new Date(e.at) >= monthStart).reduce((t, e) => t + e.costUsd, 0),
    calls: log.length,
  }
}
