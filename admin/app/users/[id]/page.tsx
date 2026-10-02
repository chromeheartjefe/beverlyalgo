import { Activity, Bot, Cpu, Crown, LineChart, LogIn, Radar, ShieldCheck, UserRound } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { forceSignOut, markIndicatorInvited, resendVerification } from "~/app/actions"
import { ActionButton } from "~/components/action-button"
import { ChatViewer } from "~/components/chat-viewer"
import { Badge, Card, Muted, Notice, PageHeader, PlanBadge, Stat, Table, Td } from "~/components/ui"
import { isExcludedEmail } from "~/lib/excluded"
import { ago, dateOnly, dateTime, num, pct, price, usd, usdSmall } from "~/lib/format"
import {
  getAiUsage,
  getAnalyses,
  getAnalysisStats,
  getLimitsToday,
  getSecurity,
  getStripeInfo,
  getTimeline,
  getTrading,
  getUser,
  type TimelineRow,
} from "~/lib/queries/user-detail"

export const dynamic = "force-dynamic"

const FEATURE: Record<string, string> = { chart_analysis: "Chart Analysis", chat: "AI Bot", screener: "Screener", support: "Support chat" }

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/[0.07] py-2 text-sm last:border-0">
      <span className="text-gray-400">{label}</span>
      <span className="text-right text-gray-200">{children}</span>
    </div>
  )
}

function parse(meta: string | null): Record<string, unknown> {
  try {
    return meta ? JSON.parse(meta) : {}
  } catch {
    return {}
  }
}

function describe(e: TimelineRow): { label: string; detail: string; color: "gray" | "purple" | "green" | "amber" | "red" | "blue" } {
  const m = parse(e.meta)
  switch (e.kind) {
    case "signed_up":           return { label: "Signed up", detail: "", color: "green" }
    case "login":               return { label: "Signed in", detail: m.ip ? `IP ${m.ip}` : "", color: "gray" }
    case "login_failed":        return { label: "Failed sign-in", detail: m.ip ? `IP ${m.ip}` : "", color: "red" }
    case "analysis":            return { label: "Chart analysis", detail: `${m.pair} ${m.timeframe} · ${m.signal}${m.signal !== "NEUTRAL" ? ` ${m.confidence}%` : ""}`, color: "purple" }
    case "analysis_rejected":   return { label: "Screenshot rejected", detail: String(m.reason ?? ""), color: "amber" }
    case "free_analysis_used":  return { label: "Used free analysis", detail: "", color: "green" }
    case "bot_messages":        return { label: "AI Bot", detail: `${m.count} message${m.count === 1 ? "" : "s"} that day`, color: "blue" }
    case "chat_cleared":        return { label: "Cleared bot chat", detail: "", color: "gray" }
    case "screener_scan":       return { label: m.fresh === true ? "Screener scan" : "Screener (cached)", detail: "", color: "gray" }
    case "trade_added":         return { label: "Trade logged", detail: `${m.pair} ${m.direction} · P&L ${m.pnl}`, color: "gray" }
    case "goal_set":            return { label: "Monthly goal", detail: `${m.month}: ${m.amount}`, color: "gray" }
    case "password_changed":    return { label: "Password changed", detail: "", color: "amber" }
    case "password_reset":      return { label: "Password reset", detail: "", color: "amber" }
    case "email_changed":       return { label: "Email changed", detail: `${m.from} → ${m.to}`, color: "amber" }
    case "email_verified":      return { label: "Email verified", detail: "", color: "green" }
    case "indicator_requested": return { label: "Indicator requested", detail: `@${m.username}`, color: "purple" }
    case "checkout_abandoned":  return { label: "Left checkout without paying", detail: m.plan === "lifetime" ? "Lifetime" : "Monthly", color: "amber" }
    default:                    return { label: e.kind, detail: e.meta ?? "", color: "gray" }
  }
}

