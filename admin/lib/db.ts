import "server-only"

import { neon } from "@neondatabase/serverless"
import { type SQL } from "drizzle-orm"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@/db/schema"

// Two separate database logins (see admin/sql/roles.sql):
// - ADMIN_DATABASE_URL: SELECT only. Every page reads through this one, so
//   the console physically cannot change customer data while browsing.
// - ADMIN_WRITE_DATABASE_URL: only the few columns/tables the safe actions
//   touch (mark invited, force sign-out, resend verification, audit log).
// Never the site's own DATABASE_URL (full owner rights).

class SetupError extends Error {}

function url(name: "ADMIN_DATABASE_URL" | "ADMIN_WRITE_DATABASE_URL"): string {
  const value = process.env[name]
  if (!value) throw new SetupError(`${name} is not set in admin/.env.local (see admin/README.md).`)
  return value
}

type Db = ReturnType<typeof drizzle<typeof schema>>
let read: Db | null = null
let write: Db | null = null

export function readDb(): Db {
  return (read ??= drizzle(neon(url("ADMIN_DATABASE_URL")), { schema }))
}

export function writeDb(): Db {
  return (write ??= drizzle(neon(url("ADMIN_WRITE_DATABASE_URL")), { schema }))
}

/** Runs a raw SQL query on the read-only connection and returns its rows. */
export async function rows<T>(query: SQL): Promise<T[]> {
  const result = await readDb().execute(query)
  return result.rows as T[]
}

export async function one<T>(query: SQL): Promise<T | null> {
  return (await rows<T>(query))[0] ?? null
}
