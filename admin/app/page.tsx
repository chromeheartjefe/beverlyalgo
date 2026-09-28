import { StackedBars, TrendLine } from "~/components/charts"
import { Card, Notice, PageHeader, Stat } from "~/components/ui"
import { AI_BUDGET_USD, num, pct, usd, usdSmall } from "~/lib/format"
import {
  getActivePerDay,
  getAiCostPerDay,
  getAnalysesPerDay,
  getKpis,
  getMessagesPerDay,
  getMonthSpend,
  getSignupsPerDay,
  getTotals,
} from "~/lib/queries/overview"
import { getStripeData, mrr } from "~/lib/queries/revenue"

export const dynamic = "force-dynamic"

export default async function OverviewPage() {
  const [kpis, spend, signups, active, aiCost, analyses, messages, totals, stripeData] = await Promise.all([
    getKpis(),
    getMonthSpend(),
    getSignupsPerDay(),
    getActivePerDay(),
    getAiCostPerDay(),
    getAnalysesPerDay(),
    getMessagesPerDay(),
    getTotals(),
    getStripeData().catch(() => null),
  ])
  if (!kpis) return null

  const paying = kpis.monthly + kpis.lifetime
  const activeSubs = stripeData?.subs.filter((s) => s.status === "active" || s.status === "past_due") ?? []
  const canceling = activeSubs.filter((s) => s.canceling).length
  const budgetUse = spend.spend / AI_BUDGET_USD

  return (
    <div className="space-y-6">
      <PageHeader title="Overview" sub="Whole site at a glance. Days are UTC." />

      {!stripeData && (
        <Notice>Revenue figures need <code>STRIPE_ADMIN_KEY</code> in <code>admin/.env.local</code> (a read-only restricted key).</Notice>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Stat label="Total users" value={num(kpis.total)} hint={`+${kpis.new_7d} in 7 days`} />
        <Stat label="New today" value={num(kpis.new_1d)} hint={`${num(kpis.new_30d)} in 30 days`} />
        <Stat label="Active today" value={num(kpis.dau)} hint={`${num(kpis.wau)} this week · ${num(kpis.mau)} this month`} />
        <Stat label="Paying" value={num(paying)} hint={`${kpis.monthly} monthly · ${kpis.lifetime} lifetime · ${kpis.manual} manual`} />
        <Stat label="MRR" value={stripeData ? usd(mrr(stripeData.subs)) : "—"} hint={stripeData ? `${activeSubs.length} active subs${canceling ? ` · ${canceling} canceling` : ""}` : "Stripe not connected"} />
        <Stat label="Free → Pro" value={pct(paying, kpis.total)} hint="of all accounts pay" />
        <Stat label="Email verified" value={pct(kpis.verified, kpis.total)} hint={`${num(kpis.verified)} of ${num(kpis.total)}`} />
        <Stat
          label="AI spend this month"
          value={usd(spend.spend)}
          hint={`${(budgetUse * 100).toFixed(0)}% of ${usd(AI_BUDGET_USD, 0)} budget${spend.estimated ? " · some est." : ""}`}
          tone={budgetUse >= 0.9 ? "bad" : budgetUse >= 0.7 ? "warn" : undefined}
        />
        <Stat label="Analyses (30d)" value={num(totals?.analyses_30d)} />
        <Stat label="Bot messages (30d)" value={num(totals?.messages_30d)} />
        <Stat label="Trades logged (30d)" value={num(totals?.trades_30d)} />
        <Stat label="Screener scans (30d)" value={num(totals?.scans_30d)} hint={`real scans · ${num(totals?.scan_views_30d)} cached views`} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Signups" sub="New accounts per day, last 30 days">
          <TrendLine data={signups} dataKey="signups" name="Signups" />
        </Card>
        <Card title="Active users" sub="Accounts that did something recorded, per day">
          <TrendLine data={active} dataKey="active" name="Active users" />
        </Card>
        <Card title="AI cost" sub="Per day by feature, last 30 days">
          <StackedBars
            data={aiCost}
            format="usdSmall"
            series={[
              { key: "chart_analysis", name: "Chart Analysis" },
              { key: "chat", name: "AI Bot" },
              { key: "screener", name: "Screener" },
            ]}
          />
        </Card>
        <Card title="Chart analyses" sub="Per day by signal, last 30 days">
          <StackedBars
            data={analyses}
            series={[
              { key: "buy", name: "BUY" },
              { key: "sell", name: "SELL" },
              { key: "neutral", name: "No trade" },
            ]}
          />
        </Card>
        <Card title="AI Bot messages" sub="User messages per day, last 30 days" className="xl:col-span-2">
          <TrendLine data={messages} dataKey="messages" name="Messages" height={180} />
        </Card>
      </div>
    </div>
  )
}
