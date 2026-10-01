"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, BookA } from "lucide-react"
import { createContext, type ReactNode, useCallback, useContext, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { EASE_OUT } from "@/components/ui/motion"
import { findHint, type GlossaryHint } from "@/lib/glossary/hints"

// Glossary pop-ups inside Academy lessons. A lesson page passes the hints its
// bold terms need; Rich (steps.tsx) asks this context whether a bold phrase
// has one and, if so, renders it as a tappable term.

const HintsContext = createContext<Record<string, GlossaryHint> | null>(null)

export function GlossaryHintsProvider({ hints, children }: { hints?: Record<string, GlossaryHint>; children: ReactNode }) {
  return <HintsContext.Provider value={hints ?? null}>{children}</HintsContext.Provider>
}

export function useGlossaryHint(text: string): GlossaryHint | null {
  const hints = useContext(HintsContext)
  return hints ? findHint(hints, text) : null
}

const CARD_W = 300
const GAP = 8

export function GlossaryTerm({ text, hint }: { text: string; hint: GlossaryHint }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ left: number; top: number; above: boolean } | null>(null)
  const trigger = useRef<HTMLSpanElement>(null)
  const card = useRef<HTMLDivElement>(null)
  const id = useId()

  const place = useCallback(() => {
    const el = trigger.current
    if (!el) return
    // The first line of a wrapped term is where the reader tapped
    const rect = el.getClientRects()[0] ?? el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = Math.min(CARD_W, vw - 16)
    const left = Math.min(Math.max(8, rect.left + rect.width / 2 - width / 2), vw - width - 8)
    const above = vh - rect.bottom < 220 && rect.top > 220
    setPos({ left, top: above ? rect.top - GAP : rect.bottom + GAP, above })
  }, [])

  const toggle = () => {
    if (open) return setOpen(false)
    place()
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node
      if (trigger.current?.contains(t) || card.current?.contains(t)) return
      setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        trigger.current?.focus()
      }
    }
    const close = () => setOpen(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    // The lesson scrolls inside its own container; any scroll closes the card
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
    }
  }, [open])

  return (
    <>
      <span
        ref={trigger}
        role="button"
        tabIndex={0}
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-haspopup="dialog"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggle()
          }
        }}
        className="cursor-help rounded-sm font-semibold text-white underline decoration-purple-400/70 decoration-dotted decoration-2 underline-offset-4 transition-colors hover:decoration-purple-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
      >
        {text}
      </span>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && pos && (
              <motion.div
                ref={card}
                id={id}
                role="dialog"
                aria-label={hint.term}
                initial={{ opacity: 0, y: pos.above ? 4 : -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.16, ease: EASE_OUT }}
                style={{ left: pos.left, top: pos.top, width: Math.min(CARD_W, window.innerWidth - 16), translate: pos.above ? "0 -100%" : undefined }}
                className="fixed z-[60] rounded-2xl border border-white/15 bg-[#11111b] p-4 text-left shadow-2xl shadow-black/60"
              >
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-purple-300/90">
                  <BookA className="size-3.5" aria-hidden /> Glossary · {hint.category}
                </p>
                <p className="mt-1.5 text-base font-bold text-white">{hint.term}</p>
                <p className="mt-1 text-sm leading-relaxed text-gray-300">{hint.short}</p>
                <a
                  href={`/dashboard/glossary?term=${hint.slug}`}
                  target="_blank"
                  rel="noopener"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-purple-300 hover:text-purple-200"
                >
                  Open in glossary <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  )
}
