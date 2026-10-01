import { and, asc, count, eq, lte, ne, sql } from "drizzle-orm"

import { LESSON_CONTENT } from "@/content/academy"
import { db } from "@/db"
import { academyCertificates, academyProgress, academyReviews, academyStats, users } from "@/db/schema"
import { ALL_LESSONS, findLessonById } from "@/lib/academy/curriculum"
import { isQuestion, type Question } from "@/lib/academy/types"
import {
  addDays,
  advanceStreak,
  displayStreak,
  freezeAvailable,
  lessonXp,
  MAX_BOX,
  PRACTICE_SIZE,
  PRACTICE_XP_DAILY_CAP,
  REVIEW_INTERVALS,
} from "@/lib/academy/xp"
import { isAdmin } from "@/lib/admin"

// Entrix Academy persistence. XP is only ever awarded here, from the lesson
// registry and the reported score; the browser never sends an XP amount.

export interface AcademyState {
  xp: number
  streak: number
  bestStreak: number
  freezeAvailable: boolean
  /** Lessons finished today (local day) */
  todayCount: number
  /** Admins can open every written lesson without finishing the ones before it */
  unlockAll: boolean
  /** Missed questions due for review today or earlier */
  dueCount: number
  /** Public code of the learner's certificate, once they passed the final exam */
  certificateId: string | null
  completed: Record<string, { bestCorrect: number; total: number }>
}

export async function getAcademyState(userId: string, today: string): Promise<AcademyState> {
  const [stats, rows, user, due, cert] = await Promise.all([
    db.select().from(academyStats).where(eq(academyStats.userId, userId)).then((r) => r[0]),
    db
      .select({
        lessonId: academyProgress.lessonId,
        bestCorrect: academyProgress.bestCorrect,
        total: academyProgress.total,
        lastCompletedDay: academyProgress.lastCompletedDay,
      })
      .from(academyProgress)
      .where(eq(academyProgress.userId, userId)),
    db
      .select({ email: users.email, emailVerified: users.emailVerified })
      .from(users)
      .where(eq(users.id, userId))
      .then((r) => r[0]),
    db
      .select({ value: count() })
      .from(academyReviews)
      .where(and(eq(academyReviews.userId, userId), lte(academyReviews.dueDay, today)))
      .then((r) => r[0]?.value ?? 0),
    db
      .select({ id: academyCertificates.id })
      .from(academyCertificates)
      .where(eq(academyCertificates.userId, userId))
      .then((r) => r[0]?.id ?? null),
  ])

  const streakState = {
    streak: stats?.streak ?? 0,
    lastActiveDay: stats?.lastActiveDay ?? null,
    freezeUsedOn: stats?.freezeUsedOn ?? null,
  }

  return {
    xp: stats?.xp ?? 0,
    streak: displayStreak(streakState, today),
    bestStreak: stats?.bestStreak ?? 0,
    freezeAvailable: freezeAvailable(streakState.freezeUsedOn, today),
    todayCount: rows.filter((r) => r.lastCompletedDay === today).length,
    unlockAll: isAdmin(user),
    dueCount: due,
    certificateId: cert,
    completed: Object.fromEntries(rows.map((r) => [r.lessonId, { bestCorrect: r.bestCorrect, total: r.total }])),
  }
}

/**
 * The day used for daily limits. The browser reports its local day (checked
 * to be within a day of UTC), but it may never go back before the last day
 * this learner was active: otherwise alternating two dates resets the daily
 * Practice XP cap and the once-a-day replay XP on every request.
 */
export async function settledDay(userId: string, reported: string): Promise<string> {
  const [s] = await db
    .select({ last: academyStats.lastActiveDay, practiceDay: academyStats.practiceDay })
    .from(academyStats)
    .where(eq(academyStats.userId, userId))
  return [reported, s?.last, s?.practiceDay].filter((d): d is string => !!d).sort().at(-1) ?? reported
}

