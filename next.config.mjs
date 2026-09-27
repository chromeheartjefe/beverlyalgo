import { withSentryConfig } from "@sentry/nextjs";

// No nonce-based strict CSP here — Next.js needs 'unsafe-inline' for its own hydration
// scripts without a per-request nonce wired through middleware (which would force every
// page to render dynamically). 'unsafe-eval' is only needed by the dev server (React
// Refresh); production builds and every client library we ship run without eval.
// This still meaningfully restricts framing, plugins, unknown script/asset origins,
// and form-hijacking.
const isDev = process.env.NODE_ENV === "development";

// Google Analytics 4 (app/layout.tsx), per Google's documented CSP allowlist.
// Without these the browser blocks the GA script and its beacons.
const GA_SCRIPT  = "https://www.googletagmanager.com";
const GA_CONNECT = "https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com";
const GA_IMG     = "https://*.google-analytics.com https://www.googletagmanager.com";

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} ${GA_SCRIPT}`,
  "style-src 'self' 'unsafe-inline'",
  // blob: is required for client-side image previews/resizing (URL.createObjectURL),
  // e.g. the chart-analysis upload flow.
  `img-src 'self' data: blob: ${GA_IMG}`,
  "font-src 'self' data:",
  `connect-src 'self' ${GA_CONNECT}`,
  "object-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS only makes sense once the app is always served over HTTPS (true on Vercel).
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Content-Security-Policy", value: csp },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Rewrites `import { X } from "lucide-react"` (and other icon/date barrels) to
  // per-icon deep imports at build time, so a single icon import doesn't pull in
  // the whole package's module graph.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  // Source-map upload needs org/project/authToken (SENTRY_ORG, SENTRY_PROJECT,
  // SENTRY_AUTH_TOKEN) — add those env vars later to get readable stack traces
  // in the Sentry UI. Error capture itself works without them.
  widenClientFileUpload: true,
  webpack: { treeshake: { removeDebugLogging: true } },
  // Routes client-side events through our own origin instead of talking to
  // *.sentry.io directly — keeps connect-src at 'self' in the CSP above and
  // avoids ad-blockers dropping the requests.
  tunnelRoute: "/monitoring",
});