-- Admin console tracking (2026-09-28)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses these columns (.env.local
-- points at the same database, so even local testing needs this first).
--
-- Additive only: new nullable columns or columns with a default, new tables,
-- new indexes. No existing row is changed. Safe to re-run (IF NOT EXISTS).

BEGIN;

-- users: activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen_at  timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count   integer NOT NULL DEFAULT 0;

-- ai_usage: who, which model, what it cost
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS user_id          text REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS model            varchar(64);
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS reasoning_effort varchar(16);
ALTER TABLE ai_usage ADD COLUMN IF NOT EXISTS cost_usd         double precision;
CREATE INDEX IF NOT EXISTS ai_usage_created_at_idx         ON ai_usage (created_at);
CREATE INDEX IF NOT EXISTS ai_usage_user_id_created_at_idx ON ai_usage (user_id, created_at);

-- chart_analyses: full result for the admin view (never the screenshot)
ALTER TABLE chart_analyses ADD COLUMN IF NOT EXISTS variant           varchar(32);
ALTER TABLE chart_analyses ADD COLUMN IF NOT EXISTS model             varchar(64);
ALTER TABLE chart_analyses ADD COLUMN IF NOT EXISTS result            text;
ALTER TABLE chart_analyses ADD COLUMN IF NOT EXISTS prompt_tokens     integer;
ALTER TABLE chart_analyses ADD COLUMN IF NOT EXISTS completion_tokens integer;
ALTER TABLE chart_analyses ADD COLUMN IF NOT EXISTS cost_usd          double precision;

-- user_events: activity timeline
CREATE TABLE IF NOT EXISTS user_events (
  id         text PRIMARY KEY,
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       varchar(48) NOT NULL,
  meta       text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS user_events_user_id_created_at_idx ON user_events (user_id, created_at);
CREATE INDEX IF NOT EXISTS user_events_type_created_at_idx    ON user_events (type, created_at);

-- admin_audit_log: everything done from the admin console
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id             text PRIMARY KEY,
  action         varchar(48) NOT NULL,
  target_user_id text REFERENCES users(id) ON DELETE SET NULL,
  details        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log (created_at);

COMMIT;
