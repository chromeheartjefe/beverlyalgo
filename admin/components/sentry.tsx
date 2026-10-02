import { Bug } from "lucide-react"
import Link from "next/link"

import { ACCENT, Badge, type BadgeColor, cx, IconTile, Notice } from "~/components/ui"
import { ago, num } from "~/lib/format"
import type { IssueLevel, SentryIssue, SentryOverview, SentryResult } from "~/lib/sentry"

const LEVEL: Record<IssueLevel, { badge: BadgeColor; dot: string; label: string }> = {
  fatal:   { badge: "red",   dot: "bg-rose-400",  label: "fatal" },
  error:   { badge: "red",   dot: "bg-rose-400",  label: "error" },
  warning: { badge: "amber", dot: "bg-amber-400", label: "warning" },
  info:    { badge: "blue",  dot: "bg-sky-400",   label: "info" },
  debug:   { badge: "gray",  dot: "bg-gray-500",  label: "debug" },
  sample:  { badge: "gray",  dot: "bg-gray-500",  label: "sample" },
}

export function LevelBadge({ level }: { level: IssueLevel }) {
  return <Badge color={LEVEL[level].badge}>{LEVEL[level].label}</Badge>
}

export function LevelDot({ level }: { level: IssueLevel }) {
  return <span className={cx("size-1.5 shrink-0 rounded-full", LEVEL[level].dot)} aria-hidden />
}

/** What to show in place of the data when Sentry is not connected or did not answer */
export function SentryNotice({ result }: { result: Exclude<SentryResult<unknown>, { state: "ok" }> }) {
  if (result.state === "no-config") {
    return (
      <Notice>
        Sentry is not connected yet. Add{" "}
        {result.missing.map((name, i) => (
          <span key={name}>
            {i > 0 && (i === result.missing.length - 1 ? " and " : ", ")}
            <code>{name}</code>
          </span>
        ))}{" "}
        to <code>admin/.env.local</code> and restart the console. The token only needs to read issues; the steps are in
        admin/README.md under &quot;Sentry token&quot;.
      </Notice>
    )
  }
  return <Notice tone="red">{result.message}</Notice>
}

/** Busiest in the last 24 hours first, then the most recently seen */
function top(issues: SentryIssue[], n: number): SentryIssue[] {
  return [...issues].sort((a, b) => b.events24h - a.events24h || b.lastSeen.localeCompare(a.lastSeen)).slice(0, n)
}

/** Overview tile: errors in the last 24 hours and the issues behind them */
export function SentryMini({ result, className }: { result: SentryResult<SentryOverview>; className?: string }) {
  const a = ACCENT.rose
  return (
    <div className={cx("relative overflow-hidden rounded-2xl border border-white/[0.09] bg-surface/80 p-4", className)}>
      <span className={cx("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", a.line)} />
      <div className="relative flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-gray-400">Errors · last 24 hours</p>
        <div className="flex items-center gap-2.5">
          <Link href="/errors" className="text-xs text-rose-300 hover:underline">All errors →</Link>
          <IconTile icon={Bug} accent="rose" size="sm" />
        </div>
      </div>

      {result.state === "no-config" ? (
        <p className="relative mt-2 text-xs text-gray-500">
          Sentry is not connected. <Link href="/errors" className="text-rose-300 hover:underline">Set it up</Link> to see site errors here.
        </p>
      ) : result.state === "error" ? (
        <p className="relative mt-2 text-xs text-rose-200/90">{result.message}</p>
      ) : (
        <div className="relative mt-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-5">
          <div className="shrink-0">
            <p className={cx("num text-2xl font-semibold", result.data.events24h === 0 ? "text-emerald-300" : "text-white")}>
              {num(result.data.events24h)}
            </p>
            <p className="mt-1.5 text-xs text-gray-500">
              {result.data.issues.length === 0
                ? "no unresolved issues"
                : `${num(result.data.issues.length)}${result.data.capped ? "+" : ""} unresolved issue${result.data.issues.length === 1 ? "" : "s"}`}
            </p>
          </div>
          {result.data.issues.length > 0 && (
            <ul className="min-w-0 flex-1 space-y-1 sm:border-l sm:border-white/[0.07] sm:pl-5">
              {top(result.data.issues, 3).map((issue) => (
                <li key={issue.id}>
                  <Link href={`/errors/${issue.id}`} className="group flex items-center gap-2 text-xs">
                    <LevelDot level={issue.level} />
                    <span className="min-w-0 flex-1 truncate text-gray-200 group-hover:text-white group-hover:underline">{issue.title}</span>
                    <span className="num shrink-0 text-gray-500">
                      {issue.events24h > 0 ? `${num(issue.events24h)}× · ` : ""}{ago(issue.lastSeen)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
