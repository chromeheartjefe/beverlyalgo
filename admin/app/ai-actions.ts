"use server"

import { revalidatePath } from "next/cache"

import { AiError } from "~/lib/ai"
import { askQuestion, generateBriefing } from "~/lib/briefing"
import { loadBusiness } from "~/lib/business"
import { addIdea, deleteIdea, type IdeaStatus, listIdeas, patchIdea, reviewIdea, suggestIdeas } from "~/lib/ideas"
import { StoreError } from "~/lib/store"

// AI analyst and ideas board actions. Nothing here touches the database:
// AI results and ideas are kept in admin/data/*.json on this machine.

export type AiResult = { ok: true; message?: string } | { ok: false; message: string }

function fail(err: unknown): AiResult {
  if (err instanceof AiError || err instanceof StoreError) return { ok: false, message: err.message }
  console.error("[admin ai]", err)
  return { ok: false, message: err instanceof Error ? err.message : "Something went wrong." }
}

export async function runBriefing(): Promise<AiResult> {
  try {
    const b = await loadBusiness()
    if (!b) return { ok: false, message: "Couldn't load the metrics." }
    const brief = await generateBriefing(b)
    revalidatePath("/insights")
    revalidatePath("/")
    return { ok: true, message: `Done · $${brief.costUsd.toFixed(4)}` }
  } catch (err) {
    return fail(err)
  }
}

export async function runQuestion(question: string): Promise<AiResult> {
  const q = question.trim().slice(0, 500)
  if (q.length < 4) return { ok: false, message: "Type a question first." }
  try {
    const b = await loadBusiness()
    if (!b) return { ok: false, message: "Couldn't load the metrics." }
    await askQuestion(b, q)
    revalidatePath("/insights")
    return { ok: true }
  } catch (err) {
    return fail(err)
  }
}

export async function createIdea(input: { title: string; details: string; category: string; impact: number; effort: number }): Promise<AiResult> {
  if (input.title.trim().length < 3) return { ok: false, message: "Give the idea a title." }
  try {
    await addIdea(input)
  } catch (err) {
    return fail(err)
  }
  revalidatePath("/ideas")
  return { ok: true, message: "Added to Inbox" }
}

/** "Save as idea" from an AI briefing action */
export async function saveActionAsIdea(input: { title: string; why: string; area: string; impact: string; effort: string }): Promise<AiResult> {
  const lvl = (v: string) => (v === "high" ? 3 : v === "low" ? 1 : 2)
  const area = ["Growth", "Product", "Marketing", "Revenue", "Ops"].find((c) => input.area.toLowerCase().includes(c.toLowerCase())) ?? "Growth"
  try {
    await addIdea({ title: input.title, details: input.why, category: area, impact: lvl(input.impact), effort: lvl(input.effort) })
  } catch (err) {
    return fail(err)
  }
  revalidatePath("/ideas")
  return { ok: true, message: "Saved to Ideas" }
}

export async function updateIdea(id: string, patch: { title?: string; details?: string; category?: string; status?: IdeaStatus; impact?: number; effort?: number }): Promise<AiResult> {
  try {
    await patchIdea(id, patch as Parameters<typeof patchIdea>[1])
  } catch (err) {
    return fail(err)
  }
  revalidatePath("/ideas")
  return { ok: true }
}

export async function removeIdea(id: string): Promise<AiResult> {
  try {
    await deleteIdea(id)
  } catch (err) {
    return fail(err)
  }
  revalidatePath("/ideas")
  return { ok: true }
}

export async function runIdeaReview(id: string): Promise<AiResult> {
  try {
    const [b, ideas] = await Promise.all([loadBusiness(), listIdeas()])
    const idea = ideas.find((i) => i.id === id)
    if (!b || !idea) return { ok: false, message: "Idea or metrics not found." }
    const review = await reviewIdea(b, idea)
    revalidatePath("/ideas")
    return { ok: true, message: `Score ${review.score}/10` }
  } catch (err) {
    return fail(err)
  }
}

export async function runIdeaSuggestions(): Promise<AiResult> {
  try {
    const [b, ideas] = await Promise.all([loadBusiness(), listIdeas()])
    if (!b) return { ok: false, message: "Couldn't load the metrics." }
    const n = await suggestIdeas(b, ideas)
    revalidatePath("/ideas")
    return { ok: true, message: `${n} ideas added to Inbox` }
  } catch (err) {
    return fail(err)
  }
}
