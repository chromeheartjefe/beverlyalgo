import { db } from "@/db"
import { userEvents } from "@/db/schema"

// Account activity for the admin console's user timeline (user_events).
// Only for actions not already recorded in their own table: analyses,
// trades, chat messages and goals are read from those tables directly.
export type UserEventType =
  | "login"                 // meta.provider "google" for Google sign-ins
  | "login_failed"          // right email, wrong password
  | "google_signup"         // new account created with Google
  | "google_linked"         // Google attached to an existing account, meta.passwordCleared
  | "analysis_rejected"     // screenshot refused (not a chart, blurry, ...), meta.reason
  | "screener_scan"         // meta.fresh: true = ran a real (paid) scan, false = got the cached result
  | "chat_cleared"
  | "password_changed"
  | "password_reset"
  | "email_changed"         // meta.from / meta.to
  | "email_verified"
  | "indicator_requested"   // meta.username

/**
 * Best-effort: never throws, so a logging problem can't break the action
 * being logged. Awaited (a single small insert) rather than fire-and-forget,
 * because serverless functions can drop unawaited work after the response.
 */
export async function logEvent(userId: string, type: UserEventType, meta?: Record<string, unknown>): Promise<void> {
  try {
    await db.insert(userEvents).values({ userId, type, meta: meta ? JSON.stringify(meta) : null })
  } catch (err) {
    console.error("[events] failed to log", type, err)
  }
}
