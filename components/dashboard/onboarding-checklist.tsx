"use client"

import { BookOpen, Calculator, CheckCircle2, Circle, Settings, X, Zap } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { dismissOnboarding, getOnboardingState } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

export function OnboardingChecklist({
  hasTrades,
  hasAnalyses,
}: {
  hasTrades:   boolean
  hasAnalyses: boolean
}) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [dismissed,        setDismissed]        = useState(false)
  const [visitedRiskCalc,  setVisitedRiskCalc]  = useState(false)
  const [visitedSettings,  setVisitedSettings]  = useState(false)

  useEffect(() => {
    if (!userId) return
    const state = getOnboardingState(userId)
    setDismissed(!!state.dismissed)
    setVisitedRiskCalc(!!state.visitedRiskCalc)
    setVisitedSettings(!!state.visitedSettings)
  }, [userId])

  if (!userId || dismissed) return null

  const steps = [
    { label: "Log your first trade",     done: hasTrades,        href: "/dashboard/trade-journal",   icon: BookOpen   },
    { label: "Try the Risk Calculator",  done: visitedRiskCalc,  href: "/dashboard/risk-calculator", icon: Calculator },
    { label: "Run an AI chart analysis", done: hasAnalyses,      href: "/dashboard/chart-analysis",  icon: Zap        },
    { label: "Review your account settings", done: visitedSettings, href: "/dashboard/settings",     icon: Settings   },
  ]

  const doneCount = steps.filter((s) => s.done).length
  if (doneCount === steps.length) return null

  return (
    <div className="mb-8 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Get started with EntrixAlgo</h2>
          <p className="mt-0.5 text-xs text-gray-500">{doneCount} of {steps.length} steps complete</p>
        </div>
        <button
          onClick={() => { setDismissed(true); dismissOnboarding(userId) }}
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
                : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
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
  )
}
