"use client"

import { ChevronsRight, Newspaper, Pause, Play, RotateCcw, ShieldCheck, X } from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { AccountRunway, money } from "@/components/dashboard/paper-trading/account-runway"
import {
  AccountClosedCard, type Hints, NewTradeCard, OpenTradeCard, type Review, ReviewCard, SideButton, type TicketSettings,
} from "@/components/dashboard/paper-trading/order-ticket"
import { MissionsPanel, type MissionView, StatsPanel } from "@/components/dashboard/paper-trading/panels"
import type { ChartLines, SimChartHandle } from "@/components/dashboard/paper-trading/sim-chart"
import { localDay } from "@/lib/academy/xp"
import { isMarketSnapshot, Market, TICKS_PER_CANDLE } from "@/lib/sim/market"
import {
  canMoveStop, checkExit, type CloseReason, fillPrice, openPnl, type OpenPosition, openPosition, RISK_CHOICES, STOP_CHOICES, TARGET_CHOICES,
  type TradeReport,
} from "@/lib/sim/rules"
import type { SimState, TradeOutcome } from "@/lib/sim/server"
import { fetcher } from "@/lib/swr"
import { cn } from "@/lib/utils"

// Paper Trading: a generated practice market, one trade at a time, on a
// virtual account with real rules. The market runs in this browser tab (and
// only while the tab is visible); a closed trade is sent to the server, which
// works out the result, applies the account rules and checks the missions.

const SimChart = dynamic(() => import("@/components/dashboard/paper-trading/sim-chart").then((m) => m.SimChart), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-white/[0.03]" />,
})

const FRAME_MS = 33
const SPEEDS = [1, 3] as const
/** Candles of history a new market starts with */
const PREWARM = 150
const SETTINGS_KEY = "entrix:sim:ticket"
const DEFAULT_SETTINGS: TicketSettings = { riskPct: 0.01, stopId: "normal", targetR: 2 }

const toLines = (p: OpenPosition): ChartLines => ({ entry: p.entry, stop: p.stop, target: p.target })

/** The entry price as a stop level: rounded to the cent on the side that can't lose */
const breakeven = (p: OpenPosition) => (p.side === "long" ? Math.ceil(p.entry * 100) / 100 : Math.floor(p.entry * 100) / 100)

