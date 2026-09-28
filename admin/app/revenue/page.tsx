import { sql } from "drizzle-orm"

import { MonthBars } from "~/components/charts"
import { Badge, Card, Muted, Notice, PageHeader, Stat, Table, Td, UserLink } from "~/components/ui"
import { rows } from "~/lib/db"
import { dateOnly, dateTime, num, usd } from "~/lib/format"
import { getStripeData, mrr, revenueByMonth } from "~/lib/queries/revenue"

export const dynamic = "force-dynamic"

export default async function RevenuePage() {
  const [data, userMap, events, lifetime] = await Promise.all([
    getStripeData(),
    rows<{ id: string; email: string; customer: string }>(sql`
      SELECT id, email, stripe_customer_id AS customer FROM users WHERE stripe_customer_id IS NOT NULL
    `),
    rows<{ id: string; type: string; created_at: string }>(sql`
      SELECT id, type, created_at FROM processed_stripe_events ORDER BY created_at DESC LIMIT 30
    `),
    rows<{ id: string; email: string; created_at: string }>(sql`
      SELECT id, email, created_at FROM users
      WHERE plan <> 'free' AND stripe_subscription_id IS NULL AND stripe_customer_id IS NOT NULL
      ORDER BY created_at DESC
    `),
  ])

  if (!data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Revenue" />
        <Notice>Set <code>STRIPE_ADMIN_KEY</code> (a read-only restricted key) in <code>admin/.env.local</code> to see revenue. See admin/README.md.</Notice>
      </div>
    )
  }

  const byCustomer = new Map(userMap.map((u) => [u.customer, u]))
  const who = (customerId: string | null) => {
    const u = customerId ? byCustomer.get(customerId) : undefined
    return u ? <UserLink id={u.id}>{u.email}</UserLink> : <Muted>{customerId ?? "no customer"}</Muted>
  }

  const live = data.subs.filter((s) => s.status === "active" || s.status === "past_due" || s.status === "trialing")
  const canceling = live.filter((s) => s.canceling)
  const pastDue = data.subs.filter((s) => s.status === "past_due" || s.status === "unpaid")
  const soon = Date.now() + 7 * 86400_000
  const renewing = live.filter((s) => !s.canceling && s.periodEnd && s.periodEnd.getTime() < soon)
  const ended30 = data.subs.filter((s) => s.status === "canceled" && s.periodEnd && Date.now() - s.periodEnd.getTime() < 30 * 86400_000)
  const monthly = revenueByMonth(data.charges)
  const thisMonth = monthly.at(-1)?.revenue ?? 0
  const refunds = data.charges.filter((c) => c.refunded > 0)
  const disputes = data.charges.filter((c) => c.disputed)
  const failed = data.charges.filter((c) => !c.paid)

  return (
    <div className="space-y-5">
      <PageHeader title="Revenue" sub="Live from Stripe (read-only key). Charges from the last 12 months." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="MRR" value={usd(mrr(data.subs))} hint={`${live.length} live subscriptions`} />
        <Stat label="Net revenue this month" value={usd(thisMonth)} />
        <Stat label="Canceling" value={num(canceling.length)} hint="paid up, won't renew" tone={canceling.length ? "warn" : undefined} />
        <Stat label="Past due" value={num(pastDue.length)} tone={pastDue.length ? "bad" : undefined} />
        <Stat label="Lifetime customers" value={num(lifetime.length)} />
        <Stat label="Refunds · disputes" value={`${refunds.length} · ${disputes.length}`} tone={disputes.length ? "bad" : undefined} />
      </div>

      <Card title="Net revenue" sub="Per month, paid charges minus refunds">
        <MonthBars data={monthly} dataKey="revenue" name="Net revenue" format="usd0" />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Live subscriptions">
          <Table head={["Customer", "Status", "Monthly", "Renews / ends", "Since"]} empty={live.length === 0}>
            {live.map((s) => (
              <tr key={s.id}>
                <Td>{who(s.customerId)}</Td>
                <Td>
                  <Badge color={s.status === "past_due" ? "red" : s.canceling ? "amber" : "green"}>{s.canceling ? "canceling" : s.status}</Badge>
                </Td>
                <Td className="tabular-nums">{usd(s.monthly)}</Td>
                <Td>{dateOnly(s.periodEnd)}</Td>
                <Td>{dateOnly(s.created)}</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <div className="space-y-4">
          <Card title="Renewing in the next 7 days">
            <Table head={["Customer", "Renews", "Amount"]} empty={renewing.length === 0}>
              {renewing.map((s) => (
                <tr key={s.id}><Td>{who(s.customerId)}</Td><Td>{dateOnly(s.periodEnd)}</Td><Td>{usd(s.monthly)}</Td></tr>
              ))}
            </Table>
          </Card>
          <Card title="Ended in the last 30 days">
            <Table head={["Customer", "Ended"]} empty={ended30.length === 0}>
              {ended30.map((s) => (
                <tr key={s.id}><Td>{who(s.customerId)}</Td><Td>{dateOnly(s.periodEnd)}</Td></tr>
              ))}
            </Table>
          </Card>
          <Card title="Lifetime customers">
            <Table head={["User", "Account created"]} empty={lifetime.length === 0}>
              {lifetime.map((u) => (
                <tr key={u.id}><Td><UserLink id={u.id}>{u.email}</UserLink></Td><Td>{dateOnly(u.created_at)}</Td></tr>
              ))}
            </Table>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card title="Recent payments">
          <Table head={["Date", "Customer", "Amount", "Flags"]} empty={data.charges.length === 0}>
            {data.charges.slice(0, 25).map((c) => (
              <tr key={c.id}>
                <Td>{dateTime(c.created)}</Td>
                <Td>{who(c.customerId)}</Td>
                <Td className="tabular-nums">{usd(c.amount)} {c.currency.toUpperCase()}</Td>
                <Td>
                  <span className="flex gap-1">
                    {!c.paid && <Badge color="red">failed</Badge>}
                    {c.refunded > 0 && <Badge color="amber">refunded {usd(c.refunded)}</Badge>}
                    {c.disputed && <Badge color="red">disputed</Badge>}
                  </span>
                </Td>
              </tr>
            ))}
          </Table>
          {failed.length > 0 && <p className="mt-3 text-xs text-rose-300">{failed.length} failed charge(s) in the last 12 months.</p>}
        </Card>

        <Card title="Processed Stripe webhooks" sub="What the site received and handled">
          <Table head={["When", "Event", "Id"]} empty={events.length === 0}>
            {events.map((e) => (
              <tr key={e.id}><Td>{dateTime(e.created_at)}</Td><Td>{e.type}</Td><Td><Muted>{e.id}</Muted></Td></tr>
            ))}
          </Table>
        </Card>
      </div>
    </div>
  )
}
