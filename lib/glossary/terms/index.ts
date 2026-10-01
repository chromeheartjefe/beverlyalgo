import type { GlossaryTerm } from "@/lib/glossary/types"

import { CHARTS } from "./charts"
import { INDICATORS } from "./indicators"
import { LEVELS } from "./levels"
import { MACRO } from "./macro"
import { MARKETS } from "./markets"
import { ORDERS } from "./orders"
import { PSYCHOLOGY } from "./psychology"
import { RISK } from "./risk"
import { SMC } from "./smc"
import { STRATEGY } from "./strategy"
import { STRUCTURE } from "./structure"
import { TIME } from "./time"

/** Every glossary term, sorted A to Z */
export const TERMS: GlossaryTerm[] = [
  ...MARKETS,
  ...ORDERS,
  ...CHARTS,
  ...STRUCTURE,
  ...LEVELS,
  ...INDICATORS,
  ...SMC,
  ...TIME,
  ...RISK,
  ...STRATEGY,
  ...PSYCHOLOGY,
  ...MACRO,
].sort((a, b) => a.term.localeCompare(b.term, "en", { sensitivity: "base" }))

export const TERM_BY_SLUG: Record<string, GlossaryTerm> = Object.fromEntries(TERMS.map((t) => [t.slug, t]))
