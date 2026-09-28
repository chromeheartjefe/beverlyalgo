import { sql } from "drizzle-orm"

import { markIndicatorInvited } from "~/app/actions"
import { ActionButton } from "~/components/action-button"
import { Badge, Card, PageHeader, PlanBadge, Table, Td, UserLink } from "~/components/ui"
import { rows } from "~/lib/db"
import { ago, dateTime, PLAN_KIND, type PlanKind } from "~/lib/format"

export const dynamic = "force-dynamic"

type Req = { id: string; email: string; plan_kind: PlanKind; username: string; requested_at: string; invited_at: string | null }

export default async function IndicatorPage() {
  const [pending, invited] = await Promise.all([
    rows<Req>(sql`
      SELECT u.id, u.email, ${PLAN_KIND()} AS plan_kind, u.tradingview_username AS username,
        u.indicator_requested_at AS requested_at, u.indicator_invited_at AS invited_at
      FROM users u
      WHERE u.indicator_requested_at IS NOT NULL AND u.indicator_invited_at IS NULL
      ORDER BY u.indicator_requested_at ASC
    `),
    rows<Req>(sql`
      SELECT u.id, u.email, ${PLAN_KIND()} AS plan_kind, u.tradingview_username AS username,
        u.indicator_requested_at AS requested_at, u.indicator_invited_at AS invited_at
      FROM users u
      WHERE u.indicator_invited_at IS NOT NULL
      ORDER BY u.indicator_invited_at DESC LIMIT 50
    `),
  ])

  return (
    <div className="space-y-5">
      <PageHeader
        title="Indicator queue"
        sub="Add each user to the invite-only script on TradingView, then mark them invited so their dashboard shows access. Oldest first."
      />

      <Card title={`Waiting (${pending.length})`}>
        <Table head={["TradingView", "User", "Plan", "Requested", "Waiting", ""]} empty={pending.length === 0}>
          {pending.map((r) => {
            const hours = (Date.now() - new Date(r.requested_at).getTime()) / 3_600_000
            return (
              <tr key={r.id}>
                <Td>
                  <a href={`https://www.tradingview.com/u/${encodeURIComponent(r.username)}/`} target="_blank" rel="noreferrer" className="text-purple-300 hover:underline">
                    @{r.username} ↗
                  </a>
                </Td>
                <Td><UserLink id={r.id}>{r.email}</UserLink></Td>
                <Td><PlanBadge kind={r.plan_kind} /></Td>
                <Td>{dateTime(r.requested_at)}</Td>
                <Td>{hours > 48 ? <Badge color="red">{ago(r.requested_at)} (over 48h)</Badge> : ago(r.requested_at)}</Td>
                <Td>
                  <ActionButton label="Mark invited" confirmLabel="Added on TradingView?" run={markIndicatorInvited.bind(null, r.id)} />
                </Td>
              </tr>
            )
          })}
        </Table>
      </Card>

      <Card title="Recently invited">
        <Table head={["TradingView", "User", "Requested", "Invited"]} empty={invited.length === 0}>
          {invited.map((r) => (
            <tr key={r.id}>
              <Td>@{r.username}</Td>
              <Td><UserLink id={r.id}>{r.email}</UserLink></Td>
              <Td>{dateTime(r.requested_at)}</Td>
              <Td>{dateTime(r.invited_at)}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
