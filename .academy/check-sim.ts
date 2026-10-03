// Checks for the Paper Trading engine and rules (no browser needed).
//   npx tsx --tsconfig tsconfig.json .academy/check-sim.ts
import { findLessonById } from "../lib/academy/curriculum"
import { TERM_BY_SLUG } from "../lib/glossary/terms"
import { Market } from "../lib/sim/market"
import { MISSIONS } from "../lib/sim/missions"
import {
  applyTrade, canMoveStop, checkExit, DAILY_LOSS, failBalance, fillPrice, MAX_DRAWDOWN, newAccount, openPnl, openPosition, passBalance,
  resolveTrade, SPREAD, statsOf,
} from "../lib/sim/rules"

let problems = 0
const check = (label: string, ok: boolean, detail = "") => {
  if (!ok) problems++
  console.log(`${ok ? "✓" : "✗"} ${label}${ok || !detail ? "" : `: ${detail}`}`)
}

// ─── Market ─────────────────────────────────────────────────────────────────
{
  const m = new Market(12345)
  m.prewarm(500)
  const h = m.history
  check("market builds 500 candles", h.length === 500)
  check("every candle's high and low contain its open and close", h.every((c) => c.high >= Math.max(c.open, c.close) && c.low <= Math.min(c.open, c.close)))
  check("candles are one simulated minute apart", h.every((c, i) => i === 0 || c.time - h[i - 1].time === 60))
  check("prices stay positive and finite", h.every((c) => Number.isFinite(c.close) && c.low > 0))
  const flat = h.filter((c) => c.high === c.low).length
  check(`almost no flat candles (${flat})`, flat < 10)

  // Same seed, same market; a restored snapshot continues exactly
  const a = new Market(777)
  const b = new Market(777)
  a.prewarm(50)
  b.prewarm(50)
  check("same seed gives the same market", JSON.stringify(a.history) === JSON.stringify(b.history))
  const resumed = Market.restore(JSON.parse(JSON.stringify(a.snapshot())))
  const next1: number[] = []
  const next2: number[] = []
  for (let i = 0; i < 400; i++) {
    next1.push(a.tick().candle.close)
    next2.push(resumed.tick().candle.close)
  }
  check("a restored snapshot continues the same market", JSON.stringify(next1) === JSON.stringify(next2))

  // No built-in direction: over many markets, up and down moves balance out
  let up = 0
  let ranges = 0
  let spikes = 0
  const total = 300
  for (let seed = 1; seed <= total; seed++) {
    const mk = new Market(seed * 7919)
    mk.prewarm(400)
    if (mk.history[mk.history.length - 1].close > mk.history[0].open) up++
    ranges += mk.averageRange() / mk.price
    spikes += mk.spikes.length
  }
  check(`no built-in direction: ${up} of ${total} markets ended higher`, up > total * 0.4 && up < total * 0.6)
  console.log(`  average candle range: ${((ranges / total) * 100).toFixed(3)}% of price; news spikes per 400 candles: ${(spikes / total).toFixed(1)}`)
}

// ─── Orders ─────────────────────────────────────────────────────────────────
{
  const long = openPosition({ side: "long", mid: 100, balance: 1000, riskPct: 0.01, stopDistance: 0.5, targetR: 2 })
  check("a long fills at the ask", Math.abs(long.entry - 100 * (1 + SPREAD / 2)) < 1e-9)
  check("size makes the stop cost exactly the chosen risk", Math.abs((long.entry - long.stop) * long.qty - 10) < 1e-9)
  check("a 2R target is twice the stop distance away", Math.abs(long.target! - long.entry - 1) < 1e-9)
  check("a new trade starts slightly negative: the spread", openPnl(long, 100) < 0 && openPnl(long, 100) > -1)
  const stopped = checkExit(long, long.stop - 0.2)
  check("price through the stop closes at the worse price (slippage)", stopped?.reason === "stop" && stopped.exit < long.stop)
  const hit = checkExit(long, fillPrice(long.target!, true) + 0.05)
  check("a target fills at its own price", hit?.reason === "target" && hit.exit === long.target)
  check("nothing closes between stop and target", checkExit(long, 100.2) === null)
  check("a stop can move towards profit", canMoveStop(long, long.stop + 0.1, 100.5))
  check("a stop cannot move further away", !canMoveStop(long, long.stop - 0.1, 100.5))

  const short = openPosition({ side: "short", mid: 100, balance: 1000, riskPct: 0.02, stopDistance: 0.4, targetR: null })
  check("a short fills at the bid, stop above", short.entry < 100 && short.stop > short.entry && short.target === null)
  check("a short profits when price falls", openPnl(short, 99) > 0)

  const ok = resolveTrade({ side: "long", entry: long.entry, exit: long.target!, qty: long.qty, stop: long.stop, target: long.target, reason: "target", spike: false, lockedIn: false }, 1000)
  check("server result of a 2R winner is +2R and +$20", ok.ok && Math.abs(ok.result.r - 2) < 0.01 && Math.abs(ok.result.pnl - 20) < 0.01)
  const greedy = resolveTrade({ side: "long", entry: 100, exit: 101, qty: 500, stop: 99.5, target: null, reason: "manual", spike: false, lockedIn: false }, 1000)
  check("a trade risking 25% of the account is refused", !greedy.ok)
  const jackpot = resolveTrade({ side: "long", entry: 100, exit: 150, qty: 20, stop: 99.5, target: null, reason: "manual", spike: false, lockedIn: false }, 1000)
  check("an impossible 100R win is refused", !jackpot.ok)
}

