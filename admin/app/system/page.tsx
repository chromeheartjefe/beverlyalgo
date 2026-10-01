import { sql } from "drizzle-orm"
import { Database, ExternalLink, Gauge, KeyRound, LineChart, ServerCog, Timer, Webhook } from "lucide-react"

import { Badge, Card, Muted, PageHeader, Stat, Table, Td } from "~/components/ui"
import { one, rows } from "~/lib/db"
import { ago, dateTime, num } from "~/lib/format"

export const dynamic = "force-dynamic"

const LINKS = [
  ["Vercel", "https://vercel.com/dashboard"],
  ["Sentry", "https://sentry.io/"],
  ["Neon", "https://console.neon.tech/"],
  ["Stripe", "https://dashboard.stripe.com/"],
  ["Resend", "https://resend.com/emails"],
  ["OpenAI usage", "https://platform.openai.com/usage"],
  ["Twelve Data", "https://twelvedata.com/account/usage"],
  ["Google Analytics", "https://analytics.google.com/"],
]

export default async function SystemPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [td, caches, logins, tables, events] = await Promise.all([
    one<{ minute: number; day: number; backoff: number; backoff_day: number }>(sql`
      SELECT
        (SELECT count(*) FROM rate_limit_hits WHERE key = 'twelvedata:credit' AND created_at > now() - interval '1 minute')::int AS minute,
        (SELECT count(*) FROM rate_limit_hits WHERE key = 'twelvedata:credit' AND created_at >= date_trunc('day', now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC')::int AS day,
        (SELECT count(*) FROM rate_limit_hits WHERE key = 'twelvedata:backoff' AND created_at > now() - interval '2 minutes')::int AS backoff,
        (SELECT count(*) FROM rate_limit_hits WHERE key = ${`twelvedata:backoff-day:${today}`})::int AS backoff_day
    `),
    one<{ screener_at: string | null; ticker_at: string | null; ticker_data: string | null }>(sql`
      SELECT
        (SELECT generated_at FROM screener_cache WHERE id = 'singleton') AS screener_at,
        (SELECT generated_at FROM index_ticker_cache WHERE id = 'singleton') AS ticker_at,
        (SELECT data FROM index_ticker_cache WHERE id = 'singleton') AS ticker_data
    `),
    rows<{ key: string; n: number; last: string }>(sql`
      SELECT key, count(*)::int AS n, max(created_at) AS last
      FROM rate_limit_hits
      WHERE key LIKE 'login-fail:%' AND created_at > now() - interval '24 hours'
      GROUP BY key ORDER BY n DESC LIMIT 15
    `),
    one<Record<string, number>>(sql`
      SELECT
        (SELECT count(*) FROM users)::int AS users,
        (SELECT count(*) FROM chart_analyses)::int AS chart_analyses,
        (SELECT count(*) FROM chat_messages)::int AS chat_messages,
        (SELECT count(*) FROM trades)::int AS trades,
        (SELECT count(*) FROM ai_usage)::int AS ai_usage,
        (SELECT count(*) FROM user_events)::int AS user_events,
        (SELECT count(*) FROM rate_limit_hits)::int AS rate_limit_hits,
        (SELECT count(*) FROM auth_tokens)::int AS auth_tokens,
        (SELECT count(*) FROM admin_audit_log)::int AS admin_audit_log
    `),
    rows<{ id: string; type: string; created_at: string }>(sql`
      SELECT id, type, created_at FROM processed_stripe_events ORDER BY created_at DESC LIMIT 20
    `),
  ])

  let ticker: { label: string; price: number; changePercent: number }[] = []
  try {
    ticker = caches?.ticker_data ? JSON.parse(caches.ticker_data) : []
  } catch {}

  return (
    <div className="space-y-5">
      <PageHeader icon={ServerCog} accent="sky" eyebrow="Operations" title="System health" sub="Budgets, caches, webhooks and abuse signals. Refresh the page to update." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat accent="sky" icon={Gauge} label="Twelve Data credits, last minute" value={`${num(td?.minute)} / 8`} tone={(td?.minute ?? 0) >= 8 ? "warn" : undefined} />
        <Stat accent="sky" icon={LineChart} label="Twelve Data credits today (UTC)" value={`${num(td?.day)} / 750`} hint="our cap, real limit 800" tone={(td?.day ?? 0) >= 700 ? "bad" : (td?.day ?? 0) >= 500 ? "warn" : undefined} />
        <Stat
          accent="amber"
          icon={Timer}
          label="Twelve Data backoff"
          value={td?.backoff_day ? "Until 00:00 UTC" : td?.backoff ? "2 min pause" : "None"}
          tone={td?.backoff_day ? "bad" : td?.backoff ? "warn" : "good"}
        />
        <Stat accent="violet" icon={Database} label="Screener cache" value={ago(caches?.screener_at)} hint={dateTime(caches?.screener_at)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent="sky" icon={LineChart} title="Ticker cache (Twelve Data part)" sub={`Refreshed ${ago(caches?.ticker_at)}. Only refreshes while each market is open.`}>
          <Table head={["Symbol", "Price", "24h"]} empty={ticker.length === 0}>
            {ticker.map((t) => (
              <tr key={t.label}>
                <Td>{t.label}</Td>
                <Td className="tabular-nums">{t.price}</Td>
                <Td className={t.changePercent >= 0 ? "text-emerald-300" : "text-rose-300"}>{t.changePercent.toFixed(2)}%</Td>
              </tr>
            ))}
          </Table>
        </Card>

        <Card accent="rose" icon={KeyRound} title="Failed sign-ins, last 24h" sub="Throttle keys. Blocks at 10 per email+IP, 30 per IP, 100 per email (15 min).">
          <Table head={["Key", "Failures", "Last"]} empty={logins.length === 0}>
            {logins.map((l) => (
              <tr key={l.key}>
                <Td><Muted>{l.key.replace("login-fail:", "")}</Muted></Td>
                <Td>{l.n >= 10 ? <Badge color="red">{l.n}</Badge> : l.n}</Td>
                <Td>{ago(l.last)}</Td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card accent="violet" icon={Database} title="Table sizes" sub="Row counts">
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            {tables && Object.entries(tables).map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-white/[0.07] py-1">
                <span className="text-gray-400">{k}</span>
                <span className="tabular-nums text-gray-200">{num(v)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card accent="emerald" icon={Webhook} title="Processed Stripe webhooks" sub="What the site received and handled">
          <Table head={["When", "Event", "Id"]} empty={events.length === 0}>
            {events.map((e) => (
              <tr key={e.id}><Td>{dateTime(e.created_at)}</Td><Td>{e.type}</Td><Td><Muted>{e.id}</Muted></Td></tr>
            ))}
          </Table>
        </Card>
      </div>

      <div>
        <Card accent="sky" icon={ExternalLink} title="Dashboards">
          <div className="flex flex-wrap gap-2">
            {LINKS.map(([label, href]) => (
              <a key={href} href={href} target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-gray-200 hover:border-purple-400/40 hover:text-white">
                {label} ↗
              </a>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
