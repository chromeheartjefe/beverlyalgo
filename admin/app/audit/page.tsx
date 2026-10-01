import { sql } from "drizzle-orm"
import { ScrollText } from "lucide-react"

import { Badge, Card, Muted, PageHeader, Table, Td, UserLink } from "~/components/ui"
import { rows } from "~/lib/db"
import { dateTime } from "~/lib/format"

export const dynamic = "force-dynamic"

const LABEL: Record<string, [string, "gray" | "purple" | "green" | "amber" | "red" | "blue"]> = {
  mark_invited:        ["Marked invited", "green"],
  resend_verification: ["Resent verification", "blue"],
  resend_verification_all: ["Bulk verification resend", "blue"],
  indicator_update_sent: ["Indicator update email", "purple"],
  indicator_update_all:  ["Indicator update (bulk)", "purple"],
  force_sign_out:      ["Forced sign-out", "red"],
  chat_viewed:         ["Viewed bot chat", "amber"],
}

export default async function AuditPage() {
  const list = await rows<{ id: string; action: string; target_user_id: string | null; email: string | null; details: string | null; created_at: string }>(sql`
    SELECT a.id, a.action, a.target_user_id, u.email, a.details, a.created_at
    FROM admin_audit_log a LEFT JOIN users u ON u.id = a.target_user_id
    ORDER BY a.created_at DESC LIMIT 300
  `)

  return (
    <div className="space-y-5">
      <PageHeader icon={ScrollText} accent="violet" eyebrow="Operations" title="Audit log" sub="Every action and every chat view from this console. Never deleted automatically." />
      <Card>
        <Table head={["When", "Action", "User", "Details"]} empty={list.length === 0}>
          {list.map((a) => {
            const [label, color] = LABEL[a.action] ?? [a.action, "gray"]
            return (
              <tr key={a.id}>
                <Td>{dateTime(a.created_at)}</Td>
                <Td><Badge color={color}>{label}</Badge></Td>
                <Td>
                  {a.target_user_id && a.email ? <UserLink id={a.target_user_id}>{a.email}</UserLink>
                    : a.target_user_id ? <Muted>deleted user</Muted>
                    : <Muted>many users</Muted>}
                </Td>
                <Td className="max-w-md truncate whitespace-normal text-xs text-gray-400">{a.details}</Td>
              </tr>
            )
          })}
        </Table>
      </Card>
    </div>
  )
}