// ─── Accounts ───────────────────────────────────────────────────────────────
{
  const day = "2026-10-03"
  let a = newAccount(1)
  check("level 1 starts at $1,000", a.balance === 1000 && passBalance(a) === 1080)
  for (let i = 0; i < 9; i++) a = applyTrade(a, 10, day)
  check("+9% in 9 trades is not a pass yet (10 trades needed)", a.status === "active" && a.balance === 1090)
  a = applyTrade(a, 1, day)
  check("the 10th trade passes the account", a.status === "passed" && a.passes === 1)

  let d = newAccount(1)
  d = applyTrade(d, -20, day)
  check("the daily line is 4% under the day's starting balance", failBalance(d, day).reason === "daily" && failBalance(d, day).balance === 1000 * (1 - DAILY_LOSS))
  d = applyTrade(d, -20, day)
  check("losing 4% in one day fails the account", d.status === "failed" && d.failReason === "daily" && d.fails === 1)

  let w = newAccount(1)
  for (let i = 0; i < 4; i++) w = applyTrade(w, -25, `2026-10-0${i + 1}`)
  check("10% from the peak over several days fails on drawdown", w.status === "failed" && w.failReason === "drawdown" && w.balance <= 1000 * (1 - MAX_DRAWDOWN))

  const s = statsOf([{ r: 2 }, { r: -1 }, { r: -1 }, { r: 2 }])
  check("stats: 50% win rate, +0.5R expectancy", !!s && s.winRate === 0.5 && s.expectancy === 0.5)
}

// ─── Missions ───────────────────────────────────────────────────────────────
{
  check("mission ids are unique", new Set(MISSIONS.map((m) => m.id)).size === MISSIONS.length)
  for (const m of MISSIONS) {
    if (!findLessonById(m.lessonId)) check(`mission ${m.id}: lesson ${m.lessonId} exists`, false)
    for (const slug of m.terms) if (!TERM_BY_SLUG[slug]) check(`mission ${m.id}: glossary term ${slug} exists`, false)
    if (JSON.stringify([m.title, m.goal]).includes("—")) check(`mission ${m.id}: no em-dash`, false)
  }
  check(`${MISSIONS.length} missions link to real lessons and glossary terms, ${MISSIONS.reduce((x, m) => x + m.xp, 0)} XP in total`, true)
  const base = { side: "long" as const, r: 2, riskPct: 0.01, reason: "target" as "target" | "stop" | "manual", targetR: 2 as number | null, spike: false, lockedIn: false }
  const done = (id: string, trade = base, trades = [trade], passes = 0) => MISSIONS.find((m) => m.id === id)!.done({ trade, trades, passes })
  check("a 2R target that fills completes 'let it run' and '2R winner'", done("let-it-run") && done("two-r"))
  check("closing by hand does not complete 'let it run'", !done("let-it-run", { ...base, reason: "manual" }))
  check("a stop-out at -1R completes 'planned loss'", done("planned-loss", { ...base, r: -1.02, reason: "stop" }))
  check("a slipped -2R stop does not", !done("planned-loss", { ...base, r: -2, reason: "stop" }))
  check(
    "five small-risk trades in a row",
    done("five-disciplined", base, Array(5).fill(base)) && !done("five-disciplined", base, [...Array(4).fill(base), { ...base, riskPct: 0.02 }]),
  )
  check("'pass an account' needs a pass", !done("pass-account") && done("pass-account", base, [base], 1))
}

console.log(`\n${problems} problems`)
if (problems) process.exit(1)
