"use client"

import { ChevronDown, ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Sparkles, Trash2, X } from "lucide-react"
import { useState, useTransition } from "react"

import { createIdea, removeIdea, runIdeaReview, updateIdea } from "~/app/ai-actions"
import { cx } from "~/components/ui"
import type { Idea, IdeaStatus } from "~/lib/ideas"

// Ideas board. Moving uses buttons and a select (no drag-only controls), so
// it works from the keyboard too.

const COLUMNS: { id: IdeaStatus; label: string; dot: string; ring: string }[] = [
  { id: "inbox",     label: "Inbox",     dot: "bg-gray-400",    ring: "border-white/[0.09]" },
  { id: "exploring", label: "Exploring", dot: "bg-sky-400",     ring: "border-sky-400/20" },
  { id: "planned",   label: "Planned",   dot: "bg-violet-400",  ring: "border-violet-400/20" },
  { id: "building",  label: "Building",  dot: "bg-amber-400",   ring: "border-amber-400/20" },
  { id: "shipped",   label: "Shipped",   dot: "bg-emerald-400", ring: "border-emerald-400/20" },
]
const ORDER: IdeaStatus[] = ["inbox", "exploring", "planned", "building", "shipped"]
const CATEGORIES = ["Growth", "Product", "Marketing", "Revenue", "Ops"] as const

const CAT_CLS: Record<string, string> = {
  Growth:    "border-sky-400/30 bg-sky-500/10 text-sky-300",
  Product:   "border-violet-400/30 bg-violet-500/10 text-violet-300",
  Marketing: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300",
  Revenue:   "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  Ops:       "border-amber-400/30 bg-amber-500/10 text-amber-300",
}
const VERDICT_CLS: Record<string, string> = {
  "do it":       "bg-emerald-500/15 text-emerald-300",
  "test it":     "bg-sky-500/15 text-sky-300",
  "maybe later": "bg-amber-500/15 text-amber-300",
  skip:          "bg-rose-500/15 text-rose-300",
}

/** Founder's own priority: impact counts double, effort counts against */
const priority = (i: Idea) => i.impact * 2 - i.effort
const priorityLabel = (p: number) => (p >= 4 ? ["High", "text-emerald-300"] : p >= 2 ? ["Medium", "text-amber-300"] : ["Low", "text-gray-400"]) as [string, string]

function Scale({ label, value, onChange }: { label: string; value: number; onChange: (v: 1 | 2 | 3) => void }) {
  return (
    <div>
      <p className="mb-1 text-[11px] text-gray-400">{label}</p>
      <div className="inline-flex rounded-lg border border-white/[0.1] bg-black/30 p-0.5" role="radiogroup" aria-label={label}>
        {([1, 2, 3] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={value === v}
            onClick={() => onChange(v)}
            className={cx("cursor-pointer rounded-md px-2.5 py-1 text-xs transition-colors", value === v ? "bg-white/[0.12] text-white" : "text-gray-500 hover:text-gray-200")}
          >
            {v === 1 ? "Low" : v === 2 ? "Med" : "High"}
          </button>
        ))}
      </div>
    </div>
  )
}

const INPUT = "w-full rounded-lg border border-white/[0.1] bg-black/30 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-amber-400/40 focus:outline-none"

function IdeaForm({ initial, onDone, submitLabel }: { initial?: Idea; onDone: () => void; submitLabel: string }) {
  const [title, setTitle] = useState(initial?.title ?? "")
  const [details, setDetails] = useState(initial?.details ?? "")
  const [category, setCategory] = useState<string>(initial?.category ?? "Growth")
  const [impact, setImpact] = useState<1 | 2 | 3>(initial?.impact ?? 2)
  const [effort, setEffort] = useState<1 | 2 | 3>(initial?.effort ?? 2)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        start(async () => {
          const r = initial
            ? await updateIdea(initial.id, { title, details, category, impact, effort })
            : await createIdea({ title, details, category, impact, effort })
          if (r.ok) onDone()
          else setError(r.message ?? "Couldn't save.")
        })
      }}
      className="space-y-3"
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Idea in a few words" maxLength={160} className={INPUT} aria-label="Title" autoFocus />
      <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Details, why it matters, anything you know so far" rows={3} maxLength={4000} className={cx(INPUT, "resize-y")} aria-label="Details" />
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <p className="mb-1 text-[11px] text-gray-400">Area</p>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-white/[0.1] bg-black/30 px-2.5 py-1.5 text-sm text-gray-200" aria-label="Area">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <Scale label="Impact" value={impact} onChange={setImpact} />
        <Scale label="Effort" value={effort} onChange={setEffort} />
        <div className="ml-auto flex items-center gap-2">
          {error && <span className="text-xs text-rose-300">{error}</span>}
          <button type="button" onClick={onDone} className="cursor-pointer rounded-lg px-3 py-1.5 text-sm text-gray-400 hover:text-white">Cancel</button>
          <button
            type="submit"
            disabled={pending || title.trim().length < 3}
            className="cursor-pointer rounded-lg bg-amber-500 px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending ? "Saving…" : submitLabel}
          </button>
        </div>
      </div>
    </form>
  )
}

