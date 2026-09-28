"use client"

import { useState, useTransition } from "react"

import { type ChatLine, viewChat } from "~/app/actions"

// Hidden until asked for, with a required reason: reading a customer's
// conversation is for debugging a reported problem only, and each view is
// recorded in the audit log with that reason.
export function ChatViewer({ userId, total }: { userId: string; total: number }) {
  const [reason, setReason] = useState("")
  const [lines, setLines] = useState<ChatLine[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()

  if (total === 0) return <p className="text-sm text-gray-500">No bot messages.</p>

  if (!lines) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-400">
          {total} messages stored. For debugging a reported problem only: shows the latest 40 and records this view, with your reason, in the audit log.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason, e.g. user reports cut-off replies"
            className="w-80 rounded-lg border border-white/15 bg-[#07070d] px-3 py-1.5 text-sm text-white placeholder:text-gray-500"
          />
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await viewChat(userId, reason)
                if (res.ok) setLines(res.lines)
                else setError(res.message)
              })
            }
            className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
          >
            {pending ? "Loading…" : "View messages (debug)"}
          </button>
        </div>
        {error && <p className="text-xs text-rose-300">{error}</p>}
      </div>
    )
  }

  return (
    <div className="max-h-[480px] space-y-2 overflow-y-auto pr-1">
      {lines.map((l, i) => (
        <div
          key={i}
          className={`rounded-xl border px-3 py-2 text-sm ${l.role === "user" ? "border-purple-400/25 bg-purple-500/[0.07]" : "border-white/15 bg-white/[0.03]"}`}
        >
          <p className="mb-0.5 text-[11px] text-gray-500">
            {l.role === "user" ? "User" : "Bot"} · {new Date(l.created_at).toLocaleString("en-GB")}
          </p>
          <p className="whitespace-pre-wrap text-gray-200">{l.content}</p>
        </div>
      ))}
    </div>
  )
}
