import Link from "next/link"

import { StackedBars } from "~/components/charts"
import { Badge, Card, cx, Muted, Notice, PageHeader, PlanBadge, Stat, Table, Td, UserLink } from "~/components/ui"
import { ago, dateOnly, dateTime, num, pct, usd } from "~/lib/format"
import { type CheckoutRow, type CheckoutStatus, getFunnelData, median, perDay, signupsSince } from "~/lib/queries/funnel"

export const dynamic = "force-dynamic"

const PERIODS = [7, 30, 90, 365] as const
const DAY_MS = 86400_000

const STATUS_BADGE: Record<CheckoutStatus, [Parameters<typeof Badge>[0]["color"], string]> = {
  paid:       ["green", "paid"],
  processing: ["amber", "payment processing"],
  abandoned:  ["gray", "left without paying"],
  open:       ["blue", "still open"],
}

function FunnelStep({ label, value, of, prev, hint }: { label: string; value: number; of: number; prev?: number; hint: string }) {
  const width = of > 0 ? Math.max((value / of) * 100, value > 0 ? 1.5 : 0) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="text-gray-200">{label}</span>
        <span className="tabular-nums text-white">
          {num(value)}
          {prev !== undefined && <span className="ml-2 text-xs text-gray-400">{pct(value, prev)} of previous step</span>}
        </span>
      </div>
      <div className="h-2.5 bg-white/[0.06]">
        <div className="h-full bg-[#3987e5]" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-1 text-xs text-gray-500">{hint}</p>
    </div>
  )
}

