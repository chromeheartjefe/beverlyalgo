"use client"

// Most first-run errors are setup: a missing env var, the migration or the
// roles SQL not run yet. Show the message so it can be fixed from here.
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
      <pre className="whitespace-pre-wrap rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error.message}</pre>
      <ul className="list-disc space-y-1 pl-5 text-sm text-gray-400">
        <li>Is <code>admin/.env.local</code> filled in? (see <code>admin/README.md</code>)</li>
        <li>Was <code>db/migrations/2026-09-28-admin-tracking.sql</code> run in Neon?</li>
        <li>Was <code>admin/sql/roles.sql</code> run, and do the URLs use those roles?</li>
      </ul>
      <button onClick={reset} className="rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-400">
        Try again
      </button>
    </div>
  )
}
