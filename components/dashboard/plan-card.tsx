"use client"

import { Check, Crown, Sparkles } from "lucide-react"
import Link from "next/link"
import useSWR from "swr"

import { Loaded } from "@/components/ui/motion"
import type { PlanStatus } from "@/lib/plan-status"
import { fetcher } from "@/lib/swr"
import { cn } from "@/lib/utils"

const PLAN_CARD_KEY = "/api/user/plan"

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })

const STATUS = {
  active:    { label: "Active",    pill: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300", dot: "bg-emerald-400" },
  canceling: { label: "Canceling", pill: "border-amber-400/30 bg-amber-500/10 text-amber-300",       dot: "bg-amber-400"   },
  past_due:  { label: "Past due",  pill: "border-red-400/30 bg-red-500/10 text-red-300",             dot: "bg-red-400"     },
  ended:     { label: "Ended",     pill: "border-red-400/30 bg-red-500/10 text-red-300",             dot: "bg-red-400"     },
} as const

// ─── Pro ──────────────────────────────────────────────────────────────────────

// The billing line arrives from Stripe after the card renders: it fades in
// over its placeholder instead of popping in
function Detail({ data }: { data: PlanStatus | undefined }) {
  return (
    <Loaded loading={!data} fallback={<span className="block h-3 w-28 animate-pulse rounded bg-white/[0.06]" aria-hidden="true" />}>
      {data && <DetailText data={data} />}
    </Loaded>
  )
}

function DetailText({ data }: { data: PlanStatus }) {
  if (data.billing === "monthly") {
    if (data.status === "ended") {
      return (
        <span className="text-red-300">
          Subscription ended.{" "}
          <Link href="/#pricing" className="font-medium underline underline-offset-2 hover:text-white">
            Renew
          </Link>
        </span>
      )
    }
    if (data.status === "past_due") {
      return (
        <span className="text-red-300">
          Payment failed.{" "}
          <Link href="/dashboard/settings" className="font-medium underline underline-offset-2 hover:text-white">
            Update card
          </Link>
        </span>
      )
    }
    if (!data.periodEnd) return <span>Monthly</span>
    return data.status === "canceling"
      ? <span className="text-amber-200">Access until {fmtDate(data.periodEnd)}</span>
      : <span>Monthly · renews {fmtDate(data.periodEnd)}</span>
  }
  if (data.billing === "lifetime") return <span>Lifetime access</span>
  return <span>Full access</span>
}

function ProCard({ data }: { data: PlanStatus | undefined }) {
  const s = STATUS[data?.status ?? "active"]
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-purple-500/25 bg-gradient-to-r from-purple-500/[0.10] to-transparent px-3 py-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/[0.18]">
        <Crown className="size-4 text-purple-300" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold leading-tight text-white">Pro plan</p>
          <span
            role="status"
            className={cn("flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-px text-[11px] font-medium", s.pill)}
          >
            <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden="true" />
            {s.label}
          </span>
        </div>
        <div className="mt-0.5 truncate text-xs leading-tight text-gray-400">
          <Detail data={data} />
        </div>
      </div>
    </div>
  )
}

// ─── Free ─────────────────────────────────────────────────────────────────────

const PRO_UNLOCKS = ["AI Chart Analysis", "AI Trading Indicator", "AI Trading Bot"]

function FreeCard({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="rounded-2xl border border-purple-500/25 bg-gradient-to-b from-purple-500/[0.10] to-transparent p-4">
      <div className="flex items-center gap-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-purple-500/[0.18]">
          <Sparkles className="size-4 text-purple-300" aria-hidden="true" />
        </div>
        <p className="text-sm font-semibold leading-tight text-white">Free plan</p>
      </div>
      <p className="mt-3 text-xs text-gray-400">Go Pro to unlock:</p>
      <ul className="mt-1.5 space-y-1">
        {PRO_UNLOCKS.map((f) => (
          <li key={f} className="flex items-center gap-2 text-xs text-gray-200">
            <Check className="size-3.5 shrink-0 text-purple-300" aria-hidden="true" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/#pricing"
        onClick={onNavigate}
        className="mt-3.5 block w-full rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 py-2 text-center text-xs font-semibold text-white shadow-lg shadow-purple-950/30 transition-colors hover:from-purple-500 hover:to-purple-400"
      >
        Upgrade to Pro
      </Link>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function PlanCard({ isFree, loading, onNavigate }: { isFree: boolean; loading: boolean; onNavigate?: () => void }) {
  // Only Pro accounts need the status call (it asks Stripe for monthly subs).
  const { data } = useSWR<PlanStatus>(isFree || loading ? null : PLAN_CARD_KEY, fetcher, { revalidateOnFocus: false })

  // Until the session loads we don't know the plan; a neutral placeholder
  // avoids flashing the Free card at Pro users.
  if (loading) {
    return <div className="h-14 animate-pulse rounded-xl border border-white/15 bg-white/[0.02]" aria-hidden="true" />
  }

  // The session can say Pro a moment before the DB-backed status catches up
  // (or the other way round after a plan ends); trust the fresher answer.
  if (isFree || data?.plan === "free") return <FreeCard onNavigate={onNavigate} />
  return <ProCard data={data} />
}