/**
 * Same unlock rule as the course path: a lesson can be finished once the one
 * before it is finished (replays are always fine). Admins can open everything.
 */
export async function canCompleteLesson(userId: string, lessonId: string): Promise<boolean> {
  const ref = findLessonById(lessonId)
  if (!ref) return false
  const prev = ALL_LESSONS[ref.index - 1]
  if (!prev) return true
  const [done, user] = await Promise.all([
    db
      .select({ lessonId: academyProgress.lessonId })
      .from(academyProgress)
      .where(and(eq(academyProgress.userId, userId), sql`${academyProgress.lessonId} IN (${lessonId}, ${prev.lesson.id})`)),
    db.select({ email: users.email, emailVerified: users.emailVerified }).from(users).where(eq(users.id, userId)).then((r) => r[0]),
  ])
  return done.length > 0 || isAdmin(user)
}

/** Adds XP and moves the streak for activity on `today`. Returns whether a streak freeze was used. */
export async function bumpStats(userId: string, xpEarned: number, today: string, practiceXp = 0): Promise<boolean> {
  const [current] = await db.select().from(academyStats).where(eq(academyStats.userId, userId))
  const next = advanceStreak(
    {
      streak: current?.streak ?? 0,
      lastActiveDay: current?.lastActiveDay ?? null,
      freezeUsedOn: current?.freezeUsedOn ?? null,
    },
    today,
  )
  const bestStreak = Math.max(current?.bestStreak ?? 0, next.streak)
  const practiceToday = current?.practiceDay === today ? current.practiceXp + practiceXp : practiceXp
  await db
    .insert(academyStats)
    .values({
      userId,
      xp: xpEarned,
      streak: next.streak,
      bestStreak,
      lastActiveDay: next.lastActiveDay,
      freezeUsedOn: next.freezeUsedOn,
      practiceDay: practiceXp > 0 ? today : null,
      practiceXp,
    })
    .onConflictDoUpdate({
      target: academyStats.userId,
      set: {
        // Added in SQL so two sessions finishing at once can't lose XP
        xp: sql`${academyStats.xp} + ${xpEarned}`,
        streak: next.streak,
        bestStreak,
        lastActiveDay: next.lastActiveDay,
        freezeUsedOn: next.freezeUsedOn,
        ...(practiceXp > 0 ? { practiceDay: today, practiceXp: practiceToday } : {}),
        updatedAt: new Date(),
      },
    })
  return next.usedFreeze
}

export interface CompletionResult {
  xpEarned: number
  firstTime: boolean
  perfect: boolean
  usedFreeze: boolean
  state: AcademyState
}

