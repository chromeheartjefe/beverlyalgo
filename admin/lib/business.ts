import "server-only"

import { cache } from "react"

import { AI_BUDGET_USD } from "~/lib/format"
import { getFunnelData } from "~/lib/queries/funnel"
import {
  type AcademyMetrics,
  type Activation,
  type AdoptionRow,
  type FreeTrial,
  getAcademyMetrics,
  getActivation,
  getAtRiskPayers,
  getFeatureAdoption,
  getFreeTrial,
  getGrowth,
  getGrowthSeries,
  getLifecycle,
  getUnitCosts,
  type Growth,
  type LifecycleFunnel,
  type UnitCosts,
} from "~/lib/queries/metrics"
import { getKpis, getMonthSpend } from "~/lib/queries/overview"
import { getStripeData, mrr, revenueByMonth } from "~/lib/queries/revenue"

const DAY = 86400_000
const DAYS_STALE = 7

type Revenue = {
  mrr: number
  arr: number
  liveSubs: number
  canceling: number
  pastDue: number
  revenue30d: number
  revenuePrev30d: number
  revenue12m: number
  payingCustomers12m: number
  months: { month: string; revenue: number }[]
  refunds12m: number
  disputes12m: number
}

type Checkout = { opens30d: number; paid30d: number; abandoned30d: number; openers30d: number; buyers30d: number }

export type Business = {
  generatedAt: string
  kpis: NonNullable<Awaited<ReturnType<typeof getKpis>>>
  growth: Growth
  activation: Activation | null
  lifecycle: LifecycleFunnel | null
  adoption: AdoptionRow[]
  series: { day: string; signups: number; active: number }[]
  revenue: Revenue | null
  checkout: Checkout | null
  checkoutState: "ok" | "no-key" | "no-permission" | "error"
  ai: { spendMonth: number; budget: number; estimatedRows: number; units: UnitCosts | null }
  freeTrial: FreeTrial | null
  academy: AcademyMetrics | null
  atRisk: { total: number; quiet: number }
}

function sumPaid(charges: { paid: boolean; amount: number; refunded: number; created: Date }[], from: number, to: number) {
  return charges
    .filter((c) => c.paid && c.created.getTime() >= from && c.created.getTime() < to)
    .reduce((t, c) => t + c.amount - c.refunded, 0)
}

/** Everything the console knows about the business right now (one per request) */
export const loadBusiness = cache(async (): Promise<Business | null> => {
  const [kpis, growth, activation, lifecycle, adoption, series, month, units, freeTrial, academy, risk, stripeData, funnel] = await Promise.all([
    getKpis(),
    getGrowth(),
    getActivation(),
    getLifecycle(),
    getFeatureAdoption(),
    getGrowthSeries(30),
    getMonthSpend(),
    getUnitCosts(),
    getFreeTrial(),
    getAcademyMetrics(),
    getAtRiskPayers(),
    getStripeData().catch(() => null),
    getFunnelData().catch(() => ({ state: "error" as const })),
  ])
  if (!kpis || !growth) return null

  const now = Date.now()
  let revenue: Revenue | null = null
  if (stripeData) {
    const live = stripeData.subs.filter((s) => s.status === "active" || s.status === "past_due" || s.status === "trialing")
    const m = mrr(stripeData.subs)
    const paidCharges = stripeData.charges.filter((c) => c.paid)
    revenue = {
      mrr: m,
      arr: m * 12,
      liveSubs: live.length,
      canceling: live.filter((s) => s.canceling).length,
      pastDue: stripeData.subs.filter((s) => s.status === "past_due" || s.status === "unpaid").length,
      revenue30d: sumPaid(stripeData.charges, now - 30 * DAY, now + DAY),
      revenuePrev30d: sumPaid(stripeData.charges, now - 60 * DAY, now - 30 * DAY),
      revenue12m: paidCharges.reduce((t, c) => t + c.amount - c.refunded, 0),
      payingCustomers12m: new Set(paidCharges.map((c) => c.customerId).filter(Boolean)).size,
      months: revenueByMonth(stripeData.charges),
      refunds12m: stripeData.charges.filter((c) => c.refunded > 0).length,
      disputes12m: stripeData.charges.filter((c) => c.disputed).length,
    }
  }

  let checkout: Checkout | null = null
  if (funnel.state === "ok") {
    const recent = funnel.sessions.filter((s) => now - s.created.getTime() < 30 * DAY)
    checkout = {
      opens30d: recent.length,
      paid30d: recent.filter((s) => s.status === "paid").length,
      abandoned30d: recent.filter((s) => s.status === "abandoned").length,
      openers30d: new Set(recent.map((s) => s.userId)).size,
      buyers30d: new Set(recent.filter((s) => s.status === "paid").map((s) => s.userId)).size,
    }
  }

  const quiet = risk.filter((r) => !r.last_active || now - new Date(r.last_active).getTime() > DAYS_STALE * DAY).length

  return {
    generatedAt: new Date().toISOString(),
    kpis,
    growth,
    activation,
    lifecycle,
    adoption,
    series,
    revenue,
    checkout,
    checkoutState: funnel.state,
    ai: { spendMonth: month.spend, budget: AI_BUDGET_USD, estimatedRows: month.estimated, units },
    freeTrial,
    academy,
    atRisk: { total: risk.length, quiet },
  }
})

