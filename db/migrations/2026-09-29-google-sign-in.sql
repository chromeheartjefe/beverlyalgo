-- Google sign-in (2026-09-29)
--
-- Run ONCE in the Neon SQL editor, on the production branch, BEFORE running
-- `npm run dev` or deploying the code that uses it (.env.local points at the
-- same database, so even local testing needs this first).
--
-- Additive only. Existing rows are not changed: every current account keeps
-- its password, and making the column nullable only allows NEW accounts that
-- sign in with Google and never set a password. Safe to re-run.

BEGIN;

-- Accounts created with Google have no password until they set one
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Which Google identity belongs to which account. The Google user id (sub)
-- never changes, even if the person changes their Gmail address or their
-- EntrixAlgo email later.
CREATE TABLE IF NOT EXISTS oauth_accounts (
  id                  text PRIMARY KEY,
  user_id             text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider            varchar(32) NOT NULL,
  provider_account_id text NOT NULL,
  email               varchar(255),
  created_at          timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS oauth_accounts_provider_account_idx ON oauth_accounts (provider, provider_account_id);
CREATE INDEX IF NOT EXISTS oauth_accounts_user_id_idx ON oauth_accounts (user_id);

COMMIT;

-- If the admin console's read-only role should see Google links too:
-- GRANT SELECT ON oauth_accounts TO entrix_admin_read;
