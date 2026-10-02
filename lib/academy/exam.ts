import { and, eq, isNull } from "drizzle-orm"
import { cache } from "react"

import { LESSON_CONTENT } from "@/content/academy"
import { db } from "@/db"
import { academyCertificates, academyExamAttempts, academyProgress, academyStats, users } from "@/db/schema"
import { ALL_LESSONS, findLessonById } from "@/lib/academy/curriculum"
import { type Answer, answerText, EMPTY_ANSWER, grade, promptText } from "@/lib/academy/grading"
import { bumpStats, settledDay } from "@/lib/academy/server"
import { isQuestion, type Question } from "@/lib/academy/types"
import { isAdmin } from "@/lib/admin"

// Entrix Academy final exam. Questions go to the browser WITHOUT their
// answers; the browser sends back what the learner picked and the server
// grades it, so a certificate can't be earned by reading the page source.

const EXAM_PER_UNIT = 2
const EXAM_PASS_RATIO = 0.8
const EXAM_XP = 50
/** An attempt must be submitted within this time of starting */
const ATTEMPT_TTL_MS = 3 * 60 * 60 * 1000

/** Question kinds the exam uses (match questions reveal their pairs, so they're left out) */
const EXAM_KINDS = new Set(["choice", "truefalse", "numeric", "tap"])

export interface ExamItem {
  key: string
  lessonTitle: string
  question: Question
}

/** The question with everything that would reveal the answer removed */
function sanitize(q: Question): Question {
  switch (q.kind) {
    case "choice":
      return { ...q, answer: -1, explain: "" }
    case "truefalse":
      return { ...q, answer: false, explain: "" }
    case "numeric":
      return { ...q, answer: 0, tolerance: 0, explain: "" }
    case "tap":
      return { ...q, targets: [], explain: "" }
    case "match":
      return { ...q, explain: "" }
  }
}

function questionByKey(key: string): { lessonId: string; question: Question } | null {
  const [lessonId, questionId] = key.split("::")
  const q = LESSON_CONTENT[lessonId]?.steps.filter(isQuestion).find((x) => x.id === questionId)
  return q ? { lessonId, question: q } : null
}

export async function examEligibility(userId: string): Promise<{ eligible: boolean; done: number; total: number }> {
  const [rows, user] = await Promise.all([
    db.select({ lessonId: academyProgress.lessonId }).from(academyProgress).where(eq(academyProgress.userId, userId)),
    db.select({ email: users.email, emailVerified: users.emailVerified }).from(users).where(eq(users.id, userId)).then((r) => r[0]),
  ])
  const written = Object.keys(LESSON_CONTENT)
  const finished = new Set(rows.map((r) => r.lessonId))
  const done = written.filter((id) => finished.has(id)).length
  return { eligible: done === written.length || isAdmin(user), done, total: written.length }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** EXAM_PER_UNIT random questions from every unit with written lessons, product unit excluded */
export async function startExam(userId: string): Promise<{ attemptId: string; items: ExamItem[] }> {
  const units = new Map<string, { lessonId: string; question: Question }[]>()
  for (const ref of ALL_LESSONS) {
    if (ref.unit.id === "u16") continue
    const content = LESSON_CONTENT[ref.lesson.id]
    if (!content) continue
    const list = units.get(ref.unit.id) ?? []
    for (const q of content.steps.filter(isQuestion)) if (EXAM_KINDS.has(q.kind)) list.push({ lessonId: ref.lesson.id, question: q })
    units.set(ref.unit.id, list)
  }
  const picked = shuffle([...units.values()].flatMap((list) => shuffle(list).slice(0, EXAM_PER_UNIT)))
  const keys = picked.map((p) => `${p.lessonId}::${p.question.id}`)

  const [attempt] = await db
    .insert(academyExamAttempts)
    .values({ userId, questions: JSON.stringify(keys), total: keys.length })
    .returning({ id: academyExamAttempts.id })

  return {
    attemptId: attempt.id,
    items: picked.map((p, i) => ({
      key: keys[i],
      lessonTitle: findLessonById(p.lessonId)?.lesson.title ?? "",
      question: sanitize(p.question),
    })),
  }
}

interface ExamReviewItem {
  key: string
  lessonTitle: string
  prompt: string
  correct: boolean
  rightAnswer: string
  explain: string
}

export interface ExamResult {
  correct: number
  total: number
  passed: boolean
  passMark: number
  xpEarned: number
  /** Total Academy XP after this exam (for the level-up check) */
  xpTotal: number
  certificateId: string | null
  review: ExamReviewItem[]
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
function certificateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(10))
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("")
}

