import { sql } from "drizzle-orm"
import { Bot, Calculator, Camera, Cpu, Crown, Layers, PieChart, Radar, Scale, TrendingDown, Users, Wallet } from "lucide-react"

import { StackedBars } from "~/components/charts"
import { Card, Meter, Muted, PageHeader, Stat, Table, Td, UserLink } from "~/components/ui"
import { loadBusiness } from "~/lib/business"
import { one, rows } from "~/lib/db"
import { USERS } from "~/lib/excluded"
import { AI_BUDGET_USD, COST, num, pct, usd, usdSmall } from "~/lib/format"
import { getAiCostPerDay, getMonthSpend } from "~/lib/queries/overview"

export const dynamic = "force-dynamic"

const FEATURE: Record<string, string> = { chart_analysis: "Chart Analysis", chat: "AI Bot", screener: "Screener", support: "Support chat" }

export default async function AiPage() {
  const [perDay, month, byModel, top, rejections, rejectTotals, unit, b] = await Promise.all([
    getAiCostPerDay(30),
    getMonthSpend(),
    rows<{ feature: string; model: string | null; effort: string | null; calls: number; pt: number; ct: number; cost: number }>(sql`
      SELECT feature, model, reasoning_effort AS effort, count(*)::int AS calls,
        sum(prompt_tokens)::int AS pt, sum(completion_tokens)::int AS ct, sum(${COST()})::float8 AS cost
      FROM ai_usage WHERE created_at >= now() - interval '30 days'
      GROUP BY feature, model, reasoning_effort ORDER BY cost DESC
    `),
    rows<{ id: string; email: string; calls: number; cost: number }>(sql`
      SELECT u.id, u.email, count(*)::int AS calls, sum(${COST("a.")})::float8 AS cost
      FROM ai_usage a JOIN ${USERS} u ON u.id = a.user_id
      WHERE a.created_at >= now() - interval '30 days'
      GROUP BY u.id, u.email ORDER BY cost DESC LIMIT 10
    `),
    rows<{ reason: string; n: number }>(sql`
      SELECT coalesce(meta::json->>'reason', 'unknown') AS reason, count(*)::int AS n
      FROM user_events WHERE type = 'analysis_rejected' AND created_at >= now() - interval '30 days'
      GROUP BY 1 ORDER BY n DESC
    `),
    one<{ rejected: number; analyses: number }>(sql`
      SELECT
        (SELECT count(*) FROM user_events WHERE type = 'analysis_rejected' AND created_at >= now() - interval '30 days')::int AS rejected,
        (SELECT count(*) FROM chart_analyses WHERE created_at >= now() - interval '30 days')::int AS analyses
    `),
    rows<{ feature: string; avg_cost: number; avg_out: number; n: number }>(sql`
      SELECT feature, avg(cost_usd)::float8 AS avg_cost, avg(completion_tokens)::float8 AS avg_out, count(*)::int AS n
      FROM ai_usage WHERE cost_usd IS NOT NULL AND created_at >= now() - interval '30 days'
      GROUP BY feature
    `),
    loadBusiness(),
  ])
  const u = b?.ai.units
  const rev30 = b?.revenue?.revenue30d ?? null
  const payingNow = b ? b.kpis.monthly + b.kpis.lifetime + b.kpis.manual : 0
  const perPaying = u && payingNow > 0 ? u.cost_paying_30d / payingNow : null
  const perFree = u && u.free_active_30d > 0 ? u.cost_free_30d / u.free_active_30d : null
  const arppu30 = rev30 !== null && payingNow > 0 ? rev30 / payingNow : null

  const spend30 = byModel.reduce((t, r) => t + r.cost, 0)
  const calls30 = byModel.reduce((t, r) => t + r.calls, 0)
  const per = (f: string) => unit.find((u) => u.feature === f)
  const attempts = (rejectTotals?.rejected ?? 0) + (rejectTotals?.analyses ?? 0)

  return (
    <div className="space-y-5">
      <PageHeader icon={Cpu} accent="amber" eyebrow="Money" title="AI & unit costs" sub="OpenAI spend from ai_usage. Rows before 2026-09-28 have no recorded cost and are estimated at the gpt-5.6-luna prices they ran on." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat accent="amber" icon={Wallet} label="This month" value={usd(month.spend)} hint={`of ${usd(AI_BUDGET_USD, 0)} budget`} tone={month.spend / AI_BUDGET_USD >= 0.9 ? "bad" : month.spend / AI_BUDGET_USD >= 0.7 ? "warn" : undefined} />
        <Stat accent="amber" icon={Cpu} label="Last 30 days" value={usd(spend30)} hint={`${num(calls30)} AI calls`} />
        <Stat accent="violet" icon={Camera} label="Per analysis" value={usdSmall(per("chart_analysis")?.avg_cost)} hint={per("chart_analysis") ? `avg ${num(Math.round(per("chart_analysis")!.avg_out))} output tokens` : "no tracked calls yet"} />
        <Stat accent="fuchsia" icon={Bot} label="Per bot message" value={usdSmall(per("chat")?.avg_cost)} hint={per("chat") ? `avg ${num(Math.round(per("chat")!.avg_out))} output tokens` : "no tracked calls yet"} />
        <Stat accent="sky" icon={Radar} label="Per screener scan" value={usdSmall(per("screener")?.avg_cost)} />
        <Stat accent="rose" icon={TrendingDown} label="Rejected screenshots" value={pct(rejectTotals?.rejected ?? 0, attempts)} hint={`${num(rejectTotals?.rejected)} of ${num(attempts)} attempts (30d)`} />
      </div>

      <Card accent="emerald" icon={Scale} title="Unit economics" sub="Last 30 days. Is each paying customer worth more than the AI they use, and what do free users cost?">
        {u ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <UnitTile icon={Crown} label="AI cost per paying account" value={usdSmall(perPaying)} hint={`${usd(u.cost_paying_30d)} across ${payingNow} paying`} />
            <UnitTile icon={Wallet} label="Revenue per paying account" value={arppu30 !== null ? usd(arppu30) : "—"} hint={rev30 !== null ? `${usd(rev30)} net revenue` : "Stripe not connected"} />
            <UnitTile icon={Users} label="AI cost per active free account" value={usdSmall(perFree)} hint={`${usd(u.cost_free_30d)} across ${u.free_active_30d} free accounts`} />
            <UnitTile
              icon={Calculator}
              label="AI as share of revenue"
              value={rev30 && rev30 > 0 ? `${Math.round((u.cost_30d / rev30) * 100)}%` : "—"}
              hint="lower is better · before Stripe fees"
              meter={rev30 && rev30 > 0 ? u.cost_30d / rev30 : undefined}
            />
          </div>
        ) : (
          <Muted>No data.</Muted>
        )}
      </Card>

      <Card accent="amber" icon={Layers} title="Spend per day" sub="By feature, last 30 days">
        <StackedBars
          data={perDay}
          format="usdSmall"
          height={260}
          series={[
            { key: "chart_analysis", name: "Chart Analysis" },
            { key: "chat", name: "AI Bot" },
            { key: "screener", name: "Screener" },
          ]}
        />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent="violet" icon={Cpu} title="By model and thinking level" sub="Last 30 days">
          <Table head={["Feature", "Model", "Thinking", "Calls", "Tokens in", "Tokens out", "Cost"]} empty={byModel.length === 0}>
            {byModel.map((r, i) => (
              <tr key={i}>
                <Td>{FEATURE[r.feature] ?? r.feature}</Td>
                <Td>{r.model ?? "untracked"}</Td>
                <Td>{r.effort ?? "—"}</Td>
                <Td className="tabular-nums">{num(r.calls)}</Td>
                <Td className="tabular-nums">{num(r.pt)}</Td>
                <Td className="tabular-nums">{num(r.ct)}</Td>
                <Td className="tabular-nums">{usdSmall(r.cost)}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card accent="fuchsia" icon={Users} title="Top users by spend" sub="Last 30 days, tracked calls only">
          <Table head={["User", "Calls", "Cost"]} empty={top.length === 0}>
            {top.map((u) => (
              <tr key={u.id}>
                <Td><UserLink id={u.id}>{u.email}</UserLink></Td>
                <Td className="tabular-nums">{num(u.calls)}</Td>
                <Td className="tabular-nums">{usdSmall(u.cost)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <Card accent="rose" icon={PieChart} title="Why screenshots get rejected" sub="Last 30 days. High NO_PRICE or LOW_QUALITY usually means users need the upload tips.">
        <Table head={["Reason", "Count"]} empty={rejections.length === 0}>
          {rejections.map((r) => (
            <tr key={r.reason}><Td>{r.reason}</Td><Td className="tabular-nums">{num(r.n)}</Td></tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}

function UnitTile({ icon: Icon, label, value, hint, meter }: { icon: typeof Cpu; label: string; value: string; hint?: string; meter?: number }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Icon className="size-3.5 text-emerald-300" aria-hidden />
        {label}
      </div>
      <p className="num mt-1.5 text-xl font-semibold text-white">{value}</p>
      {meter !== undefined && <div className="mt-2"><Meter value={meter} accent="emerald" warnAt={0.3} badAt={0.6} /></div>}
      {hint && <p className="mt-1 text-[11px] text-gray-500">{hint}</p>}
    </div>
  )
}
