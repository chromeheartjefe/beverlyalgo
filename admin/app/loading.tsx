// Shown instantly while a page's data loads, so navigation never feels stuck
export default function Loading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="flex items-center gap-3.5">
        <div className="size-11 rounded-xl bg-white/[0.06]" />
        <div className="space-y-2">
          <div className="h-3 w-24 bg-white/[0.06]" />
          <div className="h-6 w-48 bg-white/[0.08]" />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-36 rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <div className="h-80 rounded-2xl border border-white/[0.06] bg-white/[0.03] xl:col-span-3" />
        <div className="h-80 rounded-2xl border border-white/[0.06] bg-white/[0.03] xl:col-span-2" />
      </div>
    </div>
  )
}
