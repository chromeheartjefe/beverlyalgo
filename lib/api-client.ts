// Browser-side request helper for the AI tabs (Chart Analysis, AI Screener,
// AI Trading Bot). Every failure becomes an ApiError whose message is safe to
// show a user. Raw failures never reach the UI: a dropped connection
// ("Failed to fetch"), a host error page returned as HTML on a timeout or
// crash ("Unexpected token '<' ... is not valid JSON"), or an empty body.

export const MSG_BUSY    = "Our servers are busy right now. Please try again in a moment."
export const MSG_OFFLINE = "We couldn't reach our servers. Check your internet connection and try again."
export const MSG_SESSION = "Your session has expired. Please sign in again."

export class ApiError extends Error {
  // Machine-readable reason some routes add next to the message, e.g.
  // "free_used" from /api/analyze, so a page can react (show a card).
  constructor(message: string, readonly code?: string) {
    super(message)
  }
}

/** Our API routes always answer errors as {"error": "..."} written for users. */
function messageFor(status: number, body: unknown): string {
  if (status === 401) return MSG_SESSION
  if (status === 413) return "That file is too large. Please upload a smaller image."

  const own = body && typeof body === "object" && "error" in body ? (body as { error: unknown }).error : null
  // Length cap is a last guard in case something unexpected ever lands here
  if (typeof own === "string" && own.trim() && own.length <= 300) return own.trim()

  if (status === 429) return "Too many requests. Please wait a moment and try again."
  return MSG_BUSY
}

export async function requestJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(input, init)
  } catch {
    throw new ApiError(MSG_OFFLINE)
  }

  // Not JSON means it didn't come from our route (host error page, proxy, crash)
  const body: unknown = await res.json().catch(() => null)

  if (!res.ok) {
    const code = body && typeof body === "object" && "code" in body ? (body as { code: unknown }).code : undefined
    throw new ApiError(messageFor(res.status, body), typeof code === "string" ? code : undefined)
  }
  if (body === null) throw new ApiError(MSG_BUSY)
  return body as T
}

/** The message to show for anything caught around requestJson. */
export function userMessage(err: unknown, fallback: string = MSG_BUSY): string {
  return err instanceof ApiError ? err.message : fallback
}
