// Content checks for Entrix Academy lessons. Run from the repo root:
//   npx tsx --tsconfig tsconfig.json .academy/check-lessons.ts
import { LESSON_CONTENT } from "../content/academy"
import { ALL_LESSONS } from "../lib/academy/curriculum"
import { B, BREAKER, D, DAY, R, REVERSAL, REVERSAL_BEAR, REVERSAL_DEEP, REVERSAL_NO_SWEEP } from "../content/academy/l3/setups"
import { equityPath, maxDrawdown, TRADES } from "../content/academy/l4/equity"
import { rsi } from "../lib/academy/indicators"
import { findFvgs, isDown } from "../lib/academy/smc"
import { type Candle, type ChartSpec, isQuestion, type SceneSpec, type Step } from "../lib/academy/types"

let problems = 0
const fail = (id: string, msg: string) => {
  problems++
  console.log(`✗ ${id}: ${msg}`)
}
const ok = (msg: string) => console.log(`✓ ${msg}`)

function chartsOf(step: Step): ChartSpec[] {
  const out: ChartSpec[] = []
  if ((step.kind === "learn" || step.kind === "choice" || step.kind === "truefalse" || step.kind === "numeric") && step.visual?.type === "chart") out.push(step.visual.chart)
  if (step.kind === "learn" && step.visual?.type === "charts") out.push(...step.visual.charts)
  if (step.kind === "tap") out.push(step.chart)
  return out
}

/** What is wrong with an animated scene's data, if anything (the scene components trust it) */
function sceneProblems(s: SceneSpec): string[] {
  const out: string[] = []
  const finite = (...values: number[]) => values.every(Number.isFinite)
  switch (s.kind) {
    case "bars":
      if (!s.bars.length) out.push("no bars")
      for (const b of s.bars) {
        if (!finite(b.value, b.to ?? 0) || b.value < 0) out.push(`bar "${b.label}" has a bad value`)
        if (s.max !== undefined && Math.max(b.value, b.to ?? 0) > s.max + 1e-9) out.push(`bar "${b.label}" is longer than max`)
      }
      break
    case "compare":
      if (s.columns.length < 2 || s.columns.length > 3) out.push("compare needs 2 or 3 columns")
      if (s.columns.some((c) => !c.points.length || c.points.length > 5)) out.push("a compare column needs 1 to 5 points")
      break
    case "flow":
      if (s.nodes.length < 2 || s.nodes.length > 6) out.push("flow needs 2 to 6 nodes")
      break
    case "cycle":
      if (s.nodes.length < 3 || s.nodes.length > 6) out.push("cycle needs 3 to 6 nodes")
      break
    case "line":
      for (const series of s.series) {
        if (series.points.length < 2 || !finite(...series.points)) out.push(`line "${series.label}" needs 2+ finite points`)
        if (series.points.length !== s.series[0].points.length) out.push("line series have different lengths")
      }
      if (s.xLabels && s.xLabels.length > s.series[0].points.length) out.push("more x labels than points")
      break
    case "checklist":
      if (!s.items.length || s.items.length > 8) out.push("checklist needs 1 to 8 items")
      break
    case "stat":
      if (!s.stats.length || s.stats.length > 3) out.push("stat needs 1 to 3 numbers")
      if (!finite(...s.stats.map((x) => x.value))) out.push("stat value not finite")
      break
    case "timeline":
      if (s.events.length < 2 || s.events.length > 5) out.push("timeline needs 2 to 5 events")
      break
    case "grid":
      if (!s.cols.length || s.cols.length > 5 || !s.rows.length || s.rows.length > 5) out.push("grid needs 1 to 5 columns and rows")
      for (const row of s.rows) {
        if (row.cells.length !== s.cols.length) out.push(`grid row "${row.label}" has ${row.cells.length} cells for ${s.cols.length} columns`)
        if (row.tones && row.tones.length !== row.cells.length) out.push(`grid row "${row.label}" tones don't match its cells`)
      }
      break
    case "donut":
      if (s.slices.length < 2 || s.slices.some((x) => !finite(x.value) || x.value <= 0)) out.push("donut needs 2+ positive slices")
      break
    case "path":
      if (s.points.length < 2 || !finite(...s.points)) out.push("path needs 2+ finite points")
      for (const m of s.marks ?? []) if (!Number.isInteger(m.at) || m.at < 0 || m.at >= s.points.length) out.push(`path mark "${m.label}" is off the path`)
      if (!finite(...(s.levels ?? []).map((l) => l.price))) out.push("path level not finite")
      break
    case "rr":
      if (!(s.risk > 0) || !(s.reward > 0)) out.push("rr needs positive risk and reward")
      break
    case "quote":
      if (!s.text.trim() || !s.author.trim()) out.push("quote needs text and an author")
      break
    case "ticks":
      for (const row of s.rows) if (row.from === row.to) out.push(`tick row "${row.market}" doesn't change`)
      break
    case "candles":
      if (!s.groups.length || s.groups.length > 4) out.push("candles needs 1 to 4 groups")
      for (const g of s.groups) {
        if (!g.candles.length || g.candles.length > 6) out.push(`candle group "${g.label}" needs 1 to 6 candles`)
        g.candles.forEach(([o, h, l, c], i) => {
          if (!finite(o, h, l, c)) out.push(`candle group "${g.label}" candle ${i} not finite`)
          else if (h < Math.max(o, c) - 1e-9 || l > Math.min(o, c) + 1e-9) out.push(`candle group "${g.label}" candle ${i} high/low inside body`)
        })
      }
      break
  }
  return out
}

