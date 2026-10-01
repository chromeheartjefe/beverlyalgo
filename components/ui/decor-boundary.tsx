"use client"

import * as Sentry from "@sentry/nextjs"
import { Component, type ReactNode } from "react"

// Safety net for purely decorative parts (banner, shader buttons, animated
// backgrounds). The site has no error.tsx, so an error in one of them used to
// replace the whole page with the global error screen. Now the decoration is
// swapped for `fallback` (nothing by default) and the error is still reported
// to Sentry, as a warning tagged with the part's name.
export class DecorBoundary extends Component<{ name: string; fallback?: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    Sentry.captureException(error, { level: "warning", tags: { decor_boundary: this.props.name } })
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children
  }
}
