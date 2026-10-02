import { ArrowLeft, Bug, ExternalLink, Footprints, Globe, History, Layers, Tags } from "lucide-react"
import Link from "next/link"

import { LevelBadge, SentryNotice } from "~/components/sentry"
import { Badge, Card, cx, Muted, PageHeader, Stat, Table, Td, UserLink } from "~/components/ui"
import { ago, dateTime, num } from "~/lib/format"
import { type Breadcrumb, type Frame, getSentryIssue, type SentryEvent } from "~/lib/sentry"

export const dynamic = "force-dynamic"

// Our own account ids are UUIDs; anything else Sentry has for a user is shown as text
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const time = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC" }) : ""

/** One line for a trail entry: its message, or the useful part of its data */
function crumbText(c: Breadcrumb): string {
  const d = c.data ?? {}
  if (typeof d.url === "string") {
    const status = d.status_code ?? d.status
    return `${typeof d.method === "string" ? `${d.method} ` : ""}${d.url}${status != null ? ` → ${String(status)}` : ""}`
  }
  if (typeof d.to === "string") return `${typeof d.from === "string" ? `${d.from} → ` : ""}${d.to}`
  if (c.message) return c.message
  const rest = Object.keys(d).length ? JSON.stringify(d) : ""
  return rest.length > 220 ? `${rest.slice(0, 220)}…` : rest
}

const CRUMB_TONE: Record<string, string> = {
  fatal: "text-rose-300",
  error: "text-rose-300",
  warning: "text-amber-300",
}

function StackFrame({ frame, open }: { frame: Frame; open: boolean }) {
  const where = [frame.filename, frame.lineNo != null ? `${frame.lineNo}${frame.colNo != null ? `:${frame.colNo}` : ""}` : null].filter(Boolean).join(":")
  return (
    <li className={cx("border-l-2 pl-3", frame.inApp ? "border-rose-400/60" : "border-white/10")}>
      <p className="break-all font-mono text-xs">
        <span className={frame.inApp ? "text-white" : "text-gray-400"}>{frame.function ?? "(anonymous)"}</span>
        <span className="text-gray-500"> · {where || "unknown file"}</span>
        {frame.inApp && <span className="ml-2 font-sans text-[11px] font-medium text-rose-300">our code</span>}
      </p>
      {open && frame.context.length > 0 && (
        <pre className="mt-1.5 overflow-x-auto rounded-lg border border-white/[0.07] bg-black/30 p-2 font-mono text-[11px] leading-relaxed">
          {frame.context.map(([n, line]) => (
            <div key={n} className={n === frame.lineNo ? "bg-rose-500/15 text-rose-100" : "text-gray-400"}>
              <span className="mr-3 inline-block w-8 select-none text-right text-gray-600">{n}</span>
              {line || " "}
            </div>
          ))}
        </pre>
      )}
    </li>
  )
}

function StackTrace({ event }: { event: SentryEvent }) {
  if (event.exceptions.length === 0) {
    return <Muted>{event.message ?? "This event has no stack trace (it was logged as a message)."}</Muted>
  }
  return (
    <div className="space-y-5">
      {event.exceptions.map((ex, i) => {
        // Source context for the first frame in our own code, or the top frame
        const focus = ex.frames.find((f) => f.inApp && f.context.length > 0) ?? ex.frames.find((f) => f.context.length > 0)
        return (
          <div key={i}>
            <p className="break-words text-sm">
              <span className="font-semibold text-rose-200">{ex.type ?? "Error"}</span>
              {ex.value && <span className="text-gray-200">: {ex.value}</span>}
              {ex.handled === false && <span className="ml-2"><Badge color="red">unhandled</Badge></span>}
            </p>
            {ex.frames.length > 0 ? (
              <ol className="mt-3 space-y-2">
                {ex.frames.slice(0, 40).map((f, j) => <StackFrame key={j} frame={f} open={f === focus} />)}
              </ol>
            ) : (
              <p className="mt-2 text-xs text-gray-500">No frames recorded.</p>
            )}
            {ex.frames.length > 40 && <p className="mt-2 text-xs text-gray-500">{ex.frames.length - 40} more frames in Sentry.</p>}
          </div>
        )
      })}
    </div>
  )
}

