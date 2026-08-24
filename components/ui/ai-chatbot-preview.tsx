"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Bot, Check, MessageCircle } from "lucide-react"
import { useEffect, useState } from "react"

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Reveal } from "@/components/ui/reveal"

// ─── Types & constants ────────────────────────────────────────────────────────

type Phase = "asking" | "thinking" | "answering"

const PHASE_ORDER: Phase[] = ["asking", "thinking", "answering"]

const PHASE_DURATION: Record<Phase, number> = {
  asking: 1500,
  thinking: 1600,
  answering: 4200,
}

const QA_PAIRS = [
  {
    q: "What's causing BTC to pump right now?",
    a: "Funding rates just flipped positive and ETF inflows hit $420M today. Price broke the $68K resistance with strong volume behind it.",
  },
  {
    q: "Is this a good entry for a long?",
    a: "RSI sits at 58, not overbought yet. An entry near $68.4K with a stop below the $66.9K support gives roughly a 2.4:1 reward-to-risk.",
  },
  {
    q: "What's a healthy risk/reward ratio?",
    a: "Most consistent traders target at least 2:1. Anything below 1:1 needs a very high win rate to stay profitable long-term.",
  },
]

// ─── Typing indicator ─────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-3 py-2.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-gray-500"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function AiChatbotPreview() {
  const [phase, setPhase] = useState<Phase>("asking")
  const [pairIndex, setPairIndex] = useState(0)

  useEffect(() => {
    let current: Phase = "asking"
    let idx = 0
    let timer: ReturnType<typeof setTimeout>

    const advance = () => {
      const i = PHASE_ORDER.indexOf(current)
      current = PHASE_ORDER[(i + 1) % PHASE_ORDER.length]
      if (current === "asking") idx = (idx + 1) % QA_PAIRS.length
      setPhase(current)
      setPairIndex(idx)
      timer = setTimeout(advance, PHASE_DURATION[current])
    }

    timer = setTimeout(advance, PHASE_DURATION["asking"])
    return () => clearTimeout(timer)
  }, [])

  const pair = QA_PAIRS[pairIndex]

  return (
    <section className="relative bg-black pb-3 pt-3 md:pb-4 md:pt-4">
      <div className="mx-auto max-w-7xl px-6">
        {/* Outer card */}
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[#070712] shadow-2xl shadow-black/60">
          <BackgroundGradientAnimation variant="corners" size="45%" containerClassName="absolute inset-0 z-0" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2">

            {/* ── Left: animated preview ── */}
            <div className="order-2 flex items-center justify-center border-t border-white/[0.05] bg-gradient-to-br from-[#0b0b1e] to-[#050510] p-8 lg:order-1 lg:border-l-0 lg:border-r lg:border-t-0 lg:p-12">
              <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.07] bg-[#08080f]">
                {/* Chat header */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-purple-500/15">
                      <Bot className="size-3.5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">EntrixAlgo · AI Agent</p>
                      <div className="flex items-center gap-1.5">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        <p className="text-[10px] leading-none text-gray-600">Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thread — question + typing/answer are one unit so an
                    exchange fades out and in as a whole, never snapping
                    layout mid-cycle */}
                <div className="flex h-72 flex-col justify-end p-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`pair-${pairIndex}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.45, ease: "easeInOut" }}
                      className="flex flex-col gap-3"
                    >
                      <div className="flex justify-end">
                        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-purple-500 px-4 py-2.5 text-sm leading-relaxed text-white">
                          {pair.q}
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {phase === "thinking" && (
                          <motion.div
                            key="thinking"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <TypingDots />
                          </motion.div>
                        )}
                        {phase === "answering" && (
                          <motion.div
                            key="answer"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35, ease: "easeInOut" }}
                            className="max-w-[85%] rounded-2xl rounded-tl-sm border border-white/[0.07] bg-white/[0.035] px-4 py-2.5 text-sm leading-relaxed text-gray-200"
                          >
                            {pair.a}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Decorative input bar */}
                <div className="border-t border-white/[0.06] p-3">
                  <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-2.5">
                    <span className="flex-1 text-sm text-gray-600">Ask about any market…</span>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/15">
                      <ArrowUp className="size-3.5 text-purple-400" />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Right: copy ── */}
            <div className="order-1 flex flex-col justify-center p-8 lg:order-2 lg:p-12 xl:p-16">
              {/* Badge */}
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-[11px] font-medium text-purple-400">
                <MessageCircle className="size-3" />
                AI Trading Assistant
              </div>

              {/* Headline */}
              <h2 className="mt-6 text-3xl font-black tracking-tight text-white lg:text-4xl xl:text-[2.6rem] xl:leading-[1.18]">
                Your personal <span className="text-purple-400">trading AI</span>
              </h2>

              {/* Body copy */}
              <p className="mt-5 text-base leading-relaxed text-gray-400">
                Ask about any market and get instant AI-powered insights, straight
                answers on strategy, and risk management. No fluff, no generic advice.
              </p>

              {/* Feature bullets */}
              <ul className="mt-8 space-y-3">
                {[
                  "Real-time market Q&A",
                  "Strategy & risk guidance",
                  "Trade setup suggestions",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/15">
                      <Check className="size-3 text-purple-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-10">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-200 hover:from-purple-500 hover:to-purple-400 hover:shadow-purple-900/50"
                >
                  Get Started
                  <MessageCircle className="size-4" />
                </a>
                <p className="mt-3 text-xs text-gray-600">
                  Available in Pro plan · Live now in your dashboard
                </p>
              </div>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  )
}
