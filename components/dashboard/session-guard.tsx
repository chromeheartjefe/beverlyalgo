"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

import { isSigningOut } from "@/lib/sign-out"

// The middleware only checks that the session cookie is genuine (no database
// read), so a session ended elsewhere (password changed or reset on another
// device) still opens a dashboard page. The session check the page makes
// does read the database, comes back empty for such a session (and clears
// its cookie), and this then sends the browser to sign-in.
//
// "unauthenticated" alone isn't trusted: next-auth also reports it when the
// session request merely failed (offline, a network blip). So the server is
// asked once more, and only a clear "no session" answer redirects.
export function SessionGuard() {
  const { status } = useSession()

  useEffect(() => {
    if (status !== "unauthenticated" || isSigningOut()) return
    let cancelled = false
    fetch("/api/auth/session", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : undefined))
      .then((session) => {
        if (cancelled || session === undefined || session?.user || isSigningOut()) return
        window.location.assign(`/sign-in?callbackUrl=${encodeURIComponent(window.location.pathname)}`)
      })
      .catch(() => {}) // no answer is not a "signed out" answer
    return () => {
      cancelled = true
    }
  }, [status])

  return null
}
