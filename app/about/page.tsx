import { ArrowLeft, Brain, ShieldCheck, TrendingUp } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title:       "About – EntrixAlgo",
  description: "What EntrixAlgo is, and why we built it.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-400">{children}</div>
    </section>
  )
}

const VALUES = [
  {
    icon:  Brain,
    title: "AI-assisted, not AI-automated",
    body:  "EntrixAlgo reads charts and surfaces patterns, levels, and risk — you make the call. We don't run autopilot trades and never will.",
  },
  {
    icon:  ShieldCheck,
    title: "Risk-first by design",
    body:  "Every analysis ships with invalidation levels and a risk assessment, not just a signal. Every account gets a free risk calculator and trade journal, no paywall.",
  },
  {
    icon:  TrendingUp,
    title: "Built for traders who do the work",
    body:  "EntrixAlgo speeds up your analysis, it doesn't replace your judgment. It's a tool for people who already understand risk management, not a shortcut around it.",
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <header className="border-b border-white/[0.07] px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo_transparent.png" alt="EntrixAlgo" width={28} height={28} className="size-7 object-contain" />
            <span className="text-base font-bold tracking-tight text-white">
              Entrix<span className="text-purple-400">Algo</span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300">
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-bold text-white">About EntrixAlgo</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-400">
          EntrixAlgo is an AI-powered chart analysis platform built for traders who want a second pair of eyes on
          every setup — without handing over control of their trades.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-purple-500/[0.12]">
                <Icon className="size-4 text-purple-400" />
              </div>
              <p className="mt-3 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-10">
          <Section title="What we do">
            <p>
              Upload a chart screenshot and EntrixAlgo&apos;s AI reads it the way an experienced analyst would: pattern
              recognition, support and resistance, trend structure, and a clear entry, target, and stop loss with a
              risk/reward ratio. Every analysis explains its reasoning, not just its conclusion, so you can decide for
              yourself whether the setup makes sense.
            </p>
            <p>
              Alongside chart analysis, every account — free or paid — gets a trade journal to track real performance
              over time and a risk calculator to size positions correctly. We think risk management tools shouldn&apos;t
              be a premium feature.
            </p>
          </Section>

          <Section title="What we're not">
            <p>
              We&apos;re not a signals-for-profit scheme, an automated trading bot, or a promise of guaranteed returns.
              Trading carries real risk, and AI analysis can be wrong. EntrixAlgo is built to make you a faster,
              more disciplined analyst — the trading decisions, and the outcomes, are always yours.
            </p>
          </Section>

          <Section title="Get in touch">
            <p>
              Questions, feedback, or partnership inquiries — reach out through the contact options listed on our{" "}
              <Link href="/" className="text-purple-400 hover:text-purple-300">homepage</Link>.
            </p>
          </Section>
        </div>
      </main>
    </div>
  )
}
