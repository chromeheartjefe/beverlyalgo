// Where the auth pages send someone once they are signed in.

const DEFAULT = "/dashboard"

// Only same-site paths. A full URL (https://evil.site) or protocol-relative
// one (//evil.site, /\evil.site) would turn the sign-in page into a phishing
// redirect after a successful login.
export function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return DEFAULT
  return raw
}

/** An auth page link that keeps the destination, so switching between sign-in and sign-up doesn't lose it */
export function withCallback(href: string, callbackUrl: string): string {
  return callbackUrl === DEFAULT ? href : `${href}?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

/** Came from a plan button on the pricing section */
export const isPlanCallback = (callbackUrl: string) => callbackUrl.endsWith("#pricing")
