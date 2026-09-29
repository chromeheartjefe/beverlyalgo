// The AI reads the timeframe label off the screenshot as it appears there
// ("5", "5m", "5 minutes", "M5", "60", "Daily"...). Everything shown and
// stored uses one form: 5m, 1H, 4H, 1D, 1W, 1M (TradingView style: lowercase
// m = minutes, capital M = months).

type Unit = "s" | "m" | "h" | "d" | "w" | "mo"

const LABEL: Record<Unit, string> = { s: "s", m: "m", h: "H", d: "D", w: "W", mo: "M" }

function format(n: number, unit: Unit): string {
  // Whole hours / days read better in the bigger unit: 60 -> 1H, 240 -> 4H
  if (unit === "m" && n >= 60 && n % 60 === 0) {
    n /= 60
    unit = "h"
  }
  if (unit === "h" && n >= 24 && n % 24 === 0) {
    n /= 24
    unit = "d"
  }
  return `${n}${LABEL[unit]}`
}

function unitOf(u: string): Unit | null {
  if (u === "") return "m" // TradingView: a bare number is minutes
  if (u === "M") return "mo" // capital M alone = months
  const l = u.toLowerCase()
  if (/^(s|sec|secs|seconds?)$/.test(l)) return "s"
  if (/^(m|min|mins|minutes?)$/.test(l)) return "m"
  if (/^(h|hr|hrs|hours?)$/.test(l)) return "h"
  if (/^(d|days?)$/.test(l)) return "d"
  if (/^(w|wk|wks|weeks?)$/.test(l)) return "w"
  if (/^(mo|mon|mons|months?)$/.test(l)) return "mo"
  return null
}

/** "5", "5m", "5 min", "5 minutes", "M5" -> "5m"; "60", "1h", "H1" -> "1H"; unknown labels are returned unchanged. */
export function normalizeTimeframe(raw: unknown): string {
  const original = String(raw ?? "").trim()
  if (!original || original === "—") return "—"
  const t = original.replace(/\s+/g, " ").replace(/\.$/, "")

  const word = t.toLowerCase()
  if (word === "daily" || word === "day" || t === "D") return "1D"
  if (word === "weekly" || word === "week" || t === "W") return "1W"
  if (word === "monthly" || word === "month" || t === "M") return "1M"

  // MetaTrader style: M5, H1, D1, W1, MN1
  const mt = t.match(/^(MN|M|H|D|W)\s?(\d+)$/i)
  if (mt) {
    const p = mt[1].toUpperCase()
    const unit: Unit = p === "MN" ? "mo" : p === "M" ? "m" : (p.toLowerCase() as Unit)
    return format(Number(mt[2]), unit)
  }

  // Number + unit: 5, 5m, 5 min, 1h, 4 hours, 1D, 1W, 1M
  const nu = t.match(/^(\d+(?:\.\d+)?)\s?([a-zA-Z]*)$/)
  if (nu) {
    const unit = unitOf(nu[2])
    if (unit) return format(Number(nu[1]), unit)
  }

  return original
}
