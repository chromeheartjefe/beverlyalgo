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
      } else if (token.id) {
        // Re-fetch on every request so plan upgrades (Stripe webhook) and email
        // verification show up without forcing the user to sign out and back in.
        const [row] = await db
          .select({ plan: users.plan, emailVerified: users.emailVerified })
          .from(users)
          .where(eq(users.id, String(token.id)))
          .limit(1)
        if (row) {
          token.plan          = row.plan
          token.emailVerified = !!row.emailVerified
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
        },
      }
    },
  },
})
