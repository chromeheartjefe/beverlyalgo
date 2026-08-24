import { and, count, eq, gt } from "drizzle-orm"

import { db } from "@/db"
import { rateLimitHits } from "@/db/schema"

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const since = new Date(Date.now() - windowMs)

  const [{ value }] = await db
    .select({ value: count() })
    .from(rateLimitHits)
    .where(and(eq(rateLimitHits.key, key), gt(rateLimitHits.createdAt, since)))

  if (value >= limit) return false

  await db.insert(rateLimitHits).values({ key })
  return true
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
}