const SIGNAL_COLOR = { BUY: "green", SELL: "red", NEUTRAL: "gray" } as const

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser(id)
  if (!user) notFound()

  const [ai, limits, analyses, aStats, timeline, trading, security, stripeInfo] = await Promise.all([
    getAiUsage(id),
    getLimitsToday(id),
    getAnalyses(id),
    getAnalysisStats(id),
    getTimeline(id),
    getTrading(id),
    getSecurity(id, user.email),
    getStripeInfo(user.stripe_customer_id, user.stripe_subscription_id).catch((err) => `error: ${err instanceof Error ? err.message : err}`),
  ])

  const aiAll = ai.reduce((t, r) => t + r.cost_all, 0)
  const ai30 = ai.reduce((t, r) => t + r.cost_30d, 0)

  return (
    <div className="space-y-5">
      <PageHeader
        icon={UserRound}
        accent="sky"
        eyebrow="User"
        title={user.name}
        sub={
          <span className="flex flex-wrap items-center gap-2">
            {user.email} <PlanBadge kind={user.plan_kind} />
            {user.email_verified ? <Badge color="green">Verified</Badge> : <Badge color="amber">Not verified</Badge>}
            {isExcludedEmail(user.email) && <Badge color="gray">excluded from metrics</Badge>}
            <Muted>id {user.id}</Muted>
          </span>
        }
        right={<Link href="/users" className="text-sm text-gray-400 hover:text-white">← All users</Link>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Signed up" value={dateOnly(user.created_at)} hint={ago(user.created_at)} />
        <Stat label="Last seen" value={ago(user.last_seen_at)} hint={dateTime(user.last_seen_at)} />
        <Stat label="Sign-ins" value={num(user.login_count)} hint={`last ${ago(user.last_login_at)}`} />
        <Stat label="Chart analyses" value={num(aStats?.total)} hint={`${aStats?.rejected ?? 0} rejected screenshots`} />
        <Stat label="AI spend (30d)" value={usdSmall(ai30)} hint={`${usdSmall(aiAll)} all time`} />
        <Stat label="Today's limits" value={`${limits?.analyses ?? 0}/30 · ${limits?.messages ?? 0}/40`} hint="analyses · bot messages (24h)" />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Subscription */}
        <Card accent="emerald" icon={Crown} title="Subscription" sub="Live from Stripe">
          <Row label="Plan">{user.plan_kind === "free" ? "Free" : `Pro (${user.plan_kind})`}</Row>
          {stripeInfo === "not-configured" ? (
            <p className="mt-2 text-sm text-gray-400">Add STRIPE_ADMIN_KEY to see live billing.</p>
          ) : typeof stripeInfo === "string" ? (
            <p className="mt-2 text-sm text-rose-300">{stripeInfo}</p>
          ) : !stripeInfo ? (
            <p className="mt-2 text-sm text-gray-400">{user.plan_kind === "manual" ? "Pro granted by hand, no Stripe customer." : "No Stripe customer."}</p>
          ) : (
            <>
              {stripeInfo.subscription && (
                <>
                  <Row label="Status">
                    <Badge color={stripeInfo.subscription.status === "active" ? (stripeInfo.subscription.canceling ? "amber" : "green") : "red"}>
                      {stripeInfo.subscription.canceling ? "Canceling" : stripeInfo.subscription.status}
                    </Badge>
                  </Row>
                  <Row label={stripeInfo.subscription.canceling ? "Access until" : "Renews"}>{dateOnly(stripeInfo.subscription.periodEnd)}</Row>
                  <Row label="Monthly">{usd(stripeInfo.subscription.monthly)}</Row>
                  <Row label="Subscribed since">{dateOnly(stripeInfo.subscription.created)}</Row>
                </>
              )}
              <Row label="Lifetime value">{usd(stripeInfo.lifetimeValue)}</Row>
              <Row label="Customer">
                <a className="text-purple-300 hover:underline" href={`https://dashboard.stripe.com/customers/${user.stripe_customer_id}`} target="_blank" rel="noreferrer">
                  Open in Stripe ↗
                </a>
              </Row>
              {stripeInfo.charges.length > 0 && (
                <div className="mt-3 space-y-1">
                  <p className="text-xs font-medium text-gray-400">Payments</p>
                  {stripeInfo.charges.map((c) => (
                    <div key={c.id} className="flex justify-between text-xs">
                      <span className="text-gray-400">{dateOnly(c.created)}</span>
                      <span className="flex gap-1.5">
                        <span className={c.paid ? "text-gray-200" : "text-rose-300"}>{usd(c.amount)} {c.currency.toUpperCase()}</span>
                        {!c.paid && <Badge color="red">failed</Badge>}
                        {c.refunded > 0 && <Badge color="amber">refunded {usd(c.refunded)}</Badge>}
                        {c.disputed && <Badge color="red">disputed</Badge>}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </Card>

        {/* AI usage */}
        <Card accent="amber" icon={Cpu} title="AI usage" sub="Tracked per user since 2026-09-28">
          {ai.length === 0 ? (
            <p className="text-sm text-gray-500">No tracked AI calls yet.</p>
          ) : (
            <Table head={["Feature", "Calls", "Tokens", "7d", "30d", "All"]}>
              {ai.map((r) => (
                <tr key={r.feature}>
                  <Td>{FEATURE[r.feature] ?? r.feature}</Td>
                  <Td className="tabular-nums">{num(r.calls)}</Td>
                  <Td className="tabular-nums">{num(r.tokens)}</Td>
                  <Td className="tabular-nums">{usdSmall(r.cost_7d)}</Td>
                  <Td className="tabular-nums">{usdSmall(r.cost_30d)}</Td>
                  <Td className="tabular-nums">{usdSmall(r.cost_all)}</Td>
                </tr>
              ))}
            </Table>
          )}
        </Card>

        {/* Account & actions */}
        <Card accent="violet" icon={ShieldCheck} title="Account" sub="Safe actions are confirmed and audit-logged">
          <Row label="Last sign-in">{dateTime(user.last_login_at)}</Row>
          <Row label="Failed sign-ins (30d)">{num(security.summary?.failed_30d)}</Row>
          <Row label="Failed attempts, last 15 min">
            {/* This counter is the all-sources one; it blocks at 100 (auth.ts) */}
            {(security.summary?.fails_15m ?? 0) >= 100 ? <Badge color="red">{security.summary?.fails_15m} (blocked)</Badge> : num(security.summary?.fails_15m)}
          </Row>
          <Row label="Password changes/resets">{num(security.summary?.password_changes)}</Row>
          <Row label="Session version">{user.session_version}</Row>
          <div className="mt-4 flex flex-wrap gap-3">
            {!user.email_verified && (
              <ActionButton label="Resend verification" confirmLabel="Send email?" run={resendVerification.bind(null, user.id)} />
            )}
            <ActionButton label="Force sign-out" confirmLabel="Sign out everywhere?" tone="red" run={forceSignOut.bind(null, user.id)} />
          </div>
        </Card>
      </div>

      {/* Chart analyses */}
      <Card
        title="Latest chart analyses"
        sub={aStats ? `${num(aStats.total)} total · BUY ${pct(aStats.buy, aStats.total)} · SELL ${pct(aStats.sell, aStats.total)} · No trade ${pct(aStats.neutral, aStats.total)}` : undefined}
      >
        {analyses.length === 0 ? (
          <p className="text-sm text-gray-500">No analyses yet.</p>
        ) : (
          <div className="space-y-2">
            {analyses.map((a) => (
              <details key={a.id} className="group rounded-xl border border-white/15 bg-white/[0.02]">
                <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <span className="w-36 text-gray-400">{dateTime(a.created_at)}</span>
                  <span className="w-28 font-medium text-white">{a.pair} · {a.timeframe}</span>
                  <Badge color={SIGNAL_COLOR[a.signal as keyof typeof SIGNAL_COLOR] ?? "gray"}>
                    {a.signal === "NEUTRAL" ? "No trade" : `${a.signal} ${a.confidence}%`}
                  </Badge>
                  <span className="text-gray-300">Entry {price(a.entry)} · SL {price(a.sl)} · TP1 {price(a.tp1)} · TP2 {price(a.tp2)}</span>
                  <span className="text-gray-400">{a.rr_ratio != null ? `R:R 1:${a.rr_ratio}` : ""}</span>
                  <span className="ml-auto flex gap-2 text-xs text-gray-500">
                    {a.variant && <Badge>{a.variant}</Badge>}
                    {a.model && <span>{a.model}</span>}
                    {a.cost_usd != null && <span>{usdSmall(a.cost_usd)}</span>}
                  </span>
                </summary>
                <div className="border-t border-white/10 px-4 py-3">
                  {a.result ? (
                    <pre className="max-h-96 overflow-auto whitespace-pre-wrap text-xs text-gray-300">{JSON.stringify(JSON.parse(a.result), null, 2)}</pre>
                  ) : (
                    <p className="text-xs text-gray-500">Full result not stored (analysis made before 2026-09-28).</p>
                  )}
                  {a.prompt_tokens != null && (
                    <p className="mt-2 text-xs text-gray-500">Tokens: {num(a.prompt_tokens)} in · {num(a.completion_tokens)} out</p>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        {/* Timeline */}
        <Card accent="fuchsia" icon={Activity} title="Activity timeline" sub="Newest first, last 80 entries" className="xl:col-span-2">
          <ol className="space-y-1.5">
            {timeline.map((e, i) => {
              const d = describe(e)
              return (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="w-36 shrink-0 text-xs text-gray-500">{dateTime(e.created_at)}</span>
                  <Badge color={d.color}>{d.label}</Badge>
                  <span className="truncate text-gray-300">{d.detail}</span>
                </li>
              )
            })}
          </ol>
        </Card>

        <div className="space-y-4">
          <Card accent="sky" icon={LineChart} title="Trading">
            <Row label="Trades logged">{num(trading?.trades)}</Row>
            <Row label="Win rate">{trading ? pct(trading.wins, trading.wins + trading.losses) : "—"}</Row>
            <Row label="Total P&L">
              <span className={(trading?.pnl ?? 0) >= 0 ? "text-emerald-300" : "text-rose-300"}>{trading ? trading.pnl.toLocaleString("en-US", { maximumFractionDigits: 2 }) : "—"}</span>
            </Row>
            <Row label="Trade dates">{trading?.first ? `${dateOnly(trading.first)} → ${dateOnly(trading.last)}` : "—"}</Row>
            <Row label="Monthly goals set">{num(trading?.goals)}</Row>
          </Card>

          <Card accent="violet" icon={Radar} title="TradingView indicator">
            <Row label="Username">{user.tradingview_username ? `@${user.tradingview_username}` : "—"}</Row>
            <Row label="Requested">{dateTime(user.indicator_requested_at)}</Row>
            <Row label="Invited">{user.indicator_invited_at ? dateTime(user.indicator_invited_at) : user.indicator_requested_at ? <Badge color="amber">Pending</Badge> : "—"}</Row>
            {user.indicator_requested_at && !user.indicator_invited_at && (
              <div className="mt-3">
                <ActionButton label="Mark invited" confirmLabel="Added on TradingView?" run={markIndicatorInvited.bind(null, user.id)} />
              </div>
            )}
          </Card>

          <Card accent="sky" icon={LogIn} title="Recent sign-ins">
            {security.logins.length === 0 ? (
              <p className="text-sm text-gray-500">None recorded yet.</p>
            ) : (
              security.logins.map((l, i) => {
                const m = parse(l.meta)
                return (
                  <div key={i} className="flex justify-between py-1 text-xs">
                    <span className="text-gray-400">{dateTime(l.created_at)}</span>
                    <span className={l.type === "login" ? "text-gray-300" : "text-rose-300"}>
                      {l.type === "login" ? "OK" : "Failed"} · {String(m.ip ?? "?")}
                    </span>
                  </div>
                )
              })
            )}
          </Card>
        </div>
      </div>

      <Card accent="fuchsia" icon={Bot} title="AI Bot conversation" sub="Debug only">
        <ChatViewer userId={user.id} total={security.summary?.chat_messages ?? 0} />
      </Card>

      {user.plan_kind !== "free" && !user.last_seen_at && (
        <Notice tone="blue">This paying user has no &quot;last seen&quot; yet: it is recorded from 2026-09-28 on their next visit.</Notice>
      )}
    </div>
  )
}