export default async function FunnelPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const sp = await searchParams
  const days = PERIODS.find((p) => String(p) === sp.days) ?? 30
  const [data, signups] = await Promise.all([getFunnelData(), signupsSince(days)])

  const header = (
    <PageHeader
      title="Checkout funnel"
      sub="Live from Stripe (read-only key). A checkout open = a signed-in user clicked a Pro button and Stripe's payment page opened. Days are UTC."
      right={
        <div className="flex gap-1 rounded-xl border border-white/15 bg-surface p-1">
          {PERIODS.map((p) => (
            <Link
              key={p}
              href={`/funnel?days=${p}`}
              className={cx("rounded-lg px-3 py-1.5 text-sm", p === days ? "bg-purple-500/20 text-purple-200" : "text-gray-400 hover:text-white")}
            >
              {p === 365 ? "12 months" : `${p} days`}
            </Link>
          ))}
        </div>
      }
    />
  )

  if (data.state !== "ok") {
    return (
      <div className="space-y-5">
        {header}
        {data.state === "no-key" ? (
          <Notice>Set <code>STRIPE_ADMIN_KEY</code> (a read-only restricted key) in <code>admin/.env.local</code>. See admin/README.md.</Notice>
        ) : (
          <Notice>
            The Stripe key can&apos;t read checkout sessions yet. In Stripe → Developers → API keys, edit the admin
            restricted key and set <b>Checkout Sessions</b> to <b>Read</b>, then reload this page.
          </Notice>
        )}
      </div>
    )
  }

  const { sessions, users } = data
  const cutoff = Date.now() - days * DAY_MS
  const period = sessions.filter((s) => s.created.getTime() >= cutoff)

  const people = new Set(period.map((s) => s.userId))
  const paid = period.filter((s) => s.status === "paid")
  const buyers = new Set(paid.map((s) => s.userId))
  const revenue = paid.reduce((t, s) => t + s.amount, 0)
  const abandoned = period.filter((s) => s.status === "abandoned").length
  const stillOpen = period.filter((s) => s.status === "open").length
  const byPlan = (plan: CheckoutRow["plan"]) => {
    const list = period.filter((s) => s.plan === plan)
    return { opens: list.length, paid: list.filter((s) => s.status === "paid").length }
  }
  const monthly = byPlan("Monthly")
  const lifetime = byPlan("Lifetime")

  // Signups in the period → how many of them opened checkout → how many paid
  const signupSet = new Set(signups)
  const signupsOpened = new Set(period.filter((s) => signupSet.has(s.userId)).map((s) => s.userId))
  const signupsPaid = new Set(paid.filter((s) => signupSet.has(s.userId)).map((s) => s.userId))

  // All time: days from account creation to the first purchase
  const firstPurchase = new Map<string, Date>()
  for (const s of sessions) {
    if (s.status !== "paid") continue
    const seen = firstPurchase.get(s.userId)
    if (!seen || s.created < seen) firstPurchase.set(s.userId, s.created)
  }
  const daysToBuy = [...firstPurchase].flatMap(([id, at]) => {
    const u = users.get(id)
    return u ? [(at.getTime() - new Date(u.created_at).getTime()) / DAY_MS] : []
  })
  const medianDays = median(daysToBuy)

  // Opened checkout in the period, never bought, still on Free: follow-up list
  const everPaid = new Set(sessions.filter((s) => s.status === "paid").map((s) => s.userId))
  const hesitant = [...people]
    .filter((id) => !everPaid.has(id) && users.get(id)?.kind === "free")
    .map((id) => {
      const mine = period.filter((s) => s.userId === id)
      return {
        id,
        user: users.get(id)!,
        opens: mine.length,
        last: mine.reduce((a, s) => (s.created > a ? s.created : a), mine[0].created),
        plans: [...new Set(mine.map((s) => s.plan))].join(" + "),
      }
    })
    .sort((a, b) => b.last.getTime() - a.last.getTime())

  const who = (id: string) => {
    const u = users.get(id)
    return u ? <UserLink id={u.id}>{u.email}</UserLink> : <Muted>deleted or unknown account</Muted>
  }
  const chartDays = Math.min(days, 90)

  return (
    <div className="space-y-5">
      {header}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Checkout opens" value={num(period.length)} hint={`${num(people.size)} people`} />
        <Stat label="Purchases" value={num(paid.length)} hint={`${usd(revenue)} at checkout`} tone={paid.length ? "good" : undefined} />
        <Stat label="Checkout conversion" value={pct(buyers.size, people.size)} hint="people who opened and paid" />
        <Stat label="Left without paying" value={num(abandoned)} hint={stillOpen ? `${stillOpen} still open` : "sessions expire after 24h"} tone={abandoned ? "warn" : undefined} />
        <Stat label="Monthly ($49)" value={`${monthly.paid} / ${monthly.opens}`} hint="paid / opened" />
        <Stat label="Lifetime ($299)" value={`${lifetime.paid} / ${lifetime.opens}`} hint="paid / opened" />
      </div>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card
          className="xl:col-span-3"
          title="Checkout opens per day"
          sub={days > chartDays ? `Last ${chartDays} days` : `Last ${days} days`}
        >
          <StackedBars
            data={perDay(period, chartDays)}
            series={[{ key: "paid", name: "Paid" }, { key: "notPaid", name: "Didn't pay" }]}
          />
        </Card>

        <Card className="xl:col-span-2" title="New accounts → paying" sub={`Accounts created in the last ${days === 365 ? "12 months" : `${days} days`}`}>
          <div className="space-y-4">
            <FunnelStep label="Signed up" value={signups.length} of={signups.length} hint="new accounts" />
            <FunnelStep label="Opened checkout" value={signupsOpened.size} of={signups.length} prev={signups.length} hint="clicked a Pro button at least once" />
            <FunnelStep label="Paid" value={signupsPaid.size} of={signups.length} prev={signupsOpened.size} hint="bought Monthly or Lifetime" />
          </div>
          <p className="mt-5 border-t border-white/10 pt-3 text-xs text-gray-400">
            Median time from sign-up to first purchase:{" "}
            <span className="text-white">
              {medianDays == null ? "—" : medianDays < 1 ? "same day" : `${medianDays.toFixed(1)} days`}
            </span>{" "}
            <Muted>(all time, {daysToBuy.length} buyers)</Muted>
          </p>
        </Card>
      </div>

      <Card
        title="Opened checkout but didn't buy"
        sub="Still on Free and never paid. The warmest leads: they saw the price."
        right={<Badge color="amber">{num(hesitant.length)} people</Badge>}
      >
        <Table head={["User", "Tried", "Opens", "Last opened", "Signed up"]} empty={hesitant.length === 0}>
          {hesitant.slice(0, 100).map((h) => (
            <tr key={h.id}>
              <Td><UserLink id={h.id}>{h.user.email}</UserLink></Td>
              <Td>{h.plans}</Td>
              <Td className="tabular-nums">{h.opens}</Td>
              <Td>{ago(h.last)}</Td>
              <Td>{dateOnly(h.user.created_at)}</Td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card title="Recent checkout sessions">
        <Table head={["When", "User", "Now", "Plan", "Amount", "Result"]} empty={period.length === 0}>
          {period.slice(0, 30).map((s) => {
            const [color, label] = STATUS_BADGE[s.status]
            const u = users.get(s.userId)
            return (
              <tr key={s.id}>
                <Td>{dateTime(s.created)}</Td>
                <Td>{who(s.userId)}</Td>
                <Td>{u ? <PlanBadge kind={u.kind} /> : <Muted>—</Muted>}</Td>
                <Td>{s.plan}</Td>
                <Td className="tabular-nums">{usd(s.amount)} {s.currency.toUpperCase()}</Td>
                <Td><Badge color={color}>{label}</Badge></Td>
              </tr>
            )
          })}
        </Table>
      </Card>
    </div>
  )
}
