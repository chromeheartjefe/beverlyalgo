import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // No-op when DSN is unset (e.g. local dev without a Sentry project).
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
})
