"use client"

import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export interface TocItem {
  id: string
  title: string
}

// "On this page" for the legal documents. On wide screens it is a sticky list
// that marks the section being read; on phones it folds into one tappable row
// so the document itself starts near the top.
export function LegalToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "")
  const folded = useRef<HTMLDetailsElement>(null)

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(item.id)).filter((el): el is HTMLElement => !!el)
    if (sections.length === 0) return
    // The section that owns the upper part of the window is the one being read
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: "-10% 0px -65% 0px" },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [items])

  const list = (onNavigate?: () => void) => (
    <ul>
      {items.map((item, i) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={onNavigate}
            aria-current={active === item.id ? "location" : undefined}
            className={cn(
              "flex min-h-11 items-baseline gap-2.5 border-l-2 py-2.5 pl-3.5 pr-2 text-sm leading-snug transition-colors lg:min-h-0 lg:py-1.5",
              active === item.id ? "border-purple-400 text-white" : "border-white/[0.08] text-gray-400 hover:border-white/25 hover:text-gray-200",
            )}
          >
            <span className="w-5 shrink-0 text-xs tabular-nums text-gray-500">{i + 1}</span>
            {item.title}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Phones and tablets */}
      <details ref={folded} className="group rounded-2xl border border-white/[0.07] bg-white/[0.03] lg:hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
          On this page
          <ChevronDown className="size-4 text-gray-400 transition-transform group-open:rotate-180" aria-hidden />
        </summary>
        <nav aria-label="On this page" className="px-3 pb-3">
          {list(() => {
            if (folded.current) folded.current.open = false
          })}
        </nav>
      </details>

      {/* Desktop */}
      <nav aria-label="On this page" className="sticky top-8 hidden max-h-[calc(100vh-4rem)] overflow-y-auto pr-2 lg:block">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">On this page</p>
        {list()}
      </nav>
    </>
  )
}
