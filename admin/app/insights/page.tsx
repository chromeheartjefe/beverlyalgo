import { AlertTriangle, BrainCircuit, CheckCircle2, History, ListChecks, MessageSquareText, OctagonAlert, ShieldAlert, Sparkles } from "lucide-react"
import Link from "next/link"

import { AskBox, BriefingButton, SaveIdeaButton } from "~/components/ai-controls"
import { Badge, type BadgeColor, Card, cx, Muted, Notice, PageHeader, SectionLabel } from "~/components/ui"
import { AI_MODEL, aiConfigured, aiSpend } from "~/lib/ai"
import { type Briefing, listAnswers, listBriefings } from "~/lib/briefing"
import { ago, dateTime, usd } from "~/lib/format"

export const dynamic = "force-dynamic"

const TONE = {
  good: { icon: CheckCircle2, cls: "text-emerald-300", box: "border-emerald-400/20 bg-emerald-500/[0.05]" },
  warn: { icon: AlertTriangle, cls: "text-amber-300", box: "border-amber-400/20 bg-amber-500/[0.05]" },
  bad:  { icon: OctagonAlert, cls: "text-rose-300", box: "border-rose-400/20 bg-rose-500/[0.06]" },
} as const

const LEVEL: Record<string, BadgeColor> = { high: "green", medium: "amber", low: "gray" }
const EFFORT: Record<string, BadgeColor> = { low: "green", medium: "amber", high: "red" }

const SUGGESTIONS = [
  "Why aren't more free users upgrading?",
  "What should I focus on this week?",
  "Are AI costs sustainable at this revenue?",
  "Which feature drives retention the most?",
]

function scoreColor(s: number) {
  return s >= 7 ? "bg-emerald-400" : s >= 4 ? "bg-amber-400" : "bg-rose-400"
}