let scenes = 0
for (const [id, lesson] of Object.entries(LESSON_CONTENT)) {
  const ids = new Set<string>()
  if (JSON.stringify(lesson).includes("—")) fail(id, "contains an em-dash")
  if (lesson.steps[lesson.steps.length - 1].kind !== "recap") fail(id, "does not end with a recap")
  let questions = 0
  for (const step of lesson.steps) {
    if ("visual" in step && step.visual?.type === "scene") {
      scenes++
      for (const problem of sceneProblems(step.visual.scene)) fail(id, `scene in "${"title" in step ? step.title : step.id}": ${problem}`)
    }
    for (const c of chartsOf(step)) {
      const n = c.candles.length
      if (c.volumes && c.volumes.length !== n) fail(id, `volumes ${c.volumes.length} != candles ${n}`)
      for (const o of c.overlays ?? []) if (o.values.length !== n) fail(id, `overlay length ${o.values.length} != ${n}`)
      for (const l of c.pane?.lines ?? []) if (l.values.length !== n) fail(id, `pane line length ${l.values.length} != ${n}`)
      if (c.pane?.histogram && c.pane.histogram.length !== n) fail(id, "histogram length")
      c.candles.forEach(([o, h, l, cl], i) => {
        if (![o, h, l, cl].every(Number.isFinite)) fail(id, `candle ${i} not finite`)
        if (h < Math.max(o, cl) - 1e-9 || l > Math.min(o, cl) + 1e-9) fail(id, `candle ${i} high/low inside body`)
      })
      for (const a of c.annotations ?? []) {
        const bad =
          (a.kind === "marker" && (a.index < 0 || a.index >= n)) ||
          (a.kind === "zone" && (a.from < 0 || a.from >= n)) ||
          (a.kind === "line" && [a.from[0], a.to[0]].some((k) => k < 0 || k >= n || !Number.isFinite(k)))
        if (bad) fail(id, `annotation out of range: ${JSON.stringify(a)}`)
      }
    }
    if (!isQuestion(step)) continue
    questions++
    if (ids.has(step.id)) fail(id, `duplicate question id ${step.id}`)
    ids.add(step.id)
    if (step.kind === "choice" && (step.answer < 0 || step.answer >= step.options.length)) fail(id, `choice ${step.id} answer out of range`)
    if (step.kind === "match" && step.pairs.length < 2) fail(id, `match ${step.id} needs 2+ pairs`)
    if (step.kind === "tap" && step.targets.some((t) => t < 0 || t >= step.chart.candles.length)) fail(id, `tap ${step.id} target out of range`)
  }
  if (questions < 3) fail(id, `only ${questions} questions`)
}
ok(`generic checks on ${Object.keys(LESSON_CONTENT).length} lessons, ${scenes} animated scenes`)

