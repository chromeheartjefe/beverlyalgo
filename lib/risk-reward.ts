// Shared Risk : Reward grading, used by the Risk Calculator and the Chart
// Analysis results so the same ratio always gets the same label and color.
// "Good" starts at 1:1.5, the minimum Chart Analysis accepts for a trade.

export type RRTier = "poor" | "acceptable" | "good" | "excellent"

export const RR_TIERS: Record<RRTier, { label: string; text: string; bg: string; border: string }> = {
  poor:       { label: "Poor",       text: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/25" },
  acceptable: { label: "Acceptable", text: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/25" },
  good:       { label: "Good",       text: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/25" },
  excellent:  { label: "Excellent",  text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
}

export function rrTier(ratio: number): RRTier {
  return ratio >= 2 ? "excellent" : ratio >= 1.5 ? "good" : ratio >= 1 ? "acceptable" : "poor"
}

/** Win rate (%) needed to break even at this ratio: risk / (risk + reward). */
export function breakevenWinRate(ratio: number): number {
  return 100 / (1 + ratio)
}
