"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Check, RotateCcw, UserRound, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { type FormEvent, type ReactNode, useEffect, useId, useRef, useState } from "react"

import { Collapse, EASE_OUT, FadeIn } from "@/components/ui/motion"
import { siteConfig } from "@/config/site"
import { QUICK_REPLIES, SUPPORT_CHAT, SUPPORT_LINKS } from "@/config/support-chat"
import { cn } from "@/lib/utils"

type Message = { id: string; role: "user" | "assistant"; content: string }
type Contact = { summary: string; sentTo?: string }

// Kept for this browser tab only, so a page reload doesn't wipe the chat.
const STORAGE_KEY = "ea_support_chat_v1"

const GREETING =
  "Hi! I'm the EntrixAlgo assistant. Ask me anything about the platform, plans or your account. If something needs a person, I'll pass it to the team."

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`

function loadSaved(): { messages: Message[]; contact: Contact | null } {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw)
      if (Array.isArray(saved.messages)) return { messages: saved.messages, contact: saved.contact ?? null }
    }
  } catch {}
  return { messages: [], contact: null }
}

// ─── Reply text: allowed site paths and the support email become links ────────
// No lookbehind (older iOS Safari can't parse it): a match like "/sell" in
// "buy/sell" is simply not in SUPPORT_LINKS, so it stays plain text.
const LINKABLE = /(support@entrixalgo\.com|\/(?:#[a-z-]+|[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*(?:#[a-z-]+)?))/gi
const linkClass = "font-medium text-purple-300 underline decoration-purple-400/40 underline-offset-2 hover:text-white"

function RichText({ text, onNavigate }: { text: string; onNavigate: () => void }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <p key={i} className={cn(i > 0 && "mt-1.5")}>
          {line.split(LINKABLE).map((part, j, parts) => {
            if (j % 2 === 0) return part
            if (part.includes("@")) return <span key={j} className="font-medium text-purple-400">{part}</span>
            // Only a path that starts a word, not the tail of "https://x.com/sign-up".
            if (!SUPPORT_LINKS.has(part) || /[\w.:/]$/.test(parts[j - 1])) return part
            return <Link key={j} href={part} onClick={onNavigate} className={linkClass}>{part}</Link>
          })}
        </p>
      ))}
    </>
  )
}

function BotAvatar() {
  return (
    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-purple-500/25 bg-purple-500/10">
      <Image src="/logo_transparent.png" alt="" width={16} height={16} className="size-4 object-contain" />
    </div>
  )
}

function Bubble({ role, children }: { role: Message["role"]; children: ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-purple-500/25 bg-purple-500/15 px-3.5 py-2 text-sm leading-relaxed text-white">
          {children}
        </div>
      </div>
    )
  }
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="max-w-[85%] break-words rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm leading-relaxed text-gray-200">
        {children}
      </div>
    </div>
  )
}

// ─── Talk to a person ─────────────────────────────────────────────────────────
type FieldErrors = Partial<Record<"name" | "email" | "message", string>>

function validate(field: keyof FieldErrors, value: string): string | undefined {
  const v = value.trim()
  if (field === "name") return v ? undefined : "Please add your name."
  if (field === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? undefined : "Please enter a valid email."
  return v.length >= 10 ? undefined : "Please add a few more details."
}

function ContactCard({
  contact,
  transcript,
  onSent,
  onCancel,
}: {
  contact: Contact
  transcript: Message[]
  onSent: (email: string) => void
  onCancel: () => void
}) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const uid = useId()
  const [values, setValues] = useState({
    name:    session?.user?.name ?? "",
    email:   session?.user?.email ?? "",
    message: contact.summary,
    company: "",
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const refs = {
    name:    useRef<HTMLInputElement>(null),
    email:   useRef<HTMLInputElement>(null),
    message: useRef<HTMLTextAreaElement>(null),
  }

  if (contact.sentTo) {
    return (
      <div role="status" className="flex items-start gap-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.08] p-3.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
          <Check className="size-4 text-emerald-300" aria-hidden />
        </div>
        <div className="text-sm leading-relaxed">
          <p className="font-medium text-white">Sent to the team</p>
          <p className="mt-0.5 text-gray-400">We&apos;ll reply to {contact.sentTo} by email.</p>
        </div>
      </div>
    )
  }

  const onBlur = (field: keyof FieldErrors) => () => {
    setErrors((e) => ({ ...e, [field]: values[field] ? validate(field, values[field]) : e[field] }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const next: FieldErrors = {
      name:    validate("name", values.name),
      email:   validate("email", values.email),
      message: validate("message", values.message),
    }
    setErrors(next)
    const firstInvalid = (["name", "email", "message"] as const).find((f) => next[f])
    if (firstInvalid) {
      refs[firstInvalid].current?.focus()
      return
    }
    setSending(true)
    setFormError(null)
    try {
      const res = await fetch("/api/support-contact", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...values,
          page:       pathname,
          transcript: transcript.map(({ role, content }) => ({ role, content })),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFormError(typeof data.error === "string" ? data.error : `Couldn't send that. Please email ${siteConfig.supportEmail}.`)
        return
      }
      onSent(values.email.trim())
    } catch {
      setFormError(`You seem to be offline. Please try again, or email ${siteConfig.supportEmail}.`)
    } finally {
      setSending(false)
    }
  }

  const input =
    "w-full rounded-xl border bg-white/[0.03] px-3 py-2 text-base text-white placeholder:text-gray-600 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/30 sm:text-sm"
  const field = (name: keyof FieldErrors, label: string, control: ReactNode) => (
    <div>
      <label htmlFor={`${uid}-${name}`} className="mb-1 block text-xs font-medium text-gray-300">{label}</label>
      {control}
      {errors[name] && <p id={`${uid}-${name}-error`} className="mt-1 text-xs text-red-400">{errors[name]}</p>}
    </div>
  )
  const a11y = (name: keyof FieldErrors) => ({
    id: `${uid}-${name}`,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `${uid}-${name}-error` : undefined,
  })

  return (
    <form onSubmit={submit} noValidate className="rounded-2xl border border-white/15 bg-white/[0.03] p-3.5">
      <div className="mb-3 flex items-start gap-2.5">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
          <UserRound className="size-4 text-purple-300" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-medium text-white">Contact the team</p>
          <p className="text-xs text-gray-500">A person will reply by email. This chat is attached for context.</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {field("name", "Name", (
          <input
            ref={refs.name}
            {...a11y("name")}
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            onBlur={onBlur("name")}
            className={cn(input, errors.name ? "border-red-500/50" : "border-white/15")}
          />
        ))}
        {field("email", "Email", (
          <input
            ref={refs.email}
            {...a11y("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            onBlur={onBlur("email")}
            className={cn(input, errors.email ? "border-red-500/50" : "border-white/15")}
          />
        ))}
        {field("message", "How can we help?", (
          <textarea
            ref={refs.message}
            {...a11y("message")}
            rows={3}
            maxLength={2000}
            value={values.message}
            onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            onBlur={onBlur("message")}
            className={cn(input, "resize-none", errors.message ? "border-red-500/50" : "border-white/15")}
          />
        ))}
        {/* Honeypot: hidden from people and screen readers, filled by bots. */}
        <input
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
          value={values.company}
          onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
          className="absolute -left-[9999px] size-px opacity-0"
        />
      </div>
      <Collapse show={!!formError} className="pt-2.5">
        <p role="alert" className="text-xs text-red-400">{formError}</p>
      </Collapse>
      <div className="mt-3 flex gap-2">
        <button
          type="submit"
          disabled={sending}
          className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-4 text-sm font-semibold text-white transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send to the team"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={sending}
          className="min-h-10 rounded-xl border border-white/15 px-3.5 text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────
export function SupportChatPanel({ id, open, onClose }: { id: string; open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const [saved] = useState(loadSaved)
  const [messages, setMessages] = useState<Message[]>(saved.messages)
  const [contact, setContact] = useState<Contact | null>(saved.contact)
  const [input, setInput] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const titleId = useId()

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, contact }))
    } catch {}
  }, [messages, contact])

  // Newest message in view.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    list.scrollTo({ top: list.scrollHeight, behavior: smooth ? "smooth" : "auto" })
  }, [messages, pending, contact, error])

  // Focus the message box on open, but not on touch screens where it would
  // pop the keyboard over the conversation straight away.
  useEffect(() => {
    if (open && window.matchMedia("(pointer: fine)").matches) inputRef.current?.focus({ preventScroll: true })
  }, [open])

  // Grow the message box with its text, up to a few lines.
  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [input])

  // The panel is full screen on phones, so following a link closes it.
  const onNavigate = () => {
    if (window.matchMedia("(max-width: 639px)").matches) onClose()
  }

  const ask = async (history: Message[]) => {
    setPending(true)
    setError(null)
    try {
      const res = await fetch("/api/support-chat", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
          page:     pathname,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || typeof data.reply !== "string") {
        setError(typeof data.error === "string" ? data.error : "Something went wrong. Please try again.")
        return
      }
      setMessages((m) => [...m, { id: newId(), role: "assistant", content: data.reply }])
      if (typeof data.handoff === "string") setContact({ summary: data.handoff })
    } catch {
      setError("You seem to be offline. Check your connection and try again.")
    } finally {
      setPending(false)
    }
  }

  const send = (text: string) => {
    const content = text.trim()
    if (!content || pending) return
    const next: Message[] = [...messages, { id: newId(), role: "user", content }]
    setMessages(next)
    setInput("")
    void ask(next)
  }

  const quickReply = (reply: (typeof QUICK_REPLIES)[number]) => {
    if ("contact" in reply) {
      setContact({ summary: "" })
      return
    }
    setMessages((m) => [
      ...m,
      { id: newId(), role: "user", content: reply.label },
      { id: newId(), role: "assistant", content: reply.answer },
    ])
  }

  const reset = () => {
    setMessages([])
    setContact(null)
    setError(null)
    setInput("")
  }

  const lastIsUser = messages[messages.length - 1]?.role === "user"
  const tooLong = input.length > SUPPORT_CHAT.maxInputChars - 80

  return (
    <div
      id={id}
      role="dialog"
      aria-labelledby={titleId}
      inert={!open}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation()
          onClose()
        }
      }}
      className={cn(
        "fixed inset-0 z-50 flex origin-bottom-right flex-col overflow-hidden bg-[#0d0d1c] text-white transition-[opacity,transform,visibility] duration-200 ease-out motion-reduce:transition-none",
        "sm:inset-auto sm:bottom-[5.25rem] sm:right-6 sm:h-[min(620px,calc(100dvh-7rem))] sm:w-[380px] sm:rounded-2xl sm:border sm:border-white/20 sm:shadow-2xl sm:shadow-black/60",
        open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-3 scale-[0.98] opacity-0"
      )}
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10">
          <Image src="/logo_transparent.png" alt="" width={20} height={20} className="size-5 object-contain" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="text-sm font-semibold text-white">EntrixAlgo Support</h2>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400" />
            Online
          </p>
        </div>
        {messages.length > 0 && (
          <button
            type="button"
            onClick={reset}
            disabled={pending}
            aria-label="Start a new chat"
            className="flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 disabled:opacity-50 sm:size-9"
          >
            <RotateCcw className="size-4" aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close support chat"
          className="-mr-1.5 flex size-11 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 sm:size-9"
        >
          <X className="size-4" aria-hidden />
        </button>
      </div>

      {/* Conversation */}
      <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div role="log" aria-live="polite" aria-label="Conversation" className="space-y-3">
          <Bubble role="assistant">{GREETING}</Bubble>

          {/* New messages fade in; the restored conversation and the greeting
              just appear (initial={false}). Quick replies fade out on the
              first message. */}
          <AnimatePresence initial={false}>
          {messages.length === 0 && !contact && (
            <motion.div
              key="quick-replies"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className="flex flex-wrap gap-2 pl-9"
            >
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply.label}
                  type="button"
                  onClick={() => quickReply(reply)}
                  className="min-h-9 rounded-full border border-purple-500/25 bg-purple-500/[0.08] px-3 py-1.5 text-left text-xs font-medium text-purple-200 transition-colors hover:border-purple-400/50 hover:bg-purple-500/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
                >
                  {reply.label}
                </button>
              ))}
            </motion.div>
          )}

          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
            >
              <Bubble role={m.role}>
                {m.role === "assistant" ? <RichText text={m.content} onNavigate={onNavigate} /> : m.content}
              </Bubble>
            </motion.div>
          ))}
          </AnimatePresence>

          {pending && (
            <FadeIn className="flex items-end gap-2">
              <BotAvatar />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.04] px-3.5 py-3">
                <span className="sr-only">The assistant is typing</span>
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    aria-hidden
                    style={{ animationDelay: `${delay}ms` }}
                    className="size-1.5 animate-bounce rounded-full bg-gray-400 motion-reduce:animate-none"
                  />
                ))}
              </div>
            </FadeIn>
          )}

          {error && (
            <FadeIn>
            <div role="alert" className="ml-9 rounded-xl border border-red-500/25 bg-red-500/[0.08] px-3 py-2 text-xs text-red-300">
              {error}
              {lastIsUser && !pending && (
                <button
                  type="button"
                  onClick={() => void ask(messages)}
                  className="ml-2 font-semibold text-red-200 underline underline-offset-2 hover:text-white"
                >
                  Try again
                </button>
              )}
            </div>
            </FadeIn>
          )}
        </div>

        <Collapse show={!!contact} className="pt-3">
          {contact && (
            <ContactCard
              contact={contact}
              transcript={messages}
              onSent={(email) => setContact((c) => (c ? { ...c, sentTo: email } : c))}
              onCancel={() => setContact(null)}
            />
          )}
        </Collapse>
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="shrink-0 border-t border-white/10 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-white/15 bg-white/[0.03] p-1.5 pl-3.5 transition-colors focus-within:border-purple-400/50">
          <label htmlFor={`${id}-input`} className="sr-only">Message</label>
          <textarea
            id={`${id}-input`}
            ref={inputRef}
            rows={1}
            value={input}
            maxLength={SUPPORT_CHAT.maxInputChars}
            placeholder="Ask about EntrixAlgo…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                send(input)
              }
            }}
            className="max-h-[120px] min-h-9 flex-1 resize-none bg-transparent py-1.5 text-base leading-6 text-white placeholder:text-gray-600 focus:outline-none sm:text-sm"
          />
          <button
            type="submit"
            disabled={!input.trim() || pending}
            aria-label="Send message"
            className="relative tap-44 flex size-9 shrink-0 items-center justify-center rounded-xl bg-purple-500 text-white transition-[background-color,opacity] hover:bg-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 disabled:bg-white/[0.06] disabled:text-gray-600"
          >
            <ArrowUp className="size-4" aria-hidden />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 px-1 text-xs text-gray-600">
          <span>AI answers can be wrong.</span>
          {tooLong ? (
            <span className={cn(input.length >= SUPPORT_CHAT.maxInputChars && "text-amber-400")}>
              {input.length}/{SUPPORT_CHAT.maxInputChars}
            </span>
          ) : (
            !contact && (
              <button
                type="button"
                onClick={() => setContact({ summary: "" })}
                className="rounded font-medium text-gray-400 underline-offset-2 hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
              >
                Talk to a person
              </button>
            )
          )}
        </div>
      </form>
    </div>
  )
}