// ─── Specific answers ───────────────────────────────────────────────────────
const tapOf = (lessonId: string, qid: string) => {
  const s = LESSON_CONTENT[lessonId]?.steps.find((x) => x.kind === "tap" && x.id === qid)
  if (!s || s.kind !== "tap") throw new Error(`missing tap ${lessonId}/${qid}`)
  return s
}
const learnChart = (lessonId: string, nth = 0) => {
  const charts = LESSON_CONTENT[lessonId].steps.flatMap(chartsOf)
  return charts[nth]
}
const argBy = (c: Candle[], from: number, to: number, f: (k: Candle) => number, max: boolean) => {
  let best = from
  for (let i = from; i <= to; i++) if (max ? f(c[i]) > f(c[best]) : f(c[i]) < f(c[best])) best = i
  return best
}
const hi = (k: Candle) => k[1]
const lo = (k: Candle) => k[2]
function check(label: string, cond: boolean, detail = "") {
  if (cond) ok(label)
  else fail(label, detail)
}
function tapIs(lessonId: string, qid: string, computed: number) {
  const t = tapOf(lessonId, qid)
  check(`${lessonId}/${qid} -> ${computed}`, t.targets.includes(computed), `targets ${t.targets}`)
}

// Level 1
const argmax = (xs: number[]) => xs.indexOf(Math.max(...xs))
{
  const t = tapOf("u1-what-is-a-market", "tap-peak")
  tapIs("u1-what-is-a-market", "tap-peak", argmax(t.chart.candles.map((k) => k[3])))
}
tapIs("u2-limit-orders", "limit-fill", tapOf("u2-limit-orders", "limit-fill").chart.candles.findIndex((k) => k[2] <= 99.4))
{
  const c = tapOf("u3-anatomy-of-a-candle", "long-upper-wick").chart.candles
  tapIs("u3-anatomy-of-a-candle", "long-upper-wick", argmax(c.map((k) => k[1] - Math.max(k[0], k[3]))))
}
tapIs("u3-volume", "biggest-volume", argmax(tapOf("u3-volume", "biggest-volume").chart.volumes!))
{
  const c = tapOf("u3-gaps", "find-gap").chart.candles
  tapIs("u3-gaps", "find-gap", c.findIndex((k, i) => i > 0 && k[2] > c[i - 1][1]))
}

// Unit 4
{
  const c = tapOf("u4-swing-highs-and-swing-lows", "latest-swing-high").chart.candles
  tapIs("u4-swing-highs-and-swing-lows", "latest-swing-high", argBy(c, 18, 27, hi, true))
  check("u4 swing highs are the max of their legs", argBy(c, 0, 9, hi, true) === 5 && argBy(c, 9, 18, hi, true) === 14)
}
{
  const c = tapOf("u4-trend-vs-range", "latest-hl").chart.candles
  tapIs("u4-trend-vs-range", "latest-hl", argBy(c, 22, 30, lo, false))
}
tapIs("u4-impulse-and-pullback", "pullback-end", argBy(tapOf("u4-impulse-and-pullback", "pullback-end").chart.candles, 15, 26, lo, false))
{
  const t = tapOf("u4-break-of-structure", "bos-candle")
  const c = t.chart.candles
  const level = c[8][1]
  check("u4 BOS level is the swing high of 0..12", argBy(c, 0, 12, hi, true) === 8)
  tapIs("u4-break-of-structure", "bos-candle", c.findIndex((k, i) => i > 12 && k[3] > level))
}
{
  const t = tapOf("u4-change-of-character", "choch-candle")
  const c = t.chart.candles
  check("u4 last HL is the low of 12..20", argBy(c, 12, 20, lo, false) === 16)
  tapIs("u4-change-of-character", "choch-candle", c.findIndex((k, i) => i > 20 && k[3] < c[16][2]))
}
tapIs("u4-internal-vs-swing-structure", "strong-low", argBy(tapOf("u4-internal-vs-swing-structure", "strong-low").chart.candles, 6, 22, lo, false))

