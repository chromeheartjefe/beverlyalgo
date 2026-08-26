"use client"

import { BarChart3, Bell, ChevronDown, CreditCard, LogOut, Menu, Settings, TrendingDown, TrendingUp } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { MarketTicker } from "@/components/dashboard/market-ticker"
import { useMobileNav } from "@/components/dashboard/mobile-nav-context"
import { Avatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getLastSeen, markSeen } from "@/lib/notifications"
import { cn } from "@/lib/utils"

type Notification = {
  id:         string
  signal:     string
  pair:       string
  timeframe:  string
  confidence: number
  createdAt:  string
}

function greeting() {
  const hour = new Date().getHours()
  if (hour < 5)  return "Good night"
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

const SUBTITLE_LINES = [
  "Here's what's happening with your trading today.",
  "Plan your trade, trade your plan.",
  "The market rewards patience, not prediction.",
  "Cut your losses short, let your winners run.",
  "Risk comes from not knowing what you're doing.",
  "Discipline beats motivation on a red day.",
  "Small edges, repeated often, win.",
  "Your worst trade is the one you didn't journal.",
  "No signal beats a bad risk-reward ratio.",
  "Protect your capital like it's the only lot you have.",
  "The trend is your friend, until it bends.",
  "Position sizing is a risk decision, not a hope decision.",
  "Every chart tells a story — read it, don't guess it.",
  "Consistency compounds faster than genius.",
  "A good exit plan is worth more than a good entry.",
  "Trade the setup, not the emotion.",
  "Overtrading is the fastest way to underperform.",
  "Wait for the odds to favor you, not the other way around.",
  "One green candle doesn't make a strategy.",
  "Log it, learn from it, level up.",
]

function useSubtitle() {
  const [subtitle, setSubtitle] = useState(SUBTITLE_LINES[0])
  useEffect(() => {
    setSubtitle(SUBTITLE_LINES[Math.floor(Math.random() * SUBTITLE_LINES.length)])
  }, [])
  return subtitle
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  const units: [number, string][] = [
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ]
  for (const [secs, label] of units) {
    if (seconds >= secs) return `${Math.floor(seconds / secs)}${label} ago`
  }
  return "just now"
}

function signalIcon(signal: string) {
  if (signal === "BUY")  return { Icon: TrendingUp,   color: "text-emerald-400", bg: "bg-emerald-500/[0.12]" }
  if (signal === "SELL") return { Icon: TrendingDown, color: "text-red-400",     bg: "bg-red-500/[0.12]" }
  return { Icon: BarChart3, color: "text-gray-400", bg: "bg-white/[0.06]" }
}

export function DashboardHeader() {
  const pathname = usePathname()
  const isOverview = pathname === "/dashboard"
  const { setOpen: setMobileNavOpen } = useMobileNav()
  const { data: session } = useSession()
  const name     = session?.user?.name ?? "User"
  const email    = session?.user?.email ?? ""
  const plan          = (session?.user as { plan?: string })?.plan ?? "free"
  const userId        = session?.user?.id
  const avatarVersion = (session?.user as { avatarVersion?: number | null })?.avatarVersion

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const subtitle = useSubtitle()

  useEffect(() => {
    if (!userId) return
    fetch("/api/notifications")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Notification[]) => {
        setNotifications(data)
        const lastSeen = getLastSeen(userId)
        const newest = data[0] ? new Date(data[0].createdAt).getTime() : 0
        setUnread(newest > lastSeen)
      })
      .catch(() => {})
  }, [userId])

  const handleNotifOpenChange = (open: boolean) => {
    setNotifOpen(open)
    if (open && userId) {
      markSeen(userId)
      setUnread(false)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (res.ok) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/[0.07] bg-[#07070d] px-4 sm:px-6">
      {/* Mobile nav trigger — sidebar is hidden below lg, this opens the drawer */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setMobileNavOpen(true)}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-400 transition-colors hover:text-gray-200 lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu className="size-5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Menu</TooltipContent>
      </Tooltip>

      {/* Both stay mounted so the ticker never re-fetches/pops in when switching tabs — only opacity crossfades */}
      <div className="relative hidden h-full flex-1 md:block">
        <div
          className={cn(
            "absolute inset-0 flex flex-col justify-center transition-opacity duration-300 ease-out",
            isOverview ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <p className="text-sm font-semibold text-white">
            {greeting()}, {name.split(" ")[0]} <span aria-hidden>👋</span>
          </p>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300 ease-out",
            isOverview ? "pointer-events-none opacity-0" : "opacity-100"
          )}
        >
          <MarketTicker />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu open={notifOpen} onOpenChange={handleNotifOpenChange}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-gray-500 transition-colors hover:text-gray-200">
                  <Bell className="size-4" />
                  {unread && <span className="absolute right-2 top-2 size-1.5 rounded-full bg-purple-400" />}
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-80 border-white/[0.08] bg-[#0d0d1c] p-0 text-white">
            <DropdownMenuLabel className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Recent Signals
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.07]" />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 && (
                <p className="px-4 py-8 text-center text-xs text-gray-600">
                  No AI signals yet — run a chart analysis to see results here.
                </p>
              )}
              {notifications.map((n) => {
                const { Icon, color, bg } = signalIcon(n.signal)
                return (
                  <DropdownMenuItem
                    key={n.id}
                    asChild
                    className="cursor-pointer rounded-none px-4 py-3 focus:bg-white/[0.05]"
                  >
                    <Link href="/dashboard/chart-analysis" className="flex items-start gap-3">
                      <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg", bg)}>
                        <Icon className={cn("size-4", color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-gray-200">
                          <span className={cn("font-semibold", color)}>{n.signal}</span> signal on{" "}
                          <span className="font-mono font-semibold text-white">{n.pair}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          {n.timeframe} · {n.confidence}% confidence · {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-white/[0.07]" />

        {/* Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5">
              <Avatar
                userId={userId}
                avatarVersion={avatarVersion}
                name={name}
                className="size-8 shrink-0 rounded-lg text-xs"
              />
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold leading-none text-white">{name}</p>
                <p className="mt-0.5 text-[11px] capitalize leading-none text-gray-500">{plan} Trader</p>
              </div>
              <ChevronDown className="hidden size-3.5 text-gray-600 md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 border-white/[0.08] bg-[#0d0d1c] p-1.5 text-white">
            <DropdownMenuLabel className="px-2.5 py-2">
              <p className="truncate text-sm font-semibold text-white">{name}</p>
              <p className="truncate text-xs text-gray-500">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/[0.07]" />
            <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-300 focus:bg-white/[0.06] focus:text-white">
              <Link href="/dashboard/settings">
                <Settings className="size-4 text-gray-500" />
                Settings
              </Link>
            </DropdownMenuItem>
            {plan !== "free" ? (
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  handleManageBilling()
                }}
                disabled={portalLoading}
                className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-300 focus:bg-white/[0.06] focus:text-white"
              >
                <CreditCard className="size-4 text-gray-500" />
                {portalLoading ? "Loading…" : "Manage Billing"}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem asChild className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-300 focus:bg-white/[0.06] focus:text-white">
                <Link href="/#pricing">
                  <CreditCard className="size-4 text-gray-500" />
                  Upgrade to Pro
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-white/[0.07]" />
            <DropdownMenuItem
              onSelect={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm text-red-400 focus:bg-red-500/10 focus:text-red-300"
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
