// The practice market for Paper Trading: generated prices, no real instrument.
//
// Price moves in small steps ("ticks"); 20 of them build one candle, so highs
// and lows form the way they do in a real candle instead of being picked at
// random. Each step adds up: noise whose size clusters (quiet spells, busy
// spells), a little momentum, a pull back towards a slowly wandering fair
// value, a drift that depends on the current market condition, and rare news
// jumps. Conditions (range, uptrend, downtrend, volatile) change on their own.
//
// Nothing here knows about the player's trades. The market never leans
// towards or away from a position: it must stay that way.

export interface SimCandle {
  /** Simulated time in seconds; each candle is one simulated minute */
  time: number
  open: number
  high: number
  low: number
  close: number
}

export type Condition = "range" | "up" | "down" | "volatile"

interface ConditionParams {
  drift: number
  volatility: number
  meanReversion: number
  momentum: number
  /** Chance of a news jump, per tick */
  news: number
}

const CONDITIONS: Record<Condition, ConditionParams> = {
  range:    { drift: 0,     volatility: 0.2,  meanReversion: 0.45, momentum: 0.1, news: 0.0002 },
  up:       { drift: 0.5,   volatility: 0.35, meanReversion: 0.05, momentum: 0.4, news: 0.0006 },
  down:     { drift: -0.5,  volatility: 0.35, meanReversion: 0.05, momentum: 0.4, news: 0.0006 },
  volatile: { drift: 0,     volatility: 0.7,  meanReversion: 0.12, momentum: 0.3, news: 0.003 },
}
// Up and down are equally likely, so over time the market has no built-in direction
const CONDITION_ODDS: [Condition, number][] = [["range", 0.4], ["up", 0.225], ["down", 0.225], ["volatile", 0.15]]

export const TICKS_PER_CANDLE = 20
const CANDLE_SECONDS = 60
const START_PRICE = 100
const HISTORY_CAP = 600
/** A jump this large (as a share of price) is announced as a news spike */
const NEWS_MIN = 0.0025

const round2 = (v: number) => Math.round(v * 100) / 100

export interface MarketSnapshot {
  v: 1
  rng: number
  spare: number | null
  price: number
  fairValue: number
  variance: number
  lastChange: number
  ticksInCandle: number
  current: SimCandle
  history: SimCandle[]
  condition: Condition
  conditionLeft: number
  spikes: number[]
}

export interface TickResult {
  /** The candle being built, after this tick */
  candle: SimCandle
  /** Set when this tick finished a candle */
  closed: SimCandle | null
  /** A news jump happened on this tick */
  spike: boolean
}

export class Market {
  private rng: number
  private spare: number | null = null
  price = START_PRICE
  private fairValue = START_PRICE
  private variance = 1
  private lastChange = 0
  private ticksInCandle = 0
  private current: SimCandle
  history: SimCandle[] = []
  private condition: Condition = "range"
  private conditionLeft = 0
  /** Times of candles in which a news spike happened */
  spikes: number[] = []

  constructor(seed = Math.floor(Math.random() * 0xffffffff)) {
    this.rng = seed >>> 0
    this.current = { time: 0, open: this.price, high: this.price, low: this.price, close: this.price }
    this.nextCondition()
  }

