// Prints the teaching text of lessons, compactly, to plan visuals.
//   npx tsx --tsconfig tsconfig.json .academy/dump-lessons.ts u1 u2      (unit prefixes or lesson ids)
import { LESSON_CONTENT } from "../content/academy"
import { ALL_LESSONS } from "../lib/academy/curriculum"

const want = process.argv.slice(2)
for (const ref of ALL_LESSONS) {
  const id = ref.lesson.id
  if (!want.some((w) => id === w || id.startsWith(w + "-"))) continue
  const c = LESSON_CONTENT[id]
  console.log(`\n### ${id}  "${ref.lesson.title}"`)
  c.steps.forEach((s, i) => {
    if (s.kind === "learn") {
      const v = s.visual ? (s.visual.type === "figure" ? `[figure ${s.visual.id}]` : `[${s.visual.type}]`) : "[NO VISUAL]"
      console.log(`${i} LEARN ${v} "${s.title}": ${s.body.join(" / ")}${s.callout ? ` {${s.callout.tone}: ${s.callout.text}}` : ""}`)
    } else if (s.kind === "recap") {
      console.log(`${i} RECAP: ${s.points.join(" | ")}`)
    } else {
      console.log(`${i} Q:${s.kind} ${"visual" in s && s.visual ? "[has visual]" : s.kind === "tap" ? "[chart]" : ""}`)
    }
  })
}