const r2 = (n: number) => Math.round(n * 100) / 100
const share = (a: number, b: number) => (b > 0 ? r2((a / b) * 100) : null)

/**
 * The numbers handed to the AI analyst: aggregates only, no emails, names or
 * ids, so nothing personal leaves this machine.
 */
export function aiSnapshot(b: Business) {
  const weekly = [0, 1, 2, 3].map((w) => {
    const slice = b.series.slice(Math.max(0, b.series.length - 7 * (w + 1)), b.series.length - 7 * w)
    return { weeksAgo: w, signups: slice.reduce((t, d) => t + d.signups, 0), peakDailyActive: Math.max(0, ...slice.map((d) => d.active)) }
  })
  return {
    generatedAt: b.generatedAt,
    product: "EntrixAlgo: AI trading tools SaaS (Chart Analysis from screenshots, AI trading bot, AI screener, trade journal + calendar, TradingView indicator, free Academy course). Free plan + Pro at $49/month or $299 lifetime.",
    users: {
      total: b.kpis.total,
      verifiedEmailPct: share(b.kpis.verified, b.kpis.total),
      paying: { monthly: b.kpis.monthly, lifetime: b.kpis.lifetime, manualOrComped: b.kpis.manual },
      freeToPaidPct: share(b.kpis.monthly + b.kpis.lifetime, b.kpis.total),
    },
    growth: {
      signupsLast7d: b.growth.signups_7d,
      signupsPrev7d: b.growth.signups_prev_7d,
      signupsLast30d: b.growth.signups_30d,
      signupsPrev30d: b.growth.signups_prev_30d,
      weekly,
    },
    engagement: {
      activeToday: b.growth.active_today,
      activeLast7d: b.growth.active_7d,
      activePrev7d: b.growth.active_prev_7d,
      activeLast30d: b.growth.active_30d,
      activePrev30d: b.growth.active_prev_30d,
      stickinessDauOverMauPct: share(b.growth.avg_daily_7d, b.growth.active_30d),
      activationWithin7dPct: b.activation ? share(b.activation.activated, b.activation.cohort) : null,
      activationCohortSize: b.activation?.cohort ?? null,
      medianHoursToFirstValue: b.activation?.median_hours != null ? r2(b.activation.median_hours) : null,
      featureAdoption30d: b.adoption.map((a) => ({ feature: a.label, users: a.users, uses: a.uses })),
    },
    lifecycleFunnelAllTime: b.lifecycle,
    revenue: b.revenue
      ? {
          mrrUsd: r2(b.revenue.mrr),
          arrRunRateUsd: r2(b.revenue.arr),
          liveSubscriptions: b.revenue.liveSubs,
          canceling: b.revenue.canceling,
          pastDue: b.revenue.pastDue,
          netRevenueLast30dUsd: r2(b.revenue.revenue30d),
          netRevenuePrev30dUsd: r2(b.revenue.revenuePrev30d),
          netRevenueSinceSep2026Usd: r2(b.revenue.revenue12m),
          payingCustomersSinceSep2026: b.revenue.payingCustomers12m,
          refundsSinceSep2026: b.revenue.refunds12m,
          disputesSinceSep2026: b.revenue.disputes12m,
        }
      : "Stripe not connected",
    checkoutLast30d: b.checkout ?? `unavailable (${b.checkoutState})`,
    aiCosts: {
      spendThisMonthUsd: r2(b.ai.spendMonth),
      monthlyBudgetUsd: b.ai.budget,
      last30dUsd: b.ai.units ? r2(b.ai.units.cost_30d) : null,
      last30dOnPayingUsersUsd: b.ai.units ? r2(b.ai.units.cost_paying_30d) : null,
      last30dOnFreeUsersUsd: b.ai.units ? r2(b.ai.units.cost_free_30d) : null,
    },
    freeAnalysisTrial: b.freeTrial,
    academy: b.academy,
    churnWatch: { payingAccounts: b.atRisk.total, quietOver7Days: b.atRisk.quiet },
  }
}
