"use client"

import { BookOpen, Calculator, CheckCircle2, Circle, Settings, X, Zap } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useMemo, useState, useSyncExternalStore } from "react"

import { Collapse } from "@/components/ui/motion"
import { dismissOnboarding, parseOnboardingState, readOnboardingRaw } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

function subscribeStorage(onChange: () => void) {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

export function OnboardingChecklist({
  hasTrades,
  hasAnalyses,
  loading,
}: {
  hasTrades:   boolean
  hasAnalyses: boolean
  // Trades/analyses not known yet: every step would read as not done
  loading:     boolean
}) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  // Read the saved state during render, not in an effect: an effect showed
  // the card for a frame on every visit before hiding it for dismissed users,
  // shifting the whole Overview. null on the server and during hydration.
  const raw = useSyncExternalStore(
    subscribeStorage,
    () => (userId ? readOnboardingRaw(userId) : null),
    () => null,
  )
  const state = useMemo(() => (raw ? parseOnboardingState(raw) : null), [raw])
  const [dismissedNow, setDismissedNow] = useState(false)

  const visitedRiskCalc = !!state?.visitedRiskCalc
  const visitedSettings = !!state?.visitedSettings

  const steps = [
    { label: "Log your first trade",     done: hasTrades,        href: "/dashboard/trade-journal",   icon: BookOpen   },
    { label: "Try the Risk Calculator",  done: visitedRiskCalc,  href: "/dashboard/risk-calculator", icon: Calculator },
    { label: "Run an AI chart analysis", done: hasAnalyses,      href: "/dashboard/chart-analysis",  icon: Zap        },
    { label: "Review your account settings", done: visitedSettings, href: "/dashboard/settings",     icon: Settings   },
  ]

  const doneCount = steps.filter((s) => s.done).length
  const show = !!userId && !!state && !loading && !state.dismissed && !dismissedNow && doneCount < steps.length

  // Opens and closes in height, so the Overview below slides instead of
  // jumping when the card appears after loading or is dismissed
  return (
    <Collapse show={show} className="mb-8">
    <div className="rounded-2xl border border-white/25 bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Get started with EntrixAlgo</h2>
          <p className="mt-0.5 text-xs text-gray-500">{doneCount} of {steps.length} steps complete</p>
        </div>
        <button
          onClick={() => { setDismissedNow(true); if (userId) dismissOnboarding(userId) }}
          className="-mr-1.5 -mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-white/[0.06] hover:text-gray-300"
        >
          <X className="size-4" />
          <span className="sr-only">Dismiss</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {steps.map(({ label, done, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl border px-3.5 py-3 transition-colors",
              done
                ? "border-emerald-500/[0.15] bg-emerald-500/[0.04]"
                : "border-white/15 bg-white/[0.02] hover:bg-white/[0.04]"
            )}
          >
            {done
              ? <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
              : <Circle className="size-4 shrink-0 text-gray-600" />}
            <Icon className={cn("size-3.5 shrink-0", done ? "text-emerald-400/70" : "text-gray-500")} />
            <span className={cn("text-sm", done ? "text-gray-400 line-through" : "text-gray-200")}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
    </Collapse>
  )
}
