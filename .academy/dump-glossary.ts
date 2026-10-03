// Prints every glossary term with its definition, for review.
//   npx tsx --tsconfig tsconfig.json .academy/dump-glossary.ts
import { TERMS } from "../lib/glossary/terms"

for (const t of TERMS) console.log(`[${t.category}] ${t.term}${t.visual ? ` {visual ${t.visual}}` : ""}: ${t.short} // ${(t.detail ?? []).join(" / ")}`)
console.log(`\n${TERMS.length} terms`)
