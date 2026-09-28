// Response of GET /api/user/plan (sidebar plan card).
export type PlanStatus = {
  plan:      "free" | "pro"
  billing:   "monthly" | "lifetime" | "manual" | null
  // "ended": Stripe says the subscription is over (canceled, expired or
  // paused) while our DB still says Pro, i.e. the downgrade webhook is late
  status:    "active" | "canceling" | "past_due" | "ended" | null
  /** Monthly only: next renewal, or the last day of access when canceling */
  periodEnd: string | null
}
