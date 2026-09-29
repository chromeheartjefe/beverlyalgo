"use client"

import { motion, useReducedMotion } from "framer-motion"
import { useSession } from "next-auth/react"
import { type ReactNode, useMemo, useState } from "react"
import useSWR from "swr"

import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist"
import { AiAnalysesCard,type AnalysisRow } from "@/components/dashboard/overview/ai-analyses-card"
import { GoalCard } from "@/components/dashboard/overview/goal-card"
import { MarketPulse } from "@/components/dashboard/overview/market-pulse"
import { MarketSessions } from "@/components/dashboard/overview/market-sessions"
import { QuickActions } from "@/components/dashboard/overview/quick-actions"
import { ScreenerPicks } from "@/components/dashboard/overview/screener-picks"
import type { Goal } from "@/components/dashboard/trade-calendar/utils"
import { fetcher } from "@/lib/swr"
import type { TradeRow } from "@/lib/trades"
import { cn } from "@/lib/utils"

// sessionStorage so the entrance plays once, on the first /dashboard visit of
// a browser session, and stays instant on every return to this tab after:
// a cascade on each tab switch read as lag, not polish.
const REVEAL_KEY = "dashboardRevealed"

function Item({ index, reveal, className, children }: { index: number; reveal: boolean; className?: string; children: ReactNode }) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      initial={reveal ? (reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.985 }) : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: reduceMotion ? 0.2 : 0.4, delay: reveal ? index * 0.06 : 0, ease: [0.22, 1, 0.36, 1] }}
      className={cn("min-w-0", className)}
    >
      {children}
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const plan = (session?.user as { plan?: string } | undefined)?.plan
  const isFree = status === "authenticated" && (plan ?? "free") === "free"

  // Same SWR keys as the Journal, Calendar and Chart Analysis pages, so
  // switching tabs shows cached data instantly instead of refetching.
  const { data: tradesData }   = useSWR<TradeRow[]>("/api/trades", fetcher)
  const { data: analysesData } = useSWR<AnalysisRow[]>(isFree ? null : "/api/analyses", fetcher)
  const { data: goalsData }    = useSWR<Goal[]>("/api/trading-goals", fetcher)

  const trades   = useMemo(() => tradesData ?? [], [tradesData])
  const analyses = useMemo(() => analysesData ?? [], [analysesData])
  const goals    = useMemo(() => goalsData ?? [], [goalsData])

  const [reveal] = useState(() => {
    if (typeof window === "undefined") return false
    try {
      const first = !window.sessionStorage.getItem(REVEAL_KEY)
      if (first) window.sessionStorage.setItem(REVEAL_KEY, "1")
      return first
    } catch {
      return false
    }
  })

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-purple-300/80" suppressHydrationWarning>
            {today}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Your trading day at a glance: your month, the markets and AI picks.</p>
        </div>
      </div>

      <OnboardingChecklist hasTrades={trades.length > 0} hasAnalyses={analyses.length > 0} />

      <Item index={0} reveal={reveal}>
        <QuickActions isFree={isFree} />
      </Item>

      {/* "This month" is the tall card; the market cards stack beside it */}
      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-12">
        <Item index={1} reveal={reveal} className="md:row-span-2 xl:col-span-5">
          <GoalCard trades={trades} goals={goals} loading={tradesData === undefined || goalsData === undefined} />
        </Item>
        <Item index={2} reveal={reveal} className="xl:col-span-7">
          <MarketPulse />
        </Item>
        <Item index={3} reveal={reveal} className="xl:col-span-7">
          <MarketSessions />
        </Item>
        <Item index={4} reveal={reveal} className="xl:col-span-7">
          <ScreenerPicks />
        </Item>
        <Item index={5} reveal={reveal} className="xl:col-span-5">
          <AiAnalysesCard analyses={analyses} loading={status === "loading" || (!isFree && analysesData === undefined)} isFree={isFree} />
        </Item>
      </div>
    </div>
  )
}
