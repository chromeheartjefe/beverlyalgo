import * as Sentry from "@sentry/nextjs"

import { installDomGuard, pageTranslated } from "@/lib/dom-guard"

// Scripts injected into our pages by browser extensions (crypto wallets use
// inpage.js / contentscript.js) or by in-app browsers (Facebook/Instagram's
// Android WebView adds app://navigation_performance_logger_android). Their
// errors aren't ours and can't be fixed from here, e.g. "func sseError not
// found" or "Error invoking postMessage: Java object is gone".
// Our own bundle is always app:///… (three slashes); app://<name> is injected.
const INJECTED_SOURCE =
  /^(chrome|moz|safari(-web)?|ms-browser)-extension:|webkit-masked-url:|^app:\/\/(?!\/)|\binpage\.js|content[-_]?script|\/extensions?\//i

// Frames of the browser's own functions (JSON.parse, Array.map) carry no file
const isBuiltIn = (filename: string | undefined) => !filename || filename === "undefined" || filename === "<anonymous>"

// Where an error was thrown: the innermost frame that has a file (the last
// frame is the innermost). Built-in frames are skipped, so our own code
// failing inside JSON.parse is judged by our file and not by the built-in,
// which used to look like "no file, so the browser injected it".
function thrownFrom(frames: { filename?: string }[]): string {
  for (let i = frames.length - 1; i >= 0; i--) {
    const filename = frames[i].filename
    if (!isBuiltIn(filename)) return filename as string
  }
  return ""
}

// Code the browser puts into the page itself has no file of its own: its stack
// frames carry the page's address (app:///dashboard, never a /_next/ file).
// Chrome and the Google app on iPhone add their page translation this way,
// and it fails on our pages with "Maximum call stack size exceeded" or
// "Error: La" (2026-10-03: French, German and Thai visitors; no page
// crashed). Everything of ours lives in a /_next/ file.
function thrownInPageScript(filename: string): boolean {
  if (!filename || filename.includes("/_next/")) return false
  const path = filename.startsWith("app://")
    ? filename.slice("app://".length)
    : filename.startsWith(location.origin)
      ? filename.slice(location.origin.length)
      : null // another site's script: not this case
  return path !== null && !/\.[a-z0-9]+(\?|$)/i.test(path)
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  // Never from `npm run dev`: .env.local holds the production DSN, so errors
  // made while building a feature used to land among the visitors' errors.
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === "production",
  denyUrls: [INJECTED_SOURCE],
  ignoreErrors: [/Java object is gone/],
  beforeSend(event) {
    // Drop the event when the error was thrown inside an injected script.
    // Checked here too because denyUrls can miss frames once Sentry has
    // rewritten their filenames, and a caller frame may be Sentry's own
    // listener wrapper inside our bundle (so "every frame" checks miss it).
    const thrownIn = (event.exception?.values ?? []).map((v) => thrownFrom(v.stacktrace?.frames ?? []))
    if (thrownIn.length > 0 && thrownIn.every((f) => INJECTED_SOURCE.test(f))) {
      return null
    }

    // Lets us confirm (or rule out) translation as the cause of React DOM errors
    event.tags = {
      ...event.tags,
      page_translated: pageTranslated() ? "yes" : "no",
      page_lang: document.documentElement.lang || "unknown",
    }

    // Errors thrown by a script the browser injected into the page are kept
    // (they show how many visitors translate the site) but as one warning
    // issue, instead of a new unhandled error for every different message.
    // Only when every error in the event names a page-address file: one with
    // no frames, or with built-in frames only, could be ours.
    if (thrownIn.length > 0 && thrownIn.every(thrownInPageScript)) {
      event.fingerprint = ["script-injected-into-page"]
      event.level = "warning"
      event.tags.injected_page_script = "yes"
    }
    return event
  },
})

installDomGuard()

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
