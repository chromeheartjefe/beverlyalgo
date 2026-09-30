"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { Loader2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import { Collapse } from "@/components/ui/motion"
import { fetcher } from "@/lib/swr"
import type { TradeRow } from "@/lib/trades"

// Shared by Trade Journal and Trade Calendar. Both read and write the one
// "/api/trades" SWR cache entry, so a trade added, edited or deleted in either
// tab is reflected in the other (and on the Overview) without a refetch.

export const TRADES_KEY = "/api/trades"

export type TradeFormState = {
  date:      string
  pair:      string
  direction: "Buy" | "Sell"
  entry:     string
  exit:      string
  pnl:       string
}

// The viewer's local calendar day. toISOString() would give the UTC day, which
// is already "tomorrow" or "yesterday" for part of the day outside UTC.
function localToday(): string {
  const n = new Date()
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`
}

function emptyForm(date?: string): TradeFormState {
  return {
    date:      date ?? localToday(),
    pair:      "",
    direction: "Buy",
    entry:     "",
    exit:      "",
    pnl:       "",
  }
}

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"

// ─── Modal ────────────────────────────────────────────────────────────────────

export function TradeFormModal({
  open,
  onOpenChange,
  editing,
  defaultDate,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: TradeRow | null
  /** Pre-fills the date for a new trade (e.g. the day picked in the calendar). */
  defaultDate?: string
  onSubmit: (form: TradeFormState) => void
  submitting: boolean
  error: string | null
}) {
  const [form, setForm] = useState<TradeFormState>(() => emptyForm(defaultDate))
  const dateInputRef = useRef<HTMLInputElement>(null)
  const pairInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setForm(
      editing
        ? {
            date:      editing.date.slice(0, 10),
            pair:      editing.pair,
            direction: editing.direction,
            entry:     String(editing.entry),
            exit:      String(editing.exit),
            pnl:       String(editing.pnl),
          }
        : emptyForm(defaultDate)
    )
  }, [open, editing, defaultDate])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            // Date already chosen from the calendar → jump straight to the pair.
            if (!editing && defaultDate) pairInputRef.current?.focus()
            else dateInputRef.current?.focus()
          }}
          className="fixed left-1/2 top-1/2 z-[60] max-h-[85vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/25 bg-[#0d0d1c] p-5 shadow-2xl sm:p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-sm font-semibold text-white">
              {editing ? "Edit Trade" : "Add Trade"}
            </Dialog.Title>
            <Dialog.Close className="-mr-2 -mt-2 flex size-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-300">
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(form)
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="tradeDate" className="mb-1.5 block text-xs font-medium text-gray-400">Date</label>
                <input
                  ref={dateInputRef}
                  id="tradeDate"
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="tradeDirection" className="mb-1.5 block text-xs font-medium text-gray-400">Direction</label>
                <select
                  id="tradeDirection"
                  value={form.direction}
                  onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as "Buy" | "Sell" }))}
                  className={inputCls}
                >
                  <option value="Buy" className="bg-[#0d0d1c] text-white">Buy</option>
                  <option value="Sell" className="bg-[#0d0d1c] text-white">Sell</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tradePair" className="mb-1.5 block text-xs font-medium text-gray-400">Pair</label>
              <input
                ref={pairInputRef}
                id="tradePair"
                type="text"
                required
                placeholder="BTC/USDT"
                value={form.pair}
                onChange={(e) => setForm((f) => ({ ...f, pair: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor="tradeEntry" className="mb-1.5 block text-xs font-medium text-gray-400">Entry Price</label>
                <input
                  id="tradeEntry"
                  type="number"
                  step="any"
                  required
                  value={form.entry}
                  onChange={(e) => setForm((f) => ({ ...f, entry: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="tradeExit" className="mb-1.5 block text-xs font-medium text-gray-400">Exit Price</label>
                <input
                  id="tradeExit"
                  type="number"
                  step="any"
                  required
                  value={form.exit}
                  onChange={(e) => setForm((f) => ({ ...f, exit: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label htmlFor="tradePnl" className="mb-1.5 block text-xs font-medium text-gray-400">P&amp;L ($)</label>
              <input
                id="tradePnl"
                type="number"
                step="any"
                required
                value={form.pnl}
                onChange={(e) => setForm((f) => ({ ...f, pnl: e.target.value }))}
                className={inputCls}
              />
              <p className="mt-1.5 text-xs text-gray-600">
                Enter your realized P&amp;L from your broker/exchange. Positive for a win, negative for a loss.
              </p>
            </div>

            <Collapse show={!!error} className="pb-4">
              <p role="alert" className="text-xs text-red-400">{error}</p>
            </Collapse>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-400 disabled:opacity-60"
            >
              {submitting && <Loader2 className="size-3.5 animate-spin" />}
              {editing ? "Save Changes" : "Add Trade"}
            </button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Shared data + mutations ──────────────────────────────────────────────────

export function useTrades() {
  // Cached via SWR (shared with the Overview, Journal and Calendar) so
  // switching between those tabs shows already-fetched trades instantly.
  const { data, isLoading, mutate } = useSWR<TradeRow[]>(TRADES_KEY, fetcher)
  return { trades: data ?? [], loading: isLoading, mutate }
}

/**
 * Add/edit modal state plus optimistic, undoable delete — the exact same
 * behaviour wherever trades are managed.
 */
export function useTradeActions() {
  const { trades, mutate } = useTrades()

  const [modalOpen,   setModalOpen]   = useState(false)
  const [editing,     setEditing]     = useState<TradeRow | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)
  const [submitting,  setSubmitting]  = useState(false)
  const [formError,   setFormError]   = useState<string | null>(null)

  // Deletes are optimistic + undoable: the row disappears immediately and the
  // actual DELETE request only fires once the undo window (matching the toast
  // duration below) elapses without the user clicking "Undo".
  const pendingDeletesRef = useRef<Map<string, { trade: TradeRow; index: number; timer: ReturnType<typeof setTimeout> }>>(new Map())

  function openAdd(date?: string) {
    setEditing(null)
    setDefaultDate(date)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(t: TradeRow) {
    setEditing(t)
    setDefaultDate(undefined)
    setFormError(null)
    setModalOpen(true)
  }

  async function submit(form: TradeFormState) {
    const entry = parseFloat(form.entry)
    const exit  = parseFloat(form.exit)
    const pnl   = parseFloat(form.pnl)
    if (!form.pair.trim() || !form.date || Number.isNaN(entry) || Number.isNaN(exit) || Number.isNaN(pnl) || entry <= 0 || exit <= 0) {
      setFormError("Please fill in every field with valid values.")
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      const payload = { date: form.date, pair: form.pair.trim(), direction: form.direction, entry, exit, pnl }
      const res = await fetch(editing ? `${TRADES_KEY}/${editing.id}` : TRADES_KEY, {
        method:  editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Something went wrong.")
      }

      const saved: TradeRow = await res.json()
      mutate(
        (prev) => (editing ? (prev ?? []).map((t) => (t.id === saved.id ? saved : t)) : [saved, ...(prev ?? [])]),
        { revalidate: false }
      )
      setModalOpen(false)
      toast.success(editing ? "Trade updated" : "Trade added")
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSubmitting(false)
    }
  }

  function commitDelete(id: string) {
    if (!pendingDeletesRef.current.delete(id)) return
    fetch(`${TRADES_KEY}/${id}`, { method: "DELETE" }).catch(() => {})
  }

  function remove(trade: TradeRow) {
    const index = trades.findIndex((t) => t.id === trade.id)
    mutate((prev) => (prev ?? []).filter((t) => t.id !== trade.id), { revalidate: false })

    const timer = setTimeout(() => commitDelete(trade.id), 5000)
    pendingDeletesRef.current.set(trade.id, { trade, index, timer })

    toast(`Deleted ${trade.pair} trade`, {
      duration: 5000,
      action: {
        label: "Undo",
        onClick: () => {
          const pending = pendingDeletesRef.current.get(trade.id)
          if (!pending) return
          clearTimeout(pending.timer)
          pendingDeletesRef.current.delete(trade.id)
          mutate((prev) => {
            const next = [...(prev ?? [])]
            next.splice(Math.min(pending.index, next.length), 0, pending.trade)
            return next
          }, { revalidate: false })
        },
      },
    })
  }

  const modal = (
    <TradeFormModal
      open={modalOpen}
      onOpenChange={setModalOpen}
      editing={editing}
      defaultDate={defaultDate}
      onSubmit={submit}
      submitting={submitting}
      error={formError}
    />
  )

  return { openAdd, openEdit, remove, modal }
}
