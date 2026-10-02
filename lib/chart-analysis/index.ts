import { isAdmin } from "@/lib/admin"

import type { ChartAnalysisVariant } from "./types"
import { V1_AGGRESSIVE } from "./v1-aggressive"
import { V2 } from "./v2"

export type { ChartAnalysisVariant }
from "./types"

/** What every user gets. */
const PRODUCTION_VARIANT = V2

// Variants the logic switch can pick, production first. Only reachable for
// accounts allowed by canPickVariant; everyone else always runs production.
const PICKABLE_VARIANTS: ChartAnalysisVariant[] = [V2, V1_AGGRESSIVE]

/**
 * Verified admin accounts, plus local `next dev` when
 * NEXT_PUBLIC_SHOW_DEV_LOGIC_SWITCH=1 is set in .env.local. Pass the user row
 * from the DB, not values from the request.
 */
export function canPickVariant(user: Parameters<typeof isAdmin>[0]): boolean {
  if (isAdmin(user)) return true
  return process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_SHOW_DEV_LOGIC_SWITCH === "1"
}

/** Options for the logic switch, or none when the account can't pick. */
export function variantOptions(allowed: boolean): { id: string; label: string }[] {
  return allowed ? PICKABLE_VARIANTS.map((v) => ({ id: v.id, label: v.label })) : []
}

export function resolveVariant(requested: string | null | undefined, allowed: boolean): ChartAnalysisVariant {
  if (!allowed || !requested) return PRODUCTION_VARIANT
  return PICKABLE_VARIANTS.find((v) => v.id === requested) ?? PRODUCTION_VARIANT
}
