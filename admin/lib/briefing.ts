import "server-only"

import { AI_MODEL, askJson } from "~/lib/ai"
import { aiSnapshot, type Business } from "~/lib/business"
import { readStore, updateStore } from "~/lib/store"

// AI analyst: turns the live aggregates into a short business briefing, and
// answers free-form questions about them. Only aggregate numbers are sent
// (see aiSnapshot), never emails or names.

export type Tone = "good" | "warn" | "bad"
export type Level = "high" | "medium" | "low"

export type Briefing = {
  id: string
  at: string
  model: string
  costUsd: number
  headline: string
  summary: string
  scores: { area: string; score: number; note: string }[]
  insights: { title: string; detail: string; tone: Tone }[]
  actions: { title: string; why: string; impact: Level; effort: Level; area: string }[]
  risks: string[]
}

export type Answer = { id: string; at: string; question: string; answer: string; followUps: string[]; costUsd: number }

const ANALYST = `You are a sharp, honest growth and finance analyst for a small, early-stage SaaS. You get a JSON snapshot of live business metrics. Reply in JSON only.
Rules:
- Ground every claim in the numbers given. Quote the numbers. Never invent data you were not given.
- Small samples are noisy: say so when counts are tiny (under ~10) instead of over-reading percentages.
- Be concrete and practical for a solo founder with limited time and budget. No generic advice like "improve marketing".
- Plain words, short sentences, no em dashes.`

export async function generateBriefing(b: Business): Promise<Briefing> {
  const { data, costUsd } = await askJson<Omit<Briefing, "id" | "at" | "model" | "costUsd">>(
    "briefing",
    `${ANALYST}
Return JSON with exactly these keys:
{"headline": one sentence, the single most important thing right now,
 "summary": 2-3 sentences on the state of the business,
 "scores": [{"area": "Growth"|"Activation"|"Engagement"|"Monetization"|"Unit economics", "score": 1-10, "note": short reason}] (all five areas),
 "insights": 3-6 items [{"title", "detail" (1-2 sentences with the numbers), "tone": "good"|"warn"|"bad"}],
 "actions": 3-5 items ranked by expected impact [{"title" (imperative), "why" (tie to a number), "impact": "high"|"medium"|"low", "effort": "low"|"medium"|"high", "area"}],
 "risks": 1-3 short strings}`,
    `Business snapshot:\n${JSON.stringify(aiSnapshot(b))}`,
  )
  const briefing: Briefing = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    model: AI_MODEL,
    costUsd,
    headline: String(data.headline ?? ""),
    summary: String(data.summary ?? ""),
    scores: Array.isArray(data.scores) ? data.scores.slice(0, 6).map((s) => ({ area: String(s.area), score: Math.max(1, Math.min(10, Number(s.score) || 0)), note: String(s.note ?? "") })) : [],
    insights: Array.isArray(data.insights) ? data.insights.slice(0, 8) : [],
    actions: Array.isArray(data.actions) ? data.actions.slice(0, 6) : [],
    risks: Array.isArray(data.risks) ? data.risks.slice(0, 4).map(String) : [],
  }
  await updateStore<Briefing[]>("briefings", [], (list) => [briefing, ...list].slice(0, 30))
  return briefing
}

export async function askQuestion(b: Business, question: string): Promise<Answer> {
  const { data, costUsd } = await askJson<{ answer: string; followUps: string[] }>(
    "question",
    `${ANALYST}
The founder asks a question about the business. If the snapshot can't answer it, say exactly what data is missing and how to get it.
Return JSON: {"answer": the answer in 1-3 short paragraphs (use \\n between paragraphs), "followUps": 2-3 short follow-up questions worth asking next}`,
    `Business snapshot:\n${JSON.stringify(aiSnapshot(b))}\n\nQuestion: ${question}`,
  )
  const answer: Answer = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    question,
    answer: String(data.answer ?? ""),
    followUps: Array.isArray(data.followUps) ? data.followUps.slice(0, 3).map(String) : [],
    costUsd,
  }
  await updateStore<Answer[]>("questions", [], (list) => [answer, ...list].slice(0, 50))
  return answer
}

export const listBriefings = () => readStore<Briefing[]>("briefings", [])
export const listAnswers = () => readStore<Answer[]>("questions", [])
