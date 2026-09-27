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

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  denyUrls: [INJECTED_SOURCE],
  ignoreErrors: [/Java object is gone/],
  beforeSend(event) {
    // Drop the event when the error was thrown inside an injected script.
    // Checked here too because denyUrls can miss frames once Sentry has
    // rewritten their filenames, and a caller frame may be Sentry's own
    // listener wrapper inside our bundle (so "every frame" checks miss it).
    const thrownIn = (event.exception?.values ?? []).map((v) => {
      const frames = v.stacktrace?.frames ?? []
      return frames[frames.length - 1]?.filename ?? "" // last frame = where it was thrown
    })
    if (thrownIn.length > 0 && thrownIn.every((f) => INJECTED_SOURCE.test(f))) {
      return null
    }

    // Lets us confirm (or rule out) translation as the cause of React DOM errors
    event.tags = {
      ...event.tags,
      page_translated: pageTranslated() ? "yes" : "no",
      page_lang: document.documentElement.lang || "unknown",
    }
    return event
  },
})

installDomGuard()

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart
