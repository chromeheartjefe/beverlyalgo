import "server-only"

import type { Business } from "~/lib/business"
import { change } from "~/lib/queries/metrics"

// Plain rules over the live numbers (no AI, free, instant). They only speak
// when there is enough data for the statement to mean something.

export type Insight = {
  tone: "good" | "warn" | "bad" | "info"
  title: string
  detail: string
  href?: string
}

const pctText = (x: number) => `${Math.round(Math.abs(x) * 100)}%`
const ORDER = { bad: 0, warn: 1, good: 2, info: 3 } as const

export function buildInsights(b: Business): Insight[] {
  const out: Insight[] = []
  const g = b.growth

  // Growth
  const signups = change(g.signups_7d, g.signups_prev_7d)
  if (signups !== null && g.signups_7d + g.signups_prev_7d >= 5) {
    if (signups >= 0.25) out.push({ tone: "good", title: `Signups up ${pctText(signups)} this week`, detail: `${g.signups_7d} new accounts vs ${g.signups_prev_7d} the week before.`, href: "/users" })
    else if (signups <= -0.25) out.push({ tone: "warn", title: `Signups down ${pctText(signups)} this week`, detail: `${g.signups_7d} new accounts vs ${g.signups_prev_7d} the week before. Check whether a traffic source dried up.`, href: "/users" })
  }
  const active = change(g.active_7d, g.active_prev_7d)
  if (active !== null && g.active_7d + g.active_prev_7d >= 5) {
    if (active >= 0.25) out.push({ tone: "good", title: `Weekly active accounts up ${pctText(active)}`, detail: `${g.active_7d} accounts did something this week vs ${g.active_prev_7d}.`, href: "/engagement" })
    else if (active <= -0.25) out.push({ tone: "warn", title: `Weekly active accounts down ${pctText(active)}`, detail: `${g.active_7d} accounts did something this week vs ${g.active_prev_7d}.`, href: "/engagement" })
  }

  // Activation and verification
  if (b.activation && b.activation.cohort >= 10) {
    const rate = b.activation.activated / b.activation.cohort
    if (rate < 0.4) {
      out.push({
        tone: "warn",
        title: `Only ${Math.round(rate * 100)}% of signups try a feature in week one`,
        detail: `${b.activation.activated} of ${b.activation.cohort} recent signups ran an analysis, asked the bot, logged a trade or scanned within 7 days. Onboarding is the biggest lever.`,
        href: "/engagement",
      })
    } else {
      out.push({ tone: "good", title: `${Math.round(rate * 100)}% of signups activate in week one`, detail: `${b.activation.activated} of ${b.activation.cohort} recent signups used a core feature within 7 days.`, href: "/engagement" })
    }
  }
  if (b.kpis.total >= 20 && b.kpis.verified / b.kpis.total < 0.7) {
    out.push({
      tone: "warn",
      title: `${Math.round((1 - b.kpis.verified / b.kpis.total) * 100)}% of accounts never verified their email`,
      detail: `${b.kpis.total - b.kpis.verified} unverified accounts can't be reached reliably. A bulk resend is on the Users page.`,
      href: "/users?verified=no",
    })
  }

  // Money
  if (b.revenue) {
    if (b.revenue.pastDue > 0) out.push({ tone: "bad", title: `${b.revenue.pastDue} subscription${b.revenue.pastDue > 1 ? "s" : ""} past due`, detail: "A card failed. Stripe retries, but a personal nudge saves more of these.", href: "/revenue" })
    if (b.revenue.canceling > 0) out.push({ tone: "bad", title: `${b.revenue.canceling} subscriber${b.revenue.canceling > 1 ? "s are" : " is"} canceling`, detail: "Paid up but won't renew. Worth asking why before the period ends.", href: "/revenue" })
    const rev = change(b.revenue.revenue30d, b.revenue.revenuePrev30d)
    if (rev !== null && b.revenue.revenue30d + b.revenue.revenuePrev30d > 0) {
      if (rev >= 0.2) out.push({ tone: "good", title: `Revenue up ${pctText(rev)} vs the previous 30 days`, detail: `$${b.revenue.revenue30d.toFixed(0)} net in the last 30 days.`, href: "/revenue" })
      else if (rev <= -0.2) out.push({ tone: "warn", title: `Revenue down ${pctText(rev)} vs the previous 30 days`, detail: `$${b.revenue.revenue30d.toFixed(0)} net vs $${b.revenue.revenuePrev30d.toFixed(0)}.`, href: "/revenue" })
    }
  }
  if (b.checkout && b.checkout.openers30d >= 3) {
    const conv = b.checkout.buyers30d / b.checkout.openers30d
    if (conv < 0.25) {
      out.push({
        tone: "warn",
        title: `${b.checkout.openers30d - b.checkout.buyers30d} of ${b.checkout.openers30d} people left checkout without paying`,
        detail: "They wanted Pro enough to open Stripe. A follow-up email or a clearer pricing page could recover some.",
        href: "/funnel",
      })
    }
  }
  if (b.atRisk.quiet > 0) {
    out.push({ tone: "warn", title: `${b.atRisk.quiet} paying account${b.atRisk.quiet > 1 ? "s" : ""} quiet for 7+ days`, detail: "Paying users who stop using the product are the ones who cancel next.", href: "/engagement" })
  }

  // AI costs
  const budgetUse = b.ai.spendMonth / b.ai.budget
  if (budgetUse >= 0.9) out.push({ tone: "bad", title: `AI spend at ${Math.round(budgetUse * 100)}% of the monthly budget`, detail: `$${b.ai.spendMonth.toFixed(2)} of $${b.ai.budget}. The site stops AI features at the cap.`, href: "/ai" })
  else if (budgetUse >= 0.7) out.push({ tone: "warn", title: `AI spend at ${Math.round(budgetUse * 100)}% of the monthly budget`, detail: `$${b.ai.spendMonth.toFixed(2)} of $${b.ai.budget}.`, href: "/ai" })
  if (b.ai.units && b.revenue && b.ai.units.cost_30d > b.revenue.revenue30d && b.ai.units.cost_30d > 1) {
    out.push({ tone: "bad", title: "AI costs exceed revenue (30 days)", detail: `$${b.ai.units.cost_30d.toFixed(2)} on AI vs $${b.revenue.revenue30d.toFixed(2)} net revenue.`, href: "/ai" })
  }

  // Free trial
  if (b.freeTrial && b.freeTrial.claims >= 5) {
    const conv = b.freeTrial.claimed_then_paid / b.freeTrial.claims
    out.push({
      tone: conv >= 0.1 ? "good" : "info",
      title: `Free analysis converts ${Math.round(conv * 100)}% to Pro`,
      detail: `${b.freeTrial.claimed_then_paid} of ${b.freeTrial.claims} accounts that used their free analysis are now paying.`,
      href: "/engagement",
    })
  }

  // Engagement depth
  if (g.active_30d >= 10) {
    const stick = g.avg_daily_7d / g.active_30d
    if (stick < 0.1) out.push({ tone: "info", title: `Stickiness is ${Math.round(stick * 100)}% (daily / monthly active)`, detail: "Most active accounts come back only occasionally. Daily hooks (streaks, alerts, the Academy) help here.", href: "/engagement" })
    const top = b.adoption[0]
    const low = [...b.adoption].reverse().find((a) => a.key !== "indicator" && a.users > 0)
    if (top && low && top.key !== low.key) {
      out.push({ tone: "info", title: `${top.label} leads adoption, ${low.label} trails`, detail: `${top.users} vs ${low.users} accounts in the last 30 days.`, href: "/engagement" })
    }
  }

  return out.sort((a, b) => ORDER[a.tone] - ORDER[b.tone]).slice(0, 8)
}
