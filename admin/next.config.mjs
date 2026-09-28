import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))

// Local-only admin console. Runs from the repo root with `npm run admin`
// (next dev admin -p 3100 -H 127.0.0.1) and shares the root node_modules,
// db/schema.ts and a few pure helpers (lib/email.ts, lib/auth-tokens.ts),
// so it can never drift from the site's database schema. Never deployed:
// excluded in .vercelignore and the root tsconfig.
/** @type {import("next").NextConfig} */
const nextConfig = {
  // Compile the shared files that live outside this folder (../db, ../lib)
  experimental: { externalDir: true },
  outputFileTracingRoot: path.join(here, ".."),
  poweredByHeader: false,
  eslint: { ignoreDuringBuilds: true },
}

export default nextConfig