// Unit 5
{
  const c = tapOf("u5-support-and-resistance", "third-touch").chart.candles
  tapIs("u5-support-and-resistance", "third-touch", argBy(c, 18, 28, lo, false))
  check("u5 support lows inside the zone", [5, 14, 23].every((i) => c[i][2] >= 99.75 && c[i][2] <= 100.4), [5, 14, 23].map((i) => c[i][2]).join(","))
}
{
  const c = tapOf("u5-role-reversal", "retest").chart.candles
  tapIs("u5-role-reversal", "retest", argBy(c, 16, 26, lo, false))
  check("u5 retest low inside the flip zone", c[20][2] >= 101.85 && c[20][2] <= 102.3, String(c[20][2]))
}
{
  const t = tapOf("u5-round-numbers", "round-break")
  const c = t.chart.candles
  const first = c.findIndex((k) => k[3] > 1.1)
  tapIs("u5-round-numbers", "round-break", first)
  check("u5 earlier highs stay under 1.1000", c.slice(0, 18).every((k) => k[1] < 1.1), "")
}
{
  const t = tapOf("u5-trendlines-and-channels", "third-touch")
  const c = t.chart.candles
  tapIs("u5-trendlines-and-channels", "third-touch", argBy(c, 16, 25, lo, false))
  const slope = (c[12][2] - c[4][2]) / 8
  const onLine = c[4][2] + slope * 16
  check("u5 third touch near the trendline", Math.abs(c[20][2] - onLine) < 0.3, `${c[20][2]} vs ${onLine.toFixed(2)}`)
}
{
  const c = tapOf("u5-supply-and-demand-zones", "zone-return").chart.candles
  tapIs("u5-supply-and-demand-zones", "zone-return", argBy(c, 21, 28, lo, false))
  check("u5 zone return low inside the zone", c[24][2] <= 101.65 && c[24][2] >= 100.6, String(c[24][2]))
}
tapIs("u5-classic-reversal-patterns", "find-head", argmax(tapOf("u5-classic-reversal-patterns", "find-head").chart.candles.map(hi)))
{
  const dt = learnChart("u5-classic-reversal-patterns", 0).candles
  check("u5 double top peaks within 0.3", Math.abs(dt[6][1] - dt[15][1]) < 0.3, `${dt[6][1]} vs ${dt[15][1]}`)
}
{
  const t = tapOf("u5-breakouts-fakeouts-and-retests", "find-fakeout")
  const c = t.chart.candles
  const rangeHigh = Math.max(...c.slice(0, 20).map(hi))
  check("u5 fakeout spikes above and closes inside", c[20][1] > rangeHigh && c[20][3] < rangeHigh)
}
{
  const t = tapOf("u5-fibonacci-retracements-and-extensions", "fib-touch")
  const c = t.chart.candles
  tapIs("u5-fibonacci-retracements-and-extensions", "fib-touch", argBy(c, 10, 24, lo, false))
  const lvl = c[10][1] - (c[10][1] - c[0][2]) * 0.618
  check("u5 fib low near 61.8%", Math.abs(c[16][2] - lvl) < 0.35, `${c[16][2]} vs ${lvl.toFixed(2)}`)
}

