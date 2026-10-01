import { editDistance } from "@/lib/edit-distance"
import type { GlossaryTerm } from "@/lib/glossary/types"

// Glossary search: ranks by where the query matches (term name first, then
// abbreviations and aliases, then the definition). Every word typed must match
// somewhere. Also suggests near-misses when nothing matches.

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9%&:/.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()

// Shorthand traders type, expanded before matching
const SHORTHAND: Record<string, string> = {
  ny: "new york",
  nyc: "new york",
  ldn: "london",
  tf: "timeframe",
  htf: "higher timeframe",
  ltf: "lower timeframe",
  ob: "order block",
  pos: "position",
}

function expand(q: string): string {
  return q
    .split(" ")
    .map((w) => SHORTHAND[w] ?? w)
    .join(" ")
}

function scoreTerm(t: GlossaryTerm, words: string[], whole: string, mode: "all" | "any" = "all"): number {
  const name = norm(t.term)
  const aliases = (t.aliases ?? []).map(norm)
  const short = norm(t.short)
  const detail = norm(t.detail.join(" "))
  let score = 0
  if (name === whole) score += 120
  else if (aliases.includes(whole)) score += 110
  else if (name.startsWith(whole)) score += 90
  else if (aliases.some((a) => a.startsWith(whole))) score += 80

  for (const w of words) {
    if (name.split(" ").some((p) => p.startsWith(w))) score += 30
    else if (name.includes(w)) score += 20
    else if (aliases.some((a) => a.includes(w))) score += 18
    else if (short.includes(w)) score += 8
    else if (detail.includes(w)) score += 4
    else if (mode === "all") return 0
  }
  return score
}

function rank(terms: GlossaryTerm[], words: string[], whole: string, mode: "all" | "any") {
  return terms
    .map((t) => ({ t, s: scoreTerm(t, words, whole, mode) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.t.term.localeCompare(b.t.term))
    .map((x) => x.t)
}

export function searchTerms(terms: GlossaryTerm[], query: string): GlossaryTerm[] {
  const raw = norm(query)
  if (!raw) return terms
  // Exact abbreviations (e.g. "OB" as an alias) win before shorthand expansion
  const whole = terms.some((t) => (t.aliases ?? []).map(norm).includes(raw)) ? raw : expand(raw)
  const words = whole.split(" ").filter((w) => w.length > 0)
  const strict = rank(terms, words, whole, "all")
  // Nothing matches every word: fall back to terms matching any of them
  return strict.length > 0 || words.length < 2 ? strict : rank(terms, words, whole, "any")
}

/** Closest term names for a query that matched nothing ("Did you mean...") */
export function suggestTerms(terms: GlossaryTerm[], query: string, n = 3): GlossaryTerm[] {
  const q = norm(query)
  if (!q) return []
  return terms
    .map((t) => {
      const names = [t.term, ...(t.aliases ?? [])].map(norm)
      const d = Math.min(...names.map((name) => editDistance(q, name.slice(0, Math.max(q.length, 3)))))
      return { t, d }
    })
    .filter((x) => x.d <= Math.max(2, Math.floor(q.length / 3)))
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.t)
}

/** First letter used for A-Z grouping */
export function letterOf(t: GlossaryTerm): string {
  const c = t.term[0]?.toUpperCase() ?? "#"
  return /[A-Z]/.test(c) ? c : "#"
}
