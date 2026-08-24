/**
 * Reads a required env var and fails loudly with a readable message instead
 * of the opaque downstream error you'd get from passing `undefined` into a
 * DB/Stripe client (e.g. Neon's "Error: No database host or connection
 * string was set"). Call this at module load time in the few places that
 * cannot function at all without the value.
 */
export function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in your deployment environment ` +
      `(or .env.local for local dev) before starting the app.`
    )
  }
  return value
}
