"use client"

import { Check } from "lucide-react"

import { failBalance, levelInfo, LEVELS, MIN_TRADES, passBalance, type SimAccount } from "@/lib/sim/rules"
import { cn } from "@/lib/utils"

export const money = (v: number, digits = 2) =>
  `${v < 0 ? "-" : ""}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`

const shortMoney = (v: number) => (v >= 1000 ? `$${v / 1000}K` : `$${v}`)

// The account as a runway: the fail line on the left, the pass line on the
// right, and the account's value moving between them as trades play out.
// It is the one thing on the page that says, at a glance, how the game stands.
export function AccountRunway({ account, equity, today }: { account: SimAccount; equity: number; today: string }) {
  const info = levelInfo(account.level)
  const fail = failBalance(account, today)
  const pass = passBalance(account)
  const span = pass - fail.balance
  const at = (v: number) => Math.min(Math.max((v - fail.balance) / span, 0), 1) * 100
  const change = equity - account.startBalance
  const tradesLeft = Math.max(MIN_TRADES - account.trades, 0)

  return (
    <section aria-label="Practice account" className="rounded-2xl border border-white/15 bg-white/[0.025] p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div>
          <p className="text-sm text-gray-400">
            {info.name} account, level {account.level} of {LEVELS.length}
          </p>
          <p className="mt-0.5 text-3xl font-bold tabular-nums tracking-tight text-white">{money(equity)}</p>
          <p className={cn("mt-0.5 text-sm font-medium tabular-nums", change > 0 ? "text-emerald-400" : change < 0 ? "text-rose-400" : "text-gray-400")}>
            {change >= 0 ? "+" : ""}
            {money(change)} ({change >= 0 ? "+" : ""}
            {((change / account.startBalance) * 100).toFixed(2)}%) on virtual money
          </p>
        </div>

        {/* The ladder of accounts */}
        <ol className="flex items-center gap-1.5" aria-label="Account levels">
          {LEVELS.map((l) => {
            const done = l.level < account.level
            const current = l.level === account.level
            return (
              <li
                key={l.level}
                aria-current={current ? "step" : undefined}
                className={cn(
                  "flex h-8 items-center gap-1 border px-2.5 text-xs font-semibold tabular-nums",
                  current
                    ? "border-purple-400/60 bg-purple-500/20 text-white"
                    : done
                      ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300"
                      : "border-white/10 bg-white/[0.02] text-gray-500",
                )}
              >
                {done && <Check className="size-3" aria-hidden />}
                {shortMoney(l.balance)}
              </li>
            )
          })}
        </ol>
      </div>

      {/* The runway */}
      <div className="mt-5">
        <div
          role="meter"
          aria-label="Account value between the fail line and the pass line"
          aria-valuemin={Math.round(fail.balance)}
          aria-valuemax={Math.round(pass)}
          aria-valuenow={Math.round(equity)}
          className="relative h-3 bg-gradient-to-r from-rose-500/45 via-white/[0.08] to-emerald-500/45"
        >
          {/* Where the account started */}
          <span className="absolute inset-y-[-3px] w-px bg-white/40" style={{ left: `${at(account.startBalance)}%` }} aria-hidden />
          {/* Where it is now */}
          <span
            className="absolute top-1/2 h-6 w-1.5 -translate-x-1/2 -translate-y-1/2 bg-purple-300 shadow-[0_0_14px_rgba(167,139,250,0.9)] transition-[left] duration-200 ease-out motion-reduce:transition-none"
            style={{ left: `${at(equity)}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-2.5 flex flex-wrap items-start justify-between gap-x-4 gap-y-1 text-xs">
          <p className="text-rose-300">
            Fails at <span className="font-semibold tabular-nums">{money(fail.balance)}</span>
            <span className="text-gray-500"> ({fail.reason === "daily" ? "4% daily limit" : "10% from the peak"})</span>
          </p>
          <p className="text-gray-400">
            {tradesLeft > 0 ? `${account.trades} of ${MIN_TRADES} trades needed to pass` : `${account.trades} trades taken`}
          </p>
          <p className="text-emerald-300">
            Passes at <span className="font-semibold tabular-nums">{money(pass)}</span>
          </p>
        </div>
      </div>
    </section>
  )
}
