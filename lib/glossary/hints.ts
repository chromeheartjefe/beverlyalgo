// Matching bold lesson phrases to glossary terms. Pure and shared: the server
// uses it to pick the hints a lesson needs, the client to look them up.

export interface GlossaryHint {
  slug: string
  term: string
  short: string
  category: string
}

/** Lowercase, accents and punctuation stripped; hyphens count as spaces */
export function hintKey(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9%:\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Keys a bold phrase might match: itself, without a leading article, each side of "X (Y)", singular forms */
export function hintCandidates(text: string): string[] {
  const out = new Set<string>()
  const add = (raw: string) => {
    const k = hintKey(raw).replace(/^(a|an|the) /, "")
    if (!k) return
    out.add(k)
    if (k.length > 3 && k.endsWith("es")) out.add(k.slice(0, -2))
    if (k.length > 3 && k.endsWith("s")) out.add(k.slice(0, -1))
  }
  add(text)
  const paren = text.match(/^(.*?)\s*\((.+)\)\s*$/)
  if (paren) {
    add(paren[1])
    add(paren[2])
  }
  return [...out]
}

export function findHint(hints: Record<string, GlossaryHint>, text: string): GlossaryHint | null {
  for (const k of hintCandidates(text)) if (hints[k]) return hints[k]
  return null
}
