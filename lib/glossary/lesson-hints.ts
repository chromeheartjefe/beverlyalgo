import type { LessonContent } from "@/lib/academy/types"
import { type GlossaryHint, hintCandidates, hintKey } from "@/lib/glossary/hints"
import { TERMS } from "@/lib/glossary/terms"
import { CATEGORIES } from "@/lib/glossary/types"

// Server side: which glossary hints a lesson needs. Only those go to the
// browser, so a lesson page never ships the whole glossary.

const INDEX: Map<string, GlossaryHint> = (() => {
  const map = new Map<string, GlossaryHint>()
  for (const t of TERMS) {
    const hint: GlossaryHint = {
      slug: t.slug,
      term: t.term,
      short: t.short,
      category: CATEGORIES.find((c) => c.id === t.category)?.label ?? "",
    }
    // Term names win over aliases when both claim a key
    for (const k of [t.term, ...(t.aliases ?? [])].map(hintKey)) {
      if (!map.has(k) || hintKey(map.get(k)!.term) !== k) map.set(k, hint)
    }
  }
  return map
})()

/** Every **bold** phrase in a lesson's text */
export function boldPhrases(lesson: LessonContent): string[] {
  const texts: string[] = []
  for (const step of lesson.steps) {
    if (step.kind === "learn") {
      texts.push(...step.body)
      if (step.callout) texts.push(step.callout.text)
    }
    if (step.kind === "recap") texts.push(...step.points)
  }
  return texts.flatMap((t) => [...t.matchAll(/\*\*(.+?)\*\*/g)].map((m) => m[1]))
}

export function hintForPhrase(phrase: string): GlossaryHint | null {
  for (const k of hintCandidates(phrase)) {
    const h = INDEX.get(k)
    if (h) return h
  }
  return null
}

/** Hints keyed by every candidate key of the lesson's bold phrases */
export function glossaryHintsForLesson(lesson: LessonContent): Record<string, GlossaryHint> {
  const out: Record<string, GlossaryHint> = {}
  for (const phrase of boldPhrases(lesson)) {
    const hint = hintForPhrase(phrase)
    if (!hint) continue
    for (const k of hintCandidates(phrase)) if (INDEX.get(k)?.slug === hint.slug) out[k] = hint
  }
  return out
}
