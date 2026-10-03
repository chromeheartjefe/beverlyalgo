// Rough text-fit check for the animated scenes: flags labels that are likely
// to overflow their box on the 720 x 440 canvas. It estimates widths from
// character counts, so treat a hit as "look at this one", not as proof.
//   npx tsx --tsconfig tsconfig.json .academy/check-scene-fit.ts
import { LESSON_CONTENT } from "../content/academy"

const W = 720
const PAD = 32
/** Average glyph width as a share of the font size (bold runs wider) */
const width = (text: string, size: number, bold = false) => text.length * size * (bold ? 0.56 : 0.5)
const lines = (text: string, size: number, box: number, bold = false) => Math.ceil(width(text, size, bold) / box)
// A browser also breaks a line after a hyphen
const longestWord = (text: string) => text.split(/[\s-]+/).reduce((a, b) => (b.length > a.length ? b : a), "")

let hits = 0
let scenes = 0
const flag = (where: string, msg: string) => {
  hits++
  console.log(`? ${where}: ${msg}`)
}

for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
  for (const step of lesson.steps) {
    if (!("visual" in step) || step.visual?.type !== "scene") continue
    scenes++
    const s = step.visual.scene
    const where = `${id} / ${"title" in step ? step.title : step.id} (${s.kind})`
    if ("title" in s && s.title && lines(s.title, 23, W - PAD * 2, true) > 1) flag(where, `title wraps: "${s.title}"`)
    const top = "title" in s && s.title ? 74 : 30
    switch (s.kind) {
      case "bars":
        for (const b of s.bars) {
          if (lines(b.label, 19, 190) > 2) flag(where, `bar label over 2 lines: "${b.label}"`)
          const max = s.max ?? Math.max(...s.bars.map((x) => x.to ?? x.value))
          const end = 236 + ((W - 236 - 150) * (b.to ?? b.value)) / max + 12
          if (b.display && end + width(b.display, 22, true) > W - 6) flag(where, `bar value runs off the canvas: "${b.display}"`)
        }
        break
      case "compare": {
        const n = s.columns.length
        const inner = (W - PAD * 2 - 14 * (n - 1)) / n - (n >= 3 ? 28 : 36)
        const size = n >= 3 ? 18 : 20
        for (const c of s.columns) {
          if (width(longestWord(c.title), n >= 3 ? 21 : 23, true) > inner - (c.icon ? 36 : 0)) flag(where, `column title word too wide: "${c.title}"`)
          const titleLines = lines(c.title, n >= 3 ? 21 : 23, inner - (c.icon ? 36 : 0), true)
          const body = c.points.reduce((sum, p) => sum + lines(p, size, inner - 16) * size * 1.25 + (n >= 3 ? 11 : 13), 0)
          if (titleLines * 27 + 14 + body > 440 - top - 28 - 34) flag(where, `column "${c.title}" is too tall`)
          for (const p of c.points) if (width(longestWord(p), size) > inner - 16) flag(where, `point word too wide: "${p}"`)
        }
        break
      }
      case "flow": {
        const n = s.nodes.length
        const perRow = n <= 4 ? n : Math.ceil(n / 2)
        const rows = Math.ceil(n / perRow)
        const nodeW = (W - PAD * 2 - 34 * (perRow - 1)) / perRow - 20
        const nodeH = Math.min(190, (440 - top - 30 - 26 * (rows - 1)) / rows) - 24
        const compact = perRow >= 4 || rows > 1
        for (const node of s.nodes) {
          const labelSize = compact ? 19 : 21
          const subSize = compact ? 15.5 : 17
          if (width(longestWord(node.label), labelSize, true) > nodeW) flag(where, `node word too wide: "${node.label}"`)
          const h = (node.icon ? (compact ? 26 : 32) + 8 : 0) + lines(node.label, labelSize, nodeW, true) * labelSize * 1.15 + (node.sub ? 8 + lines(node.sub, subSize, nodeW) * subSize * 1.2 : 0)
          if (h > nodeH) flag(where, `node too tall (${Math.round(h)} > ${Math.round(nodeH)}): "${node.label}"`)
        }
        break
      }
      case "cycle":
        for (const node of s.nodes) if (lines(node.label, 18, 160, true) > 2) flag(where, `cycle label over 2 lines: "${node.label}"`)
        if (s.center && lines(s.center, 19, 240) > 3) flag(where, `cycle centre over 3 lines: "${s.center}"`)
        break
      case "checklist": {
        const rowH = Math.min(60, (440 - top - 24) / s.items.length)
        const size = rowH < 50 ? 19.5 : 21.5
        for (const item of s.items) if (lines(item.text, size, W - PAD * 2 - 44) * size * 1.2 > rowH) flag(where, `item too tall for its row: "${item.text}"`)
        break
      }
      case "stat":
        for (const x of s.stats) {
          const size = s.stats.length === 1 ? 120 : s.stats.length === 2 ? 92 : 68
          const text = `${x.prefix ?? ""}${x.value.toFixed(x.decimals ?? 0)}${x.suffix ?? ""}`
          if (width(text, size, true) > (W - PAD * 2) / s.stats.length - 20) flag(where, `number too wide: "${text}"`)
        }
        break
      case "timeline": {
        const n = s.events.length
        const labelW = Math.min(200, ((W - 132) / Math.max(1, n - 1)) * 1.8)
        const room = (440 - top - 26) / 2 - 38
        s.events.forEach((e, i) => {
          if (width(e.time, 17, true) > labelW) flag(where, `time label too wide: "${e.time}"`)
          if (20 + 3 + lines(e.label, 18.5, labelW) * 18.5 * 1.2 > room) flag(where, `event label too tall: "${e.label}"`)
          // Labels near an edge are lined up with their marker instead of centred on it (see Timeline)
          const x = n === 1 ? W / 2 : 66 + ((W - 132) * i) / (n - 1)
          const left = x - labelW / 2 < 8 ? x - 8 : x + labelW / 2 > W - 8 ? x + 8 - labelW : x - labelW / 2
          if (left < 0 || left + labelW > W) flag(where, `event label leaves the canvas: "${e.label}"`)
        })
        break
      }
      case "grid": {
        const cellW = (W - PAD * 2 - 150) / s.cols.length - 6
        const cellH = Math.min(58, (440 - top - 26 - 42) / s.rows.length) - 6
        for (const col of s.cols) if (width(col, 18, true) > cellW) flag(where, `column heading too wide: "${col}"`)
        for (const row of s.rows) {
          if (lines(row.label, 18, 140, true) * 18 * 1.15 > cellH + 6) flag(where, `row label too tall: "${row.label}"`)
          for (const cell of row.cells) if (typeof cell === "string" && lines(cell, 19, cellW, true) * 19 * 1.2 > cellH) flag(where, `cell too tall: "${cell}"`)
        }
        break
      }
      case "path": {
        const n = s.points.length
        for (const m of s.marks ?? []) {
          const x = 46 + ((W - 92) * m.at) / (n - 1)
          const w = width(m.label, 18, true)
          const anchor = x < 136 ? "start" : x > W - 136 ? "end" : "middle"
          const left = anchor === "start" ? x : anchor === "end" ? x - w : x - w / 2
          if (left < 4 || left + w > W - 4) flag(where, `mark leaves the canvas: "${m.label}"`)
        }
        break
      }
      case "candles": {
        const n = s.groups.length
        const box = (W - PAD * 2 - 14 * (n - 1)) / n - 16
        const textH = s.groups.some((g) => g.note) ? (n >= 4 ? 102 : 92) : 50
        for (const g of s.groups) {
          const labelSize = n >= 4 ? 18 : 20
          const noteSize = n >= 3 ? 16 : 17.5
          const h = lines(g.label, labelSize, box, true) * labelSize * 1.15 + (g.note ? 5 + lines(g.note, noteSize, box) * noteSize * 1.2 : 0)
          if (h > textH - 10) flag(where, `group text too tall (${Math.round(h)} > ${textH - 10}): "${g.label}"`)
          if (width(longestWord(g.label), labelSize, true) > box) flag(where, `group label word too wide: "${g.label}"`)
        }
        break
      }
    }
  }
}
console.log(`\n${scenes} scenes checked, ${hits} to look at`)
