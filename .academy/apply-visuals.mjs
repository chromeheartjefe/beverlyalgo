// Adds visuals to lesson steps from the patch files in .academy/visuals/.
//   node .academy/apply-visuals.mjs            apply every patch file
//   node .academy/apply-visuals.mjs u1-u2      apply .academy/visuals/u1-u2.mjs only
//
// A patch is { lesson: "u1-what-is-a-market", step: "<exact step title>", scene: {...}, caption?: "..." }.
// The visual is written into the step right after its `body`. A step that
// already has a visual is left alone, so running this twice changes nothing.
// A patch with `replace: true` swaps out the scene the step already has (only
// scenes this script wrote; charts and figures are never touched).
//
// The patch files record what was applied. Small later edits (a word, a tone)
// are made in the lesson files, which are the source of truth.
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, "..")

const isIdent = (key) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)

/** Value as TypeScript source: short things on one line, long things broken up */
function ser(value, indent) {
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  const pad = " ".repeat(indent)
  const inner = " ".repeat(indent + 2)
  if (Array.isArray(value)) {
    const flat = `[${value.map((v) => ser(v, 0)).join(", ")}]`
    if (flat.length + indent <= 150 && !flat.includes("\n")) return flat
    return `[\n${value.map((v) => `${inner}${ser(v, indent + 2)},`).join("\n")}\n${pad}]`
  }
  const entries = Object.entries(value).filter(([, v]) => v !== undefined)
  const flat = `{ ${entries.map(([k, v]) => `${isIdent(k) ? k : JSON.stringify(k)}: ${ser(v, 0)}`).join(", ")} }`
  if (flat.length + indent <= 150 && !flat.includes("\n")) return flat
  return `{\n${entries.map(([k, v]) => `${inner}${isIdent(k) ? k : JSON.stringify(k)}: ${ser(v, indent + 2)},`).join("\n")}\n${pad}}`
}

const BODY_END = "\n      ],\n"
const VISUAL = "\n      visual:"
const BLOCK_END = "\n      },\n"

const only = process.argv[2]
const files = readdirSync(join(here, "visuals")).filter((f) => f.endsWith(".mjs") && (!only || f === `${only}.mjs`)).sort()
let added = 0
let replaced = 0
let skipped = 0
let problems = 0

for (const file of files) {
  const { default: patches } = await import(pathToFileURL(join(here, "visuals", file)).href)
  for (const patch of patches) {
    const cut = patch.lesson.indexOf("-")
    const path = join(root, "content", "academy", patch.lesson.slice(0, cut), `${patch.lesson.slice(cut + 1)}.ts`)
    let raw
    try {
      raw = readFileSync(path, "utf8")
    } catch {
      console.log(`✗ ${patch.lesson}: no such lesson file`)
      problems++
      continue
    }
    const eol = raw.includes("\r\n") ? "\r\n" : "\n"
    let text = raw.replace(/\r\n/g, "\n")
    const titleLine = `      title: ${JSON.stringify(patch.step)},\n`
    const at = text.indexOf(titleLine)
    if (at < 0 || text.indexOf(titleLine, at + 1) >= 0) {
      console.log(`✗ ${patch.lesson}: step "${patch.step}" ${at < 0 ? "not found" : "is not unique"}`)
      problems++
      continue
    }
    const stepEnd = text.indexOf("\n    },", at)
    const bodyEnd = text.indexOf(BODY_END, at)
    if (bodyEnd < 0 || bodyEnd > stepEnd) {
      console.log(`✗ ${patch.lesson}: couldn't find the body of "${patch.step}"`)
      problems++
      continue
    }
    const old = text.slice(at, stepEnd).indexOf(VISUAL)
    if (old >= 0) {
      if (!patch.replace) {
        skipped++
        continue
      }
      // The old scene is either one line, or a block closed by a brace at the same indent
      const start = at + old + 1
      const lineEnd = text.indexOf("\n", start)
      const oneLine = !text.slice(start, lineEnd).endsWith("{")
      const blockEnd = text.indexOf(BLOCK_END, start)
      const end = oneLine ? lineEnd + 1 : blockEnd + BLOCK_END.length
      if ((!oneLine && blockEnd < 0) || !text.slice(start, end).includes('type: "scene"')) {
        console.log(`✗ ${patch.lesson}: "${patch.step}" has a visual that isn't a scene, left alone`)
        problems++
        continue
      }
      text = text.slice(0, start) + text.slice(end)
      replaced++
    } else {
      added++
    }
    const visual = { type: "scene", scene: patch.scene, caption: patch.caption }
    const insertAt = bodyEnd + BODY_END.length
    const next = `${text.slice(0, insertAt)}      visual: ${ser(visual, 6)},\n${text.slice(insertAt)}`
    writeFileSync(path, next.replace(/\n/g, eol))
  }
}
console.log(`${added} visuals added, ${replaced} replaced, ${skipped} already there, ${problems} problems`)
if (problems) process.exit(1)
