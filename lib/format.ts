// Small display formatters shared across the dashboard.

/**
 * A price with decimals that scale with its size. A flat 2 decimals collapses
 * sub-$1 assets (an ADA chart at 0.2055 moving in 0.001 steps, meme coins,
 * penny movers) into indistinguishable values, so precision follows the
 * price's own magnitude.
 */
export function fmtPrice(n: number | null): string {
  if (n === null) return "—"
  const abs = Math.abs(n)
  const decimals = abs >= 1 ? 2 : abs >= 0.01 ? 4 : abs >= 0.0001 ? 6 : 8
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

/** "just now", "5m ago", "3h ago", "2d ago" from an ISO date or a timestamp */
export function timeAgo(when: string | number): string {
  const ms = typeof when === "number" ? when : new Date(when).getTime()
  const mins = Math.max(0, Math.floor((Date.now() - ms) / 60000))
  if (mins < 1)  return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)  return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
