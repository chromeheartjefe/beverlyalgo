import {
  Activity,
  BadgeDollarSign,
  BrainCircuit,
  Cpu,
  Crown,
  Filter,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  MailCheck,
  Repeat,
  Sparkles,
  Target,
  UserPlus,
  Users,
} from "lucide-react"
import Link from "next/link"

import { FunnelBars, ShareBars } from "~/components/bars"
import { MonthBars, Sparkline, TrendLine } from "~/components/charts"
import { InsightList } from "~/components/insight-list"
import { RefreshButton } from "~/components/refresh-button"
import { Badge, Card, Delta, Meter, Muted, Notice, PageHeader, PlanBadge, SectionLabel, Stat, Table, Td, UserLink } from "~/components/ui"
import { listBriefings } from "~/lib/briefing"
import { loadBusiness } from "~/lib/business"
import { ago, num, pct, usd } from "~/lib/format"
import { buildInsights } from "~/lib/insights"
import { change, getRecentSignups } from "~/lib/queries/metrics"

export const dynamic = "force-dynamic"

const rate = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—")

export default async function OverviewPage() {
  const [b, recent, briefings] = await Promise.all([loadBusiness(), getRecentSignups(6), listBriefings().catch(() => [])])
  if (!b) return null

  const g = b.growth
  const insights = buildInsights(b)
  const latest = briefings[0]
  const paying = b.kpis.monthly + b.kpis.lifetime
  const budgetUse = b.ai.spendMonth / b.ai.budget
  const updated = new Date(b.generatedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" })

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow="Command center"
        title="Overview"
        sub={`Live from Neon and Stripe · data from ${updated} UTC · Stripe cached up to 2 min`}
        right={
          <div className="flex gap-2">
            <RefreshButton />
            <Link href="/insights" className="inline-flex items-center gap-2 rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-3.5 py-2 text-sm font-medium text-fuchsia-100 transition-colors hover:bg-fuchsia-500/20">
              <BrainCircuit className="size-4" aria-hidden /> AI briefing
            </Link>
            <Link href="/ideas" className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2 text-sm font-medium text-amber-100 transition-colors hover:bg-amber-500/20">
              <Lightbulb className="size-4" aria-hidden /> Ideas
            </Link>
          </div>
        }
      />

      {!b.revenue && <Notice>Revenue needs <code>STRIPE_ADMIN_KEY</code> in <code>admin/.env.local</code> (a read-only restricted key).</Notice>}

      {/* Hero KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          size="lg"
          accent="emerald"
          icon={BadgeDollarSign}
          label="MRR"
          value={b.revenue ? usd(b.revenue.mrr) : "—"}
          delta={b.revenue ? <Delta value={change(b.revenue.revenue30d, b.revenue.revenuePrev30d)} label="revenue vs prev 30d" /> : undefined}
          hint={b.revenue ? `ARR run-rate ${usd(b.revenue.arr, 0)}` : "Stripe not connected"}
          spark={b.revenue ? <Sparkline data={b.revenue.months} dataKey="revenue" accent="emerald" /> : undefined}
        />
        <Stat
          size="lg"
          accent="violet"
          icon={Crown}
          label="Paying customers"
          value={num(paying)}
          hint={`${b.kpis.monthly} monthly · ${b.kpis.lifetime} lifetime${b.kpis.manual ? ` · ${b.kpis.manual} comped` : ""}`}
          delta={
            b.atRisk.total === 0 ? undefined
              : b.atRisk.quiet > 0 ? <Badge color="amber">{b.atRisk.quiet} quiet 7d+</Badge>
              : <Badge color="green">all active this week</Badge>
          }
        />
        <Stat
          size="lg"
          accent="sky"
          icon={UserPlus}
          label="New signups · 7 days"
          value={num(g.signups_7d)}
          delta={<Delta value={change(g.signups_7d, g.signups_prev_7d)} label="vs prev week" />}
          hint={`${num(g.signups_30d)} in 30 days`}
          spark={<Sparkline data={b.series} dataKey="signups" accent="sky" />}
        />
        <Stat
          size="lg"
          accent="fuchsia"
          icon={Activity}
          label="Active accounts · 7 days"
          value={num(g.active_7d)}
          delta={<Delta value={change(g.active_7d, g.active_prev_7d)} label="vs prev week" />}
          hint={`${num(g.active_today)} today · ${num(g.active_30d)} in 30 days`}
          spark={<Sparkline data={b.series} dataKey="active" accent="fuchsia" />}
        />
      </div>

      {/* Health strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <Stat accent="violet" icon={Target} label="Free → Pro" value={pct(paying, b.kpis.total)} hint="of all accounts pay" />
        <Stat
          accent="sky"
          icon={Sparkles}
          label="Activation · week one"
          value={b.activation ? rate(b.activation.activated, b.activation.cohort) : "—"}
          hint={b.activation ? `${b.activation.activated} of ${b.activation.cohort} signups used a feature` : undefined}
        />
        <Stat accent="fuchsia" icon={Repeat} label="Stickiness" value={rate(g.avg_daily_7d, g.active_30d)} hint="avg daily active / monthly active" />
        <Stat accent="emerald" icon={MailCheck} label="Email verified" value={pct(b.kpis.verified, b.kpis.total)} hint={`${num(b.kpis.total - b.kpis.verified)} unverified`} />
        <Stat
          accent="amber"
          icon={Cpu}
          label="AI spend this month"
          value={usd(b.ai.spendMonth)}
          tone={budgetUse >= 0.9 ? "bad" : budgetUse >= 0.7 ? "warn" : undefined}
          hint={`${Math.round(budgetUse * 100)}% of ${usd(b.ai.budget, 0)} budget`}
          spark={<Meter value={budgetUse} accent="amber" />}
        />
      </div>

      <SectionLabel accent="fuchsia">What needs attention</SectionLabel>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card
          className="xl:col-span-3"
          accent="amber"
          icon={Gauge}
          title="Signals"
          sub="Automatic checks on the live numbers, most urgent first"
          right={<Badge color="gray">{insights.length}</Badge>}
        >
          <InsightList items={insights} />
          <Link
            href="/insights"
            className="mt-4 flex items-center gap-3 rounded-xl border border-fuchsia-400/25 bg-gradient-to-r from-fuchsia-500/10 via-violet-500/10 to-transparent px-4 py-3 transition-colors hover:border-fuchsia-400/40"
          >
            <BrainCircuit className="size-5 shrink-0 text-fuchsia-300" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white">{latest ? latest.headline : "Get an AI briefing on these numbers"}</p>
              <p className="text-xs text-gray-400">{latest ? `AI analyst · ${ago(latest.at)} · open for actions and scores` : "Scores, ranked actions and risks from the AI analyst"}</p>
            </div>
          </Link>
        </Card>

        <Card className="xl:col-span-2" accent="sky" icon={Filter} title="Customer lifecycle" sub="All time, from signup to paying">
          {b.lifecycle && (
            <FunnelBars
              steps={[
                { label: "Signed up", value: b.lifecycle.signed_up },
                { label: "Verified email", value: b.lifecycle.verified },
                { label: "Used a core feature", value: b.lifecycle.activated, hint: "analysis, bot, journal or screener" },
                { label: "Paying", value: b.lifecycle.paying },
              ]}
            />
          )}
          {b.checkout && (
            <p className="mt-4 border-t border-white/[0.07] pt-3 text-xs text-gray-400">
              Last 30 days: <span className="num text-white">{b.checkout.openers30d}</span> people opened checkout,{" "}
              <span className="num text-emerald-300">{b.checkout.buyers30d}</span> paid.{" "}
              <Link href="/funnel" className="text-sky-300 hover:underline">Funnel →</Link>
            </p>
          )}
        </Card>
      </div>

      <SectionLabel accent="sky">Growth and usage</SectionLabel>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" accent="fuchsia" icon={Activity} title="Active accounts and signups" sub="Per day, last 30 days">
          <TrendLine data={b.series} dataKey="active" name="Active accounts" accent="fuchsia" compareKey="signups" compareName="Signups" height={240} />
        </Card>
        <Card className="xl:col-span-2" accent="violet" icon={Sparkles} title="Feature adoption" sub="Accounts using each feature, last 30 days">
          <ShareBars
            rows={b.adoption.map((a) => ({ label: a.label, value: a.users, sub: a.key === "indicator" ? undefined : `${num(a.uses)} uses` }))}
            of={g.active_30d}
            ofLabel="active"
          />
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" accent="emerald" icon={BadgeDollarSign} title="Net revenue" sub="Per month, paid charges minus refunds">
          {b.revenue ? <MonthBars data={b.revenue.months} dataKey="revenue" name="Net revenue" format="usd0" /> : <Muted>Stripe not connected.</Muted>}
        </Card>
        <Card
          className="xl:col-span-2"
          accent="sky"
          icon={Users}
          title="Newest accounts"
          right={<Link href="/users" className="text-xs text-sky-300 hover:underline">All users →</Link>}
        >
          <Table head={["Account", "Plan", "Used", "Joined"]} empty={recent.length === 0}>
            {recent.map((u) => (
              <tr key={u.id}>
                <Td className="max-w-[12rem] truncate">
                  <UserLink id={u.id}>{u.email}</UserLink>
                  {!u.verified && <span className="ml-1.5"><Badge color="amber">unverified</Badge></span>}
                </Td>
                <Td><PlanBadge kind={u.kind} /></Td>
                <Td className="num">{u.actions > 0 ? num(u.actions) : <Muted>—</Muted>}</Td>
                <Td><Muted>{ago(u.created_at)}</Muted></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  )
}
