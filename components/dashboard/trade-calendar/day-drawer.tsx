"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { ArrowDown, ArrowUp, BookOpen, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { TradeRow } from "@/lib/trades"
import { cn } from "@/lib/utils"

import { AnimatedMoney } from "./parts"
import { type DayStat,fmtMoney, formatLongDate, formatShortDate, pnlText } from "./utils"

function useIsDesktop() {
  const [desktop, setDesktop] = useState(true)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)")
    const update = () => setDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  return desktop
}

const iconBtn =
  "flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"

export function DayDrawer({ dayKey, stat, onClose, onStep, onAdd, onEdit, onDelete }: {
  dayKey: string | null
  stat: DayStat | undefined
  onClose: () => void
  onStep: (dir: 1 | -1) => void
  onAdd: (key: string) => void
  onEdit: (t: TradeRow) => void
  onDelete: (t: TradeRow) => void
}) {
  const desktop = useIsDesktop()
  const reduce = useReducedMotion()
  const open = dayKey !== null

  // Keep the last day on screen while the panel animates out
  const [shownKey, setShownKey] = useState(dayKey)
  useEffect(() => {
    if (dayKey) setShownKey(dayKey)
  }, [dayKey])

  const panel = desktop
    ? { initial: { x: "100%" }, animate: { x: 0 }, exit: { x: "100%" } }
    : { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "100%" } }

  const trades = stat?.trades ?? []
  const winRate = stat && stat.count ? Math.round((stat.wins / stat.count) * 100) : null

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <AnimatePresence>
        {open && shownKey && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content
              asChild
              forceMount
              // Clicking "Undo" on a delete toast shouldn't close the drawer
              onInteractOutside={(e) => {
                if ((e.target as HTMLElement | null)?.closest?.("[data-sonner-toaster]")) e.preventDefault()
              }}
              onKeyDown={(e) => {
                if (e.target instanceof HTMLInputElement) return
                if (e.key === "ArrowLeft")  onStep(-1)
                if (e.key === "ArrowRight") onStep(1)
              }}
            >
              <motion.div
                {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : panel)}
                transition={{ type: "spring", stiffness: 380, damping: 38 }}
                className={cn(
                  "fixed z-50 flex flex-col border-white/15 bg-[#0b0b18] shadow-2xl outline-none",
                  desktop
                    ? "inset-y-0 right-0 w-[420px] max-w-[92vw] border-l"
                    : "inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t",
                )}
              >
                {!desktop && <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" aria-hidden="true" />}

                {/* Header */}
                <div className="flex items-center gap-1 border-b border-white/15 px-4 py-3 sm:px-5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onStep(-1)} className={iconBtn} aria-label="Previous day">
                        <ChevronLeft className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Previous day</TooltipContent>
                  </Tooltip>
                  <div className="min-w-0 flex-1 text-center">
                    <Dialog.Title className="truncate text-sm font-semibold text-white">{formatLongDate(shownKey)}</Dialog.Title>
                    <Dialog.Description className="sr-only">Trades logged on this day</Dialog.Description>
                  </div>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => onStep(1)} className={iconBtn} aria-label="Next day">
                        <ChevronRight className="size-4" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Next day</TooltipContent>
                  </Tooltip>
                  <Dialog.Close className={cn(iconBtn, "ml-1")}>
                    <X className="size-4" />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
                  {/* Day summary */}
                  <div className="relative overflow-hidden rounded-2xl border border-white/25 bg-[#070712] p-4">
                    <div
                      className={cn(
                        "pointer-events-none absolute -right-16 -top-20 size-48 rounded-full blur-3xl",
                        !stat ? "bg-white/[0.03]" : stat.pnl >= 0 ? "bg-emerald-500/15" : "bg-rose-500/15",
                      )}
                    />
                    <p className="relative text-xs text-gray-500">Day P&amp;L</p>
                    <p className={cn("relative mt-1 text-3xl font-bold", stat ? pnlText(stat.pnl) : "text-gray-600")}>
                      {stat ? <AnimatedMoney value={stat.pnl} /> : "$0.00"}
                    </p>
                    <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
                      {[
                        { label: "Trades", value: stat?.count ?? 0 },
                        { label: "Wins / losses", value: stat ? `${stat.wins} / ${stat.losses}` : "0 / 0" },
                        { label: "Win rate", value: winRate === null ? "–" : `${winRate}%` },
                      ].map((x) => (
                        <div key={x.label} className="rounded-lg bg-white/[0.03] px-2 py-2">
                          <p className="text-sm font-semibold text-white tabular-nums">{x.value}</p>
                          <p className="text-[11px] text-gray-500">{x.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trades */}
                  <div className="mt-5">
                    <h3 className="mb-2 text-sm font-semibold text-white">Trades</h3>
                    {trades.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-white/20 px-4 py-8 text-center">
                        <p className="text-sm text-gray-400">No trades on {formatShortDate(shownKey)}.</p>
                        <p className="mt-1 text-xs text-gray-600">Add one and it will show up here and in your Trade Journal.</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        <AnimatePresence initial={false}>
                          {trades.map((t) => (
                            <motion.li
                              key={t.id}
                              layout={!reduce}
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: 24, transition: { duration: 0.18 } }}
                              className="group flex items-center gap-3 rounded-xl border border-white/15 bg-white/[0.02] px-3 py-2.5"
                            >
                              <span
                                className={cn(
                                  "inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                                  t.direction === "Buy" ? "bg-emerald-500/10 text-emerald-300" : "bg-rose-500/10 text-rose-300",
                                )}
                              >
                                {t.direction === "Buy" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                                {t.direction}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-mono text-sm font-semibold text-white">{t.pair}</p>
                                <p className="truncate text-[11px] text-gray-500 tabular-nums">
                                  {t.entry.toLocaleString(undefined, { maximumFractionDigits: 8 })} to {t.exit.toLocaleString(undefined, { maximumFractionDigits: 8 })}
                                </p>
                              </div>
                              <span className={cn("text-sm font-semibold tabular-nums", pnlText(t.pnl))}>{fmtMoney(t.pnl, { signed: true })}</span>
                              <div className="flex items-center">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button onClick={() => onEdit(t)} aria-label={`Edit ${t.pair} trade`} className={cn(iconBtn, "size-8")}>
                                      <Pencil className="size-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit trade</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      onClick={() => onDelete(t)}
                                      aria-label={`Delete ${t.pair} trade`}
                                      className={cn(iconBtn, "size-8 hover:bg-rose-500/10 hover:text-rose-400")}
                                    >
                                      <Trash2 className="size-3.5" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete trade</TooltipContent>
                                </Tooltip>
                              </div>
                            </motion.li>
                          ))}
                        </AnimatePresence>
                      </ul>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-2 border-t border-white/15 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5">
                  <Link
                    href="/dashboard/trade-journal"
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06]"
                  >
                    <BookOpen className="size-4" />
                    Journal
                  </Link>
                  <button
                    onClick={() => onAdd(shownKey)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
                  >
                    <Plus className="size-4" />
                    Add trade on {formatShortDate(shownKey)}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
