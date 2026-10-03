// Prints everything a learner sees in a lesson, for review: teaching text, questions
// with their answers and explanations, recap, sources and a summary of each visual.
//   npx tsx --tsconfig tsconfig.json .academy/dump-full.ts u1 u2      (unit prefixes or lesson ids)
import { LESSON_CONTENT } from "../content/academy"
import { ALL_LESSONS } from "../lib/academy/curriculum"
import type { ChartSpec, Step, Visual } from "../lib/academy/types"

const r = (n: number) => +n.toFixed(4)

function chart(c: ChartSpec): string {
  const closes = c.candles.map((k) => r(k[3]))
  const parts = [`${c.candles.length} candles${c.style ? ` (${c.style})` : ""}${c.scale ? ` ${c.scale}` : ""}, closes ${closes[0]}..${closes[closes.length - 1]}, range ${r(Math.min(...c.candles.map((k) => k[2])))}-${r(Math.max(...c.candles.map((k) => k[1])))}`]
  for (const a of c.annotations ?? []) {
    if (a.kind === "hline") parts.push(`hline ${a.price} "${a.label ?? ""}"`)
    else if (a.kind === "zone") parts.push(`zone ${a.from}-${a.to ?? "end"} ${a.bottom}..${a.top} "${a.label ?? ""}"`)
    else if (a.kind === "marker") parts.push(`marker #${a.index} ${a.at}=${r(c.candles[a.index][a.at === "high" ? 1 : 2])} "${a.text}"`)
    else parts.push(`line [${a.from}]->[${a.to}] "${a.label ?? ""}"`)
  }
  for (const o of c.overlays ?? []) parts.push(`overlay "${o.label ?? ""}"`)
  if (c.pane) parts.push(`pane "${c.pane.label}" levels ${JSON.stringify(c.pane.levels ?? [])}`)
  for (const s of c.sessions ?? []) parts.push(`session ${s.from}-${s.to} "${s.label}"`)
  if (c.timeLabels) parts.push(`times ${c.timeLabels.map((t) => `${t.index}=${t.text}`).join(" ")}`)
  if (c.volumes) parts.push("volumes")
  if (c.caption) parts.push(`caption "${c.caption}"`)
  return parts.join(" | ")
}

function visual(v: Visual | undefined): string {
  if (!v) return ""
  if (v.type === "figure") return `\n    VISUAL figure ${v.id}${v.caption ? ` caption "${v.caption}"` : ""}`
  if (v.type === "chart") return `\n    VISUAL chart: ${chart(v.chart)}`
  if (v.type === "charts") return v.charts.map((c) => `\n    VISUAL chart: ${chart(c)}`).join("")
  return `\n    VISUAL scene: ${JSON.stringify(v.scene)}${v.caption ? ` caption "${v.caption}"` : ""}`
}

function show(s: Step, i: number): string {
  switch (s.kind) {
    case "learn": return `${i} LEARN "${s.title}": ${s.body.join(" / ")}${s.callout ? ` {${s.callout.tone}: ${s.callout.text}}` : ""}${visual(s.visual)}`
    case "recap": return `${i} RECAP: ${s.points.join(" | ")}`
    case "choice": return `${i} CHOICE [${s.id}] ${s.prompt} ${s.options.map((o, k) => `${k === s.answer ? "(*)" : "( )"} ${o}`).join("  ")} => ${s.explain}${visual(s.visual)}`
    case "truefalse": return `${i} TF [${s.id}] "${s.statement}" = ${s.answer} => ${s.explain}${visual(s.visual)}`
    case "numeric": return `${i} NUM [${s.id}] ${s.prompt} = ${s.prefix ?? ""}${s.answer}${s.suffix ?? ""} (±${s.tolerance}) => ${s.explain}${visual(s.visual)}`
    case "match": return `${i} MATCH [${s.id}] ${s.prompt} ${s.pairs.map(([a, b]) => `{${a} = ${b}}`).join(" ")} => ${s.explain}`
    case "tap": return `${i} TAP [${s.id}] ${s.prompt} targets ${JSON.stringify(s.targets)} => ${s.explain}\n    CHART: ${chart(s.chart)}`
  }
}

const want = process.argv.slice(2)
for (const ref of ALL_LESSONS) {
  const id = ref.lesson.id
  if (!want.some((w) => id === w || id.startsWith(w + "-"))) continue
  const c = LESSON_CONTENT[id]
  console.log(`\n### ${id}  "${ref.lesson.title}"  sources: ${c.sources.join("; ")}`)
  c.steps.forEach((s, i) => console.log(show(s, i)))
}
