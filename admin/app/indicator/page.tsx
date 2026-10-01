import { sql } from "drizzle-orm"
import { CheckCircle2, Radar } from "lucide-react"

import { indicatorUpdateEmail } from "@/lib/email"
import { markIndicatorInvited, sendIndicatorUpdateToWaiting } from "~/app/actions"
import { ActionButton } from "~/components/action-button"
import { Badge, Card, PageHeader, PlanBadge, Table, Td, UserLink } from "~/components/ui"
import { rows } from "~/lib/db"
import { ago, dateTime, PLAN_KIND, type PlanKind } from "~/lib/format"

export const dynamic = "force-dynamic"

type Req = { id: string; email: string; plan_kind: PlanKind; username: string; requested_at: string; invited_at: string | null; update_sent_at?: string | null }

export default async function IndicatorPage() {
  const [pending, invited] = await Promise.all([
    rows<Req>(sql`
      SELECT u.id, u.email, ${PLAN_KIND()} AS plan_kind, u.tradingview_username AS username,
        u.indicator_requested_at AS requested_at, u.indicator_invited_at AS invited_at,
        (SELECT max(a.created_at) FROM admin_audit_log a
          WHERE a.action = 'indicator_update_sent' AND a.target_user_id = u.id) AS update_sent_at
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

  const notUpdated = pending.filter((r) => !r.update_sent_at).length
  // Preview with a sample handle; the real email uses each user's own
  const preview = indicatorUpdateEmail({ tradingviewUsername: "alex_trades" })

  return (
    <div className="space-y-5">
      <PageHeader
        icon={Radar}
        accent="violet"
        eyebrow="Operations"
        title="Indicator queue"
        sub="Add each user to the invite-only script on TradingView, then mark them invited so their dashboard shows access. Oldest first."
      />

      <Card
        title="Update email: indicator still in progress"
        sub="A short, polite note to everyone waiting: sorry for the wait, it's being finished, access in a few days. Each person gets it once."
        right={
          notUpdated > 0 ? (
            <ActionButton
              label={`Send to ${notUpdated} waiting`}
              confirmLabel={`Email ${notUpdated} user${notUpdated === 1 ? "" : "s"}?`}
              run={sendIndicatorUpdateToWaiting}
            />
          ) : (
            <Badge color="green">{pending.length ? "Everyone waiting has it" : "Nobody waiting"}</Badge>
          )
        }
      >
        <details className="group">
          <summary className="cursor-pointer text-sm text-purple-300 hover:text-white">
            Preview the email <span className="text-gray-500">(subject: {preview.subject})</span>
          </summary>
          <iframe
            title="Indicator update email preview"
            srcDoc={preview.html}
            sandbox=""
            className="mt-3 h-[640px] w-full rounded-xl border border-white/15 bg-[#09090f]"
          />
        </details>
      </Card>

      <Card title={`Waiting (${pending.length})`}>
        <Table head={["TradingView", "User", "Plan", "Requested", "Waiting", "Update email", ""]} empty={pending.length === 0}>
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
                <Td>{r.update_sent_at ? <Badge color="purple">Sent {ago(r.update_sent_at)}</Badge> : <span className="text-gray-500">Not sent</span>}</Td>
                <Td>
                  <ActionButton label="Mark invited" confirmLabel="Added on TradingView?" run={markIndicatorInvited.bind(null, r.id)} />
                </Td>
              </tr>
            )
          })}
        </Table>
      </Card>

      <Card accent="emerald" icon={CheckCircle2} title="Recently invited">
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
