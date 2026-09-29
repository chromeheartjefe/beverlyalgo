"use client"

import { signOut } from "next-auth/react"
import { createRoot } from "react-dom/client"

import { COVER_CLASS, LoadingMark } from "@/components/dashboard/session-loading-screen"

// Signing out ends the session first and only then navigates to the landing
// page (not NextAuth's own redirect, which once sent people to localhost).
// Between the two, the dashboard is still on screen with an empty session,
// so it flashed a "User / Free Trader" placeholder account.
//
// The moment sign-out starts, the same frosted loading cover as the
// dashboard's goes up (blurred current screen, logo, ring, "Signing out…")
// and stays until the landing page replaces it. It is mounted as its own
// small React root outside the app, so the dashboard re-rendering
// underneath can't remove it.

// Read by the dashboard's SessionGuard: while signing out, the session ending
// is expected and must not send the browser to the sign-in page instead.
let signingOut = false
export const isSigningOut = () => signingOut

export function signOutToLanding(): void {
  signingOut = true
  const host = document.createElement("div")
  host.setAttribute("role", "status")
  host.setAttribute("aria-live", "polite")
  host.className = COVER_CLASS
  host.style.zIndex = "2147483647"
  host.style.opacity = "0"
  host.style.transition = "opacity 180ms ease-out"
  document.body.appendChild(host)

  const root = createRoot(host)
  root.render(
    <>
      <span className="sr-only">Signing out</span>
      <LoadingMark label="Signing out…" />
    </>,
  )
  requestAnimationFrame(() => {
    host.style.opacity = "1"
  })

  signOut({ redirect: false })
    .then(() => window.location.assign("/"))
    .catch(() => {
      // Nothing changed; give the dashboard back
      signingOut = false
      root.unmount()
      host.remove()
    })
}
