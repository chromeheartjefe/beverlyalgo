"use client"

import { Check, GraduationCap } from "lucide-react"
import Link from "next/link"

import { money } from "@/components/dashboard/paper-trading/account-runway"
import { type Hints, Term } from "@/components/dashboard/paper-trading/order-ticket"
import { statsOf } from "@/lib/sim/rules"
import type { SimTradeView } from "@/lib/sim/server"
import { cn } from "@/lib/utils"

const CARD = "rounded-2xl border border-white/15 bg-white/[0.025] p-4 sm:p-5"

/** A mission as the page needs it: the server adds the lesson's title and address */
export interface MissionView {
  id: string
  title: string
  goal: string
  xp: number
  lesson: { title: string; href: string } | null
  /** Glossary terms to offer: slug and the word to show */
  terms: { slug: string; label: string }[]
}

// ─── Missions ────────────────────────────────────────────────────────────────

export function MissionsPanel({ missions, done, hints }: { missions: MissionView[]; done: string[]; hints: Hints }) {
  const completed = new Set(done)
  const earned = missions.filter((m) => completed.has(m.id)).reduce((sum, m) => sum + m.xp, 0)
  const total = missions.reduce((sum, m) => sum + m.xp, 0)
  // What is still open comes first; finished missions sink to the bottom
  const ordered = [...missions.filter((m) => !completed.has(m.id)), ...missions.filter((m) => completed.has(m.id))]
  return (
    <section aria-label="Missions" className={CARD}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-base font-semibold text-white">Missions</h2>
        <p className="text-sm tabular-nums text-amber-200">
          {earned} of {total} XP
        </p>
      </div>
      <p className="mt-1 text-sm text-gray-400">Each one puts an Academy lesson into practice and pays Academy XP once.</p>
      <ul className="mt-4 space-y-2.5">
        {ordered.map((m) => {
          const isDone = completed.has(m.id)
          return (
            <li key={m.id} className={cn("rounded-xl border p-3", isDone ? "border-emerald-400/20 bg-emerald-500/[0.05]" : "border-white/10 bg-white/[0.02]")}>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center border",
                    isDone ? "border-emerald-400 bg-emerald-500/20 text-emerald-300" : "border-white/25",
                  )}
                  aria-hidden
                >
                  {isDone && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className={cn("text-sm font-semibold", isDone ? "text-gray-300" : "text-white")}>
                      {m.title}
                      {isDone && <span className="sr-only"> (done)</span>}
                    </p>
                    <span className={cn("shrink-0 text-xs font-semibold tabular-nums", isDone ? "text-emerald-300" : "text-amber-200")}>
                      {isDone ? "Done" : `+${m.xp} XP`}
                    </span>
                  </div>
                  {!isDone && (
                    <>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">{m.goal}</p>
                      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                        {m.lesson && (
                          <Link href={m.lesson.href} className="inline-flex items-center gap-1 font-medium text-purple-300 hover:text-purple-200">
                            <GraduationCap className="size-3.5" aria-hidden />
                            {m.lesson.title}
                          </Link>
                        )}
                        {m.terms.map((t) => (
                          <span key={t.slug}>
                            <Term slug={t.slug} hints={hints}>{t.label}</Term>
                          </span>
                        ))}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

// ─── Numbers and history ─────────────────────────────────────────────────────

const signed = (v: number, digits = 2) => `${v >= 0 ? "+" : ""}${v.toFixed(digits)}`

export function StatsPanel({ trades, hints }: { trades: SimTradeView[]; hints: Hints }) {
  const stats = statsOf(trades)
  return (
    <section aria-label="Your numbers" className={CARD}>
      <h2 className="text-base font-semibold text-white">Your numbers</h2>
      {!stats ? (
        <p className="mt-2 text-sm leading-relaxed text-gray-400">Close a trade and your win rate, average result and expectancy show up here.</p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
            <Stat label={<Term slug="win-rate" hints={hints}>Win rate</Term>} value={`${Math.round(stats.winRate * 100)}%`} />
            <Stat
              label={<Term slug="expectancy" hints={hints}>Expectancy</Term>}
              value={`${signed(stats.expectancy)}R`}
              tone={stats.expectancy > 0 ? "up" : stats.expectancy < 0 ? "down" : undefined}
            />
            <Stat label="Average win" value={stats.averageWin ? `${signed(stats.averageWin)}R` : "none yet"} />
            <Stat label="Average loss" value={stats.averageLoss ? `${signed(stats.averageLoss)}R` : "none yet"} />
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            {stats.trades < 20
              ? `Based on ${stats.trades} ${stats.trades === 1 ? "trade" : "trades"}. That is still too few to say anything about a strategy.`
              : `Based on your last ${stats.trades} trades. Prices here are random, so over time expect a result near zero minus the spread. What you are practising is the process.`}
          </p>
        </>
      )}

      {trades.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-semibold text-white">Recent trades</h3>
          <ul className="mt-2 divide-y divide-white/[0.06]">
            {trades.slice(0, 8).map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-gray-300">
                  {t.side === "long" ? "Long" : "Short"}
                  <span className="ml-2 text-xs text-gray-500">{t.reason === "target" ? "target" : t.reason === "stop" ? "stop" : "closed by hand"}</span>
                </span>
                <span className={cn("tabular-nums font-medium", t.r >= 0 ? "text-emerald-400" : "text-rose-400")}>
                  {signed(t.r)}R
                  <span className="ml-2 inline-block w-20 text-right text-xs text-gray-400">
                    {t.pnl >= 0 ? "+" : ""}
                    {money(t.pnl)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

function Stat({ label, value, tone }: { label: React.ReactNode; value: string; tone?: "up" | "down" }) {
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className={cn("mt-0.5 text-lg font-semibold tabular-nums", tone === "up" ? "text-emerald-400" : tone === "down" ? "text-rose-400" : "text-white")}>{value}</dd>
    </div>
  )
}
