import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

import { db } from "@/db"
import { users } from "@/db/schema"

// No auth: an avatar is low-sensitivity, and this needs to be a plain <img src>
// (browser-cacheable, no fetch/cookie plumbing). userId is an unguessable
// crypto.randomUUID(), so this doesn't expose anything beyond "does this id exist."
export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params

  const [row] = await db
    .select({ avatar: users.avatar, avatarType: users.avatarType })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!row?.avatar || !row.avatarType) {
    return NextResponse.json({ error: "No avatar." }, { status: 404 })
  }

  return new NextResponse(Buffer.from(row.avatar, "base64"), {
    headers: {
      "Content-Type": row.avatarType,
      // Safe to cache forever: the URL is version-busted (?v=<timestamp>) by
      // the caller whenever the avatar actually changes.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
