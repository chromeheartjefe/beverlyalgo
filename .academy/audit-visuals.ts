// Which lessons are plain? Counts, per lesson, the teaching steps with and without a visual.
//   npx tsx --tsconfig tsconfig.json .academy/audit-visuals.ts
import { LESSON_CONTENT } from "../content/academy"
import { ALL_LESSONS } from "../lib/academy/curriculum"

const rows = ALL_LESSONS.map((ref) => {
  const l = { id: ref.lesson.id, title: ref.lesson.title, unit: ref.unit.slug }
  const c = LESSON_CONTENT[l.id]
  const learn = c.steps.filter((s) => s.kind === "learn")
  const withVisual = learn.filter((s) => s.kind === "learn" && s.visual)
  const figures = c.steps.flatMap((s) => ("visual" in s && s.visual?.type === "figure" ? [s.visual.id] : []))
  const charts = c.steps.filter((s) => ("visual" in s && (s.visual?.type === "chart" || s.visual?.type === "charts")) || s.kind === "tap").length
  return { id: l.id, unit: l.unit, title: l.title, learn: learn.length, visual: withVisual.length, charts, figures }
})

const unitOf = (id: string) => id.split("-")[0]
let plain = 0
for (const r of rows) {
  const flag = r.visual === 0 && r.charts === 0 ? "NONE " : r.visual === 0 ? "none*" : r.visual * 2 <= r.learn ? "few  " : "ok   "
  if (flag !== "ok   ") plain++
  console.log(`${flag} ${r.id.padEnd(52)} learn ${r.learn} | with visual ${r.visual} | charts incl. questions ${r.charts}${r.figures.length ? " | figures: " + r.figures.join(",") : ""}`)
}
const totalLearn = rows.reduce((a, r) => a + r.learn, 0), totalVis = rows.reduce((a, r) => a + r.visual, 0)
console.log(`\n${rows.length} lessons, ${totalLearn} teaching steps, ${totalVis} with a visual (${Math.round((totalVis / totalLearn) * 100)}%).`)
console.log(`NONE = no visual anywhere: ${rows.filter((r) => r.visual === 0 && r.charts === 0).length}; none* = only in questions: ${rows.filter((r) => r.visual === 0 && r.charts > 0).length}; few = half or fewer: ${rows.filter((r) => r.visual > 0 && r.visual * 2 <= r.learn).length}`)
const byUnit: Record<string, { learn: number; visual: number }> = {}
for (const r of rows) { const u = (byUnit[unitOf(r.id)] ??= { learn: 0, visual: 0 }); u.learn += r.learn; u.visual += r.visual }
console.log(Object.entries(byUnit).map(([u, v]) => `${u}: ${v.visual}/${v.learn}`).join("  "))