  /** Uniform 0..1 (mulberry32), with its state kept so a session can be resumed exactly */
  private rand(): number {
    this.rng = (this.rng + 0x6d2b79f5) | 0
    let t = Math.imul(this.rng ^ (this.rng >>> 15), 1 | this.rng)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  /** Standard normal (polar Box-Muller) */
  private gaussian(): number {
    if (this.spare !== null) {
      const v = this.spare
      this.spare = null
      return v
    }
    let u = 0
    let v = 0
    let s = 0
    do {
      u = this.rand() * 2 - 1
      v = this.rand() * 2 - 1
      s = u * u + v * v
    } while (s === 0 || s >= 1)
    const mul = Math.sqrt((-2 * Math.log(s)) / s)
    this.spare = v * mul
    return u * mul
  }

  private nextCondition() {
    let roll = this.rand()
    for (const [condition, odds] of CONDITION_ODDS) {
      roll -= odds
      if (roll <= 0) {
        this.condition = condition
        break
      }
    }
    this.conditionLeft = 60 + Math.floor(this.rand() * 140) // candles
  }

  /** One price step. Returns whether a news jump happened. */
  private step(): boolean {
    const p = CONDITIONS[this.condition]
    const price = this.price

    // Busy ticks make the next ones busier, then it fades: volatility clusters
    const lastShock = Math.pow(this.lastChange / (price * 0.004 + 1e-9), 2)
    this.variance = Math.min(Math.max(0.9 * this.variance + 0.06 * lastShock + 0.04, 0.15), 8)

    const noise = this.gaussian() * (0.00008 + p.volatility * 0.0014) * Math.sqrt(this.variance) * price
    this.fairValue += this.gaussian() * price * 0.00015
    const reversion = p.meanReversion * 0.02 * (this.fairValue - price)
    const momentum = p.momentum * 0.55 * this.lastChange
    const drift = p.drift * 0.00012 * price

    let jump = 0
    if (this.rand() < p.news) {
      const sign = this.rand() < 0.5 ? -1 : 1
      jump = sign * (NEWS_MIN + this.rand() * 0.005) * price
    }

    const next = Math.max(price + drift + reversion + momentum + noise + jump, START_PRICE * 0.02)
    this.lastChange = next - price
    this.price = next
    return jump !== 0
  }

  tick(): TickResult {
    const spike = this.step()
    const c = this.current
    c.high = Math.max(c.high, this.price)
    c.low = Math.min(c.low, this.price)
    c.close = this.price
    this.ticksInCandle++
    if (spike && this.spikes[this.spikes.length - 1] !== c.time) {
      this.spikes.push(c.time)
      if (this.spikes.length > 40) this.spikes.shift()
    }

    let closed: SimCandle | null = null
    if (this.ticksInCandle >= TICKS_PER_CANDLE) {
      closed = { time: c.time, open: round2(c.open), high: round2(c.high), low: round2(c.low), close: round2(c.close) }
      this.history.push(closed)
      if (this.history.length > HISTORY_CAP) this.history.shift()
      this.ticksInCandle = 0
      this.current = { time: c.time + CANDLE_SECONDS, open: this.price, high: this.price, low: this.price, close: this.price }
      if (--this.conditionLeft <= 0) this.nextCondition()
    }

    const live = this.current
    return {
      candle: { time: live.time, open: round2(live.open), high: round2(live.high), low: round2(live.low), close: round2(live.close) },
      closed,
      spike,
    }
  }

  /** Builds `candles` of history at once, so the chart doesn't start empty */
  prewarm(candles: number) {
    while (this.history.length < candles) this.tick()
  }

  /** Average size of the last 14 candles, high to low: a simple stand-in for ATR */
  averageRange(): number {
    const recent = this.history.slice(-14)
    if (recent.length === 0) return this.price * 0.003
    const mean = recent.reduce((sum, c) => sum + (c.high - c.low), 0) / recent.length
    return Math.max(mean, this.price * 0.0008)
  }

  snapshot(): MarketSnapshot {
    return {
      v: 1,
      rng: this.rng,
      spare: this.spare,
      price: this.price,
      fairValue: this.fairValue,
      variance: this.variance,
      lastChange: this.lastChange,
      ticksInCandle: this.ticksInCandle,
      current: { ...this.current },
      history: this.history.slice(-HISTORY_CAP),
      condition: this.condition,
      conditionLeft: this.conditionLeft,
      spikes: [...this.spikes],
    }
  }

  static restore(s: MarketSnapshot): Market {
    const m = new Market(1)
    m.rng = s.rng
    m.spare = s.spare
    m.price = s.price
    m.fairValue = s.fairValue
    m.variance = s.variance
    m.lastChange = s.lastChange
    m.ticksInCandle = s.ticksInCandle
    m.current = { ...s.current }
    m.history = s.history.map((c) => ({ ...c }))
    m.condition = s.condition
    m.conditionLeft = s.conditionLeft
    m.spikes = [...s.spikes]
    return m
  }
}

/** True when the value has the shape of a snapshot this version can restore */
export function isMarketSnapshot(value: unknown): value is MarketSnapshot {
  const s = value as MarketSnapshot | null
  return (
    !!s && s.v === 1 && Number.isFinite(s.price) && s.price > 0 && Array.isArray(s.history) && s.history.length > 0 &&
    !!s.current && Number.isFinite(s.current.time) && typeof s.condition === "string" && s.condition in CONDITIONS
  )
}