function loadSettings(): TicketSettings {
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as Partial<TicketSettings> | null
    if (!s) return DEFAULT_SETTINGS
    return {
      riskPct: RISK_CHOICES.includes(s.riskPct as (typeof RISK_CHOICES)[number]) ? s.riskPct! : DEFAULT_SETTINGS.riskPct,
      stopId: STOP_CHOICES.some((c) => c.id === s.stopId) ? s.stopId! : DEFAULT_SETTINGS.stopId,
      targetR: TARGET_CHOICES.includes(s.targetR as (typeof TARGET_CHOICES)[number]) ? s.targetR! : DEFAULT_SETTINGS.targetR,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function PaperTrading({
  userId, missions, hints, ruinHref,
}: {
  userId: string
  missions: MissionView[]
  hints: Hints
  ruinHref: string | null
}) {
  const { data, error, isLoading, mutate } = useSWR<SimState>("/api/sim", fetcher, { revalidateOnFocus: false })
  const account = data?.account

  const market = useRef<Market | null>(null)
  const chart = useRef<SimChartHandle | null>(null)
  const position = useRef<OpenPosition | null>(null)
  const storageKey = `entrix:sim:${userId}`

  // What the screen shows. The loop below works on the refs and copies into
  // these a few times a second, so React isn't re-rendering on every tick.
  const [open, setOpen] = useState<OpenPosition | null>(null)
  const [live, setLive] = useState({ price: 100, pnl: 0, range: 0.3 })
  const [settings, setSettings] = useState<TicketSettings>(DEFAULT_SETTINGS)
  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1)
  const [review, setReview] = useState<Review | null>(null)
  const [saving, setSaving] = useState(false)
  /** A closed trade the server hasn't accepted yet (connection problem) */
  const [unsaved, setUnsaved] = useState<TradeReport | null>(null)
  const [busy, setBusy] = useState(false)
  const [news, setNews] = useState(false)
  const newsTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [confirmRestart, setConfirmRestart] = useState(false)

  const save = useCallback(() => {
    if (!market.current) return
    try {
      localStorage.setItem(storageKey, JSON.stringify({ market: market.current.snapshot(), position: position.current }))
    } catch {
      // Storage blocked or full: the market simply starts fresh next time
    }
  }, [storageKey])

  /** Put the whole market and the open trade on the chart (after it loads, or after a restore) */
  const paint = useCallback(() => {
    const m = market.current
    const c = chart.current
    if (!m || !c) return
    c.reset(m.history)
    c.setSpikes(m.spikes.filter((t) => t >= m.history[0]?.time))
    c.setLines(position.current ? toLines(position.current) : null)
  }, [])

  // ── The market: resume the one saved in this browser, or start a new one
  useEffect(() => {
    setSettings(loadSettings())
    let restored: Market | null = null
    let savedPosition: OpenPosition | null = null
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as { market?: unknown; position?: OpenPosition | null } | null
      if (saved && isMarketSnapshot(saved.market)) {
        restored = Market.restore(saved.market)
        savedPosition = saved.position ?? null
      }
    } catch {
      // Unreadable: start fresh
    }
    const m = restored ?? new Market()
    m.prewarm(PREWARM)
    market.current = m
    position.current = savedPosition
    setOpen(savedPosition)
    setLive({ price: m.price, pnl: savedPosition ? openPnl(savedPosition, m.price) : 0, range: m.averageRange() })
    paint()
    return () => {
      save()
      market.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- once per account
  }, [storageKey])

  // ── Sending a closed trade to the server
  const submit = useCallback(
    async (report: TradeReport) => {
      setSaving(true)
      try {
        const res = await fetch("/api/sim/trade", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...report, day: localDay() }),
        })
        const body = (await res.json().catch(() => null)) as (TradeOutcome & { error?: string }) | null
        if (!res.ok || !body || body.error) {
          // The server refused it (a 4xx): it will never go through, so it isn't kept
          if (res.status >= 400 && res.status < 500) {
            setUnsaved(null)
            toast.error(body?.error ?? "That trade couldn't be saved.")
            void mutate()
            return
          }
          throw new Error("save failed")
        }
        setUnsaved(null)
        await mutate(body.state, { revalidate: false })
        const done = body.completed.map((c) => ({ title: missions.find((m) => m.id === c.id)?.title ?? "Mission", xp: c.xp }))
        setReview({ trade: body.trade, missions: done })
        for (const m of done) toast.success(`Mission complete: ${m.title}`, { description: `+${m.xp} Academy XP` })
      } catch {
        setUnsaved(report)
      } finally {
        setSaving(false)
      }
    },
    [missions, mutate],
  )

  const close = useCallback(
    (reason: CloseReason, exit: number) => {
      const p = position.current
      if (!p) return
      position.current = null
      setOpen(null)
      chart.current?.setLines(null)
      save()
      void submit({ side: p.side, entry: p.entry, exit, qty: p.qty, stop: p.initialStop, target: p.target, reason, spike: p.spike, lockedIn: p.lockedIn })
    },
    [save, submit],
  )
  const closeRef = useRef(close)
  closeRef.current = close

  // ── The clock: a fixed real-time beat, as many price steps per beat as the speed asks for
  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let owed = 0
    let sinceLive = 0
    let sinceSave = 0
    const tickMs = 1000 / (TICKS_PER_CANDLE * speed) // one candle a second at normal speed
    const beat = setInterval(() => {
      const m = market.current
      const now = performance.now()
      const dt = Math.min(now - last, 250) // a sleeping tab doesn't fast-forward the market
      last = now
      if (!m || document.hidden) return
      owed += dt
      const steps = Math.min(Math.floor(owed / tickMs), 200)
      if (steps <= 0) return
      owed -= steps * tickMs

      let latest = null
      for (let i = 0; i < steps; i++) {
        const tick = m.tick()
        latest = tick.candle
        if (tick.closed) chart.current?.update(tick.closed)
        if (tick.spike) {
          if (position.current) position.current.spike = true
          chart.current?.setSpikes(m.spikes.filter((t) => t >= m.history[0]?.time))
          setNews(true)
          if (newsTimer.current) clearTimeout(newsTimer.current)
          newsTimer.current = setTimeout(() => setNews(false), 4000)
        }
        const p = position.current
        const exit = p ? checkExit(p, m.price) : null
        if (exit) closeRef.current(exit.reason, exit.exit)
      }
      if (latest) chart.current?.update(latest)

      sinceLive += dt
      if (sinceLive >= 100) {
        sinceLive = 0
        const p = position.current
        setLive({ price: m.price, pnl: p ? openPnl(p, m.price) : 0, range: m.averageRange() })
      }
      sinceSave += dt
      if (sinceSave >= 3000) {
        sinceSave = 0
        save()
      }
    }, FRAME_MS)
    return () => clearInterval(beat)
  }, [running, speed, save])

  // Leaving the tab or the page keeps the market where it was
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) save()
    }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", save)
    return () => {
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", save)
    }
  }, [save])

  const changeSettings = (next: TicketSettings) => {
    setSettings(next)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    } catch {
      // not remembered, nothing else changes
    }
  }

  const stopChoice = STOP_CHOICES.find((c) => c.id === settings.stopId) ?? STOP_CHOICES[1]
  const stopDistance = live.range * stopChoice.ranges
  const tradable = !!account && account.status === "active" && !open && !saving && !unsaved

  const openTrade = (side: "long" | "short") => {
    const m = market.current
    if (!m || !account || !tradable) return
    const p = openPosition({
      side,
      mid: m.price,
      balance: account.balance,
      riskPct: settings.riskPct,
      stopDistance: m.averageRange() * stopChoice.ranges,
      targetR: settings.targetR,
    })
    position.current = p
    setOpen(p)
    setReview(null)
    setLive({ price: m.price, pnl: openPnl(p, m.price), range: m.averageRange() })
    chart.current?.setLines(toLines(p))
    chart.current?.toLatest()
    save()
  }

  /** A change to the open trade's stop or target. False when the rules don't allow it. */
  const moveLevel = useCallback((kind: "stop" | "target", price: number): boolean => {
    const p = position.current
    const m = market.current
    if (!p || !m) return false
    const dir = p.side === "long" ? 1 : -1
    if (kind === "stop") {
      if (!canMoveStop(p, price, m.price)) return false
      p.stop = price
      if ((price - p.entry) * dir >= 0) p.lockedIn = true
    } else {
      // A target has to stay ahead of the price
      if ((price - fillPrice(m.price, p.side === "short")) * dir <= 0) return false
      p.target = price
    }
    position.current = { ...p }
    setOpen(position.current)
    chart.current?.setLines(toLines(position.current))
    return true
  }, [])

  const lockIn = () => {
    const p = position.current
    if (p && moveLevel("stop", breakeven(p))) save()
  }
  const canLockIn = !!open && !open.lockedIn && canMoveStop(open, breakeven(open), live.price)

  const closeNow = () => {
    const p = position.current
    const m = market.current
    if (p && m) close("manual", fillPrice(m.price, p.side === "short"))
  }

  const accountAction = async (action: "next" | "retry" | "restart") => {
    setBusy(true)
    try {
      const res = await fetch("/api/sim/account", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) })
      const body = (await res.json().catch(() => null)) as (SimState & { error?: string }) | null
      if (!res.ok || !body || body.error) throw new Error(body?.error ?? "")
      await mutate(body, { revalidate: false })
      setReview(null)
    } catch (err) {
      toast.error((err as Error).message || "That didn't work. Please try again.")
    } finally {
      setBusy(false)
      setConfirmRestart(false)
    }
  }

  // ── Screens before the account has loaded
  if (error && !data) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/[0.025] p-6 text-center">
        <p className="text-sm text-gray-300">Paper Trading couldn&apos;t load your practice account.</p>
        <button type="button" onClick={() => void mutate()} className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white hover:bg-purple-500">
          Try again
        </button>
      </div>
    )
  }
  if (isLoading || !account || !data) {
    return (
      <div aria-busy="true" aria-label="Loading Paper Trading" className="space-y-4">
        <div className="h-36 animate-pulse rounded-2xl bg-white/[0.04]" />
        <div className="h-[46dvh] min-h-[300px] animate-pulse rounded-2xl bg-white/[0.04] lg:h-[520px]" />
      </div>
    )
  }

  const equity = account.balance + (open ? live.pnl : 0)

  return (
    <div>
      <AccountRunway account={account} equity={equity} today={localDay()} />

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* ── The market ── */}
        <section aria-label="Practice market" className="min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.025] lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-4 sm:px-5">
            <div>
              <h2 className="flex flex-wrap items-center gap-2 text-base font-semibold text-white">
                Practice market
                <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-0.5 text-xs font-medium text-amber-200">Simulated prices</span>
              </h2>
              <p className="mt-0.5 text-2xl font-bold tabular-nums tracking-tight text-white">{live.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRunning((r) => !r)}
                aria-pressed={!running}
                className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-gray-200 hover:border-white/30"
                aria-label={running ? "Pause the market" : "Resume the market"}
              >
                {running ? <Pause className="size-4" aria-hidden /> : <Play className="size-4" aria-hidden />}
              </button>
              <div className="flex rounded-xl border border-white/15 bg-white/[0.03] p-0.5" role="group" aria-label="Market speed">
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={speed === s}
                    onClick={() => setSpeed(s)}
                    className={cn("min-h-10 rounded-[10px] px-3 text-sm font-semibold", speed === s ? "bg-purple-500/25 text-white" : "text-gray-400 hover:text-gray-200")}
                  >
                    {s === 1 ? "Normal" : "Fast"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => chart.current?.toLatest()}
                className="flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-gray-200 hover:border-white/30"
                aria-label="Jump to the newest candle"
              >
                <ChevronsRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>

          <div className="relative mt-3 h-[46dvh] min-h-[300px] lg:h-[520px]">
            <SimChart api={chart} className="absolute inset-0" onReady={paint} onDrag={open ? moveLevel : undefined} />
            {news && (
              <p role="status" className="pointer-events-none absolute right-16 top-2 flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
                <Newspaper className="size-3.5" aria-hidden />
                News spike
              </p>
            )}
            {!running && (
              <p className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-medium text-gray-200 backdrop-blur-sm">
                Paused
              </p>
            )}
          </div>
        </section>

        {/* ── Trading and missions ── */}
        <div className="space-y-4 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          {unsaved && (
            <section className="rounded-2xl border border-amber-300/30 bg-amber-300/[0.07] p-4" role="alert">
              <p className="text-sm font-semibold text-amber-100">Your last trade isn&apos;t saved yet</p>
              <p className="mt-1 text-sm text-amber-100/80">The connection dropped while saving it. Your balance updates once it goes through.</p>
              <button
                type="button"
                onClick={() => void submit(unsaved)}
                disabled={saving}
                className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-amber-400 px-4 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-60"
              >
                {saving ? "Saving" : "Save it now"}
              </button>
            </section>
          )}

          {review && !open && <ReviewCard review={review} onDismiss={() => setReview(null)} />}

          {account.status !== "active" ? (
            <AccountClosedCard
              account={account}
              busy={busy}
              lessonHref={ruinHref}
              onNext={() => void accountAction(account.status === "passed" ? "next" : "retry")}
            />
          ) : open ? (
            <OpenTradeCard position={open} pnl={live.pnl} canLockIn={canLockIn} hints={hints} onLockIn={lockIn} onClose={closeNow} />
          ) : (
            <NewTradeCard
              settings={settings}
              onSettings={changeSettings}
              balance={account.balance}
              price={live.price}
              stopDistance={stopDistance}
              hints={hints}
              disabled={!tradable}
              onOpen={openTrade}
            />
          )}

          <MissionsPanel missions={missions} done={data.missions} hints={hints} />
        </div>

        {/* ── Numbers ── */}
        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
          <StatsPanel trades={data.trades} hints={hints} />
          <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3 text-xs leading-relaxed text-gray-500">
            <p className="max-w-xl">
              The practice market is generated by a random process and is not a real instrument. Money, trades and results here are virtual, and doing
              well here does not predict results in real markets. Chart drawn with{" "}
              <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-gray-300">
                TradingView Lightweight Charts
              </a>{" "}
              (© TradingView, Inc.).
            </p>
            {account.status === "active" && !open && (
              <button
                type="button"
                disabled={busy}
                onClick={() => (confirmRestart ? void accountAction("restart") : setConfirmRestart(true))}
                onBlur={() => setConfirmRestart(false)}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 font-medium text-gray-400 hover:text-white"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {confirmRestart ? "Tap again to restart this account" : "Restart this account"}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Phones: the buttons that matter stay in reach ── */}
      {account.status === "active" && (
        <div className="sticky bottom-0 z-30 -mx-4 -mb-4 mt-4 border-t border-white/10 bg-[#09090f]/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pr-[4.75rem] pt-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6 lg:hidden">
          {open ? (
            <div className="flex items-center gap-2">
              <p className={cn("min-w-0 flex-1 text-lg font-bold tabular-nums", live.pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                {live.pnl >= 0 ? "+" : ""}
                {money(live.pnl)}
              </p>
              <button
                type="button"
                onClick={lockIn}
                disabled={!canLockIn}
                aria-label="Move the stop to your entry price"
                className="flex size-12 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-gray-200 disabled:opacity-40"
              >
                <ShieldCheck className="size-5" aria-hidden />
              </button>
              <button type="button" onClick={closeNow} className="flex min-h-12 items-center gap-2 rounded-xl bg-purple-600 px-4 text-sm font-semibold text-white">
                <X className="size-4" aria-hidden />
                Close
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <SideButton side="short" price={fillPrice(live.price, false)} disabled={!tradable} onClick={() => openTrade("short")} />
              <SideButton side="long" price={fillPrice(live.price, true)} disabled={!tradable} onClick={() => openTrade("long")} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
