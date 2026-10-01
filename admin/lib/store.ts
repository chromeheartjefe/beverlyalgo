import "server-only"

import { existsSync } from "node:fs"
import { mkdir, readFile, rename, writeFile } from "node:fs/promises"
import path from "node:path"

// Small local JSON store for things the console owns itself: the ideas board,
// AI briefings and the AI call log. It lives in admin/data/ (git-ignored) on
// this machine only, because the console's database logins are read-only for
// customer data by design. Plain JSON on purpose: easy to back up, and Claude
// can read admin/data/ideas.json directly when you want to work on an idea.

function dataDir(): string {
  if (process.env.ADMIN_DATA_DIR) return process.env.ADMIN_DATA_DIR
  // `npm run admin` runs from the repo root; `next dev` inside admin/ runs from admin/
  const fromRoot = path.join(process.cwd(), "admin")
  return existsSync(path.join(fromRoot, "next.config.mjs")) ? path.join(fromRoot, "data") : path.join(process.cwd(), "data")
}

export class StoreError extends Error {}

/**
 * The stored value, or `fallback` only when the file doesn't exist yet. Any
 * other problem (bad JSON after a hand edit, a file lock) throws, so a write
 * can never replace real data with the empty fallback.
 */
export async function readStore<T>(name: string, fallback: T): Promise<T> {
  const file = path.join(dataDir(), `${name}.json`)
  let text: string
  try {
    text = await readFile(file, "utf8")
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback
    throw new StoreError(`Couldn't read admin/data/${name}.json (${(err as Error).message}). Nothing was changed.`)
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new StoreError(`admin/data/${name}.json isn't valid JSON (maybe a hand edit). Fix or restore it; nothing was changed.`)
  }
}

// One write at a time per file, so two quick clicks can't interleave
const queues = new Map<string, Promise<unknown>>()

export async function updateStore<T>(name: string, fallback: T, fn: (current: T) => T): Promise<T> {
  const prev = queues.get(name) ?? Promise.resolve()
  const next = prev.then(async () => {
    const dir = dataDir()
    await mkdir(dir, { recursive: true })
    const current = await readStore(name, fallback)
    const updated = fn(current)
    const file = path.join(dir, `${name}.json`)
    const tmp = `${file}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify(updated, null, 2), "utf8")
    await rename(tmp, file)
    return updated
  })
  queues.set(name, next.catch(() => undefined))
  return next
}
