"use client"

import dynamic from "next/dynamic"
import type { ComponentType } from "react"

import type { FigureId, SceneSpec } from "@/lib/academy/types"

// Lesson figures, loaded only when a lesson shows them (Remotion stays out of
// every other bundle).
function Placeholder() {
  return <div className="aspect-video w-full animate-pulse border border-white/10 bg-white/[0.03]" />
}

const FIGURES: Record<FigureId, ComponentType> = {
  "order-matching": dynamic(() => import("./order-matching"), { ssr: false, loading: Placeholder }),
  "asset-classes": dynamic(() => import("./asset-classes"), { ssr: false, loading: Placeholder }),
  "market-participants": dynamic(() => import("./market-participants"), { ssr: false, loading: Placeholder }),
  "price-tug": dynamic(() => import("./price-tug"), { ssr: false, loading: Placeholder }),
  "sessions-timeline": dynamic(() => import("./sessions-timeline"), { ssr: false, loading: Placeholder }),
  "order-book": dynamic(() => import("./order-book"), { ssr: false, loading: Placeholder }),
  "market-sweep": dynamic(() => import("./market-sweep"), { ssr: false, loading: Placeholder }),
  "candle-anatomy": dynamic(() => import("./candle-anatomy"), { ssr: false, loading: Placeholder }),
  "candle-merge": dynamic(() => import("./candle-merge"), { ssr: false, loading: Placeholder }),
  "chart-types": dynamic(() => import("./chart-types"), { ssr: false, loading: Placeholder }),
  "structure-story": dynamic(() => import("./structure-story"), { ssr: false, loading: Placeholder }),
  "liquidity-sweep": dynamic(() => import("./liquidity-sweep"), { ssr: false, loading: Placeholder }),
  "fvg-fill": dynamic(() => import("./fvg-fill"), { ssr: false, loading: Placeholder }),
  "power-of-three": dynamic(() => import("./power-of-three"), { ssr: false, loading: Placeholder }),
  killzones: dynamic(() => import("./killzones"), { ssr: false, loading: Placeholder }),
  "analysis-readout": dynamic(() => import("./analysis-readout"), { ssr: false, loading: Placeholder }),
}

// Data-driven Remotion scenes (lib/academy/types.ts SceneSpec)
function ScenePlaceholder() {
  return <div className="aspect-[720/440] w-full animate-pulse border border-white/10 bg-white/[0.03]" />
}

export const Scene: ComponentType<{ spec: SceneSpec }> = dynamic(() => import("./scenes"), { ssr: false, loading: ScenePlaceholder })

export function Figure({ id }: { id: FigureId }) {
  const Component = FIGURES[id]
  return <Component />
}
