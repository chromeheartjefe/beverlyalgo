"use client"

import { Clock } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { Loaded } from "@/components/ui/motion"
import { cn } from "@/lib/utils"

import { OverviewCard, Skeleton } from "./card"

// Regular trading hours in each exchange's own time zone, so daylight saving
// is handled by Intl. Holidays and lunch breaks are not modelled.
type Session = { name: string; venue: string; tz: string; open: number; close: number; color: string }

const SESSIONS: Session[] = [
  { name: "Tokyo",    venue: "Tokyo Stock Exchange", tz: "Asia/Tokyo",       open: 9 * 60,      close: 15 * 60 + 30, color: "#f472b6" },
  { name: "London",   venue: "London Stock Exchange", tz: "Europe/London",   open: 8 * 60,      close: 16 * 60 + 30, color: "#60a5fa" },
  { name: "New York", venue: "NYSE and Nasdaq",      tz: "America/New_York", open: 9 * 60 + 30, close: 16 * 60,      color: "#a78bfa" },
]

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const DAY = 1440

function zoned(now: Date, tz: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(now)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0"
  return { weekday: WEEKDAYS.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) }
}

/** Open now, and minutes until it closes; or closed, and minutes until it opens. */
function sessionStatus(s: Session, now: Date): { open: boolean; minutes: number } {
  const { weekday, minutes } = zoned(now, s.tz)
  const tradingDay = weekday < 5
  if (tradingDay && minutes >= s.open && minutes < s.close) return { open: true, minutes: s.close - minutes }
  if (tradingDay && minutes < s.open) return { open: false, minutes: s.open - minutes }
  let wait = DAY - minutes + s.open
  let day = (weekday + 1) % 7
  while (day >= 5) {
    wait += DAY
    day = (day + 1) % 7
  }
  return { open: false, minutes: wait }
}

const mod = (n: number, m: number) => ((n % m) + m) % m

/** The session's hours as [start, end] spans on the viewer's own 24h clock. */
function localSpans(s: Session, now: Date): [number, number][] {
  const viewer = now.getHours() * 60 + now.getMinutes()
  const offset = zoned(now, s.tz).minutes - viewer
  const start = mod(s.open - offset, DAY)
  const end = mod(s.close - offset, DAY)
  return start < end ? [[start, end]] : [[start, DAY], [0, end]]
}

function duration(min: number) {
  if (min >= DAY) return `${Math.floor(min / DAY)}d ${Math.floor((min % DAY) / 60)}h`
  if (min >= 60) return `${Math.floor(min / 60)}h ${min % 60}m`
  return `${min}m`
}

const clock = (now: Date, tz?: string) =>
  now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz })

const noopSubscribe = () => () => {}

export function MarketSessions() {
  // Time-based, so the server render has no clock (no server/client
  // mismatch) and it re-renders every 30 seconds for the countdowns. When the
  // card mounts on the client (a tab switch, not hydration) the clock is
  // known at once: starting from null there flashed the skeleton every visit.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const [now, setNow] = useState<Date | null>(() => (hydrated ? new Date() : null))
  useEffect(() => {
    setNow(new Date())
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  const rows = now ? SESSIONS.map((s) => ({ s, ...sessionStatus(s, now), spans: localSpans(s, now) })) : []
  const openCount = rows.filter((r) => r.open).length
  const next = rows.length ? [...rows].sort((a, b) => a.minutes - b.minutes)[0] : null
  const viewerMinutes = now ? now.getHours() * 60 + now.getMinutes() : 0

  return (
    <OverviewCard
      accent="indigo"
      icon={Clock}
      title="Market sessions"
      sub={now ? `Your time ${clock(now)}, regular hours` : "Regular hours"}
    >
      <Loaded
        loading={!now}
        className="flex flex-1 flex-col"
        fallback={
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            {SESSIONS.map((s) => <Skeleton key={s.name} className="h-9 w-full" />)}
          </div>
        }
      >
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3">
            <p className="text-sm font-semibold text-white">
              {openCount === 0 ? "Stock markets are closed" : `${openCount} of ${SESSIONS.length} stock markets open`}
            </p>
            {next && (
              <p className="mt-0.5 text-xs text-gray-400">
                {next.s.name} {next.open ? "closes" : "opens"} in{" "}
                <span className="font-semibold tabular-nums text-indigo-200">{duration(next.minutes)}</span>
              </p>
            )}
          </div>

          <ul className="mt-4 space-y-3.5">
            {rows.map(({ s, open, minutes, spans }) => (
              <li key={s.name} className="grid grid-cols-[5.25rem_1fr_6.25rem] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs tabular-nums text-gray-500">{clock(now ?? new Date(), s.tz)} local</p>
                </div>
                <div className="relative h-2.5 bg-white/[0.06]" aria-hidden>
                  {spans.map(([a, b]) => (
                    <span
                      key={a}
                      className="absolute inset-y-0"
                      style={{
                        left: `${(a / DAY) * 100}%`,
                        width: `${((b - a) / DAY) * 100}%`,
                        background: s.color,
                        opacity: open ? 0.95 : 0.35,
                        boxShadow: open ? `0 0 10px ${s.color}88` : undefined,
                      }}
                    />
                  ))}
                  <span className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-white" style={{ left: `${(viewerMinutes / DAY) * 100}%` }} />
                </div>
                <div className="text-right">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold",
                      open ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.04] text-gray-400"
                    )}
                  >
                    {open && <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" aria-hidden />}
                    {open ? "Open" : "Closed"}
                  </span>
                  <p className="mt-0.5 text-xs tabular-nums text-gray-500">
                    {open ? "closes" : "opens"} in {duration(minutes)}
                  </p>
                </div>
              </li>
            ))}
            <li className="grid grid-cols-[5.25rem_1fr_6.25rem] items-center gap-3">
              <div>
                <p className="text-sm font-medium text-white">Crypto</p>
                <p className="text-xs text-gray-500">Always on</p>
              </div>
              <div className="relative h-2.5 bg-gradient-to-r from-emerald-500/70 via-teal-400/70 to-emerald-500/70" aria-hidden>
                <span className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-white" style={{ left: `${(viewerMinutes / DAY) * 100}%` }} />
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400 motion-reduce:animate-none" aria-hidden />
                  Open
                </span>
                <p className="mt-0.5 text-xs text-gray-500">24/7</p>
              </div>
            </li>
          </ul>

          <div className="mt-2 grid grid-cols-[5.25rem_1fr_6.25rem] gap-3 text-[10px] text-gray-600" aria-hidden>
            <span />
            <div className="flex justify-between tabular-nums">
              <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
            </div>
            <span />
          </div>
          <p className="mt-auto pt-3 text-xs text-gray-600">Bars show each session in your time. Holidays are not included.</p>
      </Loaded>
    </OverviewCard>
  )
}
