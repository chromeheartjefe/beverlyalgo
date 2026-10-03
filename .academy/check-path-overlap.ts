// Finds path scenes where a label is likely to sit on top of another label or on the price line.
// Estimates text boxes from character counts, so a hit means "look at this one".
//   npx tsx --tsconfig tsconfig.json .academy/check-path-overlap.ts
import { LESSON_CONTENT } from "../content/academy"

const W = 720
const H = 440
type Box = { name: string; x0: number; x1: number; y0: number; y1: number }
const hit = (a: Box, b: Box) => a.x0 < b.x1 && b.x0 < a.x1 && a.y0 < b.y1 && b.y0 < a.y1

let scenes = 0
let hits = 0
for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
  for (const step of lesson.steps) {
    if (!("visual" in step) || step.visual?.type !== "scene" || step.visual.scene.kind !== "path") continue
    scenes++
    const s = step.visual.scene
    const top = (s.title ? 74 : 30) + 40
    const xa = 46
    const xb = W - 46
    const yb = H - 62
    const all = s.points.concat(s.levels?.map((l) => l.price) ?? [])
    const lo = Math.min(...all)
    const hi = Math.max(...all)
    const n = s.points.length
    const x = (i: number) => xa + ((xb - xa) * i) / (n - 1)
    const y = (v: number) => yb - ((yb - top) * (v - lo)) / (hi - lo || 1)
    const boxes: Box[] = []
    for (const m of s.marks ?? []) {
      const w = m.label.length * 18 * 0.56
      const mx = x(m.at)
      const my = y(s.points[m.at])
      const anchor = mx < xa + 90 ? "start" : mx > xb - 90 ? "end" : "middle"
      const left = anchor === "start" ? mx : anchor === "end" ? mx - w : mx - w / 2
      const base = m.side === "below" ? my + 44 : my - 32
      boxes.push({ name: `mark "${m.label}"`, x0: left, x1: left + w, y0: base - 15, y1: base + 4 })
    }
    for (const l of s.levels ?? []) {
      if (!l.label) continue
      const w = l.label.length * 17 * 0.56
      const base = y(l.price) - 8
      boxes.push({ name: `level "${l.label}"`, x0: xb - w, x1: xb, y0: base - 14, y1: base + 4 })
    }
    const where = `${id} / ${"title" in step ? step.title : step.id}`
    for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) if (hit(boxes[a], boxes[b])) { hits++; console.log(`? ${where}: ${boxes[a].name} overlaps ${boxes[b].name}`) }
      if (boxes[a].y0 < (s.title ? 54 : 4) || boxes[a].y1 > H - 4) { hits++; console.log(`? ${where}: ${boxes[a].name} leaves the drawing area`) }
      // Does the price line run through the label?
      let crossed = false
      for (let i = 0; i < n - 1 && !crossed; i++) {
        for (let t = 0; t <= 1; t += 0.05) {
          const px = x(i + t)
          const py = y(s.points[i] + (s.points[i + 1] - s.points[i]) * t)
          if (px > boxes[a].x0 && px < boxes[a].x1 && py > boxes[a].y0 && py < boxes[a].y1) { crossed = true; break }
        }
      }
      if (crossed) { hits++; console.log(`? ${where}: the price line runs through ${boxes[a].name}`) }
    }
  }
}
console.log(`\n${scenes} path scenes checked, ${hits} to look at`)
