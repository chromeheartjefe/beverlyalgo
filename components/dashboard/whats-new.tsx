"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ArrowUpRight, ChevronDown, LifeBuoy, Sparkles, X } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { createContext, type ReactNode, useContext, useEffect, useLayoutEffect, useState } from "react"

import { SupportEmail } from "@/components/ui/support-email"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { type ChangeKind, CHANGELOG, type Release } from "@/config/changelog"
import { cn } from "@/lib/utils"

const LATEST = CHANGELOG[0]?.version ?? null
// Releases shown before "Show earlier updates"; the rest stay one tap away.
const INITIAL_RELEASES = 3

// Remembered per account in this browser, like the announcement banner.
const storageKey = (userId: string) => `ea_changelog_seen_${userId}`

function readSeen(userId: string): string | null {
  try {
    return localStorage.getItem(storageKey(userId))
  } catch {
    return null
  }
}

function writeSeen(userId: string, version: string) {
  try {
    localStorage.setItem(storageKey(userId), version)
  } catch {}
}

const KIND: Record<ChangeKind, { label: string; dot: string; text: string }> = {
  new:      { label: "New",      dot: "bg-emerald-400", text: "text-emerald-300" },
  improved: { label: "Improved", dot: "bg-sky-400",     text: "text-sky-300" },
  fixed:    { label: "Fixed",    dot: "bg-amber-400",   text: "text-amber-300" },
}
const KIND_ORDER: ChangeKind[] = ["new", "improved", "fixed"]

// Open state lives in a provider so other parts of the dashboard (the
// announcement banner) can open the panel too.
interface WhatsNewContextValue {
  open:    boolean
  setOpen: (open: boolean) => void
}

const WhatsNewContext = createContext<WhatsNewContextValue | null>(null)

export function WhatsNewProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <WhatsNewContext.Provider value={{ open, setOpen }}>
      {children}
    </WhatsNewContext.Provider>
  )
}

export function useWhatsNew() {
  const ctx = useContext(WhatsNewContext)
  if (!ctx) throw new Error("useWhatsNew must be used within WhatsNewProvider")
  return ctx
}

const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })

