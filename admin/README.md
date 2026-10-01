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
   Invoices, Prices, Products, Checkout Sessions. Everything else: None.
   (Checkout Sessions was added for the Checkout funnel page; an older key
   can be edited to add it.)
4. **Env**: copy `admin/.env.local.example` to `admin/.env.local` and fill it in.
   Build the two database URLs from the site's `DATABASE_URL` by swapping the
   `user:password` part.

## Run

From the repo root:

```
npm run admin
```

Open http://127.0.0.1:3100

## Run in the background (tray icon)

`admin/tray/` starts the console with no terminal window and an icon in the
taskbar notification area (bottom right):

- `start-admin.bat`: start it now. Double-click the tray icon to open
  http://127.0.0.1:3100; right-click for Open, Restart server (rebuild),
  Dev mode, Show server log (`admin/data/server.log`) and **Stop admin and
  exit** (kills the whole server process tree).
- `install-autostart.bat`: adds a shortcut to your Windows Startup folder so it
  starts hidden every time you sign in (and starts it right away).
- `remove-autostart.bat`: removes that shortcut.

**Fast mode (default):** the tray builds an optimised production version
(`npm run admin:build`, about a minute, in the background) and serves it
(`npm run admin:start`). Much faster than the dev server. Restart rebuilds, so
code changes are picked up. If the build fails it falls back to dev mode.
**Dev mode** (tray toggle, remembered): `npm run admin` with live reload, for
when the admin code is being edited. Starting it twice just opens the console.

Stripe data is cached for 2 minutes; the Refresh button on Overview and
Revenue fetches it fresh.

## Pages

Grouped in the sidebar: Command, Growth, Money, Operations.

| Page | What |
|---|---|
| Overview | Command center: MRR / paying / signups / active hero KPIs with trends and week-over-week change, health strip (free to Pro, week-one activation, stickiness, email verified, AI budget), automatic Signals (rule-based, no AI), lifecycle funnel, active + signups chart, feature adoption, net revenue per month, newest accounts |
| AI analyst | AI briefing on the live aggregates (headline, five health scores, ranked actions with "Save as idea", risks), Ask-your-data questions, briefing history. Needs `OPENAI_API_KEY` |
| Ideas | Kanban board (Inbox, Exploring, Planned, Building, Shipped, Parked), impact/effort priority, AI review per idea (score, verdict, pros/cons, first steps, success metric), "Suggest 3 ideas". Stored in `admin/data/ideas.json` |
| Users | Search and filter (plan, verified, at risk, indicator pending), sort by spend/activity |
| User detail | Live Stripe status and payments, AI spend per feature, last analyses, activity timeline, trading stats, indicator, sign-ins, debug chat viewer, safe actions |
| Engagement | Active today/7d/30d, stickiness, activation, time to first value, weekly retention cohorts, churn watch (paying accounts by last activity), power users, feature adoption, free-analysis conversion, Academy |
| Checkout funnel | Stripe payment page opens vs purchases, conversion, Monthly vs Lifetime, people who opened checkout but didn't buy, recent sessions |
| Revenue | MRR, ARR run-rate, net revenue 30d vs previous, 12-month revenue and revenue per customer, subscriptions, renewals, refunds and disputes, payments |
| AI & unit costs | Unit economics (AI cost per paying and per free account vs revenue per paying account), spend per day/model, cost per analysis/message/scan, top spenders, rejection reasons |
| Indicator queue | Pending TradingView requests with "Mark invited", update email |
| System health | Twelve Data credits and backoff, caches, Stripe webhook feed, failed sign-in throttles, table sizes, links |
| Audit log | Every action and chat view from this console |

## AI features and local data

- The AI analyst and idea reviews send only aggregate numbers (counts, rates,
  revenue totals) to OpenAI, never emails, names or ids (`aiSnapshot` in
  `lib/business.ts`).
- Calls use `ADMIN_AI_MODEL` (default gpt-6-luna), cost well under a cent each,
  and are logged in `admin/data/ai-log.json`. They are not in the site's
  `ai_usage` table, so they don't count toward the site's AI budget.
- Ideas, briefings, answers and the AI log live in `admin/data/` (git-ignored,
  this machine only). Back the folder up if the ideas matter.

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
