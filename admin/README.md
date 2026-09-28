# EntrixAlgo Admin Console (local only)

A separate Next.js app that runs **only on your computer** and reads the
**live production database**. It is never deployed (`.vercelignore`), has
no public URL, and only answers requests addressed to `127.0.0.1:3100` /
`localhost:3100`.

## One-time setup

1. **Database migration** (if not done yet): run
   `db/migrations/2026-09-28-admin-tracking.sql` in the Neon SQL editor.
2. **Database logins**: edit the two passwords in `admin/sql/roles.sql`, run
   it in the Neon SQL editor. This creates:
   - `entrix_admin_read`: SELECT only, used by every page;
   - `entrix_admin_write`: can only set `indicator_invited_at` /
     `session_version`, replace email-verify tokens and append to the audit log.
3. **Stripe key**: Stripe Dashboard → Developers → API keys → *Create
   restricted key*. Give **Read** to: Customers, Charges, Subscriptions,
   Invoices, Prices, Products. Everything else: None.
4. **Env**: copy `admin/.env.local.example` to `admin/.env.local` and fill it in.
   Build the two database URLs from the site's `DATABASE_URL` by swapping the
   `user:password` part.

## Run

From the repo root:

```
npm run admin
```

Open http://127.0.0.1:3100

## Pages

| Page | What |
|---|---|
| Overview | Users, active users, paying, MRR, conversion, verification, AI spend vs budget; charts for signups, active users, AI cost, analyses, bot messages |
| Users | Search and filter (plan, verified, at risk, indicator pending), sort by spend/activity |
| User detail | Live Stripe status and payments, AI spend per feature, today's limits, last 10 analyses with full result, activity timeline, trading stats, indicator, sign-ins, debug chat viewer, safe actions |
| Revenue | MRR, live/canceling/past-due subscriptions, renewals in 7 days, net revenue per month, refunds and disputes, webhook feed |
| AI & costs | Spend per day and per model/thinking level, cost per analysis/message/scan, top spenders, screenshot rejection reasons |
| Indicator queue | Pending TradingView requests, oldest first, with "Mark invited" |
| System health | Twelve Data credits and backoff, caches, failed sign-in throttles, table sizes, links |
| Audit log | Every action and chat view from this console |

## Safe actions (confirmed twice, audit-logged)

- **Mark invited**: after adding the user on TradingView.
- **Resend verification**: new 24h link, same as the site's own resend.
- **Force sign-out**: ends all of the user's sessions (password unchanged).
- **View bot chat**: debug only, latest 40 messages, needs a reason, logged.

## Data notes

- Per-user AI spend, "last seen", sign-ins, the activity timeline and full
  analysis results are recorded from 2026-09-28 on. Older AI rows have no
  user or cost (costs shown as estimates at the gpt-5.6-luna prices they ran on).
- Days are UTC.
