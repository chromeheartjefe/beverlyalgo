"use client"

import { AlertTriangle, CheckCircle, DollarSign, Info, TrendingUp } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { markVisited } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
}: {
  label: string
  value: number | string
  onChange: (v: string) => void
  prefix?: string
  suffix?: string
  hint?: string
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-gray-400">{label}</label>
      <div className="flex overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.04] focus-within:border-purple-500/40 focus-within:ring-1 focus-within:ring-purple-500/20">
        {prefix && (
          <span className="flex items-center border-r border-white/[0.07] bg-white/[0.03] px-3 text-sm text-gray-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent px-3.5 py-2.5 text-sm text-white focus:outline-none"
        />
        {suffix && (
          <span className="flex items-center border-l border-white/[0.07] bg-white/[0.03] px-3 text-sm text-gray-500">
            {suffix}
          </span>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-gray-600">{hint}</p>}
    </div>
  )
}

function ResultRow({
  label,
  value,
  accent,
  large,
}: {
  label: string
  value: string
  accent?: string
  large?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={cn("font-semibold", large ? "text-lg" : "text-sm", accent ?? "text-white")}>
        {value}
      </span>
    </div>
  )
}

function RRBadge({ ratio }: { ratio: number }) {
  if (ratio >= 2)
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-400">
        <CheckCircle className="size-4 shrink-0" />
        R:R of {ratio.toFixed(2)} is excellent. This is a high-quality setup.
      </div>
    )
  if (ratio >= 1)
    return (
      <div className="flex items-center gap-2 rounded-xl bg-yellow-500/10 p-3 text-sm text-yellow-400">
        <Info className="size-4 shrink-0" />
        R:R of {ratio.toFixed(2)} is acceptable but consider improving your target.
      </div>
    )
  return (
    <div className="flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">
      <AlertTriangle className="size-4 shrink-0" />
      R:R of {ratio.toFixed(2)} is poor. The potential reward doesn&apos;t justify the risk.
    </div>
  )
}

export default function RiskCalculatorPage() {
  const { data: session } = useSession()
  useEffect(() => {
    if (session?.user?.id) markVisited(session.user.id, "visitedRiskCalc")
  }, [session?.user?.id])

  const [balance,    setBalance]    = useState("10000")
  const [riskPct,    setRiskPct]    = useState("2")
  const [entry,      setEntry]      = useState("68420")
  const [stopLoss,   setStopLoss]   = useState("62100")
  const [takeProfit, setTakeProfit] = useState("78500")

  const b  = parseFloat(balance)    || 0
  const r  = parseFloat(riskPct)    || 0
  const e  = parseFloat(entry)      || 0
  const sl = parseFloat(stopLoss)   || 0
  const tp = parseFloat(takeProfit) || 0

  const dollarRisk     = (b * r) / 100
  const priceDiff      = Math.abs(e - sl)
  const positionSize   = priceDiff > 0 ? dollarRisk / priceDiff : 0
  const positionValue  = positionSize * e
  const potentialProfit = tp > 0 ? Math.abs(tp - e) * positionSize : 0
  const rrRatio        = dollarRisk > 0 && tp > 0 ? potentialProfit / dollarRisk : 0

  const fmt = (n: number, dec = 2) =>
    n === 0 ? "—" : n.toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Risk Calculator</h1>
        <p className="mt-1 text-sm text-gray-500">
          Calculate your optimal position size to manage risk precisely.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-5 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/15">
              <DollarSign className="size-4 text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">Trade Parameters</h2>
          </div>

          <InputField
            label="Account Balance"
            value={balance}
            onChange={setBalance}
            prefix="$"
            hint="Your total trading capital"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Risk per trade: <span className="text-purple-400">{riskPct}%</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={5}
              step={0.5}
              value={riskPct}
              onChange={(e) => setRiskPct(e.target.value)}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-purple-500"
            />
            <div className="mt-1 flex justify-between text-[10px] text-gray-600">
              <span>0.5%</span><span>5%</span>
            </div>
          </div>

          <div className="border-t border-white/[0.07] pt-2" />

          <InputField
            label="Entry Price"
            value={entry}
            onChange={setEntry}
            prefix="$"
          />
          <InputField
            label="Stop Loss"
            value={stopLoss}
            onChange={setStopLoss}
            prefix="$"
            hint="Price where you'll exit if the trade goes against you"
          />
          <InputField
            label="Take Profit (optional)"
            value={takeProfit}
            onChange={setTakeProfit}
            prefix="$"
            hint="Leave blank to skip R:R calculation"
          />
        </div>

        {/* Results */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15">
                <TrendingUp className="size-4 text-emerald-400" />
              </div>
              <h2 className="text-sm font-semibold text-white">Position Calculation</h2>
            </div>

            <div className="divide-y divide-white/[0.05]">
              <ResultRow label="Dollar Risk"     value={dollarRisk > 0 ? `$${fmt(dollarRisk)}` : "—"} accent="text-red-400" />
              <ResultRow label="Position Size"   value={positionSize > 0 ? `${fmt(positionSize, 4)} units` : "—"} />
              <ResultRow label="Position Value"  value={positionValue > 0 ? `$${fmt(positionValue)}` : "—"} />
              <ResultRow
                label="Potential Profit"
                value={potentialProfit > 0 ? `$${fmt(potentialProfit)}` : "—"}
                accent={potentialProfit > 0 ? "text-emerald-400" : undefined}
              />
              <ResultRow
                label="Risk:Reward Ratio"
                value={rrRatio > 0 ? `${rrRatio.toFixed(2)}:1` : "—"}
                accent={rrRatio >= 2 ? "text-emerald-400" : rrRatio >= 1 ? "text-yellow-400" : "text-red-400"}
                large
              />
            </div>
          </div>

          {/* R:R feedback */}
          {rrRatio > 0 && (
            <RRBadge ratio={rrRatio} />
          )}

          {/* Risk summary card */}
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-600">Summary</p>
            <p className="text-sm leading-relaxed text-gray-400">
              Risking{" "}
              <span className="font-semibold text-purple-400">{r}%</span> of your{" "}
              <span className="font-semibold text-white">${fmt(b, 0)}</span> account equals{" "}
              <span className="font-semibold text-red-400">${fmt(dollarRisk)}</span> at risk.{" "}
              {positionSize > 0 && (
                <>
                  You can take a position of{" "}
                  <span className="font-semibold text-white">{fmt(positionSize, 4)} units</span>{" "}
                  (value: <span className="font-semibold text-white">${fmt(positionValue, 0)}</span>).
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