function BriefingView({ b }: { b: Briefing }) {
  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="relative overflow-hidden rounded-2xl border border-fuchsia-400/25 bg-gradient-to-br from-fuchsia-600/15 via-violet-600/10 to-transparent p-6">
        <div className="pointer-events-none absolute -right-24 -top-28 size-80 bg-[radial-gradient(closest-side,rgba(217,70,239,0.25),transparent)]" />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.18em] text-fuchsia-300">Briefing · {dateTime(b.at)}</p>
        <h2 className="relative mt-2 text-xl font-semibold leading-snug text-white lg:text-2xl">{b.headline}</h2>
        <p className="relative mt-3 max-w-4xl text-sm leading-relaxed text-gray-300">{b.summary}</p>
        <p className="relative mt-4 text-[11px] text-gray-500">{b.model} · {usd(b.costUsd, 4)}</p>
      </div>

      {/* Scores */}
      {b.scores.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {b.scores.map((s) => (
            <div key={s.area} className="rounded-2xl border border-white/[0.09] bg-surface/80 p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-medium text-gray-400">{s.area}</p>
                <p className="num text-lg font-semibold text-white">{s.score}<span className="text-xs text-gray-500">/10</span></p>
              </div>
              <div className="mt-2 h-1.5 bg-white/[0.07]">
                <div className={cx("h-full", scoreColor(s.score))} style={{ width: `${s.score * 10}%` }} />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-gray-400">{s.note}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" accent="violet" icon={ListChecks} title="Recommended actions" sub="Ranked by expected impact. Save the good ones to your Ideas board.">
          <ol className="space-y-2.5">
            {b.actions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                <span className="num flex size-6 shrink-0 items-center justify-center rounded-md bg-violet-500/20 text-xs font-bold text-violet-200">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{a.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{a.why}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge color={LEVEL[a.impact] ?? "gray"}>impact {a.impact}</Badge>
                    <Badge color={EFFORT[a.effort] ?? "gray"}>effort {a.effort}</Badge>
                    {a.area && <Badge color="purple">{a.area}</Badge>}
                  </div>
                </div>
                <SaveIdeaButton action={{ title: a.title, why: a.why, area: a.area ?? "", impact: a.impact, effort: a.effort }} />
              </li>
            ))}
          </ol>
        </Card>

        <div className="space-y-4 xl:col-span-2">
          <Card accent="sky" icon={Sparkles} title="What the numbers say">
            <ul className="space-y-2">
              {b.insights.map((it, i) => {
                const t = TONE[it.tone] ?? TONE.warn
                const Icon = t.icon
                return (
                  <li key={i} className={cx("flex items-start gap-2.5 rounded-xl border px-3 py-2.5", t.box)}>
                    <Icon className={cx("mt-0.5 size-4 shrink-0", t.cls)} aria-hidden />
                    <div>
                      <p className="text-sm font-medium text-white">{it.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{it.detail}</p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </Card>
          {b.risks.length > 0 && (
            <Card accent="rose" icon={ShieldAlert} title="Risks to watch">
              <ul className="space-y-1.5">
                {b.risks.map((r, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-300"><span className="text-rose-400" aria-hidden>•</span>{r}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ b?: string }> }) {
  const sp = await searchParams
  let storeError: string | null = null
  const keep = <T,>(fallback: T) => (err: unknown) => {
    storeError ??= (err as Error).message
    return fallback
  }
  const [briefings, answers, spend] = await Promise.all([
    listBriefings().catch(keep([])),
    listAnswers().catch(keep([])),
    aiSpend().catch(keep({ total: 0, month: 0, calls: 0 })),
  ])
  const shown = briefings.find((x) => x.id === sp.b) ?? briefings[0]
  const configured = aiConfigured()

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BrainCircuit}
        accent="fuchsia"
        eyebrow="Command"
        title="AI analyst"
        sub={`Reads your live aggregate numbers (no emails or names leave this machine) and tells you what matters. ${AI_MODEL} · ${usd(spend.month, 4)} this month · logged in admin/data, separate from the site's AI budget.`}
        right={configured ? <BriefingButton hasBriefing={briefings.length > 0} /> : undefined}
      />

      {storeError && <Notice tone="red">{storeError}</Notice>}

      {!configured && (
        <Notice>
          Add <code>OPENAI_API_KEY</code> to <code>admin/.env.local</code> (the same key as the site&apos;s <code>.env.local</code>) and restart <code>npm run admin</code>. Optional: <code>ADMIN_AI_MODEL</code> to use a different model.
        </Notice>
      )}

      {shown ? (
        <BriefingView b={shown} />
      ) : (
        <Card accent="fuchsia">
          <div className="flex flex-col items-center py-10 text-center">
            <BrainCircuit className="size-10 text-fuchsia-300/70" aria-hidden />
            <p className="mt-3 text-sm font-medium text-white">No briefing yet</p>
            <p className="mt-1 max-w-md text-sm text-gray-400">Generate one to get a headline, five health scores, ranked actions and risks, all grounded in your live numbers. Each costs well under a cent.</p>
          </div>
        </Card>
      )}

      <SectionLabel accent="fuchsia">Ask your data</SectionLabel>
      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3" accent="fuchsia" icon={MessageSquareText} title="Questions" sub="Answered from the same live snapshot">
          {configured ? <AskBox suggestions={SUGGESTIONS} /> : <Muted>Needs OPENAI_API_KEY.</Muted>}
          <div className="mt-5 space-y-3">
            {answers.slice(0, 6).map((a) => (
              <div key={a.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <p className="text-sm font-medium text-fuchsia-200">{a.question}</p>
                <div className="mt-2 space-y-2 text-sm leading-relaxed text-gray-300">
                  {a.answer.split(/\n+/).map((p, i) => <p key={i}>{p}</p>)}
                </div>
                {a.followUps.length > 0 && (
                  <p className="mt-2 text-xs text-gray-500">Next: {a.followUps.join(" · ")}</p>
                )}
                <p className="mt-2 text-[11px] text-gray-600">{ago(a.at)} · {usd(a.costUsd, 4)}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="xl:col-span-2" accent="violet" icon={History} title="Past briefings">
          {briefings.length === 0 ? (
            <Muted>None yet.</Muted>
          ) : (
            <ul className="space-y-1.5">
              {briefings.map((x) => (
                <li key={x.id}>
                  <Link
                    href={`/insights?b=${x.id}`}
                    className={cx(
                      "block rounded-lg border px-3 py-2 transition-colors",
                      x.id === shown?.id ? "border-violet-400/30 bg-violet-500/10" : "border-transparent hover:bg-white/[0.04]",
                    )}
                  >
                    <p className="line-clamp-2 text-sm text-gray-200">{x.headline}</p>
                    <p className="mt-0.5 text-[11px] text-gray-500">{dateTime(x.at)}</p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
