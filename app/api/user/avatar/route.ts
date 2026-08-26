import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

import { auth } from "@/auth"
import { db } from "@/db"
import { users } from "@/db/schema"
import { checkRateLimit } from "@/lib/rate-limit"

export const dynamic = "force-dynamic"

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024 // raw upload ceiling before we even decode it
const AVATAR_PX        = 256              // stored/served square size
const WEBP_QUALITY      = 82

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Cheap enough to abuse (sharp decode is real CPU) that it's worth its own limit.
  const allowed = await checkRateLimit(`avatar-upload:${session.user.id}`, 20, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json({ error: "Too many uploads. Please try again later." }, { status: 429 })
  }

  const contentLength = Number(req.headers.get("content-length") ?? 0)
  if (contentLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 413 })
  }

  const form = await req.formData().catch(() => null)
  const file = form?.get("file") as File | null

  if (!file)                           return NextResponse.json({ error: "No image provided." }, { status: 400 })
  if (file.size > MAX_UPLOAD_BYTES)    return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 413 })
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image." }, { status: 400 })

  let optimized: Buffer
  try {
    const input = Buffer.from(await file.arrayBuffer())
    // Center-crop to a square then re-encode as WebP. sharp strips EXIF/ICC
    // metadata by default (no .withMetadata() call), which also drops any
    // embedded GPS location data from phone photos.
    optimized = await sharp(input)
      .rotate() // apply EXIF orientation before it gets stripped, so rotated phone photos don't end up sideways
      .resize(AVATAR_PX, AVATAR_PX, { fit: "cover", position: "attention" })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: "Couldn't process that image. Try a different file." }, { status: 400 })
  }

  const avatarUpdatedAt = new Date()
  await db
    .update(users)
    .set({
      avatar:          optimized.toString("base64"),
      avatarType:      "image/webp",
      avatarUpdatedAt,
    })
    .where(eq(users.id, session.user.id))

  return NextResponse.json({
    avatarVersion: avatarUpdatedAt.getTime(),
    bytes:         optimized.length,
  })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await db
    .update(users)
    .set({ avatar: null, avatarType: null, avatarUpdatedAt: null })
    .where(eq(users.id, session.user.id))

  return NextResponse.json({ ok: true })
}
