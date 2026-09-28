-- Admin console database logins. Run ONCE in the Neon SQL editor
-- (production branch), AFTER db/migrations/2026-09-28-admin-tracking.sql.
--
-- 1) Replace both passwords with long random strings (Neon rejects weak
--    ones). e.g. in a terminal: node -e "console.log(require('crypto').randomBytes(24).toString('base64url'))"
--    Alternative: create the two roles in Neon Console > Roles, then run
--    only the GRANT parts below.
-- 2) Build the two connection strings from your DATABASE_URL, swapping the
--    user:password part, and put them in admin/.env.local.

-- ─── Read-only: every page of the console ───────────────────────────────────
CREATE ROLE entrix_admin_read WITH LOGIN PASSWORD 'REPLACE_WITH_LONG_RANDOM_PASSWORD_1';

DO $$ BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO entrix_admin_read', current_database());
END $$;
GRANT USAGE ON SCHEMA public TO entrix_admin_read;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO entrix_admin_read;
-- Tables created later (by the owner role running this) are readable too
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO entrix_admin_read;

-- ─── Write: only what the safe actions need ─────────────────────────────────
CREATE ROLE entrix_admin_write WITH LOGIN PASSWORD 'REPLACE_WITH_LONG_RANDOM_PASSWORD_2';

DO $$ BEGIN
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO entrix_admin_write', current_database());
END $$;
GRANT USAGE ON SCHEMA public TO entrix_admin_write;

-- Mark invited + force sign-out: two columns only, nothing else on users
GRANT SELECT ON users TO entrix_admin_write;
GRANT UPDATE (indicator_invited_at, session_version) ON users TO entrix_admin_write;

-- Resend verification: replace the user's email-verify token
GRANT SELECT, INSERT, DELETE ON auth_tokens TO entrix_admin_write;

-- Audit trail: append only (no UPDATE/DELETE, so entries can't be edited)
GRANT SELECT, INSERT ON admin_audit_log TO entrix_admin_write;

-- Check: \dp users   (or Neon Console > Roles)
