// When this browser last caused a verification email to be sent (sign-up or
// resend). The verify banner uses it to hold the Resend button for a minute,
// because people pressed Resend seconds after signing up, before the first
// email had a chance to arrive. Convenience only: storage failures are ignored.

const KEY = "verifyEmailSentAt"

/** Fired by the "Wrong email?" link so an already open Settings page focuses the email field */
export const FOCUS_EMAIL_EVENT = "entrix:focus-email"
const RESEND_COOLDOWN_S = 60

export function markVerificationSent(): void {
  try {
    localStorage.setItem(KEY, String(Date.now()))
  } catch {
    // ignore
  }
}

/** Seconds left before Resend should be offered again (0 when it can be) */
export function resendCooldownLeft(): number {
  try {
    const at = Number(localStorage.getItem(KEY))
    if (!at) return 0
    const left = RESEND_COOLDOWN_S - Math.floor((Date.now() - at) / 1000)
    return left > 0 ? Math.min(left, RESEND_COOLDOWN_S) : 0
  } catch {
    return 0
  }
}
