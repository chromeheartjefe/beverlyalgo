"use client"

import * as Dialog from "@radix-ui/react-dialog"
import { ArrowRight, Bookmark, BookmarkCheck, Check, GraduationCap, Lightbulb, Link2, Wrench, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { Rich } from "@/components/dashboard/academy/steps"
import { TermVisual } from "@/components/dashboard/glossary/term-visual"
import { categoryStyle, LEVEL_STYLE } from "@/components/dashboard/glossary/tones"
import { findLessonById, lessonHref } from "@/lib/academy/curriculum"
import { TERM_BY_SLUG } from "@/lib/glossary/terms"
import type { GlossaryTerm } from "@/lib/glossary/types"
import { cn } from "@/lib/utils"

// Full detail for one term: a side sheet on desktop, a bottom sheet on phones.
// Related terms open in place, so learners can wander through the glossary.
export function TermPanel({
  term,
  saved,
  onToggleSave,
  onSelect,
  onClose,
}: {
  term: GlossaryTerm | null
  saved: boolean
  onToggleSave: (slug: string) => void
  onSelect: (slug: string) => void
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    if (!term) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/dashboard/glossary?term=${term.slug}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const style = term ? categoryStyle(term.category) : null
  const lesson = term?.lessonId ? findLessonById(term.lessonId) : undefined

  return (
    <Dialog.Root open={!!term} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className={cn(
            "fixed z-50 flex flex-col border-white/15 bg-[#0b0b13] shadow-2xl outline-none",
            // Phones: bottom sheet. sm+: right-hand side sheet.
            "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t",
            "sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[460px] sm:rounded-none sm:border-l sm:border-t-0",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom sm:data-[state=closed]:slide-out-to-right sm:data-[state=open]:slide-in-from-right",
          )}
        >
          {term && style && (
            <>
              {/* Header */}
              <div className="shrink-0 border-b border-white/10 px-5 pb-4 pt-3 sm:pt-5">
                <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold", style.chip)}>
                        <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
                        {style.label}
                      </span>
                      <span className={cn("text-xs font-semibold", LEVEL_STYLE[term.level].className)}>{LEVEL_STYLE[term.level].label}</span>
                    </div>
                    <Dialog.Title className="mt-2 text-2xl font-bold text-white">{term.term}</Dialog.Title>
                    {term.aliases && term.aliases.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">Also: {term.aliases.join(", ")}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onToggleSave(term.slug)}
                      aria-pressed={saved}
                      aria-label={saved ? "Remove from saved terms" : "Save term"}
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-white/[0.06]",
                        saved ? "text-amber-300" : "text-gray-400 hover:text-gray-200",
                      )}
                    >
                      {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void copyLink()}
                      aria-label="Copy link to this term"
                      className="relative tap-44 flex size-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
                    >
                      {copied ? <Check className="size-5 text-emerald-400" /> : <Link2 className="size-5" />}
                    </button>
                    <Dialog.Close
                      aria-label="Close"
                      className="relative tap-44 flex size-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-gray-200"
                    >
                      <X className="size-5" />
                    </Dialog.Close>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                <p className="text-[17px] leading-relaxed text-white">{term.short}</p>
                {term.detail.length > 0 && (
                  <div className="space-y-3 text-[15px] leading-relaxed text-gray-300">
                    {term.detail.map((p, i) => (
                      <p key={i}>
                        <Rich text={p} />
                      </p>
                    ))}
                  </div>
                )}

                {term.visual && <TermVisual key={term.slug} visual={term.visual} />}

                {term.example && (
                  <div className="flex gap-3 border border-sky-500/30 bg-sky-500/[0.07] p-4">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-sky-300" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-sky-300">Example</p>
                      <p className="mt-1 text-sm leading-relaxed text-gray-200">{term.example}</p>
                    </div>
                  </div>
                )}

                {(lesson || term.tool) && (
                  <div className="grid gap-2.5">
                    {lesson && (
                      <Link
                        href={lessonHref(lesson)}
                        className="group flex items-center gap-3 border border-purple-400/30 bg-purple-500/[0.08] p-3.5 transition-colors hover:bg-purple-500/[0.14]"
                      >
                        <GraduationCap className="size-5 shrink-0 text-purple-300" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wider text-purple-300/90">Learn it in the Academy</p>
                          <p className="truncate text-sm font-semibold text-white">{lesson.lesson.title}</p>
                          <p className="truncate text-xs text-gray-500">
                            Unit {lesson.unit.id.slice(1)} · {lesson.unit.title}
                          </p>
                        </div>
                        <ArrowRight className="size-4 shrink-0 text-purple-300 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    )}
                    {term.tool && (
                      <Link
                        href={term.tool.href}
                        className="group flex items-center gap-3 border border-white/15 bg-white/[0.03] p-3.5 transition-colors hover:bg-white/[0.06]"
                      >
                        <Wrench className="size-5 shrink-0 text-gray-300" aria-hidden />
                        <p className="flex-1 text-sm font-semibold text-gray-100">Use it: {term.tool.label}</p>
                        <ArrowRight className="size-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </Link>
                    )}
                  </div>
                )}

                {term.related.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Related terms</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {term.related.map((slug) => {
                        const r = TERM_BY_SLUG[slug]
                        if (!r) return null
                        return (
                          <button
                            key={slug}
                            type="button"
                            onClick={() => onSelect(slug)}
                            className="min-h-[36px] rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-gray-200 transition-colors hover:border-purple-400/50 hover:bg-purple-500/10"
                          >
                            {r.term}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