function IdeaCard({ idea, aiReady }: { idea: Idea; aiReady: boolean }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [armed, setArmed] = useState(false)
  const [pending, start] = useTransition()
  const [reviewing, startReview] = useTransition()
  const [msg, setMsg] = useState<string | null>(null)
  const p = priority(idea)
  const [pl, pc] = priorityLabel(p)
  const idx = ORDER.indexOf(idea.status)
  const move = (status: IdeaStatus) =>
    start(async () => {
      const r = await updateIdea(idea.id, { status })
      if (!r.ok) setMsg(r.message)
    })

  if (editing) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-surface p-3">
        <IdeaForm initial={idea} onDone={() => setEditing(false)} submitLabel="Save" />
      </div>
    )
  }

  return (
    <div className={cx("rounded-xl border border-white/[0.08] bg-surface/90 transition-colors hover:border-white/[0.16]", pending && "opacity-60")}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="w-full cursor-pointer p-3 text-left">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cx("rounded-full border px-1.5 py-px text-[10px] font-medium", CAT_CLS[idea.category])}>{idea.category}</span>
          {idea.source === "ai" && <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-500/10 px-1.5 py-px text-[10px] font-medium text-fuchsia-300">AI</span>}
          {idea.review && <span className={cx("rounded-full px-1.5 py-px text-[10px] font-semibold", VERDICT_CLS[idea.review.verdict])}>{idea.review.verdict} · {idea.review.score}/10</span>}
          <ChevronDown className={cx("ml-auto size-3.5 text-gray-500 transition-transform", open && "rotate-180")} aria-hidden />
        </div>
        <p className="mt-2 text-sm font-medium leading-snug text-white">{idea.title}</p>
        <p className="mt-1.5 text-[11px] text-gray-500">
          Priority <span className={cx("font-semibold", pc)}>{pl}</span> · impact {idea.impact}/3 · effort {idea.effort}/3
        </p>
      </button>

      {open && (
        <div className="space-y-3 border-t border-white/[0.06] p-3 pt-2.5">
          {idea.details && <p className="whitespace-pre-line text-xs leading-relaxed text-gray-300">{idea.details}</p>}

          {idea.review && (
            <div className="rounded-lg border border-fuchsia-400/20 bg-fuchsia-500/[0.05] p-2.5 text-xs">
              <p className="font-semibold text-fuchsia-200">AI review</p>
              <p className="mt-1 leading-relaxed text-gray-300">{idea.review.summary}</p>
              {idea.review.pros.length > 0 && <p className="mt-1.5 text-emerald-300/90">+ {idea.review.pros.join(" · ")}</p>}
              {idea.review.cons.length > 0 && <p className="mt-1 text-rose-300/90">− {idea.review.cons.join(" · ")}</p>}
              {idea.review.steps.length > 0 && (
                <ol className="mt-1.5 list-decimal space-y-0.5 pl-4 text-gray-300">
                  {idea.review.steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              )}
              {idea.review.metric && <p className="mt-1.5 text-gray-400">Measure: <span className="text-white">{idea.review.metric}</span></p>}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" disabled={idx <= 0 || pending} onClick={() => move(ORDER[idx - 1])} aria-label="Move left" className="cursor-pointer rounded-md border border-white/[0.1] p-1 text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronLeft className="size-3.5" />
            </button>
            <select
              value={idea.status}
              onChange={(e) => move(e.target.value as IdeaStatus)}
              className="rounded-md border border-white/[0.1] bg-black/30 px-1.5 py-1 text-xs text-gray-200"
              aria-label="Status"
            >
              {[...COLUMNS.map((c) => c.id), "parked" as const].map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
            </select>
            <button type="button" disabled={idx < 0 || idx >= ORDER.length - 1 || pending} onClick={() => move(ORDER[idx + 1])} aria-label="Move right" className="cursor-pointer rounded-md border border-white/[0.1] p-1 text-gray-400 hover:text-white disabled:opacity-30">
              <ChevronRight className="size-3.5" />
            </button>
            <span className="flex-1" />
            {aiReady && (
              <button
                type="button"
                disabled={reviewing}
                onClick={() => startReview(async () => setMsg((await runIdeaReview(idea.id)).message ?? null))}
                className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-fuchsia-400/30 bg-fuchsia-500/10 px-2 py-1 text-xs text-fuchsia-200 hover:bg-fuchsia-500/20 disabled:opacity-60"
              >
                {reviewing ? <Loader2 className="size-3 animate-spin" aria-hidden /> : <Sparkles className="size-3" aria-hidden />}
                {idea.review ? "Re-review" : "AI review"}
              </button>
            )}
            <button type="button" onClick={() => setEditing(true)} aria-label="Edit" className="cursor-pointer rounded-md border border-white/[0.1] p-1 text-gray-400 hover:text-white">
              <Pencil className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (!armed) {
                  setArmed(true)
                  setTimeout(() => setArmed(false), 4000)
                  return
                }
                start(async () => {
                  const r = await removeIdea(idea.id)
                  if (!r.ok) setMsg(r.message)
                })
              }}
              aria-label={armed ? "Confirm delete" : "Delete"}
              className={cx("inline-flex cursor-pointer items-center gap-1 rounded-md border p-1 text-xs", armed ? "border-rose-400/50 bg-rose-500/20 px-2 text-rose-100" : "border-white/[0.1] text-gray-400 hover:text-rose-300")}
            >
              <Trash2 className="size-3.5" />
              {armed && "Delete?"}
            </button>
          </div>
          {msg && <p className="text-xs text-gray-400">{msg}</p>}
        </div>
      )}
    </div>
  )
}

export function IdeaBoard({ ideas, aiReady }: { ideas: Idea[]; aiReady: boolean }) {
  const [adding, setAdding] = useState(false)
  const [showParked, setShowParked] = useState(false)
  const sorted = [...ideas].sort((a, b) => (b.review?.score ?? 0) - (a.review?.score ?? 0) || priority(b) - priority(a))
  const parked = sorted.filter((i) => i.status === "parked")

  return (
    <div className="space-y-5">
      {adding ? (
        <div className="rounded-2xl border border-amber-400/25 bg-surface/80 p-4">
          <IdeaForm onDone={() => setAdding(false)} submitLabel="Add idea" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-amber-400/30 bg-amber-500/[0.04] py-3 text-sm font-medium text-amber-200 transition-colors hover:border-amber-400/50 hover:bg-amber-500/[0.08]"
        >
          <Plus className="size-4" aria-hidden /> New idea
        </button>
      )}

      <div className="grid gap-3 overflow-x-auto md:grid-cols-2 xl:grid-cols-5">
        {COLUMNS.map((col) => {
          const items = sorted.filter((i) => i.status === col.id)
          return (
            <section key={col.id} className={cx("flex min-h-40 flex-col rounded-2xl border bg-white/[0.015] p-2.5", col.ring)} aria-label={col.label}>
              <header className="mb-2.5 flex items-center gap-2 px-1">
                <span className={cx("size-2 rounded-full", col.dot)} aria-hidden />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-300">{col.label}</h2>
                <span className="num ml-auto text-xs text-gray-500">{items.length}</span>
              </header>
              <div className="space-y-2">
                {items.map((i) => <IdeaCard key={i.id} idea={i} aiReady={aiReady} />)}
                {items.length === 0 && <p className="px-1 py-4 text-center text-xs text-gray-600">Empty</p>}
              </div>
            </section>
          )
        })}
      </div>

      {parked.length > 0 && (
        <div>
          <button type="button" onClick={() => setShowParked((s) => !s)} className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-gray-400 hover:text-white">
            {showParked ? <X className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            Parked ({parked.length})
          </button>
          {showParked && (
            <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              {parked.map((i) => <IdeaCard key={i.id} idea={i} aiReady={aiReady} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
