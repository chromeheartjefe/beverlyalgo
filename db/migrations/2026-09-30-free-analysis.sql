-- One free Chart Analysis for Free accounts (2026-09-30)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses it (.env.local points at the
-- same database, so even local testing needs this first).
--
-- Additive only: one new table, no existing rows or columns change. Pro
-- accounts never touch it. Safe to re-run.

BEGIN;

-- One row per free analysis handed out. email_key is the normalized inbox
-- (Gmail dots and +tags removed), unique, so one inbox gets one free analysis
-- however many accounts it makes. user_id is kept NULL on account deletion
-- instead of deleting the row, so deleting and re-creating an account
-- doesn't earn a second one. ip backs the per-network limit.
CREATE TABLE IF NOT EXISTS free_analysis_claims (
  id         text PRIMARY KEY,
  user_id    text UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  email_key  varchar(255) NOT NULL UNIQUE,
  ip         varchar(64),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS free_analysis_claims_ip_created_at_idx ON free_analysis_claims (ip, created_at);

COMMIT;
