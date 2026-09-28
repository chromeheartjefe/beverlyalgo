// Accounts that get admin-only tools (currently the Chart Analysis logic
// switch). Always pass the row read from the DB on the server, never values
// sent by the client. Emails are stored lowercase.
const ADMIN_EMAILS = new Set(["admin@beverlyalgo.com"])

/**
 * The email must also be VERIFIED: changing your email in Settings takes
 * effect before the new address is verified, so an unverified match would
 * let any user rename themselves to an unclaimed admin address.
 */
export function isAdmin(user: { email: string | null | undefined; emailVerified: Date | null | undefined } | null | undefined): boolean {
  if (!user?.email || !user.emailVerified) return false
  return ADMIN_EMAILS.has(user.email.trim().toLowerCase())
}
