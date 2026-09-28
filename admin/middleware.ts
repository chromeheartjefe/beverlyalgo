import { type NextRequest, NextResponse } from "next/server"

// The console has no login of its own: it is only reachable from this
// machine (the dev server binds 127.0.0.1). This also rejects any request
// whose Host header isn't the local address, which blocks DNS-rebinding
// tricks where a website you visit points its own domain at 127.0.0.1 to
// read the console from your browser.
const ALLOWED_HOSTS = new Set(["127.0.0.1:3100", "localhost:3100"])

export function middleware(req: NextRequest) {
  if (!ALLOWED_HOSTS.has(req.headers.get("host") ?? "")) {
    return new NextResponse("Forbidden", { status: 403 })
  }
  const res = NextResponse.next()
  res.headers.set("X-Frame-Options", "DENY")
  res.headers.set("Referrer-Policy", "no-referrer")
  res.headers.set("X-Robots-Tag", "noindex, nofollow")
  return res
}
