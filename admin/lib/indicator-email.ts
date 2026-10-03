import "server-only"

import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

// What the early access email carries: the indicator script and the picture
// of TradingView's Pine button. Both stay in the repo's local .indicator/
// folder (git-ignored), so the script is never part of the site's source and
// the email always sends the file as it is on this machine.

const SCRIPT_FILE = "EntrixAlgo Signals.pine"
const IMAGE_FILE = "pine-button.png"

function indicatorDir(): string {
  // `npm run admin` runs from the repo root; `next dev` inside admin/ runs from admin/
  const root = existsSync(path.join(process.cwd(), "admin", "next.config.mjs")) ? process.cwd() : path.join(process.cwd(), "..")
  return path.join(root, ".indicator")
}

export type IndicatorEmailAssets =
  | { ok: true; script: string; pineImage: Buffer }
  | { ok: false; message: string }

export async function loadIndicatorEmailAssets(): Promise<IndicatorEmailAssets> {
  const dir = indicatorDir()
  try {
    const [script, pineImage] = await Promise.all([readFile(path.join(dir, SCRIPT_FILE), "utf8"), readFile(path.join(dir, IMAGE_FILE))])
    if (!script.trim()) return { ok: false, message: `.indicator/${SCRIPT_FILE} is empty.` }
    return { ok: true, script, pineImage }
  } catch (err) {
    return { ok: false, message: `Couldn't read .indicator/${SCRIPT_FILE} or .indicator/${IMAGE_FILE} (${(err as Error).message}).` }
  }
}
