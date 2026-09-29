"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Activity, BookOpen, Bot, Calculator, CalendarDays, Flame, LayoutDashboard, LifeBuoy, Lock, Settings, X, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

import { useMobileNav } from "@/components/dashboard/mobile-nav-context"
import { PlanCard } from "@/components/dashboard/plan-card"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export const NAV_MAIN = [
  { label: "Dashboard",       href: "/dashboard",                 icon: LayoutDashboard, lockable: false },
  { label: "Chart Analysis",  href: "/dashboard/chart-analysis",  icon: Zap,             lockable: true  },
  { label: "AI Trading Indicator", href: "/dashboard/indicator",  icon: Activity,        lockable: true  },
  { label: "AI Trading Bot",  href: "/dashboard/trading-bot",     icon: Bot,             lockable: true  },
]

// Hands-on tools for finding, planning and logging your own trades
export const NAV_TRADING = [
  { label: "AI Screener",     href: "/dashboard/ai-screener",     icon: Flame,           lockable: false },
  { label: "Trade Journal",   href: "/dashboard/trade-journal",   icon: BookOpen,        lockable: false },
  { label: "Trade Calendar",  href: "/dashboard/trade-calendar",  icon: CalendarDays,    lockable: false },
  { label: "Risk Calculator", href: "/dashboard/risk-calculator", icon: Calculator,      lockable: false },
]

function Logo() {
  return (
    <Link
      href="/"
      className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/15 px-5 transition-opacity hover:opacity-80"
    >
      <Image
        src="/logo_transparent.png"
        alt="EntrixAlgo"
        width={28}
        height={28}
        className="size-7 object-contain"
      />
      <span className="text-base font-bold tracking-tight text-white">
        Entrix<span className="text-purple-400">Algo</span>
      </span>
    </Link>
  )
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status: sessionStatus } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  // Only once the session is known: while it loads, Pro users would
  // otherwise see lock icons on their own tools for a moment
  const isFree = sessionStatus === "authenticated" && plan === "free"

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  const renderItem = ({ label, href, icon: Icon, lockable }: (typeof NAV_MAIN)[number]) => {
    const active = isActive(href)
    const locked = lockable && isFree
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        onMouseEnter={() => router.prefetch(href)}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150 lg:py-2.5",
          active
            ? "bg-purple-500/[0.12] text-purple-400"
            : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-purple-400" : "text-gray-500")} />
        <span className="flex-1">{label}</span>
        {locked && <Lock className="size-3 shrink-0 text-gray-600" />}
      </Link>
    )
  }

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Main Menu
        </p>
        {NAV_MAIN.map(renderItem)}

        <div className="mx-3 my-4 border-t border-white/15" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Trading Desk
        </p>
        {NAV_TRADING.map(renderItem)}

        <div className="mx-3 my-4 border-t border-white/15" />

        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Preferences
        </p>
        {(() => {
          const active = pathname === "/dashboard/settings"
          return (
            <Link
              href="/dashboard/settings"
              onClick={onNavigate}
              onMouseEnter={() => router.prefetch("/dashboard/settings")}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-150 lg:py-2.5",
                active
                  ? "bg-purple-500/[0.12] text-purple-400"
                  : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
              )}
            >
              <Settings className={cn("size-4 shrink-0", active ? "text-purple-400" : "text-gray-500")} />
              Settings
            </Link>
          )
        })()}
        <a
          href={siteConfig.links.email}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-gray-500 transition-all duration-150 hover:bg-white/[0.04] hover:text-gray-200 lg:py-2.5"
        >
          <LifeBuoy className="size-4 shrink-0 text-gray-500" />
          Help &amp; Support
        </a>
      </nav>

      {/* Plan card */}
      <div className="shrink-0 p-3">
        <PlanCard isFree={isFree} loading={sessionStatus === "loading"} onNavigate={onNavigate} />
      </div>
    </>
  )
}

export function DashboardSidebar() {
  const { open, setOpen } = useMobileNav()
  const pathname = usePathname()

  // Auto-close the mobile drawer whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname, setOpen])

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/15 bg-[#07070d] lg:flex">
        <Logo />
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/15 bg-[#07070d] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
            <div className="flex items-center justify-between border-b border-white/15 pr-2">
              <div className="flex-1">
                <Logo />
              </div>
              <Dialog.Close className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200">
                <X className="size-5" />
                <span className="sr-only">Close navigation menu</span>
              </Dialog.Close>
            </div>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
