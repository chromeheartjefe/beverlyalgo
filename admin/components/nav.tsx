"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cx } from "~/components/ui"

const LINKS = [
  { href: "/",          label: "Overview" },
  { href: "/users",     label: "Users" },
  { href: "/revenue",   label: "Revenue" },
  { href: "/ai",        label: "AI & costs" },
  { href: "/indicator", label: "Indicator queue" },
  { href: "/system",    label: "System health" },
  { href: "/audit",     label: "Audit log" },
]

export function Nav() {
  const pathname = usePathname()
  const active = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href))
  return (
    <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-white/15 bg-[#07070d] p-4">
      <p className="px-2 text-base font-bold text-white">
        Entrix<span className="text-purple-400">Algo</span> <span className="text-xs font-medium text-gray-400">Admin</span>
      </p>
      <p className="mt-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2 py-1.5 text-[11px] leading-snug text-amber-200">
        Local only. Live production data, read-only connection.
      </p>
      <nav className="mt-5 space-y-0.5">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cx(
              "block rounded-lg px-3 py-2 text-sm transition-colors",
              active(l.href) ? "bg-purple-500/15 text-purple-200" : "text-gray-400 hover:bg-white/[0.05] hover:text-white",
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
