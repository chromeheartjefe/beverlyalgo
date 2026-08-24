"use client"

import * as Dialog from "@radix-ui/react-dialog"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  Download,
  Loader2,
  Pencil,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { tradeResult, type TradeRow } from "@/lib/trades"
import { cn } from "@/lib/utils"

type SortKey = "date" | "pair" | "pnl"

type FilterType = "all" | "wins" | "losses"

type FormState = {
  date:      string
  pair:      string
  direction: "Buy" | "Sell"
  entry:     string
  exit:      string
  pnl:       string
}

const EMPTY_FORM: FormState = {
  date:      new Date().toISOString().slice(0, 10),
  pair:      "",
  direction: "Buy",
  entry:     "",
  exit:      "",
  pnl:       "",
}

function fmt(n: number, prefix = "") {
  return `${prefix}${Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

// ─── Add/Edit modal ────────────────────────────────────────────────────────────

function TradeFormModal({
  open,
  onOpenChange,
  editing,
  onSubmit,
  submitting,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing: TradeRow | null
  onSubmit: (form: FormState) => void
  submitting: boolean
  error: string | null
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const dateInputRef = useRef<HTMLInputElement>(null)

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
        : EMPTY_FORM
    )
  }, [open, editing])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault()
            dateInputRef.current?.focus()
          }}
          className="fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#0d0d1c] p-5 shadow-2xl sm:p-6"
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
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
              <div>
                <label htmlFor="tradeDirection" className="mb-1.5 block text-xs font-medium text-gray-400">Direction</label>
                <select
                  id="tradeDirection"
                  value={form.direction}
                  onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value as "Buy" | "Sell" }))}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                >
                  <option value="Buy" className="bg-[#0d0d1c] text-white">Buy</option>
                  <option value="Sell" className="bg-[#0d0d1c] text-white">Sell</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="tradePair" className="mb-1.5 block text-xs font-medium text-gray-400">Pair</label>
              <input
                id="tradePair"
                type="text"
                required
                placeholder="BTC/USDT"
                value={form.pair}
                onChange={(e) => setForm((f) => ({ ...f, pair: e.target.value }))}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
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
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
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
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
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
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <p className="mt-1.5 text-xs text-gray-600">
                Enter your realized P&amp;L from your broker/exchange — positive for a win, negative for a loss.
              </p>
            </div>

            {error && <p role="alert" className="text-xs text-red-400">{error}</p>}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TradeJournalPage() {
  const [trades,  setTrades]  = useState<TradeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<FilterType>("all")
  const [search,  setSearch]  = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing,   setEditing]   = useState<TradeRow | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError]   = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmingBulkDelete, setConfirmingBulkDelete] = useState(false)
  const [bulkDeleting, setBulkDeleting] = useState(false)
  const selectAllRef = useRef<HTMLInputElement>(null)

  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc")

  // Deletes are optimistic + undoable: the row disappears immediately and the
  // actual DELETE request only fires once the undo window (matching the toast
  // duration below) elapses without the user clicking "Undo".
  const pendingDeletesRef = useRef<Map<string, { trade: TradeRow; index: number; timer: ReturnType<typeof setTimeout> }>>(new Map())

  useEffect(() => {
    fetch("/api/trades")
      .then((r) => r.json())
      .then((data) => setTrades(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = trades.filter((t) => {
    if (search.trim() && !t.pair.toLowerCase().includes(search.trim().toLowerCase())) return false
    const result = tradeResult(t.pnl)
    if (filter === "wins")   return result === "Win"
    if (filter === "losses") return result === "Loss"
    return true
  })

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const dir = sortDir === "asc" ? 1 : -1
    return [...filtered].sort((a, b) => {
      if (sortKey === "date") return (new Date(a.date).getTime() - new Date(b.date).getTime()) * dir
      if (sortKey === "pair") return a.pair.localeCompare(b.pair) * dir
      return (a.pnl - b.pnl) * dir
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, sortKey, sortDir])

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir(key === "pair" ? "asc" : "desc")
    }
  }

  const totals = trades.reduce(
    (acc, t) => {
      acc.pnl += t.pnl
      if (tradeResult(t.pnl) === "Win") acc.wins += 1
      return acc
    },
    { pnl: 0, wins: 0 }
  )
  const winRate = trades.length > 0 ? Math.round((totals.wins / trades.length) * 100) : 0

  const allFilteredSelected  = filtered.length > 0 && filtered.every((t) => selected.has(t.id))
  const someFilteredSelected = filtered.some((t) => selected.has(t.id))

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someFilteredSelected && !allFilteredSelected
    }
  }, [someFilteredSelected, allFilteredSelected])

  // Filtering (wins/losses/all) can hide previously-selected rows — drop any
  // selected id that's no longer in the current filter so "N selected" and
  // the bulk-delete action never silently include an invisible row.
  useEffect(() => {
    setSelected((prev) => {
      const visible = new Set(filtered.map((t) => t.id))
      const next = new Set([...prev].filter((id) => visible.has(id)))
      return next.size === prev.size ? prev : next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllFiltered() {
    setSelected((prev) => {
      if (allFilteredSelected) {
        const next = new Set(prev)
        filtered.forEach((t) => next.delete(t.id))
        return next
      }
      const next = new Set(prev)
      filtered.forEach((t) => next.add(t.id))
      return next
    })
  }

  async function handleBulkDelete() {
    const ids = Array.from(selected)
    setBulkDeleting(true)
    try {
      const results = await Promise.all(
        ids.map((id) =>
          fetch(`/api/trades/${id}`, { method: "DELETE" })
            .then((r) => ({ id, ok: r.ok }))
            .catch(() => ({ id, ok: false }))
        )
      )
      const deletedIds = new Set(results.filter((r) => r.ok).map((r) => r.id))
      setTrades((prev) => prev.filter((t) => !deletedIds.has(t.id)))
      setSelected((prev) => {
        const next = new Set(prev)
        deletedIds.forEach((id) => next.delete(id))
        return next
      })
      if (deletedIds.size > 0) {
        toast.success(`${deletedIds.size} trade${deletedIds.size === 1 ? "" : "s"} deleted`)
      }
      if (deletedIds.size < ids.length) {
        toast.error("Some trades could not be deleted. Please try again.")
      }
    } finally {
      setBulkDeleting(false)
      setConfirmingBulkDelete(false)
    }
  }

  function exportCsv() {
    const header = ["Date", "Pair", "Direction", "Entry", "Exit", "P&L", "Result"]
    const rows = sorted.map((t) => [
      t.date.slice(0, 10),
      t.pair,
      t.direction,
      t.entry,
      t.exit,
      t.pnl,
      tradeResult(t.pnl),
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\r\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement("a")
    a.href = url
    a.download = `trade-journal-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Trade journal exported")
  }

  function openAdd() {
    setEditing(null)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(t: TradeRow) {
    setEditing(t)
    setFormError(null)
    setModalOpen(true)
  }

  async function handleSubmit(form: FormState) {
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
      const res = editing
        ? await fetch(`/api/trades/${editing.id}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload),
          })
        : await fetch("/api/trades", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(payload),
          })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? "Something went wrong.")
      }

      const saved: TradeRow = await res.json()
      setTrades((prev) =>
        editing ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev]
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
    fetch(`/api/trades/${id}`, { method: "DELETE" }).catch(() => {})
  }

  function handleDelete(trade: TradeRow) {
    setConfirmDeleteId(null)
    const index = trades.findIndex((t) => t.id === trade.id)
    setTrades((prev) => prev.filter((t) => t.id !== trade.id))

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
          setTrades((prev) => {
            const next = [...prev]
            next.splice(Math.min(pending.index, next.length), 0, pending.trade)
            return next
          })
        },
      },
    })
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Trade Journal</h1>
        <p className="mt-1 text-sm text-gray-500">Your complete trading history and performance log.</p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {selected.size > 0 ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/[0.06] px-4 py-2.5">
            <span className="text-sm font-medium text-gray-300">
              {selected.size} trade{selected.size === 1 ? "" : "s"} selected
            </span>
            {confirmingBulkDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Delete permanently?</span>
                <button
                  onClick={handleBulkDelete}
                  disabled={bulkDeleting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
                >
                  {bulkDeleting && <Loader2 className="size-3 animate-spin" />}
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmingBulkDelete(false)}
                  disabled={bulkDeleting}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingBulkDelete(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="size-3.5" />
                Delete selected
              </button>
            )}
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-gray-500 transition-colors hover:text-gray-300"
            >
              Clear selection
            </button>
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={trades.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-4" />
            Export CSV
          </button>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-400"
          >
            + Add Trade
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Trades",
            value: trades.length.toString(),
            icon: Trophy,
            color: "text-violet-400",
            bg: "bg-violet-500/[0.12]",
          },
          {
            label: "Win Rate",
            value: trades.length > 0 ? `${winRate}%` : "—",
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/[0.12]",
          },
          {
            label: "Net P&L",
            value: trades.length > 0 ? `${totals.pnl >= 0 ? "+" : "-"}$${fmt(totals.pnl)}` : "—",
            icon: totals.pnl >= 0 ? TrendingUp : TrendingDown,
            color: totals.pnl >= 0 ? "text-emerald-400" : "text-red-400",
            bg: totals.pnl >= 0 ? "bg-emerald-500/[0.12]" : "bg-red-500/[0.12]",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", bg)}>
              <Icon className={cn("size-5", color)} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className={cn("text-xl font-bold", color)}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.03] p-1 w-fit">
          {(["all", "wins", "losses"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all",
                filter === f
                  ? "bg-purple-500/[0.15] text-purple-400"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by pair..."
            aria-label="Search trades by pair"
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-sm">
            <thead>
              <tr className="border-b border-white/[0.07]">
                <th className="w-11 px-5 py-3.5">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleAllFiltered}
                    disabled={filtered.length === 0}
                    aria-label="Select all trades"
                    className="size-4 rounded border-white/20 bg-white/[0.04] accent-purple-500"
                  />
                </th>
                {([
                  { label: "Date", key: "date" as const },
                  { label: "Pair", key: "pair" as const },
                  { label: "Direction", key: null },
                  { label: "Entry", key: null },
                  { label: "Exit", key: null },
                  { label: "P&L", key: "pnl" as const },
                  { label: "Result", key: null },
                  { label: "", key: null },
                ]).map(({ label, key }) => (
                  <th
                    key={label || "actions"}
                    className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-widest text-gray-600"
                  >
                    {key ? (
                      <button
                        onClick={() => toggleSort(key)}
                        className={cn(
                          "inline-flex items-center gap-1 transition-colors hover:text-gray-300",
                          sortKey === key && "text-purple-400"
                        )}
                      >
                        {label}
                        {sortKey === key ? (
                          sortDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
                        ) : (
                          <ArrowUpDown className="size-3 opacity-40" />
                        )}
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sorted.map((trade) => {
                const { pnl } = trade
                const result = tradeResult(pnl)
                return (
                  <tr
                    key={trade.id}
                    className={cn(
                      "transition-colors hover:bg-white/[0.025]",
                      selected.has(trade.id) && "bg-purple-500/[0.04]"
                    )}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selected.has(trade.id)}
                        onChange={() => toggleOne(trade.id)}
                        aria-label={`Select ${trade.pair} trade`}
                        className="size-4 rounded border-white/20 bg-white/[0.04] accent-purple-500"
                      />
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-400">{trade.date.slice(0, 10)}</td>
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-white">{trade.pair}</td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold",
                          trade.direction === "Buy"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {trade.direction === "Buy" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                        {trade.direction}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-sm text-gray-300">${fmt(trade.entry)}</td>
                    <td className="px-5 py-4 font-mono text-sm text-gray-300">${fmt(trade.exit)}</td>
                    <td className="px-5 py-4">
                      <div className={cn("font-semibold", pnl >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {pnl >= 0 ? "+" : "-"}${fmt(pnl)}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                          result === "Win"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        )}
                      >
                        {result}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {confirmDeleteId === trade.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="text-xs text-gray-500">Delete?</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleDelete(trade)}
                                aria-label={`Confirm delete ${trade.pair} trade`}
                                className="rounded-lg p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/10"
                              >
                                <Check className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Confirm delete</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                aria-label="Cancel delete"
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
                              >
                                <X className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Cancel</TooltipContent>
                          </Tooltip>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => openEdit(trade)}
                                aria-label={`Edit ${trade.pair} trade`}
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
                              >
                                <Pencil className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Edit trade</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setConfirmDeleteId(trade.id)}
                                aria-label={`Delete ${trade.pair} trade`}
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Delete trade</TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length === 0 && trades.length > 0 && (
          <p className="py-12 text-center text-sm text-gray-600">No trades match this filter.</p>
        )}
        {!loading && trades.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-14 text-center">
            <p className="text-sm text-gray-500">No trades logged yet.</p>
            <p className="text-xs text-gray-700">Add your first trade to start tracking performance.</p>
            <button
              onClick={openAdd}
              className="mt-1 inline-flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-purple-400"
            >
              + Add Trade
            </button>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-14 text-sm text-gray-600">
            <Loader2 className="size-4 animate-spin" />
            Loading trades…
          </div>
        )}
      </div>

      <TradeFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={formError}
      />
    </div>
  )
}
