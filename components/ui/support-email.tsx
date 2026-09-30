import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

// The support address as plain text in the brand purple, not a link: a
// mailto: does nothing on devices without a mail app, so people read or copy
// the address and write from wherever they email.
export function SupportEmail({ className }: { className?: string }) {
  return <span className={cn("font-medium text-purple-400", className)}>{siteConfig.supportEmail}</span>
}
