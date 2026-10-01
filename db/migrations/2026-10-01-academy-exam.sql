-- Entrix Academy final exam and certificates (2026-10-01)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses it (.env.local points at the
-- same database, so even local testing needs this first). Needs the earlier
-- 2026-10-01-academy.sql and 2026-10-01-academy-practice.sql.
--
-- Additive only: two new tables. No existing rows change. Safe to re-run.

BEGIN;

-- Each final exam attempt: the question keys issued, and the graded result.
CREATE TABLE IF NOT EXISTS academy_exam_attempts (
  id           text PRIMARY KEY,
  user_id      text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  questions    text NOT NULL,
  correct      integer,
  total        integer NOT NULL,
  passed       boolean,
  created_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz
);
CREATE INDEX IF NOT EXISTS academy_exam_attempts_user_created_idx ON academy_exam_attempts (user_id, created_at);

-- One certificate per learner. id is the short public code in the share link.
CREATE TABLE IF NOT EXISTS academy_certificates (
  id        varchar(16) PRIMARY KEY,
  user_id   text NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name      varchar(255) NOT NULL,
  correct   integer NOT NULL,
  total     integer NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now()
);

COMMIT;