function ReleaseEntry({ release, latest, unseen }: { release: Release; latest: boolean; unseen: boolean }) {
  return (
    <li className="group relative pb-7 pl-6 last:pb-2">
      {/* timeline rail + node */}
      <span aria-hidden className="absolute bottom-0 left-[5px] top-2 w-px bg-white/10 group-last:hidden" />
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-1.5 size-[11px] rounded-full border-2",
          latest ? "border-purple-400 bg-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.6)]" : "border-white/25 bg-[#0d0d1c]"
        )}
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-white/15 bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs font-semibold text-gray-200">
          v{release.version}
        </span>
        <time dateTime={release.date} className="text-xs text-gray-500">
          {dateFormat.format(new Date(release.date))}
        </time>
        {unseen && (
          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-purple-200">
            New
          </span>
        )}
      </div>

      <h3 className="mt-2 text-[15px] font-semibold leading-snug text-white">{release.title}</h3>
      {release.summary && <p className="mt-1 text-[13px] leading-relaxed text-gray-400">{release.summary}</p>}

      <div className="mt-3 space-y-3">
        {KIND_ORDER.map((kind) => {
          const items = release.items.filter((i) => i.kind === kind)
          if (items.length === 0) return null
          const style = KIND[kind]
          return (
            <div key={kind}>
              <p className={cn("flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider", style.text)}>
                <span aria-hidden className={cn("size-1.5 rounded-full", style.dot)} />
                {style.label}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {items.map((item) => (
                  <li key={item.text} className="text-[13px] leading-relaxed text-gray-300">
                    {item.href ? (
                      <Dialog.Close asChild>
                        <Link
                          href={item.href}
                          className="group/link rounded-sm decoration-white/25 underline-offset-2 transition-colors hover:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
                        >
                          {item.text}
                          <ArrowUpRight aria-hidden className="ml-0.5 inline size-3.5 text-purple-400 transition-transform group-hover/link:-translate-y-px group-hover/link:translate-x-px" />
                        </Link>
                      </Dialog.Close>
                    ) : (
                      item.text
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </li>
  )
}

export function WhatsNew() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const { open, setOpen } = useWhatsNew()
  const [unread, setUnread] = useState(false)
  // What the user had seen when this panel opened, so the "New" chips stay
  // put while it is open even though it is marked seen right away.
  const [seenAtOpen, setSeenAtOpen] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!userId || !LATEST) return
    setUnread(readSeen(userId) !== LATEST)
  }, [userId])

  // Runs however the panel was opened (its button or the banner), before
  // paint so the "New" chips never flash with the wrong state.
  useLayoutEffect(() => {
    if (!open) {
      setShowAll(false)
      return
    }
    if (!userId || !LATEST) return
    setSeenAtOpen(readSeen(userId))
    writeSeen(userId, LATEST)
    setUnread(false)
  }, [open, userId])

  // Releases above the last one seen are new. Someone who never opened the
  // panel only gets the latest flagged, not the whole history.
  const seenIndex = seenAtOpen ? CHANGELOG.findIndex((r) => r.version === seenAtOpen) : -1
  const unseenCount = seenAtOpen === LATEST ? 0 : seenIndex === -1 ? 1 : seenIndex
  const releases = showAll ? CHANGELOG : CHANGELOG.slice(0, INITIAL_RELEASES)
  const hidden = CHANGELOG.length - releases.length

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Dialog.Trigger
            className="relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/[0.03] text-gray-500 transition-colors hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 data-[state=open]:border-purple-500/30 data-[state=open]:text-purple-300"
            aria-label={unread ? "What's new, new update available" : "What's new"}
          >
            {/* Mirrored: small sparkles top-left/bottom-right, clear of the unread dot */}
            <Sparkles className="size-4 -scale-x-100" aria-hidden />
            {unread && (
              <span aria-hidden className="absolute right-1.5 top-1.5 flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-purple-400 opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex size-2 rounded-full bg-purple-400" />
              </span>
            )}
          </Dialog.Trigger>
        </TooltipTrigger>
        <TooltipContent>What&apos;s new</TooltipContent>
      </Tooltip>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:bg-transparent sm:backdrop-blur-none" />
        <Dialog.Content
          className={cn(
            "fixed z-50 flex flex-col overflow-hidden bg-[#07070d] text-white outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:duration-150 motion-reduce:animate-none",
            // Phones: full-height sheet from the right, mirroring the menu drawer.
            "inset-y-0 right-0 w-full max-w-md border-l border-white/15 max-sm:data-[state=closed]:slide-out-to-right max-sm:data-[state=open]:slide-in-from-right max-sm:data-[state=open]:duration-300",
            // Larger screens: a panel dropping from the header, under the button.
            "sm:inset-y-auto sm:right-4 sm:top-[4.25rem] sm:max-h-[min(640px,calc(100dvh-5.5rem))] sm:w-[400px] sm:rounded-2xl sm:border sm:border-white/25 sm:bg-[#0d0d1c] sm:shadow-2xl sm:shadow-black/60 sm:data-[state=closed]:zoom-out-95 sm:data-[state=open]:slide-in-from-top-2 sm:data-[state=open]:zoom-in-95 sm:data-[state=open]:duration-200 lg:right-6"
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 px-5 pb-4 pt-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10">
                <Sparkles className="size-4 text-purple-300" aria-hidden />
              </div>
              <div>
                <Dialog.Title className="text-sm font-semibold text-white">What&apos;s new</Dialog.Title>
                <Dialog.Description className="mt-0.5 text-xs text-gray-500">
                  {unseenCount > 1 ? `${unseenCount} updates since your last visit` : "The latest updates to EntrixAlgo"}
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close className="-mr-2 -mt-1.5 flex size-11 shrink-0 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-white/[0.06] hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60 sm:size-9">
              <X className="size-4" aria-hidden />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5">
            <ol>
              {releases.map((release, i) => (
                <ReleaseEntry key={release.version} release={release} latest={i === 0} unseen={i < unseenCount} />
              ))}
            </ol>
            {hidden > 0 && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="mb-5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.03] text-xs font-medium text-gray-400 transition-colors hover:border-white/25 hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/60"
              >
                Show earlier updates ({hidden})
                <ChevronDown className="size-3.5" aria-hidden />
              </button>
            )}
          </div>

          <div className="shrink-0 border-t border-white/10 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
              <LifeBuoy className="size-3.5" aria-hidden />
              Questions or ideas? Email us at <SupportEmail />
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
