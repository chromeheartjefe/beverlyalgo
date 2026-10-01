import { CATEGORIES, type CategoryId, type Level } from "@/lib/glossary/types"

// Literal Tailwind classes per category colour (Tailwind can't see built strings)
const TONE_CLASSES = {
  sky:     { chip: "border-sky-400/30 bg-sky-500/10 text-sky-200",             dot: "bg-sky-400",     active: "border-sky-400/70 bg-sky-500/20 text-white" },
  emerald: { chip: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200", dot: "bg-emerald-400", active: "border-emerald-400/70 bg-emerald-500/20 text-white" },
  indigo:  { chip: "border-indigo-400/30 bg-indigo-500/10 text-indigo-200",    dot: "bg-indigo-400",  active: "border-indigo-400/70 bg-indigo-500/20 text-white" },
  violet:  { chip: "border-violet-400/30 bg-violet-500/10 text-violet-200",    dot: "bg-violet-400",  active: "border-violet-400/70 bg-violet-500/20 text-white" },
  teal:    { chip: "border-teal-400/30 bg-teal-500/10 text-teal-200",          dot: "bg-teal-400",    active: "border-teal-400/70 bg-teal-500/20 text-white" },
  amber:   { chip: "border-amber-400/30 bg-amber-500/10 text-amber-200",       dot: "bg-amber-400",   active: "border-amber-400/70 bg-amber-500/20 text-white" },
  fuchsia: { chip: "border-fuchsia-400/30 bg-fuchsia-500/10 text-fuchsia-200", dot: "bg-fuchsia-400", active: "border-fuchsia-400/70 bg-fuchsia-500/20 text-white" },
  cyan:    { chip: "border-cyan-400/30 bg-cyan-500/10 text-cyan-200",          dot: "bg-cyan-400",    active: "border-cyan-400/70 bg-cyan-500/20 text-white" },
  rose:    { chip: "border-rose-400/30 bg-rose-500/10 text-rose-200",          dot: "bg-rose-400",    active: "border-rose-400/70 bg-rose-500/20 text-white" },
  lime:    { chip: "border-lime-400/30 bg-lime-500/10 text-lime-200",          dot: "bg-lime-400",    active: "border-lime-400/70 bg-lime-500/20 text-white" },
  orange:  { chip: "border-orange-400/30 bg-orange-500/10 text-orange-200",    dot: "bg-orange-400",  active: "border-orange-400/70 bg-orange-500/20 text-white" },
  blue:    { chip: "border-blue-400/30 bg-blue-500/10 text-blue-200",          dot: "bg-blue-400",    active: "border-blue-400/70 bg-blue-500/20 text-white" },
} as const

export function categoryStyle(id: CategoryId) {
  const cat = CATEGORIES.find((c) => c.id === id)!
  return { label: cat.label, ...TONE_CLASSES[cat.tone] }
}

export const LEVEL_STYLE: Record<Level, { label: string; className: string }> = {
  beginner:     { label: "Beginner",     className: "text-emerald-300" },
  intermediate: { label: "Intermediate", className: "text-amber-300" },
  advanced:     { label: "Advanced",     className: "text-rose-300" },
}
