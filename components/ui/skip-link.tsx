import { CornerDownRight } from "lucide-react"

// The first Tab stop on pages with a lot of navigation before the content (the
// dashboard: sidebar and header). It stays off screen until the keyboard
// focuses it (focus-visible), so a mouse click, a tap or a script moving focus
// never brings it up. Screen readers always find it. Its target is the page's
// <main id="main-content" tabIndex={-1}>.
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed left-4 top-3 z-[100] flex min-h-11 -translate-y-20 items-center gap-2 rounded-xl border border-purple-400/40 bg-[#0d0d1c] px-4 text-sm font-semibold text-white opacity-0 shadow-[0_8px_30px_-8px_rgba(168,85,247,0.6)] transition-[translate,opacity] duration-200 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 motion-reduce:transition-none"
    >
      <CornerDownRight className="size-4 text-purple-300" aria-hidden />
      Skip to content
    </a>
  )
}
