import "server-only"

// Tiny in-memory cache for slow external calls (Stripe lists take ~0.6s and
// were fetched on every page load). Concurrent callers share one in-flight
// request; failures are not cached. "Refresh data" in the console clears it.

type Entry = { at: number; value: Promise<unknown> }
const store = new Map<string, Entry>()

export function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as Promise<T>
  const value = load()
  store.set(key, { at: Date.now(), value })
  value.catch(() => {
    if (store.get(key)?.value === value) store.delete(key)
  })
  return value
}

export function clearCache() {
  store.clear()
}
