"use client"

import { useState, useTransition } from "react"

import type { ActionResult } from "~/app/actions"

// Two-step button: the first click only arms it ("Confirm?"), the second
// runs the action. Disarms itself after 5 seconds.
export function ActionButton({ label, confirmLabel, run, tone = "purple" }: {
  label: string
  confirmLabel: string
  run: () => Promise<ActionResult>
  tone?: "purple" | "red"
}) {
  const [armed, setArmed] = useState(false)
  const [pending, start] = useTransition()
  const [result, setResult] = useState<ActionResult | null>(null)

  const click = () => {
    if (!armed) {
      setArmed(true)
      setResult(null)
      setTimeout(() => setArmed(false), 5000)
      return
    }
    setArmed(false)
    start(async () => setResult(await run()))
  }

  const base = tone === "red"
    ? "border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20"
    : "border-purple-400/40 bg-purple-500/10 text-purple-200 hover:bg-purple-500/20"

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={click}
        disabled={pending}
        className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${armed ? "border-amber-400/60 bg-amber-500/20 text-amber-100" : base}`}
      >
        {pending ? "Working…" : armed ? confirmLabel : label}
      </button>
      {result && <p className={`text-xs ${result.ok ? "text-emerald-300" : "text-rose-300"}`}>{result.message}</p>}
    </div>
  )
}
