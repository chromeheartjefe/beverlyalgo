"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Activity, BookOpen, Bot, Calculator, LayoutDashboard, Lock, Settings, TrendingUp, X, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

import { useMobileNav } from "@/components/dashboard/mobile-nav-context"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export const NAV_MAIN = [
  { label: "Dashboard",       href: "/dashboard",                 icon: LayoutDashboard, lockable: false },
  { label: "Chart Analysis",  href: "/dashboard/chart-analysis",  icon: Zap,             lockable: true  },
  { label: "AI Trading Indicator", href: "/dashboard/indicator",  icon: Activity,        lockable: true  },
  { label: "AI Trading Bot",  href: "/dashboard/trading-bot",     icon: Bot,             lockable: true  },
  { label: "Trade Journal",   href: "/dashboard/trade-journal",   icon: BookOpen,        lockable: false },
  { label: "Risk Calculator", href: "/dashboard/risk-calculator", icon: Calculator,      lockable: false },
]

function Logo() {
  return (
    <Link
      href="/"
      className="flex h-16 shrink-0 items-center gap-2.5 border-b border-white/[0.07] px-5 transition-opacity hover:opacity-80"
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
  const { data: session } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const isFree = plan === "free"

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  return (
    <>
      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        <p className="mb-2 mt-3 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
          Main Menu
        </p>
        {NAV_MAIN.map(({ label, href, icon: Icon, lockable }) => {
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
        })}

        <div className="mx-3 my-4 border-t border-white/[0.07]" />

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
      </nav>

      {/* Plan card */}
      <div className="shrink-0 p-3">
        <div className="rounded-2xl border border-purple-500/[0.15] bg-gradient-to-b from-purple-500/[0.08] to-transparent p-4">
          <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/[0.15]">
            <TrendingUp className="size-4 text-purple-400" />
          </div>
          {isFree ? (
            <>
              <p className="mt-3 text-sm font-semibold text-white">Free Plan</p>
              <p className="mt-0.5 text-xs text-gray-500">Upgrade to unlock AI Chart Analysis</p>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm font-semibold capitalize text-white">{plan} Plan Active</p>
              <p className="mt-0.5 text-xs text-gray-500">Unlimited AI analyses</p>
            </>
          )}
          <Link
            href="/#pricing"
            onClick={onNavigate}
            className="mt-3 block w-full rounded-lg border border-purple-500/20 py-2 text-center text-xs font-medium text-purple-400 transition-colors hover:bg-purple-500/10"
          >
            {isFree ? "Upgrade" : "Manage Plan"}
          </Link>
        </div>
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
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#07070d] lg:flex">
        <Logo />
        <SidebarBody />
      </aside>

      {/* Mobile drawer */}
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 flex h-full w-72 max-w-[85vw] flex-col border-r border-white/[0.07] bg-[#07070d] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Navigation menu</Dialog.Title>
            <div className="flex items-center justify-between border-b border-white/[0.07] pr-2">
              <div className="flex-1">
                <Logo />
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Dialog.Close className="flex size-10 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200">
                    <X className="size-5" />
                    <span className="sr-only">Close navigation menu</span>
                  </Dialog.Close>
                </TooltipTrigger>
                <TooltipContent side="bottom">Close menu</TooltipContent>
              </Tooltip>
            </div>
            <SidebarBody onNavigate={() => setOpen(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
