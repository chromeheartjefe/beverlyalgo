/** Issue date as shown on certificates, e.g. "October 1, 2026" (UTC, so every viewer sees the same date) */
export function formatIssued(issuedAt: Date | string): string {
  return new Date(issuedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
}
