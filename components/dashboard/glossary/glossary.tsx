"use client"

import { motion } from "framer-motion"
import { BookA, Bookmark, BookmarkCheck, ChartCandlestick, GraduationCap, Search, SearchX, Sparkles, X } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { TermPanel } from "@/components/dashboard/glossary/term-panel"
import { categoryStyle, LEVEL_STYLE } from "@/components/dashboard/glossary/tones"
import { EASE_OUT } from "@/components/ui/motion"
import { localDay } from "@/lib/academy/xp"
import { letterOf, searchTerms, suggestTerms } from "@/lib/glossary/search"
import { TERM_BY_SLUG, TERMS } from "@/lib/glossary/terms"
import { CATEGORIES, type CategoryId, type GlossaryTerm, type Level } from "@/lib/glossary/types"
import { cn } from "@/lib/utils"

// Trading Glossary: instant search (abbreviations included), category and
// level filters, an A-Z index, saved terms, a term of the day, and a detail
// panel with visuals, examples, related terms and the Academy lesson that
// teaches each term. The open term lives in ?term= so links can be shared.

const SAVED_KEY = "glossary:saved"
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")
const LEVELS: { id: Level | "all"; label: string }[] = [
  { id: "all", label: "All levels" },
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
]
const POPULAR = ["fair-value-gap", "order-block", "liquidity-sweep", "position-sizing", "rsi", "break-of-structure"]

function readSaved(): string[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    const list = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(list) ? list.filter((s): s is string => typeof s === "string" && s in TERM_BY_SLUG) : []
  } catch {
    return []
  }
}

/** Same term for everyone on a given day */
function termOfTheDay(): GlossaryTerm {
  const day = localDay()
  let h = 0
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const pool = TERMS.filter((t) => t.visual || t.example)
  return pool[h % pool.length]
}

function TermCard({ term, saved, onOpen }: { term: GlossaryTerm; saved: boolean; onOpen: () => void }) {
  const style = categoryStyle(term.category)
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex h-full w-full flex-col rounded-2xl border border-white/12 bg-white/[0.025] p-4 text-left transition-colors duration-150 hover:border-white/25 hover:bg-white/[0.045] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-white">{term.term}</p>
          {term.aliases && term.aliases.length > 0 && (
            <p className="mt-0.5 truncate font-mono text-[11px] text-gray-500">{term.aliases.slice(0, 3).join(" · ")}</p>
          )}
        </div>
        {saved && <BookmarkCheck className="size-4 shrink-0 text-amber-300" aria-label="Saved" />}
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-400">{term.short}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-3 text-[11px]">
        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold", style.chip)}>
          <span className={cn("size-1.5 rounded-full", style.dot)} aria-hidden />
          {style.label}
        </span>
        <span className={cn("font-semibold", LEVEL_STYLE[term.level].className)}>{LEVEL_STYLE[term.level].label}</span>
        <span className="ml-auto flex items-center gap-2 text-gray-500">
          {term.visual && <ChartCandlestick className="size-3.5" aria-label="Has a chart" />}
          {term.lessonId && <GraduationCap className="size-3.5" aria-label="Taught in the Academy" />}
        </span>
      </div>
    </button>
  )
}

