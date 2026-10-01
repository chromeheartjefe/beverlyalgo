"use client"

import { Quote, TrendingUp } from "lucide-react"
import Image from "next/image"

import { Reveal } from "@/components/ui/reveal"
import { type Testimonial, TESTIMONIALS } from "@/config/testimonials"
import { cn } from "@/lib/utils"

import { Badge } from "../../ui/badge"
import { Section } from "../../ui/section"

// Slim testimonial wall: two rows drifting in opposite directions on tablet
// and PC, one row on phones. Built on the shared `animate-marquee` keyframes
// (translateX 0 -> -50% over a doubled list), so it only animates transform.
// Hover or keyboard focus pauses a row, and reduced motion turns the rows
// into plain horizontal scrollers (globals.css stops .animate-marquee).

// Full class strings per accent so Tailwind can see them
const ACCENTS = [
  { line: "via-violet-400/70",  blob: "bg-violet-500/20",  avatar: "from-violet-500 to-fuchsia-500", quote: "text-violet-400/50",  tag: "border-violet-400/30 bg-violet-500/10 text-violet-300" },
  { line: "via-sky-400/70",     blob: "bg-sky-500/20",     avatar: "from-sky-500 to-cyan-400",       quote: "text-sky-400/50",     tag: "border-sky-400/30 bg-sky-500/10 text-sky-300" },
  { line: "via-emerald-400/70", blob: "bg-emerald-500/20", avatar: "from-emerald-500 to-teal-400",   quote: "text-emerald-400/50", tag: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300" },
  { line: "via-amber-400/70",   blob: "bg-amber-500/20",   avatar: "from-amber-500 to-orange-400",   quote: "text-amber-400/50",   tag: "border-amber-400/30 bg-amber-500/10 text-amber-300" },
  { line: "via-fuchsia-400/70", blob: "bg-fuchsia-500/20", avatar: "from-fuchsia-500 to-pink-500",   quote: "text-fuchsia-400/50", tag: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-300" },
  { line: "via-rose-400/70",    blob: "bg-rose-500/20",    avatar: "from-rose-500 to-orange-500",    quote: "text-rose-400/50",    tag: "border-rose-400/30 bg-rose-500/10 text-rose-300" },
] as const

function initials(name: string): string {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  return (words.length > 1 ? words[0][0] + words[1][0] : words[0][0]).toUpperCase()
}

/** Long quotes get a wider card so every card stays three or four lines tall */
const LONG = 90

function TestimonialCard({ t, accent }: { t: Testimonial; accent: (typeof ACCENTS)[number] }) {
  const long = t.text.length > LONG
  return (
    <figure
      className={cn(
        "relative flex shrink-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a16] p-3 transition-colors sm:p-4 duration-300 hover:border-white/30",
        long ? "w-[19.5rem] sm:w-[25rem]" : "w-[13.5rem] sm:w-[16rem]",
      )}
    >
      <span className={cn("pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent", accent.line)} />
      <div className={cn("pointer-events-none absolute -right-10 -top-12 size-32 rounded-full blur-2xl", accent.blob)} />
      <Quote className={cn("absolute right-3 top-3 size-3.5 sm:right-3.5 sm:top-3.5 sm:size-4", accent.quote)} aria-hidden="true" />

      <blockquote className="relative pr-5 text-sm leading-snug text-gray-200 sm:pr-6 sm:leading-relaxed">{t.text}</blockquote>

      <figcaption className="relative mt-2.5 flex items-center gap-2 sm:mt-3 sm:gap-2.5">
        {t.avatar ? (
          <Image src={t.avatar} alt="" width={32} height={32} className="size-7 shrink-0 rounded-full object-cover ring-1 ring-white/20 sm:size-8" />
        ) : (
          <span
            aria-hidden="true"
            className={cn("flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs sm:size-8 font-bold text-white ring-1 ring-white/20", accent.avatar)}
          >
            {initials(t.name)}
          </span>
        )}
        <span className="min-w-0 truncate text-sm font-semibold text-white">{t.name}</span>
        {t.tag && (
          <span className={cn("ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", accent.tag)}>
            <TrendingUp className="size-3" aria-hidden="true" />
            {t.tag}
          </span>
        )}
      </figcaption>
    </figure>
  )
}

const EDGE_FADE = "linear-gradient(to right, transparent, black 6%, black 94%, transparent)"

function MarqueeRow({
  items,
  offset,
  reverse = false,
  seconds,
  className,
}: {
  items: Testimonial[]
  /** Shifts the accent colours so neighbouring rows don't line up */
  offset: number
  reverse?: boolean
  seconds: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden motion-reduce:overflow-x-auto",
        className,
      )}
      style={{ maskImage: EDGE_FADE, WebkitMaskImage: EDGE_FADE }}
    >
      <div
        className="flex w-max animate-marquee items-stretch group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]"
        style={{ animationDuration: `${seconds}s`, animationDirection: reverse ? "reverse" : "normal" }}
      >
        {/* The list twice, so translating by -50% loops seamlessly. The
            second copy is decorative for screen readers. */}
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-stretch gap-3 pr-3" aria-hidden={copy === 1 || undefined}>
            {items.map((t, i) => (
              <li key={t.name} className="flex">
                <TestimonialCard t={t} accent={ACCENTS[(i + offset) % ACCENTS.length]} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

// The list alternates long and short quotes, so each half does too
const HALF = Math.ceil(TESTIMONIALS.length / 2)
const ROW_A = TESTIMONIALS.slice(0, HALF)
const ROW_B = TESTIMONIALS.slice(HALF)

export default function Testimonials() {
  return (
    <Section className="relative overflow-hidden bg-black">
      {/* Soft brand glow behind the rows (static) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-72 -translate-y-1/4 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(168,85,247,0.14),transparent_70%)]"
      />

      <div className="relative mx-auto flex max-w-container flex-col items-center gap-6 sm:gap-8">
        <Reveal className="flex max-w-3xl flex-col items-center gap-3 text-center sm:gap-4">
          <Badge variant="outline" className="border-brand/30 text-brand max-sm:hidden">
            From our traders
          </Badge>
          <h2 className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-3xl font-extrabold text-transparent drop-shadow-[0_0_24px_var(--brand-foreground)] sm:text-5xl pb-2">
            Traders are talking
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed sm:text-lg">
            What EntrixAlgo users say after adding it to their daily routine.
          </p>
        </Reveal>

        <Reveal className="flex w-full flex-col gap-3">
          {/* Phones: one row with every quote */}
          <MarqueeRow items={TESTIMONIALS} offset={0} seconds={150} className="sm:hidden" />
          {/* Tablet and PC: two rows, opposite directions */}
          <MarqueeRow items={ROW_A} offset={0} seconds={90} className="hidden sm:block" />
          <MarqueeRow items={ROW_B} offset={3} seconds={100} reverse className="hidden sm:block" />
        </Reveal>
      </div>
    </Section>
  )
}
