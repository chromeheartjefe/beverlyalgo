"use client"

import { AlertTriangle, Bot, Loader2, Send, Trash2, User } from "lucide-react"
import { useSession } from "next-auth/react"
import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"

import { FeatureLock } from "@/components/dashboard/feature-lock"
import { fetcher } from "@/lib/swr"
import { cn } from "@/lib/utils"

type Message = {
  id:      string
  role:    "user" | "assistant"
  content: string
}

const STARTERS = [
  "How do I size a position with 1% risk per trade?",
  "What's a healthy risk/reward ratio?",
  "Explain the difference between a stop-limit and stop-market order.",
  "How do I avoid revenge trading after a loss?",
]

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user"
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-white/[0.06] text-gray-400" : "bg-purple-500/15 text-purple-400"
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-purple-500 text-white"
            : "rounded-tl-sm border border-white/[0.07] bg-white/[0.035] text-gray-200"
        )}
      >
        {message.content}
      </div>
    </div>
  )
}

export default function TradingBotPage() {
  const { data: session } = useSession()
  const plan   = (session?.user as { plan?: string })?.plan ?? "free"
  const locked = plan === "free"

  // Cached via SWR so returning to this tab shows the already-fetched chat
  // history instantly instead of flashing back to an empty/loading state.
  // Skipped entirely (no fetch) while the feature is locked.
  const { data: chatData, isLoading: loadingHistory, mutate: mutateChat } = useSWR<Message[]>(
    locked ? null : "/api/chat",
    fetcher
  )
  const messages = useMemo(() => chatData ?? [], [chatData])
  const [input, setInput]       = useState("")
  const [sending, setSending]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [clearing, setClearing] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, sending])

  const send = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setError(null)
    setInput("")
    mutateChat((prev) => [...(prev ?? []), { id: crypto.randomUUID(), role: "user", content: trimmed }], { revalidate: false })
    setSending(true)

    try {
      const res  = await fetch("/api/chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ message: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? "Something went wrong.")

      mutateChat((prev) => [...(prev ?? []), { id: crypto.randomUUID(), role: "assistant", content: data.reply }], { revalidate: false })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setSending(false)
    }
  }

  const clearHistory = async () => {
    if (clearing || messages.length === 0) return
    if (!window.confirm("Clear the entire conversation? This can't be undone.")) return

    setClearing(true)
    try {
      const res = await fetch("/api/chat", { method: "DELETE" })
      if (res.ok) {
        mutateChat([], { revalidate: false })
        setError(null)
      }
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="flex h-full flex-col p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex shrink-0 items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
            <Bot className="size-3" />
            AI Trading Bot
          </div>
          <h1 className="mt-3 text-2xl font-bold text-white">Trading Assistant</h1>
          <p className="mt-1 text-sm text-gray-500">
            Straight answers on strategy, risk management, and trade mechanics. No fluff.
          </p>
        </div>
        {!locked && messages.length > 0 && (
          <button
            onClick={clearHistory}
            disabled={clearing}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:border-red-500/25 hover:text-red-400 disabled:opacity-50"
          >
            {clearing ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            Clear history
          </button>
        )}
      </div>

      <FeatureLock locked={locked} feature="AI Trading Bot">
        <div className="flex min-h-[560px] flex-1 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-5" aria-busy={loadingHistory || sending}>
            {loadingHistory ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-600">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Loading conversation…
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10">
                  <Bot className="size-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Ask a trading question</p>
                  <p className="mt-1 text-xs text-gray-600">Strategy, risk management, order types, psychology.</p>
                </div>
                <div className="grid w-full max-w-md grid-cols-1 gap-2 sm:grid-cols-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5 text-left text-xs text-gray-400 transition-colors hover:border-purple-500/25 hover:text-gray-200"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => <Bubble key={m.id} message={m} />)}
                {sending && (
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/15 text-purple-400">
                      <Bot className="size-4" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="size-1.5 animate-pulse rounded-full bg-gray-500"
                          style={{ animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="mx-5 mb-3 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Input */}
          <div className="shrink-0 border-t border-white/[0.07] p-4">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="flex items-end gap-2.5"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    send(input)
                  }
                }}
                rows={1}
                maxLength={400}
                placeholder="Ask anything about trading..."
                aria-label="Message the AI trading assistant"
                disabled={sending}
                className="max-h-32 flex-1 resize-none rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/50 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white transition-colors hover:bg-purple-400 disabled:opacity-40"
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
            <p className="mt-2.5 text-center text-[11px] text-gray-700">
              AI-generated for educational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </FeatureLock>
    </div>
  )
}