export function Glossary() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const searchRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<CategoryId | "all">("all")
  const [level, setLevel] = useState<Level | "all">("all")
  const [savedOnly, setSavedOnly] = useState(false)
  const [saved, setSaved] = useState<string[]>([])
  const [daily, setDaily] = useState<GlossaryTerm | null>(null)

  // Browser-only bits after mount (saved list, local day)
  useEffect(() => {
    setSaved(readSaved())
    setDaily(termOfTheDay())
  }, [])

  const openSlug = params.get("term")
  const openTerm = openSlug ? (TERM_BY_SLUG[openSlug] ?? null) : null

  const setOpen = useCallback(
    (slug: string | null) => {
      const next = new URLSearchParams(params.toString())
      if (slug) next.set("term", slug)
      else next.delete("term")
      const qs = next.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [params, pathname, router],
  )

  const toggleSave = useCallback((slug: string) => {
    setSaved((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next))
      } catch {
        // Saving is a convenience; ignore storage failures
      }
      return next
    })
  }, [])

  // "/" focuses search, like most docs sites
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el?.tagName === "INPUT" || el?.tagName === "TEXTAREA" || el?.isContentEditable) return
      e.preventDefault()
      searchRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Search and level first, so category counts reflect them
  const base = useMemo(() => {
    let list = searchTerms(TERMS, query)
    if (level !== "all") list = list.filter((t) => t.level === level)
    if (savedOnly) list = list.filter((t) => saved.includes(t.slug))
    return list
  }, [query, level, savedOnly, saved])

  const counts = useMemo(() => {
    const c = new Map<string, number>()
    for (const t of base) c.set(t.category, (c.get(t.category) ?? 0) + 1)
    return c
  }, [base])

  const results = useMemo(() => (category === "all" ? base : base.filter((t) => t.category === category)), [base, category])
  const searching = query.trim().length > 0

  const groups = useMemo(() => {
    if (searching) return null
    const map = new Map<string, GlossaryTerm[]>()
    for (const t of results) {
      const l = letterOf(t)
      map.set(l, [...(map.get(l) ?? []), t])
    }
    return map
  }, [results, searching])

  const suggestions = useMemo(() => (results.length === 0 && searching ? suggestTerms(TERMS, query) : []), [results.length, searching, query])

  const jumpTo = (letter: string) => {
    document.getElementById(`glossary-${letter}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const clearFilters = () => {
    setQuery("")
    setCategory("all")
    setLevel("all")
    setSavedOnly(false)
  }

  const withVisuals = TERMS.filter((t) => t.visual).length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="hidden size-11 shrink-0 items-center justify-center rounded-xl border border-purple-500/25 bg-purple-500/10 sm:flex">
            <BookA className="size-5 text-purple-300" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Trading Glossary</h1>
            <p className="mt-1 text-sm text-gray-500">
              {TERMS.length} terms in plain English, from your first order to Smart Money Concepts. {withVisuals} come with a live chart, and almost
              every one links to the lesson that teaches it.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gray-500" aria-hidden />
          <label htmlFor="glossary-search" className="sr-only">
            Search the glossary
          </label>
          <input
            ref={searchRef}
            id="glossary-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms or abbreviations, like FVG, BSL or R:R"
            autoComplete="off"
            className="w-full rounded-2xl border border-white/15 bg-white/[0.04] py-4 pl-12 pr-24 text-base text-white placeholder:text-gray-500 focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("")
                  searchRef.current?.focus()
                }}
                aria-label="Clear search"
                className="flex size-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
              >
                <X className="size-4" />
              </button>
            ) : (
              <kbd className="hidden rounded-md border border-white/15 px-2 py-0.5 font-mono text-xs text-gray-500 sm:block">/</kbd>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            type="button"
            onClick={() => setCategory("all")}
            aria-pressed={category === "all"}
            className={cn(
              "min-h-[36px] rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              category === "all" ? "border-white/50 bg-white/[0.1] text-white" : "border-white/15 text-gray-400 hover:text-gray-200",
            )}
          >
            All <span className="ml-1 text-gray-500">{base.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const s = categoryStyle(c.id)
            const n = counts.get(c.id) ?? 0
            const active = category === c.id
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(active ? "all" : c.id)}
                aria-pressed={active}
                disabled={n === 0 && !active}
                className={cn(
                  "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  active ? s.active : "border-white/15 text-gray-300 hover:border-white/30",
                )}
              >
                <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
                {c.label}
                <span className="text-gray-500">{n}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="inline-flex border border-white/15" role="group" aria-label="Filter by level">
            {LEVELS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLevel(l.id)}
                aria-pressed={level === l.id}
                className={cn(
                  "min-h-[36px] px-3 py-1.5 text-xs font-semibold transition-colors",
                  level === l.id ? "bg-purple-500/20 text-purple-100" : "text-gray-400 hover:bg-white/[0.04] hover:text-gray-200",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSavedOnly((v) => !v)}
            aria-pressed={savedOnly}
            className={cn(
              "inline-flex min-h-[36px] items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors",
              savedOnly ? "border-amber-400/60 bg-amber-500/15 text-amber-100" : "border-white/15 text-gray-400 hover:text-gray-200",
            )}
          >
            {savedOnly ? <BookmarkCheck className="size-3.5" /> : <Bookmark className="size-3.5" />}
            Saved <span className="text-gray-500">{saved.length}</span>
          </button>
          <p className="ml-auto text-xs text-gray-500" aria-live="polite">
            {results.length} {results.length === 1 ? "term" : "terms"}
          </p>
        </div>

        {/* Term of the day */}
        {daily && !searching && category === "all" && level === "all" && !savedOnly && (
          <motion.button
            type="button"
            onClick={() => setOpen(daily.slug)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="group mt-6 flex w-full items-start gap-4 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-500/[0.14] via-purple-500/[0.04] to-transparent p-5 text-left transition-colors hover:border-purple-400/50"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-purple-400/40 bg-purple-500/15">
              <Sparkles className="size-5 text-purple-200" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-purple-300/90">Term of the day</p>
              <p className="mt-1 text-lg font-bold text-white">{daily.term}</p>
              <p className="mt-1 text-sm text-gray-400">{daily.short}</p>
            </div>
          </motion.button>
        )}

        {/* A-Z index */}
        {!searching && results.length > 0 && groups && (
          <nav aria-label="Jump to letter" className="sticky top-0 z-10 -mx-4 mt-6 border-b border-white/10 bg-[#09090f]/95 px-4 py-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex gap-0.5 overflow-x-auto [scrollbar-width:none]">
              {LETTERS.map((l) => {
                const has = groups.has(l)
                return (
                  <button
                    key={l}
                    type="button"
                    onClick={() => jumpTo(l)}
                    disabled={!has}
                    className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold text-gray-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-default disabled:text-gray-700 disabled:hover:bg-transparent"
                  >
                    {l}
                  </button>
                )
              })}
            </div>
          </nav>
        )}

        {/* Results */}
        <div className="mt-6">
          {results.length === 0 ? (
            <div className="rounded-2xl border border-white/12 bg-white/[0.02] p-8 text-center">
              <SearchX className="mx-auto size-8 text-gray-500" aria-hidden />
              <p className="mt-3 text-base font-semibold text-white">{savedOnly && saved.length === 0 ? "No saved terms yet" : "No terms match"}</p>
              <p className="mt-1 text-sm text-gray-400">
                {savedOnly && saved.length === 0
                  ? "Open any term and tap the bookmark to save it here."
                  : suggestions.length > 0
                    ? "Did you mean one of these?"
                    : "Try a shorter word, an abbreviation, or one of these popular terms."}
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {(suggestions.length > 0 ? suggestions : POPULAR.map((s) => TERM_BY_SLUG[s])).map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => setOpen(t.slug)}
                    className="min-h-[36px] rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium text-gray-200 hover:border-purple-400/50 hover:bg-purple-500/10"
                  >
                    {t.term}
                  </button>
                ))}
              </div>
              <button type="button" onClick={clearFilters} className="mt-5 text-sm font-semibold text-purple-300 underline underline-offset-2">
                Clear all filters
              </button>
            </div>
          ) : groups ? (
            <div className="space-y-8">
              {[...groups.entries()].map(([letter, list]) => (
                <section key={letter} id={`glossary-${letter}`} className="scroll-mt-16">
                  <h2 className="mb-3 flex items-center gap-3 text-sm font-bold text-gray-400">
                    <span className="text-xl text-white">{letter}</span>
                    <span className="h-px flex-1 bg-white/10" />
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {list.map((t) => (
                      <TermCard key={t.slug} term={t} saved={saved.includes(t.slug)} onOpen={() => setOpen(t.slug)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((t) => (
                <TermCard key={t.slug} term={t} saved={saved.includes(t.slug)} onOpen={() => setOpen(t.slug)} />
              ))}
            </div>
          )}
        </div>

        <p className="mt-12 border-t border-white/10 pt-4 text-xs leading-relaxed text-gray-600">
          Definitions are educational, not financial advice. Charts are illustrative.
        </p>
      </div>

      <TermPanel
        term={openTerm}
        saved={!!openTerm && saved.includes(openTerm.slug)}
        onToggleSave={toggleSave}
        onSelect={(slug) => setOpen(slug)}
        onClose={() => setOpen(null)}
      />
    </div>
  )
}
