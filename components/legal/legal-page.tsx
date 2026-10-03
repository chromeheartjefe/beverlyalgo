import { AlertTriangle, ArrowLeft, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { ReactNode } from "react"

import { LegalToc } from "@/components/legal/legal-toc"
import { SupportEmail } from "@/components/ui/support-email"
import { legal, LEGAL_DOCS } from "@/config/legal"
import { cn } from "@/lib/utils"

// Shared layout for the Terms, Privacy Policy and Cookie Policy: the same
// header as the other public pages, a switcher between the three documents,
// a plain-language summary, a table of contents and readable long-form text
// (about 70 characters a line, 16px, high contrast on the dark background).

export interface LegalSection {
  id: string
  title: string
  content: ReactNode
}

export function LegalPage({
  path,
  title,
  intro,
  summary,
  sections,
}: {
  path: (typeof LEGAL_DOCS)[number]["href"]
  title: string
  intro: ReactNode
  /** Plain-language key points. They help readers; the full text is what applies. */
  summary: ReactNode[]
  sections: LegalSection[]
}) {
  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <header className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo_transparent.png" alt="EntrixAlgo" width={28} height={28} className="size-7 object-contain" />
            <span className="text-base font-bold tracking-tight text-white">
              Entrix<span className="text-purple-400">Algo</span>
            </span>
          </Link>
          <Link href="/" className="flex min-h-11 items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200">
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to home
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-6xl px-5 pb-24 pt-10 sm:px-6 sm:pt-14">
        {/* The three documents */}
        <nav aria-label="Legal documents" className="flex flex-wrap gap-2">
          {LEGAL_DOCS.map((doc) => (
            <Link
              key={doc.href}
              href={doc.href}
              aria-current={doc.href === path ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                doc.href === path
                  ? "border-purple-400/40 bg-purple-500/[0.12] text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-gray-400 hover:border-white/20 hover:text-gray-200",
              )}
            >
              {doc.title}
            </Link>
          ))}
        </nav>

        <div className="mt-8 max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-gray-400">Last updated: {legal.lastUpdated}</p>
          <div className="mt-5 space-y-3 text-base leading-7 text-gray-300">{intro}</div>
        </div>

        <section aria-labelledby="legal-summary" className="mt-8 max-w-3xl rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5 sm:p-6">
          <h2 id="legal-summary" className="text-sm font-semibold uppercase tracking-widest text-purple-300">The short version</h2>
          <ul className="mt-4 space-y-2.5 text-[15px] leading-6 text-gray-200">
            {summary.map((point, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-[9px] size-1.5 shrink-0 bg-purple-400" aria-hidden />
                <span>{point}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-gray-400">This summary is here to help you. It is not part of the document: the full text below is what applies.</p>
        </section>

        <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-14">
          <aside>
            <LegalToc items={sections.map(({ id, title: sectionTitle }) => ({ id, title: sectionTitle }))} />
          </aside>

          <article className="mt-8 min-w-0 max-w-[70ch] space-y-12 lg:mt-0">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-8">
                <h2 id={`${section.id}-title`} className="flex items-baseline gap-3 text-xl font-bold tracking-tight text-white sm:text-2xl">
                  <span className="text-base font-semibold tabular-nums text-purple-300">{i + 1}.</span>
                  {section.title}
                </h2>
                <div className={PROSE}>{section.content}</div>
              </section>
            ))}

            <footer className="border-t border-white/[0.07] pt-8 text-sm leading-6 text-gray-400">
              <p>
                Questions about this document? Email <SupportEmail />.
              </p>
              <p className="mt-2">
                © {new Date().getFullYear()} EntrixAlgo. All rights reserved.
              </p>
            </footer>
          </article>
        </div>
      </main>
    </div>
  )
}

// Typography for the body of a section, applied to plain HTML inside it
const PROSE = cn(
  "mt-4 space-y-4 text-base leading-7 text-gray-300",
  "[&_a]:font-medium [&_a]:text-purple-300 [&_a]:underline [&_a]:decoration-purple-300/40 [&_a]:underline-offset-4 [&_a:hover]:text-purple-200",
  "[&_strong]:font-semibold [&_strong]:text-white",
  "[&_h3]:pt-3 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white",
  "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:marker:text-gray-500",
  "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:marker:text-gray-500",
)

/** A boxed passage that must stand out: risk warnings, the refund rule, liability limits */
export function Callout({ tone = "important", title, children }: { tone?: "important" | "note"; title?: string; children: ReactNode }) {
  const important = tone === "important"
  const Icon = important ? AlertTriangle : Info
  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        important ? "border-amber-400/30 bg-amber-400/[0.06]" : "border-purple-400/25 bg-purple-500/[0.07]",
      )}
    >
      {title && (
        <p className={cn("mb-2 flex items-center gap-2 text-sm font-semibold", important ? "text-amber-200" : "text-purple-200")}>
          <Icon className="size-4 shrink-0" aria-hidden />
          {title}
        </p>
      )}
      <div className="space-y-3 text-[15px] leading-6 text-gray-200">{children}</div>
    </div>
  )
}

/** A table that scrolls sideways on a phone instead of breaking the page */
export function LegalTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm leading-6">
        <thead>
          <tr className="bg-white/[0.04]">
            {head.map((cell) => (
              <th key={cell} scope="col" className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-white/[0.07] align-top">
              {row.map((cell, j) => (
                <td key={j} className={cn("px-4 py-3", j === 0 ? "font-medium text-white" : "text-gray-300")}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
