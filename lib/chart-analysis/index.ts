import type { ChartAnalysisVariant } from "./types"
import { V1_AGGRESSIVE } from "./v1-aggressive"
import { V2 } from "./v2"

export type { ChartAnalysisVariant, ChartAnalysisVariantId } from "./types"

/** What every user gets. */
export const PRODUCTION_VARIANT = V2

// Developer-only variants. Never reachable in a production build: the
// NODE_ENV check below is a build-time constant, so outside `next dev` the
// requested id is ignored and PRODUCTION_VARIANT always runs.
const DEV_VARIANTS: Record<string, ChartAnalysisVariant> = {
  [V1_AGGRESSIVE.id]: V1_AGGRESSIVE,
  [V2.id]:            V2,
}

export function resolveVariant(requested: string | null | undefined): ChartAnalysisVariant {
  if (process.env.NODE_ENV !== "development" || !requested) return PRODUCTION_VARIANT
  return DEV_VARIANTS[requested] ?? PRODUCTION_VARIANT
}
