import "server-only"

import { cached, forget } from "~/lib/ttl-cache"

// Errors from the site, read from Sentry's API with a personal token that can
// only read (scope event:read). Nothing here writes to Sentry. Every function
// returns a state instead of throwing, so a missing token or a Sentry outage
// shows a notice and never takes a page down.
//
// admin/.env.local: SENTRY_API_TOKEN, SENTRY_ORG, SENTRY_PROJECT (the slugs
// from the Sentry URL), and optionally SENTRY_URL (https://de.sentry.io for an
// organisation hosted in the EU; default https://sentry.io).

export type SentryResult<T> =
  | { state: "ok"; data: T }
  | { state: "no-config"; missing: string[] }
  | { state: "error"; status: number | null; message: string }

export type IssueLevel = "fatal" | "error" | "warning" | "info" | "debug" | "sample"

export type SentryIssue = {
  id: string
  shortId: string
  title: string
  culprit: string | null
  level: IssueLevel
  status: string
  isUnhandled: boolean
  /** All events ever recorded for this issue */
  total: number
  users: number
  firstSeen: string
  lastSeen: string
  permalink: string
  events24h: number
  events14d: number
  /** Events per hour, oldest first, last 24 hours */
  hourly: number[]
  /** Events per day, oldest first, last 14 days: [unix seconds, count] */
  daily: [number, number][]
}

export type SentryOverview = {
  issues: SentryIssue[]
  events24h: number
  events14d: number
  /** For the tile's sparkline */
  hours: { hour: number; events: number }[]
  /** For the trend chart */
  days: { day: string; events: number }[]
  /** Sentry returns at most 100 issues per call */
  capped: boolean
}

export type Frame = {
  filename: string | null
  function: string | null
  lineNo: number | null
  colNo: number | null
  inApp: boolean
  /** Source lines around the error, when Sentry has them: [line number, text] */
  context: [number, string][]
}

export type Breadcrumb = {
  timestamp: string | null
  category: string | null
  type: string | null
  level: string | null
  message: string | null
  data: Record<string, unknown> | null
}

export type SentryEvent = {
  id: string
  eventID: string
  dateCreated: string | null
  title: string
  message: string | null
  exceptions: { type: string | null; value: string | null; handled: boolean | null; frames: Frame[] }[]
  breadcrumbs: Breadcrumb[]
  request: { method: string | null; url: string | null; query: string | null; referer: string | null; userAgent: string | null } | null
  tags: { key: string; value: string }[]
  user: { id: string | null; email: string | null; ip: string | null; geo: string | null } | null
  release: string | null
  environment: string | null
  sdk: string | null
}

export type Occurrence = { id: string; eventID: string; dateCreated: string | null; title: string; tags: Record<string, string>; user: string | null }

export type SentryIssueDetail = { issue: SentryIssue; latest: SentryEvent | null; occurrences: Occurrence[] }

type Config = { token: string; org: string; project: string; base: string }

function config(): Config | { missing: string[] } {
  const token = process.env.SENTRY_API_TOKEN?.trim()
  const org = process.env.SENTRY_ORG?.trim()
  const project = process.env.SENTRY_PROJECT?.trim()
  const missing = [!token && "SENTRY_API_TOKEN", !org && "SENTRY_ORG", !project && "SENTRY_PROJECT"].filter((v): v is string => !!v)
  if (missing.length || !token || !org || !project) return { missing }
  return { token, org, project, base: (process.env.SENTRY_URL?.trim() || "https://sentry.io").replace(/\/+$/, "") }
}

class SentryError extends Error {
  constructor(readonly status: number | null, message: string) {
    super(message)
  }
}

