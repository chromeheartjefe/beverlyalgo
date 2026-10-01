import { sql } from "drizzle-orm"
import { Users } from "lucide-react"
import Link from "next/link"

import { resendVerificationToAll } from "~/app/actions"
import { ActionButton } from "~/components/action-button"
import { Badge, Card, Muted, PageHeader, PlanBadge, Table, Td, UserLink } from "~/components/ui"
import { one } from "~/lib/db"
import { isExcludedEmail } from "~/lib/excluded"
import { ago, dateOnly, num, usdSmall } from "~/lib/format"
import { listUsers, PAGE_SIZE, type UserFilters } from "~/lib/queries/users"

export const dynamic = "force-dynamic"

type Search = Record<string, string | undefined>

const PLAN_OPTIONS = [["", "All plans"], ["paying", "Paying (any Pro)"], ["monthly", "Pro monthly"], ["lifetime", "Pro lifetime"], ["manual", "Pro manual"], ["free", "Free"]]
const FLAG_OPTIONS = [["", "No flag"], ["at-risk", "At risk: Pro, not seen 14d"], ["inactive-30d", "Not seen 30d"], ["indicator-pending", "Indicator pending"]]
const SORT_OPTIONS = [["created", "Newest"], ["seen", "Last seen"], ["spend", "AI spend (30d)"], ["analyses", "Most analyses"], ["messages", "Most bot messages"]]

function Select({ name, value, options }: { name: string; value?: string; options: string[][] }) {
  return (
    <select name={name} defaultValue={value ?? ""} className="rounded-lg border border-white/15 bg-surface px-2.5 py-2 text-sm text-gray-200">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  )
}

export default async function UsersPage({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams
  const filters: UserFilters = {
    q:        sp.q || undefined,
    plan:     (sp.plan || undefined) as UserFilters["plan"],
    verified: (sp.verified || undefined) as UserFilters["verified"],
    flag:     (sp.flag || undefined) as UserFilters["flag"],
    sort:     (sp.sort || undefined) as UserFilters["sort"],
    page:     Number(sp.page) || 1,
  }
  const [{ list, total, page }, unverified] = await Promise.all([
    listUsers(filters),
    one<{ n: number }>(sql`SELECT count(*)::int AS n FROM users WHERE email_verified IS NULL`),
  ])
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageHref = (p: number) => `/users?${new URLSearchParams({ ...Object.fromEntries(Object.entries(sp).filter(([, v]) => v)) as Record<string, string>, page: String(p) })}`

  return (
    <div className="space-y-5">
      <PageHeader icon={Users} accent="sky" eyebrow="Growth" title="Users" sub={`${num(total)} matching`} />

      {(unverified?.n ?? 0) > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3">
          <p className="text-sm text-amber-100">
            <span className="font-semibold">{num(unverified?.n)} unverified accounts.</span>{" "}
            Send each a fresh verification link (one at a time, about 1 second each, max 90 per run, once per hour).
          </p>
          <ActionButton
            label={`Resend to all ${num(unverified?.n)}`}
            confirmLabel={`Email ${num(unverified?.n)} users?`}
            run={resendVerificationToAll}
          />
        </div>
      )}

      <form className="flex flex-wrap items-center gap-2">
        <input
          name="q"
          defaultValue={sp.q}
          placeholder="Search email, name, id or TradingView"
          className="w-72 rounded-lg border border-white/15 bg-surface px-3 py-2 text-sm text-white placeholder:text-gray-500"
        />
        <Select name="plan" value={sp.plan} options={PLAN_OPTIONS} />
        <Select name="verified" value={sp.verified} options={[["", "Verified or not"], ["yes", "Verified"], ["no", "Not verified"]]} />
        <Select name="flag" value={sp.flag} options={FLAG_OPTIONS} />
        <Select name="sort" value={sp.sort} options={SORT_OPTIONS} />
        <button className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400">Apply</button>
        <Link href="/users" className="px-2 text-sm text-gray-400 hover:text-white">Reset</Link>
      </form>

      <Card>
        <Table
          head={["User", "Plan", "Verified", "Signed up", "Last seen", "Logins", "Analyses", "Bot msgs", "Trades", "AI $ (30d)", "Indicator"]}
          empty={list.length === 0}
        >
          {list.map((u) => (
            <tr key={u.id} className="hover:bg-white/[0.03]">
              <Td>
                <UserLink id={u.id}>{u.email}</UserLink>
                {isExcludedEmail(u.email) && <span className="ml-1.5"><Badge color="gray">excluded from metrics</Badge></span>}
                <div className="text-xs text-gray-500">{u.name}</div>
              </Td>
              <Td><PlanBadge kind={u.plan_kind} /></Td>
              <Td>{u.verified ? <Badge color="green">Yes</Badge> : <Muted>No</Muted>}</Td>
              <Td>{dateOnly(u.created_at)}</Td>
              <Td>{ago(u.last_seen_at)}</Td>
              <Td className="tabular-nums">{num(u.login_count)}</Td>
              <Td className="tabular-nums">{num(u.analyses)}</Td>
              <Td className="tabular-nums">{num(u.messages)}</Td>
              <Td className="tabular-nums">{num(u.trades)}</Td>
              <Td className="tabular-nums">{u.spend_30d > 0 ? usdSmall(u.spend_30d) : <Muted>—</Muted>}</Td>
              <Td>
                {u.indicator === "pending" ? <Badge color="amber">Pending</Badge> : u.indicator === "invited" ? <Badge color="green">Invited</Badge> : <Muted>—</Muted>}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>

      {pages > 1 && (
        <div className="flex items-center gap-3 text-sm text-gray-400">
          {page > 1 && <Link href={pageHref(page - 1)} className="hover:text-white">← Previous</Link>}
          <span>Page {page} of {pages}</span>
          {page < pages && <Link href={pageHref(page + 1)} className="hover:text-white">Next →</Link>}
        </div>
      )}
    </div>
  )
}
