-- Paper Trading tab: practice accounts, closed practice trades, missions (2026-10-03)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses it (.env.local points at the
-- same database, so even local testing needs this first). Needs the earlier
-- 2026-10-01-academy.sql to have been run (missions pay Academy XP).
--
-- Additive only: three new tables. No existing table or row changes. Safe to
-- re-run.

BEGIN;

-- One row per player: the practice account they are on now, plus their totals.
-- All money is virtual.
CREATE TABLE IF NOT EXISTS sim_accounts (
  user_id       text PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  level         integer NOT NULL DEFAULT 1,
  start_balance double precision NOT NULL,
  balance       double precision NOT NULL,
  peak          double precision NOT NULL,
  day_key       varchar(10),
  day_start     double precision NOT NULL,
  trades        integer NOT NULL DEFAULT 0,
  status        varchar(16) NOT NULL DEFAULT 'active',
  fail_reason   varchar(16),
  best_level    integer NOT NULL DEFAULT 1,
  passes        integer NOT NULL DEFAULT 0,
  fails         integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Closed practice trades (the newest 200 per player are kept by the app)
CREATE TABLE IF NOT EXISTS sim_trades (
  id            text PRIMARY KEY,
  user_id       text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level         integer NOT NULL,
  side          varchar(8) NOT NULL,
  entry         double precision NOT NULL,
  exit          double precision NOT NULL,
  qty           double precision NOT NULL,
  stop          double precision NOT NULL,
  target        double precision,
  pnl           double precision NOT NULL,
  r             double precision NOT NULL,
  risk_pct      double precision NOT NULL,
  reason        varchar(12) NOT NULL,
  spike         boolean NOT NULL DEFAULT false,
  locked_in     boolean NOT NULL DEFAULT false,
  balance_after double precision NOT NULL,
  closed_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS sim_trades_user_closed_idx ON sim_trades (user_id, closed_at);

-- Missions a player has completed; each pays its Academy XP once
CREATE TABLE IF NOT EXISTS sim_missions (
  id           text PRIMARY KEY,
  user_id      text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id   varchar(48) NOT NULL,
  xp           integer NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sim_missions_user_mission_idx ON sim_missions (user_id, mission_id);

COMMIT;
