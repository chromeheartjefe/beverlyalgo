"use client"

import { ArrowRight, Loader2, Send, Sparkles } from "lucide-react"
import { useState, useTransition } from "react"

import { type AiResult, runBriefing, runIdeaSuggestions, runQuestion, saveActionAsIdea } from "~/app/ai-actions"
import { cx } from "~/components/ui"

const BUTTON = {
  fuchsia: "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-600/40 to-violet-600/40 text-white hover:from-fuchsia-600/55 hover:to-violet-600/55 shadow-[0_0_24px_rgba(217,70,239,0.25)]",
  amber: "border-amber-400/40 bg-amber-500/15 text-amber-100 hover:bg-amber-500/25",
} as const

function RunButton({ label, busyLabel, action, tone = "fuchsia" }: { label: string; busyLabel: string; action: () => Promise<AiResult>; tone?: keyof typeof BUTTON }) {
  const [pending, start] = useTransition()
  const [result, setResult] = useState<AiResult | null>(null)
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => setResult(await action()))}
        className={cx("inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-70", BUTTON[tone])}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Sparkles className="size-4" aria-hidden />}
        {pending ? busyLabel : label}
      </button>
      <p aria-live="polite" className={cx("min-h-4 text-xs", result?.ok === false ? "text-rose-300" : "text-gray-500")}>
        {result?.message ?? ""}
      </p>
    </div>
  )
}

export function BriefingButton({ hasBriefing }: { hasBriefing: boolean }) {
  return <RunButton label={hasBriefing ? "New briefing" : "Generate briefing"} busyLabel="Analyzing your numbers…" action={runBriefing} />
}

export function SuggestIdeasButton() {
  return <RunButton label="Suggest 3 ideas" busyLabel="Thinking…" action={runIdeaSuggestions} tone="amber" />
}

export function AskBox({ suggestions }: { suggestions: string[] }) {
  const [q, setQ] = useState("")
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const send = (text: string) =>
    start(async () => {
      setError(null)
      const r = await runQuestion(text)
      if (r.ok) setQ("")
      else setError(r.message)
    })
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(q)
        }}
        className="flex items-center gap-2 rounded-xl border border-white/[0.1] bg-black/30 p-1.5 focus-within:border-fuchsia-400/40"
      >
        <label htmlFor="ask" className="sr-only">Ask about your business</label>
        <input
          id="ask"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          maxLength={500}
          placeholder="Ask anything about your numbers…"
          className="min-w-0 flex-1 bg-transparent px-2.5 py-1.5 text-sm text-white placeholder:text-gray-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || q.trim().length < 4}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-fuchsia-500/80 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
          Ask
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() => send(s)}
            className="cursor-pointer rounded-full border border-white/[0.1] bg-white/[0.03] px-2.5 py-1 text-xs text-gray-300 transition-colors hover:border-fuchsia-400/40 hover:text-white disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SaveIdeaButton({ action }: { action: { title: string; why: string; area: string; impact: string; effort: string } }) {
  const [pending, start] = useTransition()
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      disabled={pending || done}
      onClick={() => start(async () => setDone((await saveActionAsIdea(action)).ok))}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-default disabled:opacity-60"
    >
      {done ? "Saved to Ideas" : pending ? "Saving…" : <>Save as idea <ArrowRight className="size-3" aria-hidden /></>}
    </button>
  )
}
