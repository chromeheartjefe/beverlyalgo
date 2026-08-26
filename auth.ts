import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { db } from "@/db"
import { users } from "@/db/schema"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const [row] = await db
          .select()
          .from(users)
          .where(eq(users.email, String(credentials.email).toLowerCase()))
          .limit(1)

        if (!row) return null

        const valid = await bcrypt.compare(String(credentials.password), row.passwordHash)
        if (!valid) return null

        return {
          id:            row.id,
          name:          row.name,
          email:         row.email,
          plan:          row.plan,
          emailVerified: !!row.emailVerified,
          avatarVersion: row.avatarUpdatedAt ? row.avatarUpdatedAt.getTime() : null,
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
      } else if (token.id) {
        // Re-fetch on every request so plan upgrades (Stripe webhook), email
        // verification, and avatar changes show up without forcing a re-login.
        const [row] = await db
          .select({ plan: users.plan, emailVerified: users.emailVerified, avatarUpdatedAt: users.avatarUpdatedAt })
          .from(users)
          .where(eq(users.id, String(token.id)))
          .limit(1)
        if (row) {
          token.plan          = row.plan
          token.emailVerified = !!row.emailVerified
          token.avatarVersion = row.avatarUpdatedAt ? row.avatarUpdatedAt.getTime() : null
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
