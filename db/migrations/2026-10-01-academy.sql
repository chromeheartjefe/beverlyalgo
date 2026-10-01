-- Entrix Academy progress, XP and streaks (2026-10-01)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses it (.env.local points at the
-- same database, so even local testing needs this first).
--
-- Additive only: two new tables, no existing rows or columns change. Safe to
-- re-run.

BEGIN;

-- One row per user per finished lesson. lesson_id is the stable id from
-- lib/academy/curriculum.ts; days are the learner's local "YYYY-MM-DD".
CREATE TABLE IF NOT EXISTS academy_progress (
  id                 text PRIMARY KEY,
  user_id            text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id          varchar(96) NOT NULL,
  best_correct       integer NOT NULL,
  total              integer NOT NULL,
  attempts           integer NOT NULL DEFAULT 1,
  xp                 integer NOT NULL DEFAULT 0,
  last_completed_day varchar(10) NOT NULL,
  first_completed_at timestamptz NOT NULL DEFAULT now(),
  last_completed_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS academy_progress_user_lesson_idx ON academy_progress (user_id, lesson_id);

-- One row per learner: total XP and the daily streak.
CREATE TABLE IF NOT EXISTS academy_stats (
  user_id         text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp              integer NOT NULL DEFAULT 0,
  streak          integer NOT NULL DEFAULT 0,
  best_streak     integer NOT NULL DEFAULT 0,
  last_active_day varchar(10),
  freeze_used_on  varchar(10),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

COMMIT;
