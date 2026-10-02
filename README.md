# EntrixAlgo

The website and dashboard at [entrixalgo.com](https://entrixalgo.com): AI chart analysis, an AI trading assistant, an AI screener, a trade journal and calendar, a risk calculator, and the Entrix Academy course with its glossary.

## Stack

Next.js 15 (App Router) and React 19, TypeScript, Tailwind CSS v4, Drizzle ORM on Neon Postgres, NextAuth v5 (email and Google sign-in), Stripe Payment Links with a webhook, OpenAI, Resend for email, Sentry. Hosted on Vercel.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

The app needs `.env.local` (database, auth, Stripe, OpenAI, Resend and market-data keys). It is not in the repository.

**`.env.local` points at the live database.** Anything you do locally (sign up, log a trade, change a password) happens to real data.

## Checks

```bash
npx tsc --noEmit -p .          # types, site
npx tsc --noEmit -p admin      # types, admin console
npm run lint                   # ESLint (also runs as part of the build)
npx tsx --tsconfig tsconfig.json .academy/check-lessons.ts    # Academy lesson validator
npx tsx --tsconfig tsconfig.json .academy/check-glossary.ts   # Glossary validator
```

## Database changes

Schema changes are hand-written SQL files in `db/migrations/`, kept in step with `db/schema.ts`. Run a new file in the Neon console **before** deploying the code that needs it. There are no push, generate or seed scripts, on purpose.

`npm run db:studio` opens a browser to look at the data.

## Layout

| Path | What lives there |
|---|---|
| `app/` | Pages and API routes (`app/dashboard`, `app/api`, sign-in pages, legal pages) |
| `components/` | UI: `dashboard/`, landing `sections/` and `ui/`, `support/` chat |
| `lib/` | Server and shared logic: AI prompts, billing, email, rate limits, Academy and Glossary engines |
| `content/academy/` | The lessons |
| `config/` | Site settings, changelog, testimonials, support chat |
| `db/` | Schema, database client, migrations |
| `admin/` | Local-only admin console (`npm run admin`, see `admin/README.md`). Never deployed |

## Releasing

Work goes on a `release/<date>` branch, is checked on the Vercel preview, then fast-forwarded into `main`, which deploys to production. Add an entry to `config/changelog.ts` for user-visible changes.

## License

The marketing page started from the Launch UI template (MIT, see `LICENSE.md`).
