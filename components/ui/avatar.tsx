"use client"

import { cn } from "@/lib/utils"

type AvatarProps = {
  userId?:        string | null
  avatarVersion?: number | null
  name:           string
  className?:     string
  textClassName?: string
  /** Local object URL for a just-picked file, shown immediately instead of
   *  waiting on the upload round-trip. Takes priority over userId/avatarVersion. */
  previewSrc?:    string | null
}

// Shared avatar renderer: real uploaded photo when one exists, initials
// fallback otherwise. avatarVersion (epoch ms of the last upload, carried on
// the session) both decides which to render and cache-busts the <img> src so
// a fresh upload shows immediately instead of the long-lived cached bytes.
export function Avatar({ userId, avatarVersion, name, className, textClassName, previewSrc }: AvatarProps) {
  const initials = (name.trim().charAt(0) || "U").toUpperCase()

  if (previewSrc) {
    // eslint-disable-next-line @next/next/no-img-element -- local blob: URL, not a static asset next/image can optimize
    return <img src={previewSrc} alt={name} className={cn("object-cover", className)} />
  }

  if (userId && avatarVersion) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- same-origin API route, not a static asset next/image can optimize
      <img
        src={`/api/user/avatar/${userId}?v=${avatarVersion}`}
        alt={name}
        className={cn("object-cover", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-purple-500 to-violet-600 font-bold text-white",
        className,
      )}
    >
      <span className={textClassName}>{initials}</span>
    </div>
  )
}