export async function completeLesson({
  userId,
  lessonId,
  correct,
  total,
  missed,
  today: reportedDay,
}: {
  userId: string
  lessonId: string
  correct: number
  total: number
  /** Question ids answered wrong on the first try; they go into Practice */
  missed: string[]
  today: string
}): Promise<CompletionResult> {
  const today = await settledDay(userId, reportedDay)
  const perfect = correct === total
  const firstXp = lessonXp({ firstTime: true, perfect })
  const replayXp = lessonXp({ firstTime: false, perfect })

  // First completion: the insert wins exactly once, even under a double submit
  const inserted = await db
    .insert(academyProgress)
    .values({ userId, lessonId, bestCorrect: correct, total, attempts: 1, xp: firstXp, lastCompletedDay: today })
    .onConflictDoNothing({ target: [academyProgress.userId, academyProgress.lessonId] })
    .returning({ id: academyProgress.id })
  const firstTime = inserted.length > 0

  let xpEarned = 0
  if (firstTime) {
    xpEarned = firstXp
  } else {
    // Replay: the row only matches when it wasn't already replayed today, so
    // replay XP is paid at most once per lesson per day
    const replayed = await db
      .update(academyProgress)
      .set({
        attempts: sql`${academyProgress.attempts} + 1`,
        bestCorrect: sql`greatest(${academyProgress.bestCorrect}, ${correct})`,
        total,
        xp: sql`${academyProgress.xp} + ${replayXp}`,
        lastCompletedDay: today,
        lastCompletedAt: new Date(),
      })
      .where(
        and(
          eq(academyProgress.userId, userId),
          eq(academyProgress.lessonId, lessonId),
          ne(academyProgress.lastCompletedDay, today),
        ),
      )
      .returning({ id: academyProgress.id })
    if (replayed.length > 0) {
      xpEarned = replayXp
    } else {
      // Same-day replay: keep the best score and count the attempt, no XP
      await db
        .update(academyProgress)
        .set({
          attempts: sql`${academyProgress.attempts} + 1`,
          bestCorrect: sql`greatest(${academyProgress.bestCorrect}, ${correct})`,
          lastCompletedAt: new Date(),
        })
        .where(and(eq(academyProgress.userId, userId), eq(academyProgress.lessonId, lessonId)))
    }
  }

  // Missed questions come back in Practice tomorrow
  const valid = new Set(questionsOf(lessonId).map((q) => q.id))
  const toReview = [...new Set(missed)].filter((id) => valid.has(id))
  if (toReview.length > 0) {
    await db
      .insert(academyReviews)
      .values(toReview.map((questionId) => ({ userId, lessonId, questionId, box: 1, dueDay: addDays(today, 1) })))
      .onConflictDoUpdate({
        target: [academyReviews.userId, academyReviews.lessonId, academyReviews.questionId],
        set: { box: 1, dueDay: addDays(today, 1), updatedAt: new Date() },
      })
  }

  const usedFreeze = await bumpStats(userId, xpEarned, today)
  return { xpEarned, firstTime, perfect, usedFreeze, state: await getAcademyState(userId, today) }
}

// ─── Practice ────────────────────────────────────────────────────────────────

function questionsOf(lessonId: string): Question[] {
  return LESSON_CONTENT[lessonId]?.steps.filter(isQuestion) ?? []
}

export interface PracticeItem {
  lessonId: string
  lessonTitle: string
  /** True when it came from the review queue rather than as a refresher */
  due: boolean
  question: Question
}

/**
 * Up to PRACTICE_SIZE questions: everything due for review first (oldest
 * first), then random refreshers from finished lessons to fill the session.
 */
export async function getPracticeSet(userId: string, today: string): Promise<PracticeItem[]> {
  const [queued, done] = await Promise.all([
    db
      .select({ lessonId: academyReviews.lessonId, questionId: academyReviews.questionId, dueDay: academyReviews.dueDay })
      .from(academyReviews)
      .where(eq(academyReviews.userId, userId))
      .orderBy(asc(academyReviews.dueDay), asc(academyReviews.box)),
    db.select({ lessonId: academyProgress.lessonId }).from(academyProgress).where(eq(academyProgress.userId, userId)),
  ])
  const due = queued.filter((r) => r.dueDay <= today).slice(0, PRACTICE_SIZE)

  const items: PracticeItem[] = []
  // Queued questions that aren't due yet stay out of the refreshers, so they
  // come back on their own schedule instead of early
  const taken = new Set<string>(queued.filter((r) => r.dueDay > today).map((r) => `${r.lessonId}::${r.questionId}`))
  const add = (lessonId: string, question: Question, isDue: boolean) => {
    const key = `${lessonId}::${question.id}`
    if (taken.has(key)) return
    taken.add(key)
    items.push({ lessonId, lessonTitle: findLessonById(lessonId)?.lesson.title ?? "", due: isDue, question })
  }

  for (const r of due) {
    const q = questionsOf(r.lessonId).find((x) => x.id === r.questionId)
    if (q) add(r.lessonId, q, true)
  }

  const pool = done.flatMap((d) => questionsOf(d.lessonId).map((q) => ({ lessonId: d.lessonId, q })))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  for (const p of pool) {
    if (items.length >= PRACTICE_SIZE) break
    add(p.lessonId, p.q, false)
  }
  return items
}

