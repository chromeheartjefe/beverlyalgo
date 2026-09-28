import bcrypt from "bcryptjs"
import { and, eq, isNull, lt, or, sql } from "drizzle-orm"
import { after } from "next/server"
import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { db } from "@/db"
import { users } from "@/db/schema"
import { logEvent } from "@/lib/events"
import { clientIp, countHits, releaseHit, reserveHit } from "@/lib/rate-limit"

// Brute-force protection, counting failed sign-ins only:
// - per email + IP: stops one source guessing one account's password;
// - per IP: stops one machine spraying many accounts;
// - per email from anywhere: a much higher ceiling for distributed attacks.
// A plain per-email limit let anyone who knew an address lock its owner out
// with a few wrong passwords; now another source's failures don't block the
// owner's own connection unless an attack spans many IPs.
const LOGIN_WINDOW_MS          = 15 * 60 * 1000
const MAX_FAILS_PER_EMAIL_IP   = 10
const MAX_FAILS_PER_IP         = 30
const MAX_FAILS_PER_EMAIL_ALL  = 100

// bcrypt hash of a random string nobody knows. Compared against when the
// email doesn't exist, so an unknown email takes as long as a wrong password
// and response time can't reveal which emails are registered.
const DUMMY_HASH = "$2b$10$f3ss47tbGPM554QV4df9oueyKmv.NsdzS0uWkj5AduPMfKFpauiUi"

// "Last visited" for the admin console, written at most this often per user
// (the jwt callback runs on every request, a write each time would be waste)
const LAST_SEEN_EVERY_MS = 10 * 60 * 1000

class TooManyAttempts extends CredentialsSignin {
  code = "rate_limited"
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) return null

        const email   = String(credentials.email).toLowerCase()
        const ip      = request ? clientIp(request) : "unknown"
        const keys    = [`login-fail:email-ip:${email}|${ip}`, `login-fail:ip:${ip}`, `login-fail:email:${email}`]
        const limits  = [MAX_FAILS_PER_EMAIL_IP, MAX_FAILS_PER_IP, MAX_FAILS_PER_EMAIL_ALL]

        // Reserve this attempt BEFORE the slow bcrypt compare, then count
        // including it. Counting first let hundreds of parallel guesses all
        // pass the check before any failure was written. Blocked attempts and
        // successful sign-ins take their reservation back, so only real
        // failures count toward the limit.
        const hitIds  = await Promise.all(keys.map(reserveHit))
        const release = () => Promise.all(hitIds.map(releaseHit))

        const counts = await Promise.all(keys.map((k) => countHits(k, LOGIN_WINDOW_MS)))
        if (counts.some((n, i) => n > limits[i])) {
          await release()
          throw new TooManyAttempts()
        }

        const [row] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        if (!row) {
          await bcrypt.compare(String(credentials.password), DUMMY_HASH)
          return null // reserved hits stay recorded as this failure
        }

        const valid = await bcrypt.compare(String(credentials.password), row.passwordHash)
        if (!valid) {
          await logEvent(row.id, "login_failed", { ip })
          return null // reserved hits stay recorded as this failure
        }

        await release()

        const now = new Date()
        try {
          await db
            .update(users)
            .set({ lastLoginAt: now, lastSeenAt: now, loginCount: sql`${users.loginCount} + 1` })
            .where(eq(users.id, row.id))
        } catch (err) {
          console.error("[auth] failed to record login", err) // never block a valid sign-in
        }
        await logEvent(row.id, "login", { ip })

        return {
          id:            row.id,
          name:          row.name,
          email:         row.email,
          plan:          row.plan,
          emailVerified: !!row.emailVerified,
          avatarVersion: row.avatarUpdatedAt ? row.avatarUpdatedAt.getTime() : null,
          sessionVersion: row.sessionVersion,
        }
      },
    }),
  ],

  session: { strategy: "jwt" },

  pages: {
    signIn: "/sign-in",
    error:  "/sign-in",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id            = user.id
        token.plan          = user.plan
        token.emailVerified = (user as { emailVerified?: boolean }).emailVerified
        token.avatarVersion = (user as { avatarVersion?: number | null }).avatarVersion ?? null
        token.sessionVersion = (user as { sessionVersion?: number }).sessionVersion ?? 0
      } else if (token.id) {
        // Re-fetch on every request so plan upgrades (Stripe webhook), email
        // verification, and avatar changes show up without forcing a re-login.
        const [row] = await db
          .select({
            plan:            users.plan,
            emailVerified:   users.emailVerified,
            avatarUpdatedAt: users.avatarUpdatedAt,
            sessionVersion:  users.sessionVersion,
            lastSeenAt:      users.lastSeenAt,
          })
          .from(users)
          .where(eq(users.id, String(token.id)))
          .limit(1)
        // Account gone, or the password changed since this session signed in
        // → end the session. Sessions from before this field existed carry no
        // version and count as 0, the column default, so they stay valid.
        if (!row) return null
        if (Number(token.sessionVersion ?? 0) !== row.sessionVersion) return null

        token.plan          = row.plan
        token.emailVerified = !!row.emailVerified
        token.avatarVersion = row.avatarUpdatedAt ? row.avatarUpdatedAt.getTime() : null

        // The row we just read is only a cheap pre-check. The UPDATE carries
        // the real condition, so parallel requests (page load + data fetches)
        // write it once, not once each. It runs after the response is sent
        // (after()), so no navigation waits on it.
        if (!row.lastSeenAt || Date.now() - row.lastSeenAt.getTime() > LAST_SEEN_EVERY_MS) {
          const userId = String(token.id)
          const touch = () =>
            db
              .update(users)
              .set({ lastSeenAt: new Date() })
              .where(and(
                eq(users.id, userId),
                or(isNull(users.lastSeenAt), lt(users.lastSeenAt, new Date(Date.now() - LAST_SEEN_EVERY_MS))),
              ))
              .catch(() => {}) // best-effort; the next request retries
          try {
            after(touch)
          } catch {
            await touch() // outside a request scope after() isn't available
          }
        }
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id:            String(token.id   ?? ""),
          plan:          String(token.plan ?? ""),
          emailVerified: !!token.emailVerified,
          avatarVersion: (token.avatarVersion as number | null | undefined) ?? null,
        },
      }
    },
  },
})
