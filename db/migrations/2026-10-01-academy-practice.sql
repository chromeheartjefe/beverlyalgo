-- Entrix Academy Practice tab: spaced review of missed questions (2026-10-01)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses it (.env.local points at the
-- same database, so even local testing needs this first). Needs the earlier
-- 2026-10-01-academy.sql to have been run.
--
-- Additive only: one new table and two new columns with defaults. No
-- existing rows change. Safe to re-run.

BEGIN;

-- One row per question a learner missed. box 1..5; due_day is the learner's
-- local "YYYY-MM-DD" when it comes back for review.
CREATE TABLE IF NOT EXISTS academy_reviews (
  id          text PRIMARY KEY,
  user_id     text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id   varchar(96) NOT NULL,
  question_id varchar(96) NOT NULL,
  box         integer NOT NULL DEFAULT 1,
  due_day     varchar(10) NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS academy_reviews_user_question_idx ON academy_reviews (user_id, lesson_id, question_id);
CREATE INDEX IF NOT EXISTS academy_reviews_user_due_idx ON academy_reviews (user_id, due_day);

-- Daily cap on Practice XP
ALTER TABLE academy_stats ADD COLUMN IF NOT EXISTS practice_day varchar(10);
ALTER TABLE academy_stats ADD COLUMN IF NOT EXISTS practice_xp integer NOT NULL DEFAULT 0;

COMMIT;