export class ExamError extends Error {}

export async function submitExam({
  userId,
  attemptId,
  answers,
  today,
}: {
  userId: string
  attemptId: string
  answers: Record<string, Partial<Answer>>
  today: string
}): Promise<ExamResult> {
  const [attempt] = await db
    .select()
    .from(academyExamAttempts)
    .where(and(eq(academyExamAttempts.id, attemptId), eq(academyExamAttempts.userId, userId)))
  if (!attempt) throw new ExamError("That exam attempt wasn't found. Please start a new one.")
  if (attempt.submittedAt) throw new ExamError("This exam was already submitted. Start a new attempt to try again.")
  if (Date.now() - attempt.createdAt.getTime() > ATTEMPT_TTL_MS) throw new ExamError("This exam attempt has expired. Please start a new one.")

  const keys: string[] = JSON.parse(attempt.questions)
  const review: ExamReviewItem[] = []
  let correct = 0
  for (const key of keys) {
    const found = questionByKey(key)
    if (!found) continue
    const ok = grade(found.question, { ...EMPTY_ANSWER, ...(answers[key] ?? {}) })
    if (ok) correct++
    review.push({
      key,
      lessonTitle: findLessonById(found.lessonId)?.lesson.title ?? "",
      prompt: promptText(found.question),
      correct: ok,
      rightAnswer: answerText(found.question),
      explain: found.question.explain,
    })
  }
  const total = keys.length
  const passMark = Math.ceil(total * EXAM_PASS_RATIO)
  const passed = correct >= passMark

  // Only the first submit of an attempt counts, even under a double submit
  const marked = await db
    .update(academyExamAttempts)
    .set({ correct, passed, submittedAt: new Date() })
    .where(and(eq(academyExamAttempts.id, attemptId), isNull(academyExamAttempts.submittedAt)))
    .returning({ id: academyExamAttempts.id })
  if (marked.length === 0) throw new ExamError("This exam was already submitted. Start a new attempt to try again.")

  let certificateId: string | null = null
  let xpEarned = 0
  const [existing] = await db.select({ id: academyCertificates.id }).from(academyCertificates).where(eq(academyCertificates.userId, userId))
  if (existing) {
    certificateId = existing.id
  } else if (passed) {
    const [user] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId))
    const inserted = await db
      .insert(academyCertificates)
      .values({ id: certificateCode(), userId, name: user?.name ?? "Entrix Academy graduate", correct, total })
      .onConflictDoNothing({ target: academyCertificates.userId })
      .returning({ id: academyCertificates.id })
    if (inserted[0]) {
      certificateId = inserted[0].id
      xpEarned = EXAM_XP
      await bumpStats(userId, xpEarned, await settledDay(userId, today))
    } else {
      const [again] = await db.select({ id: academyCertificates.id }).from(academyCertificates).where(eq(academyCertificates.userId, userId))
      certificateId = again?.id ?? null
    }
  }

  const [stats] = await db.select({ xp: academyStats.xp }).from(academyStats).where(eq(academyStats.userId, userId))
  return { correct, total, passed, passMark, xpEarned, xpTotal: stats?.xp ?? xpEarned, certificateId, review }
}

/**
 * A certificate by its public code (public page and image). Cached per
 * request, so the page and its metadata share one query.
 */
export const getCertificate = cache(async (id: string) => {
  if (!/^[A-Z0-9]{10}$/.test(id)) return null
  const [cert] = await db.select().from(academyCertificates).where(eq(academyCertificates.id, id))
  return cert ?? null
})