// Unit 6
{
  const ch = learnChart("u6-divergence-and-combining-tools", 0)
  const line = ch.annotations!.find((a) => a.kind === "line")
  if (line?.kind === "line") {
    const [p1, p2] = [line.from[0], line.to[0]]
    const r = rsi(ch.candles, 14)
    check(
      `u6 divergence: price ${ch.candles[p1][1]} -> ${ch.candles[p2][1]}, RSI ${r[p1]} -> ${r[p2]}`,
      ch.candles[p2][1] > ch.candles[p1][1] && (r[p2] ?? 100) < (r[p1] ?? 0),
    )
  }
}
for (const [lessonId, nth] of [["u6-why-indicators-lag", 0], ["u6-moving-averages", 1], ["u6-bollinger-bands", 0]] as const) {
  const ch = learnChart(lessonId, nth)
  const markers = (ch.annotations ?? []).filter((a) => a.kind === "marker")
  check(`${lessonId} markers placed`, markers.every((m) => m.kind === "marker" && m.index > 0), JSON.stringify(markers))
}
{
  const ch = learnChart("u6-rsi", 0)
  const v = ch.pane!.lines![0].values.filter((x): x is number => x !== null)
  check(`u6 RSI reaches >70 and <30 (max ${Math.max(...v)}, min ${Math.min(...v)})`, Math.max(...v) > 70 && Math.min(...v) < 30)
}

