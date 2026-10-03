"use client"

import { ArrowDownRight, ArrowUpRight, Loader2, RotateCcw, ShieldCheck, Trophy, X } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { GlossaryTerm } from "@/components/dashboard/academy/glossary-hint"
import { money } from "@/components/dashboard/paper-trading/account-runway"
import type { GlossaryHint } from "@/lib/glossary/hints"
import {
  fillPrice, levelInfo, MAX_LEVEL, type OpenPosition, RISK_CHOICES, type SimAccount, STOP_CHOICES, TARGET_CHOICES,
} from "@/lib/sim/rules"
import type { SimTradeView } from "@/lib/sim/server"
import { cn } from "@/lib/utils"

export type Hints = Record<string, GlossaryHint>

/** A word that opens its glossary entry, when we have one */
export function Term({ slug, hints, children }: { slug: string; hints: Hints; children: string }) {
  const hint = hints[slug]
  return hint ? <GlossaryTerm text={children} hint={hint} /> : <>{children}</>
}

export interface TicketSettings {
  riskPct: number
  stopId: (typeof STOP_CHOICES)[number]["id"]
  targetR: number | null
}

const CARD = "rounded-2xl border border-white/15 bg-white/[0.025] p-4 sm:p-5"

function Chips<T extends string | number | null>({
  label, value, options, onChange,
}: {
  label: ReactNode
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-gray-300">{label}</legend>
      <div className="grid auto-cols-fr grid-flow-col gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
            className={cn(
              "min-h-11 rounded-xl border px-2 text-sm font-semibold tabular-nums transition-colors",
              o.value === value
                ? "border-purple-400/60 bg-purple-500/20 text-white"
                : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25 hover:text-gray-200",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  )
}

// ─── New trade ───────────────────────────────────────────────────────────────

export function NewTradeCard({
  settings, onSettings, balance, price, stopDistance, hints, disabled, onOpen,
}: {
  settings: TicketSettings
  onSettings: (next: TicketSettings) => void
  balance: number
  price: number
  /** Stop distance in price for the chosen stop size, from the market's recent candles */
  stopDistance: number
  hints: Hints
  disabled: boolean
  onOpen: (side: "long" | "short") => void
}) {
  const risk = balance * settings.riskPct
  return (
    <section aria-label="New trade" className={CARD}>
      <h2 className="text-base font-semibold text-white">New trade</h2>
      <div className="mt-4 space-y-4">
        <Chips
          label={
            <>
              <Term slug="risk-per-trade" hints={hints}>Risk</Term>: {money(risk)} of the account
            </>
          }
          value={settings.riskPct}
          options={RISK_CHOICES.map((r) => ({ value: r as number, label: `${r * 100}%` }))}
          onChange={(riskPct) => onSettings({ ...settings, riskPct })}
        />
        <Chips
          label={
            <>
              <Term slug="stop-loss" hints={hints}>Stop</Term>: {stopDistance.toFixed(2)} away from your entry
            </>
          }
          value={settings.stopId}
          options={STOP_CHOICES.map((s) => ({ value: s.id, label: s.label }))}
          onChange={(stopId) => onSettings({ ...settings, stopId })}
        />
        <Chips
          label={
            <>
              <Term slug="take-profit" hints={hints}>Target</Term>:{" "}
              {settings.targetR === null ? "none, you close the trade yourself" : `+${money(risk * settings.targetR)} if reached`}
            </>
          }
          value={settings.targetR}
          options={TARGET_CHOICES.map((t) => ({ value: t, label: t === null ? "None" : `${t}R` }))}
          onChange={(targetR) => onSettings({ ...settings, targetR })}
        />
      </div>

      <p className="mt-4 text-sm text-gray-400">
        Size: <span className="font-medium tabular-nums text-gray-200">{(risk / stopDistance).toFixed(2)} units</span>, worked out so the stop costs
        exactly {money(risk)}.
      </p>

      <div className="mt-4 hidden grid-cols-2 gap-2 lg:grid">
        <SideButton side="short" price={fillPrice(price, false)} disabled={disabled} onClick={() => onOpen("short")} />
        <SideButton side="long" price={fillPrice(price, true)} disabled={disabled} onClick={() => onOpen("long")} />
      </div>
    </section>
  )
}

export function SideButton({ side, price, disabled, onClick }: { side: "long" | "short"; price: number; disabled: boolean; onClick: () => void }) {
  const long = side === "long"
  const Icon = long ? ArrowUpRight : ArrowDownRight
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-14 flex-1 flex-col items-center justify-center rounded-xl px-3 py-2 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40",
        long ? "bg-emerald-600 hover:bg-emerald-500" : "bg-rose-600 hover:bg-rose-500",
      )}
    >
      <span className="flex items-center gap-1.5 text-sm">
        <Icon className="size-4" aria-hidden />
        {long ? "Buy" : "Sell"}
      </span>
      <span className="text-xs font-medium tabular-nums text-white/80">{price.toFixed(2)}</span>
    </button>
  )
}