export default async function ErrorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await getSentryIssue(id)

  const back = (
    <Link href="/errors" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white">
      <ArrowLeft className="size-4" aria-hidden /> All errors
    </Link>
  )

  if (result.state !== "ok") {
    return (
      <div className="space-y-5">
        {back}
        <PageHeader icon={Bug} accent="rose" eyebrow="Operations" title="Error" />
        <SentryNotice result={result} />
      </div>
    )
  }

  const { issue, latest, occurrences } = result.data
  const tag = (key: string) => latest?.tags.find((t) => t.key === key)?.value ?? null
  const url = tag("url") ?? latest?.request?.url ?? null
  // The trail is chronological; keep the last stretch, which leads up to the error
  const trail = latest ? latest.breadcrumbs.slice(-40) : []

  return (
    <div className="space-y-6">
      {back}
      <PageHeader
        icon={Bug}
        accent="rose"
        eyebrow={issue.shortId || "Error"}
        title={issue.title}
        sub={
          <span className="flex flex-wrap items-center gap-1.5">
            <LevelBadge level={issue.level} />
            {issue.isUnhandled && <Badge color="red">unhandled</Badge>}
            <Badge color={issue.status === "unresolved" ? "amber" : "green"}>{issue.status}</Badge>
            {issue.culprit && <span className="font-mono text-xs text-gray-500">{issue.culprit}</span>}
          </span>
        }
        right={
          issue.permalink ? (
            <a
              href={issue.permalink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2 text-sm font-medium text-gray-200 transition-colors hover:bg-white/[0.08]"
            >
              Open in Sentry <ExternalLink className="size-4" aria-hidden />
            </a>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat accent="rose" label="Events · 24 hours" value={num(issue.events24h)} />
        <Stat accent="rose" label="Events · all time" value={num(issue.total)} />
        <Stat accent="amber" label="Users affected" value={num(issue.users)} />
        <Stat accent="sky" label="Last seen" value={ago(issue.lastSeen)} hint={`first seen ${ago(issue.firstSeen)}`} />
      </div>

      {!latest ? (
        <Card><Muted>Sentry no longer has an event stored for this issue, so there is no stack trace to show.</Muted></Card>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-5">
            <Card className="xl:col-span-3" accent="rose" icon={Layers} title="Stack trace" sub={`Latest occurrence · ${dateTime(latest.dateCreated)} · where it crashed is on top`}>
              <StackTrace event={latest} />
            </Card>

            <Card className="xl:col-span-2" accent="sky" icon={Globe} title="Where it happened" sub="Latest occurrence">
              <dl className="space-y-2.5 text-sm">
                {([
                  ["Page", url],
                  ["Request", latest.request?.method && latest.request.url ? `${latest.request.method} ${latest.request.url}${latest.request.query ? `?${latest.request.query}` : ""}` : null],
                  ["Came from", latest.request?.referer ?? null],
                  ["Browser", tag("browser")],
                  ["System", tag("os") ?? tag("client_os")],
                  ["Device", tag("device") ?? tag("device.family")],
                  ["Environment", latest.environment],
                  ["Release", latest.release],
                  ["Runtime", tag("runtime") ?? latest.sdk],
                ] as [string, string | null][])
                  .filter(([, value]) => value)
                  .map(([label, value]) => (
                    <div key={label} className="flex gap-3">
                      <dt className="w-24 shrink-0 text-gray-500">{label}</dt>
                      <dd className="min-w-0 break-all text-gray-200">{value}</dd>
                    </div>
                  ))}
                {latest.user && (latest.user.id || latest.user.email || latest.user.ip) && (
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 text-gray-500">User</dt>
                    <dd className="min-w-0 break-all text-gray-200">
                      {latest.user.id && UUID.test(latest.user.id)
                        ? <UserLink id={latest.user.id}>{latest.user.email ?? latest.user.id}</UserLink>
                        : latest.user.email ?? latest.user.id ?? latest.user.ip}
                      {latest.user.geo && <span className="text-gray-500"> · {latest.user.geo}</span>}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>

          <Card accent="amber" icon={Footprints} title="What happened before it" sub="The trail Sentry recorded in the browser or on the server, oldest first, UTC. The error comes right after the last line.">
            {trail.length === 0 ? (
              <Muted>No trail was recorded for this occurrence.</Muted>
            ) : (
              <ol className="space-y-1">
                {trail.map((c, i) => (
                  <li key={i} className="flex gap-3 font-mono text-xs">
                    <span className="num w-[4.5rem] shrink-0 text-gray-600">{time(c.timestamp)}</span>
                    <span className="w-28 shrink-0 truncate text-gray-500">{c.category ?? c.type ?? "event"}</span>
                    <span className={cx("min-w-0 break-all", CRUMB_TONE[c.level ?? ""] ?? "text-gray-300")}>{crumbText(c) || "—"}</span>
                  </li>
                ))}
              </ol>
            )}
          </Card>

          <Card accent="violet" icon={Tags} title="Tags" sub="Latest occurrence">
            {latest.tags.length === 0 ? (
              <Muted>No tags.</Muted>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {latest.tags.map((t) => (
                  <span key={t.key} className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs">
                    <span className="text-gray-500">{t.key}</span>
                    <span className="min-w-0 truncate text-gray-200">{t.value}</span>
                  </span>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      <Card accent="sky" icon={History} title="Recent occurrences" sub="Newest first, up to 25">
        <Table head={["When", "Page", "Browser", "System", "Release", "User"]} empty={occurrences.length === 0}>
          {occurrences.map((o) => (
            <tr key={o.id}>
              <Td>{dateTime(o.dateCreated)} <Muted>· {ago(o.dateCreated)}</Muted></Td>
              <Td className="max-w-[22rem] truncate">{o.tags.url ?? o.tags.transaction ?? <Muted>—</Muted>}</Td>
              <Td>{o.tags.browser ?? <Muted>—</Muted>}</Td>
              <Td>{o.tags.os ?? o.tags.client_os ?? <Muted>—</Muted>}</Td>
              <Td className="max-w-[10rem] truncate font-mono text-xs">{o.tags.release ?? <Muted>—</Muted>}</Td>
              <Td className="max-w-[14rem] truncate">{o.user ?? <Muted>—</Muted>}</Td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  )
}
