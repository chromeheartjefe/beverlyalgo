import crypto from "crypto"

// Email-verification and password-reset tokens. Only a SHA-256 hash is stored
// in auth_tokens; the raw token exists only in the emailed link. A leaked
// database then can't be used to reset anyone's password. (No salt needed:
// the token is 256 random bits, not a guessable password.)

export function hashAuthToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/** A fresh token: `token` goes in the email link, `hash` goes in the database. */
export function newAuthToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString("hex")
  return { token, hash: hashAuthToken(token) }
}

/**
 * Values to match auth_tokens.token against for an incoming link. Links sent
 * before hashing was introduced stored the raw token, and they stay valid
 * until they expire (24h at most), so both forms are accepted for now.
 */
export function authTokenLookup(token: string): string[] {
  return [hashAuthToken(token), token]
}
