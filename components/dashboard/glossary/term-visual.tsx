"use client"

import { useMemo } from "react"

import { Figure } from "@/components/dashboard/academy/figures"
import { TeachingChart } from "@/components/dashboard/academy/teaching-chart"
import type { VisualKey } from "@/lib/glossary/types"
import { glossaryVisual } from "@/lib/glossary/visuals"

// A glossary term's visual: one of the Academy's teaching charts or figures.
export function TermVisual({ visual }: { visual: VisualKey }) {
  const v = useMemo(() => glossaryVisual(visual), [visual])
  if (v.type === "figure") return <Figure id={v.id} />
  return <TeachingChart spec={v.chart} height={v.chart.height ?? 230} />
}
