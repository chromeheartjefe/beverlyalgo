"use client"

import { MessageCircle, X } from "lucide-react"
import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

// Only the launcher button ships with every page. The panel (and its chat
// logic) is its own chunk, fetched on first hover/focus/tap of the button.
const loadPanel = () => import("./support-chat-panel")
const SupportChatPanel = dynamic(() => loadPanel().then((m) => m.SupportChatPanel), { ssr: false })

// Pages whose own UI owns this corner: the AI Trading Bot page is a chat with
// its message box right there, and the Academy (lessons keep their Check
// button bottom right) and the Glossary (its term sheet) are learning spaces
// without it. Help stays reachable from the sidebar.
const HIDDEN_ON = new Set(["/dashboard/trading-bot"])
const HIDDEN_UNDER = ["/dashboard/academy", "/dashboard/glossary"]

const isHidden = (pathname: string) =>
  HIDDEN_ON.has(pathname) || HIDDEN_UNDER.some((p) => pathname === p || pathname.startsWith(`${p}/`))

export const SUPPORT_PANEL_ID = "support-chat-panel"

// Site-wide support chat: a quiet button in the bottom-right corner. It never
// opens by itself, never plays sounds and shows no unread badges.
export function SupportChat() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // The panel stays mounted after the first open, so closing and reopening
  // keeps the conversation and its scroll position.
  const [loaded, setLoaded] = useState(false)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const hidden = isHidden(pathname)

  useEffect(() => {
    if (hidden) setOpen(false)
  }, [hidden])

  const close = useCallback(() => {
    setOpen(false)
    launcherRef.current?.focus({ preventScroll: true })
  }, [])

  if (hidden) return null

  return (
    <>
      {loaded && <SupportChatPanel id={SUPPORT_PANEL_ID} open={open} onClose={close} />}
      <button
        ref={launcherRef}
        type="button"
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        onClick={() => {
          setLoaded(true)
          setOpen((v) => !v)
        }}
        aria-expanded={open}
        aria-controls={loaded ? SUPPORT_PANEL_ID : undefined}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className={cn(
          "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex size-12 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-lg shadow-purple-950/50 transition-[transform,opacity,filter] duration-200 animate-in fade-in-0 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f] active:scale-95 motion-reduce:transition-none sm:bottom-6 sm:right-6",
          // On phones the open panel is full screen and has its own close button.
          open && "max-sm:pointer-events-none max-sm:opacity-0"
        )}
      >
        <MessageCircle
          aria-hidden
          className={cn("absolute size-5 transition-all duration-200 motion-reduce:transition-none", open ? "rotate-45 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")}
        />
        <X
          aria-hidden
          className={cn("absolute size-5 transition-all duration-200 motion-reduce:transition-none", open ? "rotate-0 scale-100 opacity-100" : "-rotate-45 scale-50 opacity-0")}
        />
      </button>
    </>
  )
}