// Level 3 setups: re-derive every fact the lessons rely on
{
  const c = REVERSAL
  const eql = Math.min(c[R.eql1][2], c[R.eql2][2])
  check("L3 equal lows within 0.05", Math.abs(c[R.eql1][2] - c[R.eql2][2]) <= 0.05)
  check("L3 nothing below the equal lows before the sweep", Math.min(...c.slice(0, R.sweep).map(lo)) >= eql)
  check("L3 sweep wicks below and closes back above", c[R.sweep][2] < eql && c[R.sweep][3] > eql)
  check("L3 order block is a down-close candle", isDown(c[R.orderBlock]))
  check("L3 MSS: first close above the last lower high is the displacement", c.findIndex((k, i) => i > R.sweep && k[3] > c[R.lastLowerHigh][1]) === R.displacement)
  check("L3 last lower high is below the earlier one", c[R.lastLowerHigh][1] < c[9][1])
  const bulls = findFvgs(c).filter((f) => f.dir === "bull")
  const main = bulls.find((f) => f.index === R.fvg)!
  check("L3 main FVG is the biggest bullish gap", !!main && bulls.every((f) => f.top - f.bottom <= main.top - main.bottom))
  const ce = (main.top + main.bottom) / 2
  check("L3 retrace touches the FVG midpoint and holds the gap", c[R.retrace][2] <= ce + 0.01 && c[R.retrace][2] >= main.bottom && c[R.retrace][3] > ce)
  check("L3 retrace is the first candle back into the gap", c.findIndex((k, i) => i > R.fvg + 1 && k[2] <= main.top) === R.retrace)
  const legLow = c[R.sweep][2]
  const legHigh = c[R.legHigh][1]
  check("L3 leg high is the high between sweep and retrace", argBy(c, R.sweep, R.retrace, hi, true) === R.legHigh)
  check("L3 retrace is in discount", c[R.retrace][2] < (legLow + legHigh) / 2)
  check("L3 target takes the old high", c[R.target][1] > c[R.oldHigh][1] && c.slice(1, R.target).every((k) => k[1] < c[R.oldHigh][1]))
  const bear = findFvgs(c).find((f) => f.index === R.bearFvg && f.dir === "bear")!
  check("L3 IFVG: displacement is the first close above the bearish gap", c.findIndex((k, i) => i > R.bearFvg + 1 && k[3] > bear.top) === R.displacement)

  const d = REVERSAL_DEEP
  const range = d[R.legHigh][1] - d[R.sweep][2]
  const otelo = d[R.legHigh][1] - range * 0.79
  const otehi = d[R.legHigh][1] - range * 0.62
  check(`L3 deep retrace inside OTE (${d[R.retrace][2]} in ${otelo.toFixed(2)}..${otehi.toFixed(2)})`, d[R.retrace][2] >= otelo && d[R.retrace][2] <= otehi)
  check("L3 deep retrace reaches the order block", d[R.retrace][2] <= d[R.orderBlock][1])
  check("L3 deep retrace is the lowest point after the leg high", argBy(d, R.legHigh + 1, d.length - 1, lo, false) === R.retrace)

  const ns = REVERSAL_NO_SWEEP
  check("L3 SMT twin holds above the equal lows", ns[R.sweep][2] > Math.min(ns[R.eql1][2], ns[R.eql2][2]))

  const m = REVERSAL_BEAR
  const eqh = Math.max(m[R.eql1][1], m[R.eql2][1])
  check("L3 bearish mirror sweeps the equal highs and closes back below", m[R.sweep][1] > eqh && m[R.sweep][3] < eqh)
  check("L3 bearish mirror has its bearish FVG at the displacement", findFvgs(m).some((f) => f.index === R.fvg && f.dir === "bear"))

  const b = BREAKER
  check("L3 breaker: sweep below the old low", b[B.sweep][2] < b[B.oldLow][2] && b.slice(B.oldLow + 1, B.sweep).every((k) => k[2] > b[B.oldLow][2]))
  check("L3 breaker: order block is the last up candle before the drop", b[B.orderBlock][3] > b[B.orderBlock][0] && argBy(b, 0, B.sweep, hi, true) === B.swingHigh)
  check("L3 breaker: MSS candle is the first close above the swing high", b.findIndex((k, i) => i > B.sweep && k[3] > b[B.swingHigh][1]) === B.mss)
  const bf = findFvgs(b).find((f) => f.index === B.fvg && f.dir === "bull")!
  const uTop = Math.min(b[B.orderBlock][1], bf.top)
  const uBot = Math.max(b[B.orderBlock][2], bf.bottom)
  check("L3 unicorn overlap exists and the retest enters it", uTop > uBot && b[B.retest][2] <= uTop && b[B.retest][2] >= uBot)

  const day = DAY
  const asianHigh = Math.max(...day.slice(D.asianFrom, D.asianTo + 1).map(hi))
  const asianLow = Math.min(...day.slice(D.asianFrom, D.asianTo + 1).map(lo))
  check("L3 day: Asian high/low constants match the candles", asianHigh === D.asianHigh && asianLow === D.asianLow)
  check("L3 day: first sweep of the Asian low is at 2 am", day.findIndex((k, i) => i > D.asianTo && k[2] < D.asianLow) === D.sweep)
  check("L3 day: Judas low is the day's low", argBy(day, 0, day.length - 1, lo, false) === D.judas)
  check("L3 day: midnight open matches", day[D.midnight][0] === D.midnightOpen)
}
{
  const t = tapOf("u9-wyckoff-the-roots-of-amd", "find-spring")
  check("L3 Wyckoff spring is the lowest low after the climax", argBy(t.chart.candles, 6, t.chart.candles.length - 1, lo, false) === 24 && t.chart.candles[24][2] < t.chart.candles[5][2])
  const mm = tapOf("u10-market-maker-models", "smr").chart.candles
  check("L3 market maker reversal is the lowest low", [21, 22, 23].includes(argBy(mm, 0, mm.length - 1, lo, false)))
  const idm = tapOf("u7-inducement", "idm-swept")
  const ic = idm.chart.candles
  const z = argBy(ic, 11, 19, lo, false)
  check(`L3 inducement: price then reaches the demand zone (low ${ic[z][2]})`, ic[z][2] <= 102.0 && ic[z][2] >= 101.25)
}

