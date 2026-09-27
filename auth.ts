import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { db } from "@/db"
import { users } from "@/db/schema"
import { clientIp, countHits, releaseHit, reserveHit } from "@/lib/rate-limit"

// Brute-force protection: failed sign-ins are counted per email (stops
// guessing one account's password) and per IP (stops one machine spraying
// many accounts). Only failures count, so normal users never hit it.
const LOGIN_WINDOW_MS     = 15 * 60 * 1000
const MAX_FAILS_PER_EMAIL = 10
const MAX_FAILS_PER_IP    = 30

// bcrypt hash of a random string nobody knows. Compared against when the
// email doesn't exist, so an unknown email takes as long as a wrong password
// and response time can't reveal which emails are registered.
const DUMMY_HASH = "$2b$10$f3ss47tbGPM554QV4df9oueyKmv.NsdzS0uWkj5AduPMfKFpauiUi"

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

        const email    = String(credentials.email).toLowerCase()
        const emailKey = `login-fail:email:${email}`
        const ipKey    = `login-fail:ip:${request ? clientIp(request) : "unknown"}`

        // Reserve this attempt BEFORE the slow bcrypt compare, then count
        // including it. Counting first let hundreds of parallel guesses all
        // pass the check before any failure was written. Blocked attempts and
        // successful sign-ins take their reservation back, so only real
        // failures count toward the limit.
        const hitIds = await Promise.all([reserveHit(emailKey), reserveHit(ipKey)])
        const release = () => Promise.all(hitIds.map(releaseHit))

        const [emailFails, ipFails] = await Promise.all([
          countHits(emailKey, LOGIN_WINDOW_MS),
          countHits(ipKey, LOGIN_WINDOW_MS),
        ])
        if (emailFails > MAX_FAILS_PER_EMAIL || ipFails > MAX_FAILS_PER_IP) {
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
        if (!valid) return null // reserved hits stay recorded as this failure

        await release()

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
