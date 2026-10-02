"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { LayoutGroup, motion } from "framer-motion"
import { Activity, BookA, BookOpen, Bot, Calculator, CalendarDays, Flame, GraduationCap, LayoutDashboard, Lock, Settings, X, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

import { useMobileNav } from "@/components/dashboard/mobile-nav-context"
import { PlanCard } from "@/components/dashboard/plan-card"
import { useFreeAnalysis } from "@/lib/use-free-analysis"
import { cn } from "@/lib/utils"

const NAV_MAIN = [
  { label: "Dashboard",       href: "/dashboard",                 icon: LayoutDashboard, lockable: false },
  { label: "Chart Analysis",  href: "/dashboard/chart-analysis",  icon: Zap,             lockable: true  },
  { label: "AI Trading Indicator", href: "/dashboard/indicator",  icon: Activity,        lockable: true  },
  { label: "AI Trading Bot",  href: "/dashboard/trading-bot",     icon: Bot,             lockable: true  },
]

// Hands-on tools for finding, planning and logging your own trades
const NAV_TRADING = [
  { label: "AI Screener",     href: "/dashboard/ai-screener",     icon: Flame,           lockable: false },
  { label: "Trade Journal",   href: "/dashboard/trade-journal",   icon: BookOpen,        lockable: false },
  { label: "Trade Calendar",  href: "/dashboard/trade-calendar",  icon: CalendarDays,    lockable: false },
  { label: "Risk Calculator", href: "/dashboard/risk-calculator", icon: Calculator,      lockable: false },
]

// Free for every account
const NAV_LEARN = [
  { label: "Academy",         href: "/dashboard/academy",         icon: GraduationCap,   lockable: false },
  { label: "Glossary",        href: "/dashboard/glossary",        icon: BookA,           lockable: false },
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

// The active item's highlight is one shared element that slides to the new
// item on navigation, instead of jumping (framer layoutId). Each sidebar (desktop
// rail, mobile drawer) has its own LayoutGroup so the two never share it.
function ActivePill() {
  return (
    <motion.span
      layoutId="sidebar-active"
      aria-hidden
      className="absolute inset-0 -z-10 rounded-xl bg-purple-500/[0.12]"
      transition={{ type: "spring", stiffness: 520, damping: 42 }}
    />
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
  // Chart Analysis shows "1 free" instead of a lock while the free one is unused
  const { state: freeState } = useFreeAnalysis()

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  const renderItem = ({ label, href, icon: Icon, lockable }: (typeof NAV_MAIN)[number]) => {
    const active = isActive(href)
    const freeTry = isFree && href === "/dashboard/chart-analysis" && (freeState === "available" || freeState === "verify")
    const locked = lockable && isFree && !freeTry
    return (
      <Link
        key={href}
        href={href}
        onClick={onNavigate}
        onMouseEnter={() => router.prefetch(href)}
        className={cn(
          "relative isolate flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150 lg:py-2.5",
          active
            ? "text-purple-400"
            : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
        )}
      >
        {active && <ActivePill />}
        <Icon className={cn("size-4 shrink-0", active ? "text-purple-400" : "text-gray-500")} />
        <span className="flex-1">{label}</span>
        {locked && <Lock className="size-3 shrink-0 text-gray-600" />}
        {freeTry && (
          <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-1.5 py-px text-[11px] font-semibold text-emerald-300">
            1 free
          </span>
        )}
      </Link>
    )
  }

  return (
    <>
      {/* Navigation */}
      <LayoutGroup id={onNavigate ? "sidebar-drawer" : "sidebar-rail"}>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 mt-3 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600">
          Main Menu
        </p>
        {NAV_MAIN.map(renderItem)}

        <div className="mx-3 my-4 border-t border-white/15" />

        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600">
          Trading Desk
        </p>
        {NAV_TRADING.map(renderItem)}

        <div className="mx-3 my-4 border-t border-white/15" />

        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600">
          Learn
        </p>
        {NAV_LEARN.map(renderItem)}

        <div className="mx-3 my-4 border-t border-white/15" />

        <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-gray-600">
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
                "relative isolate flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors duration-150 lg:py-2.5",
                active
                  ? "text-purple-400"
                  : "text-gray-500 hover:bg-white/[0.04] hover:text-gray-200"
              )}
            >
              {active && <ActivePill />}
              <Settings className={cn("size-4 shrink-0", active ? "text-purple-400" : "text-gray-500")} />
              Settings
            </Link>
          )
        })()}
      </nav>
      </LayoutGroup>

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
              <Dialog.Close className="relative tap-44 flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200">
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
