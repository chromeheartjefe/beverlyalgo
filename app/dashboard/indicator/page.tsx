"use client"

import { Activity, AlertTriangle, CheckCircle2, Clock, ExternalLink, Loader2, Sparkles } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { FeatureLock } from "@/components/dashboard/feature-lock"
import { IndicatorSignalPreview } from "@/components/dashboard/indicator-signal-preview"
import { cn } from "@/lib/utils"

type AccessState = {
  tradingviewUsername:  string | null
  indicatorRequestedAt: string | null
  indicatorInvitedAt:   string | null
}

const HOW_TO = [
  {
    step: "01",
    title: "Request access",
    body: "Enter your TradingView username below. We queue it for the next invite run — invites go out once a day.",
  },
  {
    step: "02",
    title: "Accept the invite",
    body: "TradingView will email you and show a pending invite on the indicator's page. Accept it from your TradingView account.",
  },
  {
    step: "03",
    title: "Add it to your chart",
    body: "Open any chart, click Indicators, find it under Invite-only scripts, and add it. Signals paint automatically.",
  },
]

const CHANGELOG = [
  {
    version: "3.4.0",
    date:    "Aug 5, 2026",
    tag:     "Added",
    title:   "Smarter confluence filtering",
    notes: [
      "Signals now cross-check volume profile before firing, cutting low-conviction alerts.",
      "New confidence badge shown directly on-chart next to each signal.",
    ],
  },
  {
    version: "3.3.2",
    date:    "Jul 18, 2026",
    tag:     "Fixed",
    title:   "Repainting edge case on lower timeframes",
    notes: [
      "Fixed a rare repaint on the 1m/5m chart during low-liquidity gaps.",
      "Improved alert timestamp accuracy for exchanges with irregular candle close times.",
    ],
  },
  {
    version: "3.3.0",
    date:    "Jun 30, 2026",
    tag:     "Added",
    title:   "Multi-timeframe trend bias",
    notes: [
      "Adds a higher-timeframe trend arrow so signals can be filtered with the broader trend.",
      "New settings panel toggle: 'Require HTF confluence'.",
    ],
  },
  {
    version: "3.2.0",
    date:    "Jun 2, 2026",
    tag:     "Improved",
    title:   "Faster signal recalculation",
    notes: [
      "Reworked internal indicator pipeline — roughly 40% faster recalculation on chart replay.",
      "Reduced visual clutter by merging overlapping TP/SL labels.",
    ],
  },
  {
    version: "3.1.0",
    date:    "May 10, 2026",
    tag:     "Added",
    title:   "Custom alert templates",
    notes: [
      "Webhook-ready alert messages with pair, direction, entry, TP1/TP2, and SL placeholders.",
      "Added Discord-friendly formatting preset.",
    ],
  },
  {
    version: "3.0.0",
    date:    "Apr 14, 2026",
    tag:     "Added",
    title:   "Full v3 signal engine rewrite",
    notes: [
      "New core engine — same signal logic now available in the dashboard's Chart Analysis tool.",
      "Invite-only access moved to a 48-hour queued process to keep invite batches reliable.",
    ],
  },
]

const TAG_STYLES: Record<string, string> = {
  Added:    "border-emerald-500/25 bg-emerald-500/10 text-emerald-400",
  Improved: "border-purple-500/25 bg-purple-500/10 text-purple-400",
  Fixed:    "border-amber-500/25 bg-amber-500/10 text-amber-400",
}

export default function IndicatorPage() {
  const { data: session } = useSession()
  const plan   = (session?.user as { plan?: string })?.plan ?? "free"
  const locked = plan === "free"

  const [state, setState]     = useState<AccessState | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    if (locked) { setLoading(false); return }
    fetch("/api/indicator")
      .then((r) => (r.ok ? r.json() : null))
      .then(setState)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [locked])

  const submit = async () => {
    const trimmed = username.trim()
    if (!trimmed || submitting) return

    setError(null)
    setSubmitting(true)
    try {
      const res  = await fetch("/api/indicator", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ tradingviewUsername: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.")
      setState(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  const requested = !!state?.indicatorRequestedAt
  const invited   = !!state?.indicatorInvitedAt

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
          <Activity className="size-3" />
          AI Trading Indicator
        </div>
        <h1 className="mt-3 text-2xl font-bold text-white">TradingView Indicator</h1>
        <p className="mt-1 text-sm text-gray-500">
          The invite-only script this whole product started with — real-time signals painted directly on your chart.
        </p>
      </div>

      <FeatureLock locked={locked} feature="AI Trading Indicator">
        {/* Access request */}
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div>
              <h2 className="text-sm font-semibold text-white">Request indicator access</h2>
              <p className="mt-1.5 text-xs text-gray-500">
                Invites are sent once a day in a single batch. Submit your TradingView username and you&apos;ll get access within 48 hours.
              </p>
            </div>

            <div className="mt-5">
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Loader2 className="size-3.5 animate-spin" /> Checking your status…
                </div>
              ) : invited ? (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-4 py-3.5">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                  <div>
                    <p className="text-sm font-medium text-emerald-400">You&apos;re in!</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Access was granted to <span className="font-medium text-gray-300">@{state?.tradingviewUsername}</span>. Check your TradingView notifications for the invite.
                    </p>
                  </div>
                </div>
              ) : requested ? (
                <div className="flex items-start gap-3 rounded-xl border border-purple-500/20 bg-purple-500/[0.07] px-4 py-3.5">
                  <Clock className="mt-0.5 size-4 shrink-0 text-purple-400" />
                  <div>
                    <p className="text-sm font-medium text-purple-400">Request received</p>
                    <p className="mt-1 text-xs text-gray-400">
                      <span className="font-medium text-gray-300">@{state?.tradingviewUsername}</span> will get access within 48 hours. No further action needed.
                    </p>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={(e) => { e.preventDefault(); submit() }}
                  className="space-y-3"
                >
                  <label className="block text-xs font-medium text-gray-400">
                    TradingView username
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="your_tradingview_handle"
                      maxLength={50}
                      disabled={submitting}
                      className="mt-1.5 w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-60"
                    />
                  </label>
                  {error && (
                    <div className="flex items-start gap-2 text-xs text-red-400">
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                      {error}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={submitting || !username.trim()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-400 disabled:opacity-40"
                  >
                    {submitting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                    Request access
                  </button>
                </form>
              )}
            </div>
          </div>

          <IndicatorSignalPreview />
        </div>

        {/* How to use */}
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-white">How to use it</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {HOW_TO.map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <span className="text-[0.65rem] font-bold tracking-[0.3em] text-purple-400">STEP {s.step}</span>
                <h3 className="mt-2 text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Changelog */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Changelog</h2>
            <a
              href="https://www.tradingview.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-purple-400"
            >
              View on TradingView <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="mt-4 space-y-3">
            {CHANGELOG.map((entry) => (
              <div
                key={entry.version}
                className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={cn(
                      "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                      TAG_STYLES[entry.tag]
                    )}
                  >
                    {entry.tag}
                  </span>
                  <span className="text-xs font-medium text-gray-300">v{entry.version}</span>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-gray-600">{entry.date}</span>
                </div>
                <h3 className="mt-2.5 text-sm font-semibold text-white">{entry.title}</h3>
                <ul className="mt-2 space-y-1">
                  {entry.notes.map((n, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-gray-500">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-gray-600" />
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </FeatureLock>
    </div>
  )
}