// ─── Open trade ──────────────────────────────────────────────────────────────

export function OpenTradeCard({
  position, pnl, canLockIn, hints, onLockIn, onClose,
}: {
  position: OpenPosition
  pnl: number
  /** The stop can be moved to the entry price right now */
  canLockIn: boolean
  hints: Hints
  onLockIn: () => void
  onClose: () => void
}) {
  const r = pnl / position.risk
  const dir = position.side === "long" ? 1 : -1
  const atStop = (position.stop - position.entry) * position.qty * dir
  const atTarget = position.target === null ? null : (position.target - position.entry) * position.qty * dir
  return (
    <section aria-label="Open trade" className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-white">
          {position.side === "long" ? "Long" : "Short"} {position.qty.toFixed(2)} units
        </h2>
        <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", position.side === "long" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300")}>
          Open
        </span>
      </div>

      <p className={cn("mt-3 text-3xl font-bold tabular-nums tracking-tight", pnl >= 0 ? "text-emerald-400" : "text-rose-400")} aria-live="off">
        {pnl >= 0 ? "+" : ""}
        {money(pnl)}
      </p>
      <p className="text-sm text-gray-400">
        {r >= 0 ? "+" : ""}
        {r.toFixed(2)}
        <Term slug="r-multiple" hints={hints}>R</Term> so far
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Entry" value={position.entry.toFixed(2)} />
        <Row
          label="Stop"
          value={position.stop.toFixed(2)}
          note={atStop >= 0 ? `locks in ${money(atStop)}` : `${money(atStop)} if hit`}
          tone={atStop >= 0 ? "up" : "down"}
        />
        <Row label="Target" value={position.target === null ? "None" : position.target.toFixed(2)} note={atTarget === null ? undefined : `+${money(atTarget)} if reached`} tone="up" />
      </dl>

      <p className="mt-3 text-xs text-gray-500">Drag the Stop and Target tags on the chart to move them. A stop only moves towards profit.</p>

      <div className="mt-4 hidden gap-2 lg:flex">
        <button
          type="button"
          onClick={onLockIn}
          disabled={!canLockIn}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 text-sm font-semibold text-gray-200 transition-colors hover:border-white/30 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShieldCheck className="size-4" aria-hidden />
          Stop to entry
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-purple-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
        >
          <X className="size-4" aria-hidden />
          Close trade
        </button>
      </div>
    </section>
  )
}

function Row({ label, value, note, tone }: { label: string; value: string; note?: string; tone?: "up" | "down" }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-right tabular-nums text-gray-100">
        {value}
        {note && <span className={cn("ml-2 text-xs", tone === "up" ? "text-emerald-400" : "text-rose-400")}>{note}</span>}
      </dd>
    </div>
  )
}

// ─── After a trade ───────────────────────────────────────────────────────────

export interface Review {
  trade: SimTradeView
  /** Titles of the missions this trade completed, with their XP */
  missions: { title: string; xp: number }[]
}

