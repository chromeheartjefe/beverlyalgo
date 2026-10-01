import { Activity, Clock, Flame, GraduationCap, Grid3x3, HeartPulse, Repeat, ShieldAlert, Sparkles, Ticket, Trophy } from "lucide-react"

import { ShareBars } from "~/components/bars"
import { Badge, Card, Muted, PageHeader, PlanBadge, SectionLabel, Stat, Table, Td, UserLink } from "~/components/ui"
import { loadBusiness } from "~/lib/business"
import { ago, num } from "~/lib/format"
import { getAtRiskPayers, getCohorts, getPowerUsers } from "~/lib/queries/metrics"

export const dynamic = "force-dynamic"

const DAY = 86400_000
const rate = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "—")

function hours(h: number | null | undefined): string {
  if (h == null) return "—"
  if (h < 1) return `${Math.round(h * 60)} min`
  if (h < 48) return `${h.toFixed(1)} h`
  return `${(h / 24).toFixed(1)} days`
}

const weekLabel = (wk: string) => new Date(`${wk}T00:00:00Z`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })

export default async function EngagementPage() {
  const [b, cohorts, risk, power] = await Promise.all([loadBusiness(), getCohorts(8), getAtRiskPayers(), getPowerUsers(8)])
  if (!b) return null
  const g = b.growth
  const now = Date.now()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Activity}
        accent="fuchsia"
        eyebrow="Growth"
        title="Engagement"
        sub="Who comes back, what they use, and which paying accounts are drifting. Active = did something we record (sign-in, analysis, bot message, trade, scan)."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat accent="fuchsia" icon={Flame} label="Active today" value={num(g.active_today)} hint={`${g.avg_daily_7d.toFixed(1)} per day this week`} />
        <Stat accent="fuchsia" icon={Activity} label="Active · 7 days" value={num(g.active_7d)} hint={`${num(g.active_prev_7d)} the week before`} />
        <Stat accent="violet" icon={Activity} label="Active · 30 days" value={num(g.active_30d)} hint={`${num(g.active_prev_30d)} the 30 days before`} />
        <Stat accent="sky" icon={Repeat} label="Stickiness" value={rate(g.avg_daily_7d, g.active_30d)} hint="daily / monthly active" />
        <Stat accent="emerald" icon={Sparkles} label="Activation · week one" value={b.activation ? rate(b.activation.activated, b.activation.cohort) : "—"} hint={b.activation ? `${b.activation.cohort} signups 7 to 90 days old` : undefined} />
        <Stat accent="amber" icon={Clock} label="Time to first value" value={hours(b.activation?.median_hours)} hint="median, signup to first feature use" />
      </div>

      <Card
        accent="violet"
        icon={Grid3x3}
        title="Weekly retention cohorts"
        sub="Accounts grouped by signup week. Each cell: share of that group active in the Nth week after signing up (week 0 = signup week)."
      >
        <div className="-mx-1 overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-1 text-center text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-500">
                <th className="px-2 py-1 text-left font-medium">Signup week</th>
                <th className="px-2 py-1 font-medium">Accounts</th>
                {Array.from({ length: 8 }, (_, k) => <th key={k} className="px-2 py-1 font-medium">W{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c) => (
                <tr key={c.week}>
                  <td className="whitespace-nowrap px-2 py-1.5 text-left text-gray-300">{weekLabel(c.week)}</td>
                  <td className="num px-2 py-1.5 text-gray-200">{num(c.size)}</td>
                  {c.weeks.map((v, k) => (
                    <td
                      key={k}
                      className="num rounded-md px-2 py-1.5"
                      style={v === null ? undefined : { background: `rgba(139, 92, 246, ${0.06 + v * 0.7})`, color: v > 0.45 ? "#fff" : "#d1d5db" }}
                    >
                      {v === null ? <span className="text-gray-700">·</span> : `${Math.round(v * 100)}%`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {cohorts.length === 0 && <p className="px-3 py-6 text-center text-sm text-gray-500">No signups in the last 8 weeks.</p>}
        </div>
        <p className="mt-3 text-[11px] text-gray-500">Week 0 includes the sign-in that created the account, so it is close to 100% by design. W1 onward is the real retention signal.</p>
      </Card>

      <SectionLabel accent="rose">Churn watch</SectionLabel>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card
          className="xl:col-span-3"
          accent="rose"
          icon={ShieldAlert}
          title="Paying accounts by last activity"
          sub="Quietest first. A paying user who stops using the product is the most likely to cancel."
        >
          <Table head={["Account", "Plan", "Last active", "Feature uses (30d)", "Status"]} empty={risk.length === 0}>
            {risk.map((r) => {
              const idle = r.last_active ? (now - new Date(r.last_active).getTime()) / DAY : Infinity
              return (
                <tr key={r.id}>
                  <Td className="max-w-[14rem] truncate"><UserLink id={r.id}>{r.email}</UserLink></Td>
                  <Td><PlanBadge kind={r.kind} /></Td>
                  <Td>{ago(r.last_active)}</Td>
                  <Td className="num">{num(r.core_30d)}</Td>
                  <Td>
                    {idle > 14 ? <Badge color="red">at risk</Badge> : idle > 7 ? <Badge color="amber">quiet</Badge> : <Badge color="green">active</Badge>}
                  </Td>
                </tr>
              )
            })}
          </Table>
        </Card>

        <Card className="xl:col-span-2" accent="emerald" icon={Trophy} title="Power users" sub="Most feature uses, last 30 days">
          <Table head={["Account", "Uses", "Mix"]} empty={power.length === 0}>
            {power.map((p) => (
              <tr key={p.id}>
                <Td className="max-w-[11rem] truncate"><UserLink id={p.id}>{p.email}</UserLink></Td>
                <Td className="num">{num(p.actions)}</Td>
                <Td><Muted>{p.analyses} analyses · {p.messages} msgs · {p.trades} trades</Muted></Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <SectionLabel accent="violet">Features</SectionLabel>
      <div className="grid gap-4 xl:grid-cols-3">
        <Card accent="violet" icon={Sparkles} title="Feature adoption" sub="Accounts using each feature, last 30 days">
          <ShareBars rows={b.adoption.map((a) => ({ label: a.label, value: a.users, sub: a.key === "indicator" ? undefined : `${num(a.uses)} uses` }))} of={g.active_30d} ofLabel="active" />
        </Card>

        <Card accent="amber" icon={Ticket} title="Free analysis trial" sub="The one free Chart Analysis for Free accounts">
          {b.freeTrial ? (
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Claimed" value={num(b.freeTrial.claims)} hint={`${num(b.freeTrial.claims_30d)} in 30 days`} />
              <MiniStat label="Now paying" value={num(b.freeTrial.claimed_then_paid)} hint={rate(b.freeTrial.claimed_then_paid, b.freeTrial.claims) + " conversion"} />
            </div>
          ) : (
            <Muted>No data (table not readable yet).</Muted>
          )}
          <p className="mt-3 text-[11px] text-gray-500">Conversion counts anyone who claimed it and is on Pro now, whatever came first.</p>
        </Card>

        <Card accent="emerald" icon={GraduationCap} title="Entrix Academy" sub="Lessons and learners">
          {b.academy ? (
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Learners" value={num(b.academy.learners)} hint={`${num(b.academy.learners_7d)} this week`} />
              <MiniStat label="Lessons done · 30d" value={num(b.academy.lessons_30d)} hint={`${num(b.academy.completions)} all time`} />
              <MiniStat label="Avg lessons / learner" value={b.academy.avg_lessons.toFixed(1)} />
              <MiniStat label="Certificates" value={num(b.academy.certificates)} />
            </div>
          ) : (
            <div className="flex items-start gap-2 text-sm text-gray-400">
              <HeartPulse className="mt-0.5 size-4 shrink-0 text-gray-500" aria-hidden />
              Appears once the Academy is released and its tables exist on the live database.
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function MiniStat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
      <p className="text-[11px] text-gray-400">{label}</p>
      <p className="num mt-1 text-xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-gray-500">{hint}</p>}
    </div>
  )
}