async function api<T>(cfg: Config, path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${cfg.base}/api/0${path}`)
  for (const [k, v] of Object.entries(params ?? {})) url.searchParams.set(k, v)
  let res: Response
  try {
    res = await fetch(url, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    })
  } catch (err) {
    throw new SentryError(null, err instanceof Error && err.name === "TimeoutError" ? "Sentry did not answer in time." : "Could not reach Sentry.")
  }
  if (!res.ok) {
    const hint =
      res.status === 401 ? "Sentry rejected the token (SENTRY_API_TOKEN is wrong or was revoked)."
      : res.status === 403 ? "The token is not allowed to read issues. It needs the event:read scope."
      : res.status === 404 ? "Sentry found no such organisation, project or issue. Check SENTRY_ORG and SENTRY_PROJECT (the slugs from the Sentry URL), and SENTRY_URL if the organisation is hosted in the EU."
      : res.status === 429 ? "Sentry is rate limiting this token. Try again in a minute."
      : `Sentry answered with an error (${res.status}).`
    throw new SentryError(res.status, hint)
  }
  return (await res.json()) as T
}

async function guard<T>(load: (cfg: Config) => Promise<T>): Promise<SentryResult<T>> {
  const cfg = config()
  if ("missing" in cfg) return { state: "no-config", missing: cfg.missing }
  try {
    return { state: "ok", data: await load(cfg) }
  } catch (err) {
    if (err instanceof SentryError) return { state: "error", status: err.status, message: err.message }
    return { state: "error", status: null, message: "Sentry sent something this page could not read." }
  }
}

// Good answers are cached for `ttlMs`. A failure is kept for 20 seconds only:
// long enough that an outage doesn't make every page wait for the timeout
// again, short enough that a fixed token shows up almost at once.
const FAILURE_TTL_MS = 20_000

async function remember<T>(key: string, ttlMs: number, load: (cfg: Config) => Promise<T>): Promise<SentryResult<T>> {
  const result = await cached(key, ttlMs, () => guard(load))
  if (result.state === "no-config") forget(key)
  else if (result.state === "error") setTimeout(() => forget(key), FAILURE_TTL_MS).unref?.()
  return result
}

// ─── Raw shapes (only the fields used here; everything is optional because it
// comes from someone else's API) ────────────────────────────────────────────

type RawIssue = {
  id?: string; shortId?: string; title?: string; culprit?: string | null; level?: string; status?: string
  isUnhandled?: boolean; count?: string | number; userCount?: number; firstSeen?: string; lastSeen?: string
  permalink?: string; stats?: Record<string, [number, number][] | undefined>
}

const LEVELS: IssueLevel[] = ["fatal", "error", "warning", "info", "debug", "sample"]

function toIssue(raw: RawIssue, other?: RawIssue): SentryIssue {
  const hourlyStats = raw.stats?.["24h"] ?? other?.stats?.["24h"] ?? []
  const dailyStats = raw.stats?.["14d"] ?? other?.stats?.["14d"] ?? []
  const sum = (points: [number, number][]) => points.reduce((t, p) => t + (Number(p?.[1]) || 0), 0)
  const level = LEVELS.includes(raw.level as IssueLevel) ? (raw.level as IssueLevel) : "error"
  return {
    id: String(raw.id ?? ""),
    shortId: raw.shortId ?? "",
    title: raw.title ?? "Untitled issue",
    culprit: raw.culprit || null,
    level,
    status: raw.status ?? "unresolved",
    isUnhandled: !!raw.isUnhandled,
    total: Number(raw.count ?? 0) || 0,
    users: Number(raw.userCount ?? 0) || 0,
    firstSeen: raw.firstSeen ?? "",
    lastSeen: raw.lastSeen ?? "",
    permalink: raw.permalink ?? "",
    events24h: sum(hourlyStats),
    events14d: sum(dailyStats),
    hourly: hourlyStats.map((p) => Number(p?.[1]) || 0),
    daily: dailyStats.map((p) => [Number(p?.[0]) || 0, Number(p?.[1]) || 0]),
  }
}

export type IssueFilter = "unresolved" | "all"

/** The project's issues, newest activity first, with 24-hour and 14-day counts (cached 2 min) */
export function getSentryOverview(filter: IssueFilter = "unresolved"): Promise<SentryResult<SentryOverview>> {
  return remember(`sentry-overview-${filter}`, 2 * 60_000, async (cfg) => {
    const path = `/projects/${encodeURIComponent(cfg.org)}/${encodeURIComponent(cfg.project)}/issues/`
    const query = filter === "unresolved" ? "is:unresolved" : ""
    const base = { query, sort: "date", limit: "100" }
    // One call per stats window: Sentry returns a single window per request
    const [day, fortnight] = await Promise.all([
      api<RawIssue[]>(cfg, path, { ...base, statsPeriod: "24h" }),
      api<RawIssue[]>(cfg, path, { ...base, statsPeriod: "14d" }),
    ])
    const byId = new Map(fortnight.map((i) => [String(i.id), i]))
    const issues = day.map((i) => toIssue(i, byId.get(String(i.id))))

    const hours: { hour: number; events: number }[] = []
    const width = Math.max(0, ...issues.map((i) => i.hourly.length))
    for (let h = 0; h < width; h++) hours.push({ hour: h, events: issues.reduce((t, i) => t + (i.hourly[h] ?? 0), 0) })

    const perDay = new Map<number, number>()
    for (const i of issues) for (const [ts, n] of i.daily) perDay.set(ts, (perDay.get(ts) ?? 0) + n)
    const days = [...perDay].sort((a, b) => a[0] - b[0]).map(([ts, events]) => ({ day: new Date(ts * 1000).toISOString().slice(0, 10), events }))

    return {
      issues,
      events24h: issues.reduce((t, i) => t + i.events24h, 0),
      events14d: issues.reduce((t, i) => t + i.events14d, 0),
      hours,
      days,
      capped: day.length >= 100,
    }
  })
}

type RawFrame = { filename?: string | null; absPath?: string | null; module?: string | null; function?: string | null; lineNo?: number | null; colNo?: number | null; inApp?: boolean; context?: [number, string][] | null }
type RawEntry = { type?: string; data?: Record<string, unknown> }
type RawEvent = {
  id?: string; eventID?: string; dateCreated?: string; title?: string; message?: string | null
  entries?: RawEntry[]; tags?: { key?: string; value?: string }[]
  user?: { id?: string | null; email?: string | null; ip_address?: string | null; geo?: { country_code?: string; city?: string } | null } | null
  release?: { version?: string } | string | null; environment?: string | null; sdk?: { name?: string; version?: string } | null
}

function toEvent(raw: RawEvent): SentryEvent {
  const entry = (type: string) => raw.entries?.find((e) => e.type === type)?.data

  const exceptionValues = (entry("exception")?.values as Record<string, unknown>[] | undefined) ?? []
  const exceptions = exceptionValues.map((v) => {
    const frames = ((v.stacktrace as { frames?: RawFrame[] } | null)?.frames ?? []).map((f): Frame => ({
      filename: f.filename ?? f.module ?? f.absPath ?? null,
      function: f.function ?? null,
      lineNo: f.lineNo ?? null,
      colNo: f.colNo ?? null,
      inApp: !!f.inApp,
      context: Array.isArray(f.context) ? f.context.filter((c) => Array.isArray(c) && typeof c[0] === "number").map((c) => [c[0], String(c[1] ?? "")]) : [],
    }))
    const handled = (v.mechanism as { handled?: boolean } | null)?.handled
    return {
      type: (v.type as string) ?? null,
      value: (v.value as string) ?? null,
      handled: typeof handled === "boolean" ? handled : null,
      // Sentry lists frames oldest call first; the crash site reads better on top
      frames: frames.reverse(),
    }
  })

  const crumbValues = (entry("breadcrumbs")?.values as Record<string, unknown>[] | undefined) ?? []
  const breadcrumbs = crumbValues.map((c): Breadcrumb => ({
    timestamp: (c.timestamp as string) ?? null,
    category: (c.category as string) ?? null,
    type: (c.type as string) ?? null,
    level: (c.level as string) ?? null,
    message: (c.message as string) ?? null,
    data: c.data && typeof c.data === "object" ? (c.data as Record<string, unknown>) : null,
  }))

  const req = entry("request")
  const headers = new Map(((req?.headers as [string, string][] | undefined) ?? []).map(([k, v]) => [String(k).toLowerCase(), String(v)]))
  const queryRaw = req?.query
  const query = Array.isArray(queryRaw) ? queryRaw.map((p) => (Array.isArray(p) ? p.join("=") : String(p))).join("&") : typeof queryRaw === "string" ? queryRaw : null

  const geo = raw.user?.geo
  return {
    id: String(raw.id ?? ""),
    eventID: raw.eventID ?? String(raw.id ?? ""),
    dateCreated: raw.dateCreated ?? null,
    title: raw.title ?? "",
    message: raw.message || (entry("message")?.formatted as string) || null,
    exceptions,
    breadcrumbs,
    request: req ? {
      method: (req.method as string) ?? null,
      url: (req.url as string) ?? null,
      query: query || null,
      referer: headers.get("referer") ?? null,
      userAgent: headers.get("user-agent") ?? null,
    } : null,
    tags: (raw.tags ?? []).filter((t) => t.key).map((t) => ({ key: String(t.key), value: String(t.value ?? "") })),
    user: raw.user ? {
      id: raw.user.id ?? null,
      email: raw.user.email ?? null,
      ip: raw.user.ip_address ?? null,
      geo: geo ? [geo.city, geo.country_code].filter(Boolean).join(", ") || null : null,
    } : null,
    release: typeof raw.release === "string" ? raw.release : raw.release?.version ?? null,
    environment: raw.environment ?? null,
    sdk: raw.sdk?.name ? `${raw.sdk.name} ${raw.sdk.version ?? ""}`.trim() : null,
  }
}

/** Sentry issue ids are numbers; anything else never reaches the API URL */
export const isIssueId = (id: string) => /^\d{1,20}$/.test(id)

/** One issue with its latest event (stack trace, trail, request) and recent occurrences (cached 1 min) */
export function getSentryIssue(id: string): Promise<SentryResult<SentryIssueDetail>> {
  if (!isIssueId(id)) return Promise.resolve({ state: "error", status: 404, message: "That is not a Sentry issue id." })
  return remember(`sentry-issue-${id}`, 60_000, async (cfg) => {
    const root = `/organizations/${encodeURIComponent(cfg.org)}/issues/${id}`
    const [issue, latest, events] = await Promise.all([
      api<RawIssue>(cfg, `${root}/`),
      // An issue can exist with its events already expired; that is not an error
      api<RawEvent>(cfg, `${root}/events/latest/`).catch((err) => {
        if (err instanceof SentryError && err.status === 404) return null
        throw err
      }),
      api<RawEvent[]>(cfg, `${root}/events/`, { limit: "25" }).catch((err) => {
        if (err instanceof SentryError && err.status === 404) return []
        throw err
      }),
    ])
    const occurrences = events.map((e): Occurrence => ({
      id: String(e.id ?? ""),
      eventID: e.eventID ?? String(e.id ?? ""),
      dateCreated: e.dateCreated ?? null,
      title: e.title ?? "",
      tags: Object.fromEntries((e.tags ?? []).filter((t) => t.key).map((t) => [String(t.key), String(t.value ?? "")])),
      user: e.user?.email ?? e.user?.id ?? e.user?.ip_address ?? null,
    }))
    return { issue: toIssue(issue), latest: latest ? toEvent(latest) : null, occurrences }
  })
}
