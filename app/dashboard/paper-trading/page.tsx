import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PaperTradingGate } from "@/components/dashboard/paper-trading/gate"
import type { Hints } from "@/components/dashboard/paper-trading/order-ticket"
import type { MissionView } from "@/components/dashboard/paper-trading/panels"
import { PAPER_TRADING } from "@/config/features"
import { findLessonById, lessonHref } from "@/lib/academy/curriculum"
import { TERM_BY_SLUG } from "@/lib/glossary/terms"
import { MISSIONS } from "@/lib/sim/missions"

export const metadata: Metadata = {
  title: "Paper Trading",
  description: "Practise trading on a simulated market with a virtual account, missions and honest feedback.",
}

/** Glossary terms the page itself explains with a pop-up, besides the ones missions point to */
const PAGE_TERMS = ["risk-per-trade", "stop-loss", "take-profit", "r-multiple", "win-rate", "expectancy"]

// The mission list, the lesson links and the glossary pop-ups are put together
// on the server, so the browser only gets the few terms and lessons it shows.
export default function PaperTradingPage() {
  if (!PAPER_TRADING) notFound()

  const missions: MissionView[] = MISSIONS.map((m) => {
    const ref = findLessonById(m.lessonId)
    return {
      id: m.id,
      title: m.title,
      goal: m.goal,
      xp: m.xp,
      lesson: ref ? { title: ref.lesson.title, href: lessonHref(ref) } : null,
      terms: m.terms.flatMap((slug) => (TERM_BY_SLUG[slug] ? [{ slug, label: TERM_BY_SLUG[slug].term }] : [])),
    }
  })

  const hints: Hints = {}
  for (const slug of [...PAGE_TERMS, ...MISSIONS.flatMap((m) => m.terms)]) {
    const term = TERM_BY_SLUG[slug]
    if (term) hints[slug] = { slug: term.slug, term: term.term, short: term.short, category: term.category }
  }

  const ruin = findLessonById("u11-risk-of-ruin")

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Paper Trading</h1>
        <p className="mt-1 max-w-2xl text-sm text-gray-400">
          Practise on a simulated market with virtual money. Pass accounts by growing them without breaking the loss limits, and complete missions that
          put your Academy lessons to work.
        </p>
      </div>
      <PaperTradingGate missions={missions} hints={hints} ruinHref={ruin ? lessonHref(ruin) : null} />
    </div>
  )
}
