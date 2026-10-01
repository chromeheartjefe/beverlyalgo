// Checks for the Trading Glossary. Run: npx tsx --tsconfig tsconfig.json .academy/check-glossary.ts
import { findLessonById } from "../lib/academy/curriculum"
import { TERMS } from "../lib/glossary/terms"
import { CATEGORIES } from "../lib/glossary/types"
import { glossaryVisual } from "../lib/glossary/visuals"

let problems = 0
const fail = (m: string) => { problems++; console.log("✗ " + m) }
const slugs = new Set<string>()
for (const t of TERMS) {
  if (slugs.has(t.slug)) fail(`duplicate slug ${t.slug}`)
  slugs.add(t.slug)
}
const cats = new Set<string>(CATEGORIES.map((c) => c.id))
for (const t of TERMS) {
  if (JSON.stringify(t).includes("—")) fail(`${t.slug}: em-dash`)
  if (!cats.has(t.category)) fail(`${t.slug}: bad category`)
  if (t.short.length > 200) fail(`${t.slug}: short too long (${t.short.length})`)
  if (t.lessonId && !findLessonById(t.lessonId)) fail(`${t.slug}: unknown lesson ${t.lessonId}`)
  for (const r of t.related) if (!slugs.has(r)) fail(`${t.slug}: related "${r}" missing`)
  if (t.related.includes(t.slug)) fail(`${t.slug}: relates to itself`)
  if (t.visual) {
    try {
      const v = glossaryVisual(t.visual)
      if (v.type === "chart" && v.chart.candles.length < 3) fail(`${t.slug}: tiny chart`)
      if (v.type === "chart") for (const a of v.chart.annotations ?? []) if (a.kind === "marker" && (a.index < 0 || a.index >= v.chart.candles.length)) fail(`${t.slug}: marker out of range`)
    } catch (e) { fail(`${t.slug}: visual ${t.visual} throws ${e}`) }
  }
}
const byCat = CATEGORIES.map((c) => `${c.id}:${TERMS.filter((t) => t.category === c.id).length}`).join(" ")
console.log(`${TERMS.length} terms (${TERMS.filter((t) => t.visual).length} with visuals, ${TERMS.filter((t) => t.lessonId).length} linked to lessons) ${byCat}`)
console.log(`${problems} problems`)