// Level 4: the numbers the risk lessons quote
{
  const one = equityPath(10000, 0.01)
  const quarter = equityPath(10000, 0.25)
  const ten = equityPath(10000, 0.1)
  const pct = (p: number[]) => Math.round((p[p.length - 1] / p[0] - 1) * 100)
  check(`L4 trade sequence: 50 trades, 20 wins, +10R (${TRADES.length}, ${TRADES.filter((t) => t > 0).length})`, TRADES.length === 50 && TRADES.filter((t) => t > 0).length === 20)
  check(`L4 1% risk ends about +10% (${pct(one)}%) with drawdown under 8% (${(maxDrawdown(one) * 100).toFixed(1)}%)`, pct(one) === 10 && maxDrawdown(one) < 0.08)
  check(`L4 25% risk ends about -41% (${pct(quarter)}%) with a 90% drawdown`, pct(quarter) === -41 && Math.round(maxDrawdown(quarter) * 100) === 90)
  check(`L4 10% risk falls more than half from its peak (${(maxDrawdown(ten) * 100).toFixed(1)}%)`, maxDrawdown(ten) > 0.5)
  const news = tapOf("u14-trading-around-news", "news-candle").chart.candles
  check("L4 news candle has the morning's high and closes down", argBy(news, 0, news.length - 1, hi, true) === 10 && news[10][3] < news[10][0])
}

// Facts corrected in the 2026-10-03 review, pinned so they can't drift back
{
  /** Chance of at least `run` losses in a row somewhere in `trades` trades, losing each with probability `q` */
  const streak = (trades: number, q: number, run: number) => {
    let state = new Array<number>(run).fill(0)
    state[0] = 1
    let seen = 0
    for (let i = 0; i < trades; i++) {
      const next = new Array<number>(run).fill(0)
      state.forEach((p, k) => {
        next[0] += p * (1 - q)
        if (k + 1 === run) seen += p * q
        else next[k + 1] += p * q
      })
      state = next
    }
    return seen
  }
  const eight = streak(100, 0.6, 8)
  check(`L4 8 losses in a row within 100 trades at a 40% win rate is about a coin flip (${(eight * 100).toFixed(1)}%)`, eight > 0.45 && eight < 0.55)
  check(`L4 the same streak over 300 trades is very likely (${(streak(300, 0.6, 8) * 100).toFixed(1)}%)`, streak(300, 0.6, 8) > 0.8)

  const text = (id: string) => JSON.stringify(LESSON_CONTENT[id])
  check("L4 Livermore quote reads 'It always was my sitting'", text("u13-cutting-winners-early").includes("It always was my sitting") && !text("u13-cutting-winners-early").includes("It was always my sitting"))
  check("L2 gaps lesson no longer says CME Bitcoin futures close at weekends", !text("u3-gaps").includes("CME closes at weekends"))
  check("L5 stocks lesson says the pattern day trader rule was replaced", text("u15-stocks").includes("replaced by new intraday margin standards"))

  // The strong low is the latest swing low that launched a break of the high before it
  const strong = LESSON_CONTENT["u4-internal-vs-swing-structure"].steps.find((x) => x.kind === "learn" && x.title === "Strong and weak highs and lows")
  if (strong?.kind === "learn" && strong.visual?.type === "scene" && strong.visual.scene.kind === "path") {
    const { points, marks = [] } = strong.visual.scene
    const low = marks.find((m) => m.label === "Strong low")
    const weak = marks.find((m) => m.label === "Weak high")
    check(
      "L2 strong low scene: the marked low is the last one before the newest high, and that high broke the old one",
      !!low && !!weak && weak.at === points.indexOf(Math.max(...points)) && low.at === weak.at - 1 && points[weak.at] > Math.max(...points.slice(0, low.at)),
    )
  } else fail("u4-internal-vs-swing-structure", "strong low scene not found")
}

const written = ALL_LESSONS.filter((r) => LESSON_CONTENT[r.lesson.id]).length
console.log(`\n${written} lessons written, ${problems} problems`)
