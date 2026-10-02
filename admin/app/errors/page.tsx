import { Bug, ExternalLink } from "lucide-react"
import Link from "next/link"

import { Sparkline, TrendLine } from "~/components/charts"
import { RefreshButton } from "~/components/refresh-button"
import { LevelBadge, SentryNotice } from "~/components/sentry"
import { Badge, Card, cx, Muted, PageHeader, Stat, Table, Td } from "~/components/ui"
import { ago, num } from "~/lib/format"
import { getSentryOverview, type IssueFilter } from "~/lib/sentry"

export const dynamic = "force-dynamic"

const FILTERS: { key: IssueFilter; label: string }[] = [
  { key: "unresolved", label: "Unresolved" },
  { key: "all", label: "All" },
]

export default async function ErrorsPage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const sp = await searchParams
  const filter: IssueFilter = sp.show === "all" ? "all" : "unresolved"
  const result = await getSentryOverview(filter)

  const header = (
    <PageHeader
      icon={Bug}
      accent="rose"
      eyebrow="Operations"
      title="Errors"
      sub="Live from Sentry (read-only token) · cached up to 2 min. Open an error for its stack trace and what happened before it."
      right={
        <div className="flex items-center gap-2">
          <RefreshButton />
          <div className="flex gap-1 rounded-xl border border-white/15 bg-surface p-1">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={f.key === "unresolved" ? "/errors" : `/errors?show=${f.key}`}
                className={cx("rounded-lg px-3 py-1.5 text-sm", f.key === filter ? "bg-rose-500/20 text-rose-100" : "text-gray-400 hover:text-white")}
              >
                {f.label}
              </Link>
            ))}
          </div>
        </div>
      }
    />
  )

  if (result.state !== "ok") {
    return (
      <div className="space-y-5">
        {header}
        <SentryNotice result={result} />
      </div>
    )
  }

  const { issues, events24h, events14d, hours, days, capped } = result.data
  const unhandled = issues.filter((i) => i.isUnhandled).length
  const newest = [...issues].sort((a, b) => b.firstSeen.localeCompare(a.firstSeen))[0]

  return (
    <div className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat
          accent="rose"
          label="Events · 24 hours"
          value={num(events24h)}
          tone={events24h === 0 ? "good" : undefined}
          hint="per hour, issues listed below"
          spark={hours.length > 1 ? <Sparkline data={hours} dataKey="events" accent="rose" /> : undefined}
        />
        <Stat accent="rose" label="Events · 14 days" value={num(events14d)} />
        <Stat
          accent="amber"
          label={filter === "unresolved" ? "Unresolved issues" : "Issues"}
          value={`${num(issues.length)}${capped ? "+" : ""}`}
          hint={unhandled > 0 ? `${num(unhandled)} unhandled (crashed the page or request)` : "none unhandled"}
        />
        <Stat accent="sky" label="Newest issue" value={newest ? ago(newest.firstSeen) : "—"} hint={newest ? newest.title.slice(0, 60) : "nothing listed"} />
      </div>

      <Card accent="rose" icon={Bug} title="Events per day" sub="Last 14 days, UTC, issues listed below">
        {days.length > 0 ? <TrendLine data={days} dataKey="events" name="Events" accent="rose" height={200} /> : <Muted>No events in the last 14 days.</Muted>}
      </Card>

      <Card
        title={filter === "unresolved" ? "Unresolved issues" : "All issues"}
        sub={`Most recently seen first${capped ? " · showing the first 100" : ""}`}
        right={<Badge color="gray">{issues.length}{capped ? "+" : ""}</Badge>}
      >
        <Table head={["Error", "24h", "14d", "Total", "Users", "First seen", "Last seen", ""]} empty={issues.length === 0}>
          {issues.map((issue) => (
            <tr key={issue.id}>
              <Td className="max-w-[34rem] whitespace-normal">
                <Link href={`/errors/${issue.id}`} className="font-medium text-white hover:underline">{issue.title}</Link>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <LevelBadge level={issue.level} />
                  {issue.isUnhandled && <Badge color="red">unhandled</Badge>}
                  {issue.status !== "unresolved" && <Badge color="gray">{issue.status}</Badge>}
                  {issue.culprit && <span className="min-w-0 truncate font-mono text-xs text-gray-500">{issue.culprit}</span>}
                </div>
              </Td>
              <Td className={cx("num", issue.events24h > 0 ? "text-rose-200" : "text-gray-500")}>{num(issue.events24h)}</Td>
              <Td className="num">{num(issue.events14d)}</Td>
              <Td className="num">{num(issue.total)}</Td>
              <Td className="num">{num(issue.users)}</Td>
              <Td><Muted>{ago(issue.firstSeen)}</Muted></Td>
              <Td><Muted>{ago(issue.lastSeen)}</Muted></Td>
              <Td>
                {issue.permalink && (
                  <a href={issue.permalink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-sky-300 hover:underline">
                    Sentry <ExternalLink className="size-3" aria-hidden />
                  </a>
                )}
              </Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
