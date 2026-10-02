import "server-only"

import { askJson } from "~/lib/ai"
import { aiSnapshot, type Business } from "~/lib/business"
import { readStore, updateStore } from "~/lib/store"

// The ideas board. Stored in admin/data/ideas.json so it survives restarts
// and can be read by Claude when you want to turn an idea into work.

const STATUSES = ["inbox", "exploring", "planned", "building", "shipped", "parked"] as const
export type IdeaStatus = (typeof STATUSES)[number]
export const CATEGORIES = ["Growth", "Product", "Marketing", "Revenue", "Ops"] as const
export type IdeaCategory = (typeof CATEGORIES)[number]

export type IdeaReview = {
  at: string
  score: number
  verdict: "do it" | "test it" | "maybe later" | "skip"
  summary: string
  pros: string[]
  cons: string[]
  steps: string[]
  metric: string
  costUsd: number
}

export type Idea = {
  id: string
  title: string
  details: string
  category: IdeaCategory
  status: IdeaStatus
  impact: 1 | 2 | 3
  effort: 1 | 2 | 3
  source: "you" | "ai"
  createdAt: string
  updatedAt: string
  review?: IdeaReview
}

export const listIdeas = () => readStore<Idea[]>("ideas", [])

const clamp3 = (n: unknown): 1 | 2 | 3 => (n === 1 || n === 2 || n === 3 ? n : 2)
const category = (c: unknown): IdeaCategory => (CATEGORIES.includes(c as IdeaCategory) ? (c as IdeaCategory) : "Product")

export async function addIdea(input: { title: string; details: string; category: string; impact: number; effort: number; source?: "you" | "ai" }) {
  const now = new Date().toISOString()
  const idea: Idea = {
    id: crypto.randomUUID(),
    title: input.title.trim().slice(0, 160),
    details: input.details.trim().slice(0, 4000),
    category: category(input.category),
    status: "inbox",
    impact: clamp3(input.impact),
    effort: clamp3(input.effort),
    source: input.source ?? "you",
    createdAt: now,
    updatedAt: now,
  }
  await updateStore<Idea[]>("ideas", [], (list) => [idea, ...list])
  return idea
}

export async function patchIdea(id: string, patch: Partial<Pick<Idea, "title" | "details" | "category" | "status" | "impact" | "effort" | "review">>) {
  await updateStore<Idea[]>("ideas", [], (list) =>
    list.map((i) => {
      if (i.id !== id) return i
      return {
        ...i,
        ...(patch.title !== undefined && { title: patch.title.trim().slice(0, 160) || i.title }),
        ...(patch.details !== undefined && { details: patch.details.trim().slice(0, 4000) }),
        ...(patch.category !== undefined && { category: category(patch.category) }),
        ...(patch.status !== undefined && STATUSES.includes(patch.status) && { status: patch.status }),
        ...(patch.impact !== undefined && { impact: clamp3(patch.impact) }),
        ...(patch.effort !== undefined && { effort: clamp3(patch.effort) }),
        ...(patch.review !== undefined && { review: patch.review }),
        updatedAt: new Date().toISOString(),
      }
    }),
  )
}

export async function deleteIdea(id: string) {
  await updateStore<Idea[]>("ideas", [], (list) => list.filter((i) => i.id !== id))
}

const REVIEWER = `You are a pragmatic product and growth advisor for EntrixAlgo, a small AI trading tools SaaS run by a solo founder. You review one idea against live business numbers. Reply in JSON only. Ground the review in the numbers, be honest (it's fine to say skip), plain words, no em dashes.`

export async function reviewIdea(b: Business, idea: Idea): Promise<IdeaReview> {
  const { data, costUsd } = await askJson<Omit<IdeaReview, "at" | "costUsd">>(
    "idea-review",
    `${REVIEWER}
Return JSON: {"score": 1-10 overall value for the business right now, "verdict": "do it"|"test it"|"maybe later"|"skip",
"summary": 2 sentences, "pros": 2-3 strings, "cons": 2-3 strings, "steps": 3-5 concrete first steps (smallest useful version first),
"metric": the one number that would prove it worked}`,
    `Business snapshot:\n${JSON.stringify(aiSnapshot(b))}\n\nIdea (${idea.category}, founder's guess: impact ${idea.impact}/3, effort ${idea.effort}/3):\nTitle: ${idea.title}\nDetails: ${idea.details || "(none)"}`,
  )
  const verdicts = ["do it", "test it", "maybe later", "skip"] as const
  const review: IdeaReview = {
    at: new Date().toISOString(),
    score: Math.max(1, Math.min(10, Math.round(Number(data.score) || 5))),
    verdict: verdicts.includes(data.verdict) ? data.verdict : "test it",
    summary: String(data.summary ?? ""),
    pros: Array.isArray(data.pros) ? data.pros.slice(0, 4).map(String) : [],
    cons: Array.isArray(data.cons) ? data.cons.slice(0, 4).map(String) : [],
    steps: Array.isArray(data.steps) ? data.steps.slice(0, 6).map(String) : [],
    metric: String(data.metric ?? ""),
    costUsd,
  }
  await patchIdea(idea.id, { review })
  return review
}

/** Three fresh ideas aimed at the weakest numbers, added to the Inbox */
export async function suggestIdeas(b: Business, existing: Idea[]): Promise<number> {
  const { data } = await askJson<{ ideas: { title: string; details: string; category: string; impact: number; effort: number }[] }>(
    "idea-suggest",
    `${REVIEWER}
Suggest 3 new, specific ideas aimed at the weakest numbers in the snapshot. Avoid repeating the existing ideas.
Return JSON: {"ideas": [{"title": imperative, under 80 chars, "details": 2-3 sentences incl. the number it targets, "category": "Growth"|"Product"|"Marketing"|"Revenue"|"Ops", "impact": 1-3, "effort": 1-3}]}`,
    `Business snapshot:\n${JSON.stringify(aiSnapshot(b))}\n\nExisting ideas:\n${existing.map((i) => `- ${i.title}`).join("\n") || "(none)"}`,
  )
  const list = Array.isArray(data.ideas) ? data.ideas.slice(0, 3) : []
  for (const i of list) {
    if (i?.title) await addIdea({ title: String(i.title), details: String(i.details ?? ""), category: String(i.category), impact: Number(i.impact), effort: Number(i.effort), source: "ai" })
  }
  return list.length
}
