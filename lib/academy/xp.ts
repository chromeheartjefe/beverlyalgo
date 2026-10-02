// XP, ranks and streak rules for Entrix Academy. Pure functions shared by the
// API (which is the only place XP is awarded) and the UI (which displays it).

/** First completion of a lesson */
export const XP_LESSON = 10
/** Bonus when every question was right on the first try */
const XP_PERFECT_BONUS = 5
/** Replaying a finished lesson, at most once per lesson per day */
const XP_REPLAY = 2

export function lessonXp({ firstTime, perfect }: { firstTime: boolean; perfect: boolean }): number {
  if (!firstTime) return XP_REPLAY
  return XP_LESSON + (perfect ? XP_PERFECT_BONUS : 0)
}

// ~129 lessons at 10-15 XP is roughly 1,300-1,900 XP for the whole course,
// so the top rank needs most of it.
export const RANKS = [
  { name: "Novice",        xp: 0 },
  { name: "Apprentice",    xp: 50 },
  { name: "Chart Reader",  xp: 150 },
  { name: "Analyst",       xp: 350 },
  { name: "Strategist",    xp: 650 },
  { name: "Pro Trader",    xp: 1000 },
  { name: "Market Wizard", xp: 1500 },
] as const

export function rankFor(xp: number) {
  let i = 0
  while (i + 1 < RANKS.length && xp >= RANKS[i + 1].xp) i++
  const current = RANKS[i]
  const next = RANKS[i + 1] ?? null
  const progress = next ? (xp - current.xp) / (next.xp - current.xp) : 1
  return { index: i, name: current.name, next, progress: Math.max(0, Math.min(1, progress)) }
}

// ─── Days and streaks ────────────────────────────────────────────────────────
// Days are the learner's local calendar day as "YYYY-MM-DD", sent by the
// browser, so a streak follows their own midnight rather than UTC.

const DAY_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

export function isDay(value: unknown): value is string {
  return typeof value === "string" && DAY_RE.test(value)
}

function dayNumber(day: string): number {
  const [y, m, d] = day.split("-").map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / 86_400_000)
}

/** Whole days from a to b (b later = positive) */
function daysBetween(a: string, b: string): number {
  return dayNumber(b) - dayNumber(a)
}

/** The browser's local day */
export function localDay(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Every timezone's local day is within one day of the UTC day. Anything
 * further out is a wrong clock or a forged request.
 */
export function isPlausibleDay(day: string, now = new Date()): boolean {
  const utc = now.toISOString().slice(0, 10)
  return Math.abs(daysBetween(utc, day)) <= 1
}

/** One missed day is forgiven by a streak freeze, refilled every 7 days */
const FREEZE_EVERY_DAYS = 7

export function freezeAvailable(freezeUsedOn: string | null, today: string): boolean {
  return !freezeUsedOn || daysBetween(freezeUsedOn, today) >= FREEZE_EVERY_DAYS
}

export interface StreakState {
  streak: number
  lastActiveDay: string | null
  freezeUsedOn: string | null
}

/** The streak after finishing a lesson on `today` */
export function advanceStreak(s: StreakState, today: string): StreakState & { usedFreeze: boolean } {
  if (!s.lastActiveDay) return { streak: 1, lastActiveDay: today, freezeUsedOn: s.freezeUsedOn, usedFreeze: false }
  const gap = daysBetween(s.lastActiveDay, today)
  // Same day, or a clock that went backwards: nothing changes
  if (gap <= 0) return { ...s, usedFreeze: false }
  if (gap === 1) return { streak: s.streak + 1, lastActiveDay: today, freezeUsedOn: s.freezeUsedOn, usedFreeze: false }
  // Missed exactly one day: a freeze bridges it
  if (gap === 2 && freezeAvailable(s.freezeUsedOn, today)) {
    return { streak: s.streak + 1, lastActiveDay: today, freezeUsedOn: today, usedFreeze: true }
  }
  return { streak: 1, lastActiveDay: today, freezeUsedOn: s.freezeUsedOn, usedFreeze: false }
}

/**
 * The streak to show today, before any lesson is done: still alive if the
 * last lesson was today or yesterday, or the day before with a freeze left.
 */
export function displayStreak(s: StreakState, today: string): number {
  if (!s.lastActiveDay) return 0
  const gap = daysBetween(s.lastActiveDay, today)
  if (gap <= 1) return s.streak
  if (gap === 2 && freezeAvailable(s.freezeUsedOn, today)) return s.streak
  return 0
}

// ─── Practice (spaced review) ────────────────────────────────────────────────

/** Days until a question in box 1..5 comes back after a right answer */
export const REVIEW_INTERVALS = [1, 3, 7, 16, 35] as const
export const MAX_BOX = REVIEW_INTERVALS.length

/** Questions per practice session */
export const PRACTICE_SIZE = 10

/** One XP per right answer, at most this much practice XP per day */
export const PRACTICE_XP_DAILY_CAP = 30

/** "YYYY-MM-DD" plus n days */
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}
