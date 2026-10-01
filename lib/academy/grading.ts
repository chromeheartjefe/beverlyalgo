import type { Question } from "@/lib/academy/types"

// Answer checking shared by the lesson player (instant feedback) and the
// server (final exam grading), so both judge answers exactly the same way.

export type Answer = {
  choice: number | null
  tf: boolean | null
  tap: number | null
  numeric: string
  /** Match questions: left index -> the pair index of the right item chosen for it */
  match: Record<number, number>
}

export const EMPTY_ANSWER: Answer = { choice: null, tf: null, tap: null, numeric: "", match: {} }

export function parseNumber(raw: string): number | null {
  const cleaned = raw.replace(/[\s$€£,]/g, (c) => (c === "," ? "." : ""))
  if (!cleaned) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

export function isAnswered(q: Question, a: Answer): boolean {
  switch (q.kind) {
    case "choice":
      return a.choice !== null
    case "truefalse":
      return a.tf !== null
    case "tap":
      return a.tap !== null
    case "numeric":
      return parseNumber(a.numeric) !== null
    case "match":
      return Object.keys(a.match).length === q.pairs.length
  }
}

export function grade(q: Question, a: Answer): boolean {
  switch (q.kind) {
    case "choice":
      return a.choice === q.answer
    case "truefalse":
      return a.tf === q.answer
    case "tap":
      return a.tap !== null && q.targets.includes(a.tap)
    case "numeric": {
      const n = parseNumber(a.numeric)
      return n !== null && Math.abs(n - q.answer) <= q.tolerance + 1e-9
    }
    case "match":
      return q.pairs.every((_, i) => a.match[i] === i)
  }
}

/** The right answer, spelled out for feedback */
export function answerText(q: Question): string {
  switch (q.kind) {
    case "choice":
      return q.options[q.answer]
    case "truefalse":
      return q.answer ? "True" : "False"
    case "numeric":
      return `${q.prefix ?? ""}${q.answer}${q.suffix ? ` ${q.suffix}` : ""}`
    case "tap":
      return "The green area on the chart"
    case "match":
      return q.pairs.map(([l, r]) => `${l} → ${r}`).join("; ")
  }
}

/** The question prompt as plain text */
export function promptText(q: Question): string {
  return q.kind === "truefalse" ? q.statement : q.prompt
}