/** One honest sentence about the trade that just closed */
function verdict(t: SimTradeView): string {
  if (t.reason === "target") return "You set a target and let the market reach it. That is the hard part."
  if (t.reason === "stop" && t.r < -1.3) return "Price jumped past your stop, so it filled worse than planned. That is slippage, and it happens in real markets too."
  if (t.reason === "stop" && t.r < 0) return "The stop did its job: the loss is the size you chose before the trade."
  if (t.reason === "stop") return "Stopped out in profit, because you had moved your stop behind the price."
  if (t.r > 0) return "Closed by hand in profit. Check whether your target would have paid more."
  return "Closed by hand at a loss, before the stop. Smaller than planned, but ask yourself whether the plan had changed."
}

export function ReviewCard({ review, onDismiss }: { review: Review; onDismiss: () => void }) {
  const { trade } = review
  return (
    <section aria-label="Last trade" className={cn(CARD, trade.r >= 0 ? "border-emerald-400/30" : "border-rose-400/30")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-gray-400">
            {trade.reason === "target" ? "Target reached" : trade.reason === "stop" ? "Stopped out" : "Closed by hand"}
          </h2>
          <p className={cn("mt-1 text-2xl font-bold tabular-nums", trade.r >= 0 ? "text-emerald-400" : "text-rose-400")}>
            {trade.r >= 0 ? "+" : ""}
            {trade.r.toFixed(2)}R
            <span className="ml-2 text-base font-semibold">
              {trade.pnl >= 0 ? "+" : ""}
              {money(trade.pnl)}
            </span>
          </p>
        </div>
        <button type="button" onClick={onDismiss} aria-label="Dismiss" className="flex size-11 items-center justify-center rounded-xl text-gray-400 hover:bg-white/[0.06] hover:text-white">
          <X className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{verdict(trade)}</p>
      <p className="mt-1 text-sm text-gray-400">This trade risked {(trade.riskPct * 100).toFixed(1)}% of the account.</p>
      {review.missions.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {review.missions.map((m) => (
            <li key={m.title} className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.08] px-3 py-2 text-sm">
              <span className="flex items-center gap-2 font-medium text-amber-100">
                <Trophy className="size-4 shrink-0" aria-hidden />
                {m.title}
              </span>
              <span className="shrink-0 font-semibold tabular-nums text-amber-200">+{m.xp} XP</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// ─── Account passed or failed ────────────────────────────────────────────────

export function AccountClosedCard({
  account, busy, lessonHref, onNext,
}: {
  account: SimAccount
  busy: boolean
  /** The Academy lesson on risk of ruin, when it exists */
  lessonHref: string | null
  onNext: () => void
}) {
  const passed = account.status === "passed"
  const top = account.level >= MAX_LEVEL
  const next = levelInfo(Math.min(account.level + 1, MAX_LEVEL))
  return (
    <section aria-label={passed ? "Account passed" : "Account failed"} className={cn(CARD, passed ? "border-emerald-400/40 bg-emerald-500/[0.06]" : "border-rose-400/40 bg-rose-500/[0.06]")}>
      <h2 className="text-lg font-bold text-white">{passed ? "Account passed" : "Account failed"}</h2>
      {passed ? (
        <p className="mt-2 text-sm leading-relaxed text-gray-200">
          You grew the account by 8% in {account.trades} trades without breaking a loss limit.{" "}
          {top ? "This is the top account. You can take it on again." : `The ${money(next.balance, 0)} account is unlocked.`}
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-gray-200">
            {account.failReason === "daily"
              ? "The account lost 4% of its balance in one day. Professionals stop for the day well before that."
              : "The account fell 10% from its highest balance. A run of losses is normal, which is why each one has to stay small."}
          </p>
          {lessonHref && (
            <p className="mt-2 text-sm text-gray-400">
              Worth a read before the next attempt:{" "}
              <Link href={lessonHref} className="font-medium text-purple-300 underline decoration-purple-300/40 underline-offset-4 hover:text-purple-200">
                Risk of ruin
              </Link>
              .
            </p>
          )}
        </>
      )}
      <button
        type="button"
        onClick={onNext}
        disabled={busy}
        className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-purple-500 disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : passed ? <Trophy className="size-4" aria-hidden /> : <RotateCcw className="size-4" aria-hidden />}
        {passed ? (top ? "Run the top account again" : `Start the ${money(next.balance, 0)} account`) : "Try this account again"}
      </button>
    </section>
  )
}
