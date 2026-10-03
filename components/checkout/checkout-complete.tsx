"use client"

import { ArrowRight, Check, Clock, Loader2, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { PAID_PLANS, type PaidPlan } from "@/config/plans"
import { siteConfig } from "@/config/site"
import type { PlanStatus } from "@/lib/plan-status"

// After a payment. The page that renders this has normally granted access
// already (granted). When it couldn't, the webhook does, usually within a
// couple of seconds: then this waits for the account to show Pro and says so.

const POLL_MS = 1500
// After this long, stop the spinner and reassure instead
const SLOW_AFTER_MS = 30_000

type Stage = "activating" | "active" | "slow"

export function CheckoutComplete({ plan, pending, granted }: { plan: PaidPlan; pending: boolean; granted: boolean }) {
  const { update } = useSession()
  const [stage, setStage] = useState<Stage>(granted ? "active" : "activating")

  useEffect(() => {
    if (pending) return
    if (granted) {
      // Already Pro: only the signed-in session needs to catch up, so the dashboard opens as Pro
      void update().catch(() => {})
      return
    }
    let stopped = false
    const started = Date.now()

    const check = async () => {
      if (stopped) return
      try {
        const res = await fetch("/api/user/plan", { cache: "no-store" })
        const status = res.ok ? ((await res.json()) as PlanStatus) : null
        if (stopped) return
        if (status?.plan === "pro") {
          // Refresh the signed-in session, so the dashboard opens as Pro
          await update().catch(() => {})
          if (!stopped) setStage("active")
          return
        }
      } catch {
        // A failed check is just a later retry
      }
      if (stopped) return
      if (Date.now() - started > SLOW_AFTER_MS) setStage("slow")
      setTimeout(check, POLL_MS)
    }
    void check()

    return () => {
      stopped = true
    }
  }, [pending, granted, update])

  const planName = PAID_PLANS[plan].name

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-[#09090f] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "radial-gradient(55% 45% at 50% 0%, rgba(147,51,234,0.32), transparent 70%)" }}
      />
      <header className="relative mx-auto flex w-full max-w-5xl items-center px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300">
          <Image src="/logo_transparent.png" alt="" width={28} height={28} className="size-7 object-contain" />
          <span className="text-lg font-bold tracking-tight">
            Entrix<span className="text-purple-400">Algo</span>
          </span>
        </Link>
      </header>

      <main id="main-content" className="relative flex flex-1 items-center justify-center px-4 pb-20">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0d0d1c] p-7 text-center shadow-[0_0_60px_-24px_rgba(168,85,247,0.6)] sm:p-8" aria-live="polite">
          {pending ? (
            <>
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-500/10">
                <Clock className="size-7 text-amber-300" aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-bold">Your payment is on its way</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Your bank is still processing it. {planName} unlocks automatically as soon as the payment arrives, and nothing else is needed from you.
              </p>
              <Link
                href="/dashboard"
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                Go to dashboard
              </Link>
            </>
          ) : stage === "active" ? (
            <>
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-emerald-400/30 bg-emerald-500/15 shadow-[0_0_40px_-8px_rgba(52,211,153,0.7)]">
                <Check className="size-7 text-emerald-300" strokeWidth={2.5} aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-bold">You&apos;re on Pro</h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Payment received and {planName} is active. Every Pro tool is unlocked on your account.
              </p>
              <Link
                href="/dashboard/chart-analysis"
                className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 text-base font-semibold text-white shadow-[0_0_32px_-6px_rgba(192,38,211,0.75)] transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200"
              >
                <Zap className="size-4" aria-hidden />
                Analyze a chart
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/dashboard"
                className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-purple-400/25 bg-purple-500/10">
                <Loader2 className="size-7 animate-spin text-purple-300" aria-hidden />
              </div>
              <h1 className="mt-5 text-xl font-bold">Payment received</h1>
              {stage === "activating" ? (
                <p className="mt-2 text-sm leading-relaxed text-gray-400">Activating {planName} on your account. This takes a few seconds.</p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Activation is taking longer than usual. Your payment is safe and {planName} will unlock on its own. If it has not within a few
                  minutes, write to{" "}
                  <a className="text-purple-300 underline underline-offset-2" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
                </p>
              )}
              <Link
                href="/dashboard"
                className="mt-6 flex min-h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
              >
                Go to dashboard
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
