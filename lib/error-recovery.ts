// Shared by the error screens (app/global-error.tsx, app/dashboard/error.tsx).

// Crashes that come from the framework or from the DOM being changed under
// React (translation, extensions), not from our own logic. After one of these
// the client router's state is corrupt, so reset() re-renders into the same
// error; a full reload is what actually recovers.
const RECOVERABLE =
  /Rendered (more|fewer) hooks than|Failed to execute '(removeChild|insertBefore)' on 'Node'|ChunkLoadError|Loading chunk [\w-]+ failed/i

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
