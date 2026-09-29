import { type NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

// Dashboard gate. It only checks that the request carries a genuine,
// unexpired session cookie: the cookie is encrypted with AUTH_SECRET, so it
// can't be forged or edited, and decrypting it needs no database.
//
// It used to call auth(), which runs the full session refresh in auth.ts
// (a database read of the user row) on every dashboard page load and tab
// switch, before the page could even start. The checks that need the
// database still run where the data is: every API route calls auth(), so a
// session ended by a password change gets no data, and the dashboard's
// SessionGuard sends that browser to sign-in.

// Auth.js names the cookie with the __Secure- prefix on HTTPS and encrypts it
// with the cookie name as the salt, so read whichever one the browser sent.
const SECURE_SESSION_COOKIE = "__Secure-authjs.session-token"

export default async function middleware(req: NextRequest) {
  const secureCookie = req.cookies
    .getAll()
    .some((c) => c.name === SECURE_SESSION_COOKIE || c.name.startsWith(`${SECURE_SESSION_COOKIE}.`))

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET, // same lookup as NextAuth
    secureCookie,
  })

  if (!token) {
    const loginUrl = new URL("/sign-in", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
