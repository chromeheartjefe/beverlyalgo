import { CheckCircle2, Hammer, Inbox, Lightbulb, Sparkles } from "lucide-react"

import { SuggestIdeasButton } from "~/components/ai-controls"
import { IdeaBoard } from "~/components/idea-board"
import { Notice, PageHeader, Stat } from "~/components/ui"
import { aiConfigured } from "~/lib/ai"
import { num } from "~/lib/format"
import { listIdeas } from "~/lib/ideas"

export const dynamic = "force-dynamic"

export default async function IdeasPage() {
  let ideas: Awaited<ReturnType<typeof listIdeas>> = []
  let storeError: string | null = null
  try {
    ideas = await listIdeas()
  } catch (err) {
    storeError = (err as Error).message
  }
  const ai = aiConfigured()
  const count = (s: string) => ideas.filter((i) => i.status === s).length
  const reviewed = ideas.filter((i) => i.review)
  const avgScore = reviewed.length ? reviewed.reduce((t, i) => t + (i.review?.score ?? 0), 0) / reviewed.length : null

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Lightbulb}
        accent="amber"
        eyebrow="Command"
        title="Ideas"
        sub="Drop ideas here, rate impact and effort, let the AI review them against your live numbers, and move the good ones toward shipped. Saved in admin/data/ideas.json on this machine, so Claude can read the board when you want to build one."
        right={ai ? <SuggestIdeasButton /> : undefined}
      />

      {!ai && <Notice tone="blue">Add <code>OPENAI_API_KEY</code> to <code>admin/.env.local</code> to unlock AI reviews and AI suggestions. The board works without it.</Notice>}

      {storeError && <Notice tone="red">{storeError}</Notice>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat accent="amber" icon={Inbox} label="In the inbox" value={num(count("inbox"))} hint={`${num(ideas.length)} ideas in total`} />
        <Stat accent="violet" icon={Sparkles} label="Exploring · planned" value={num(count("exploring") + count("planned"))} />
        <Stat accent="sky" icon={Hammer} label="Building" value={num(count("building"))} />
        <Stat accent="emerald" icon={CheckCircle2} label="Shipped" value={num(count("shipped"))} hint={avgScore ? `avg AI score ${avgScore.toFixed(1)}/10` : undefined} />
      </div>

      {!storeError && <IdeaBoard ideas={ideas} aiReady={ai} />}
    </div>
  )
}
