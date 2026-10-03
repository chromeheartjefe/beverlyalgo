// Shared by the error screens (app/global-error.tsx, app/dashboard/error.tsx).

// Crashes that come from the framework or from the DOM being changed under
// React (translation, extensions), not from our own logic. After one of these
// the client router's state is corrupt, so reset() re-renders into the same
// error; a full reload is what actually recovers.
//
// The last three patterns are a version mismatch: a tab opened before a
// release asks for a page after it and gets code that expects modules the old
// page never loaded, so the bundler fails inside its own loader. The wording
// depends on the browser (seen 2026-10-03 as "e[a] is not a function"). A
// reload puts the tab on the new release.
const RECOVERABLE =
  /Rendered (more|fewer) hooks than|Failed to execute '(removeChild|insertBefore)' on 'Node'|ChunkLoadError|Loading chunk [\w-]+ failed|^\w\[\w\] is not a function|Cannot read properties of undefined \(reading 'call'\)|undefined is not an object \(evaluating '\w\[\w\]\.call'\)/i

const RELOAD_KEY = "entrix:global-error-reload"
const RELOAD_WINDOW_MS = 60_000

export const isRecoverable = (error: Error) => RECOVERABLE.test(error.message)

/**
 * Reloads the page for a recoverable crash and returns true when it did.
 * At most one automatic reload per minute, so a persistent error can't put
 * the page into a reload loop.
 */
export function autoReload(error: Error): boolean {
  if (!isRecoverable(error)) return false
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - last < RELOAD_WINDOW_MS) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    return false
  }
  window.location.reload()
  return true
}