export interface PracticeResult {
  xpEarned: number
  correct: number
  total: number
  /** Review questions answered right that won't come back (left the queue) */
  graduated: number
  usedFreeze: boolean
  state: AcademyState
}

export async function completePractice({
  userId,
  results,
  today: reportedDay,
}: {
  userId: string
  results: { lessonId: string; questionId: string; correct: boolean }[]
  today: string
}): Promise<PracticeResult> {
  const today = await settledDay(userId, reportedDay)
  // Only real questions count
  const valid = results.filter((r) => questionsOf(r.lessonId).some((q) => q.id === r.questionId))
  const unique = [...new Map(valid.map((r) => [`${r.lessonId}::${r.questionId}`, r])).values()]

  const existing = unique.length
    ? await db
        .select({ lessonId: academyReviews.lessonId, questionId: academyReviews.questionId, box: academyReviews.box, dueDay: academyReviews.dueDay })
        .from(academyReviews)
        .where(eq(academyReviews.userId, userId))
    : []
  // Only reviews that were actually due move up a box
  const boxOf = new Map(existing.filter((r) => r.dueDay <= today).map((r) => [`${r.lessonId}::${r.questionId}`, r.box]))

  let graduated = 0
  for (const r of unique) {
    const key = `${r.lessonId}::${r.questionId}`
    const box = boxOf.get(key)
    const where = and(
      eq(academyReviews.userId, userId),
      eq(academyReviews.lessonId, r.lessonId),
      eq(academyReviews.questionId, r.questionId),
    )
    if (!r.correct) {
      // Wrong: back to box 1, due tomorrow (insert if it wasn't queued yet)
      await db
        .insert(academyReviews)
        .values({ userId, lessonId: r.lessonId, questionId: r.questionId, box: 1, dueDay: addDays(today, 1) })
        .onConflictDoUpdate({
          target: [academyReviews.userId, academyReviews.lessonId, academyReviews.questionId],
          set: { box: 1, dueDay: addDays(today, 1), updatedAt: new Date() },
        })
    } else if (box !== undefined) {
      if (box >= MAX_BOX) {
        await db.delete(academyReviews).where(where)
        graduated++
      } else {
        await db
          .update(academyReviews)
          .set({ box: box + 1, dueDay: addDays(today, REVIEW_INTERVALS[box]), updatedAt: new Date() })
          .where(where)
      }
    }
    // Right answers to refreshers, or to queued questions not due yet, change nothing
  }

  const correct = unique.filter((r) => r.correct).length

  // Streak first (also creates the stats row), then the XP grant in one
  // statement: the row lock makes two sessions finishing at once share the
  // daily cap instead of both reading "nothing used yet".
  const usedFreeze = await bumpStats(userId, 0, today)
  const granted = await db.execute(sql`
    WITH old AS (
      SELECT practice_xp, practice_day FROM academy_stats WHERE user_id = ${userId} FOR UPDATE
    ), grant_xp AS (
      SELECT greatest(0, least(${correct}, ${PRACTICE_XP_DAILY_CAP} - CASE WHEN old.practice_day = ${today} THEN old.practice_xp ELSE 0 END)) AS n,
             CASE WHEN old.practice_day = ${today} THEN old.practice_xp ELSE 0 END AS used
      FROM old
    )
    UPDATE academy_stats SET
      xp = xp + grant_xp.n,
      practice_day = ${today},
      practice_xp = grant_xp.used + grant_xp.n,
      updated_at = now()
    FROM grant_xp
    WHERE academy_stats.user_id = ${userId}
    RETURNING grant_xp.n AS n
  `)
  const xpEarned = Number((granted.rows[0] as { n?: number } | undefined)?.n ?? 0)
  return { xpEarned, correct, total: unique.length, graduated, usedFreeze, state: await getAcademyState(userId, today) }
}
