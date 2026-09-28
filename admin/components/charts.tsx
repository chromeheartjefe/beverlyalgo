"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Categorical slots from the dataviz reference palette, dark steps, in fixed
// order (validated on this console's #0d0d1c surface: CVD ΔE 9.4, contrast
// ≥3:1). Charts here never use more than three series, the limit that holds
// for every chart form. A single series always takes slot 1.
export const SERIES = ["#3987e5", "#d95926", "#199e70"] as const

const SURFACE = "#0d0d1c"
const GRID = "rgba(255,255,255,0.07)"
const AXIS = "#9ca3af"

type Row = Record<string, string | number>

const shortDay = (day: string) => {
  const d = new Date(`${day}T00:00:00Z`)
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" })
}

function TooltipBox({ active, payload, label, format }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
  format: (v: number) => string
}) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((s, p) => s + Number(p.value || 0), 0)
  return (
    <div className="rounded-lg border border-white/15 bg-[#12122a] px-3 py-2 text-xs shadow-xl">
      <p className="mb-1 font-medium text-white">{label ? shortDay(label) : ""}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-2 text-gray-300">
          <span className="inline-block size-2 rounded-sm" style={{ background: p.color }} />
          {p.name}: <span className="font-medium text-white tabular-nums">{format(Number(p.value))}</span>
        </p>
      ))}
      {payload.length > 1 && <p className="mt-1 border-t border-white/10 pt-1 text-gray-400">Total: <span className="text-white">{format(total)}</span></p>}
    </div>
  )
}

// Pages are server components and can't pass functions to these client
// charts, so they pick a formatter by name instead.
export type ValueFormat = "number" | "usd" | "usd0" | "usdSmall"

const FORMATTERS: Record<ValueFormat, (v: number) => string> = {
  number:   (v) => v.toLocaleString("en-US"),
  usd:      (v) => `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  usd0:     (v) => `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
  usdSmall: (v) => (Math.abs(v) < 1 ? `$${v.toFixed(4)}` : `$${v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`),
}

/** One measure over time, e.g. signups per day. */
export function TrendLine({ data, dataKey, name, format: formatName = "number", height = 220 }: {
  data: Row[]
  dataKey: string
  name: string
  format?: ValueFormat
  height?: number
}) {
  const format = FORMATTERS[formatName]
  return (
    <div style={{ height }} role="img" aria-label={`${name} per day`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} tickFormatter={(v) => format(Number(v))} width={56} />
          <Tooltip content={<TooltipBox format={format} />} cursor={{ stroke: "rgba(255,255,255,0.25)" }} />
          <Line type="monotone" dataKey={dataKey} name={name} stroke={SERIES[0]} strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Up to three parts of a daily total, stacked (e.g. AI cost by feature). */
export function StackedBars({ data, series, format: formatName = "number", height = 220 }: {
  data: Row[]
  series: { key: string; name: string }[]
  format?: ValueFormat
  height?: number
}) {
  const format = FORMATTERS[formatName]
  return (
    <div style={{ height }} role="img" aria-label={series.map((s) => s.name).join(", ") + " per day"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }} barCategoryGap={2}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="day" tickFormatter={shortDay} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => format(Number(v))} width={56} />
          <Tooltip content={<TooltipBox format={format} />} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
          <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11, color: AXIS, paddingTop: 4 }} />
          {series.slice(0, 3).map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.name}
              stackId="a"
              fill={SERIES[i]}
              stroke={SURFACE}
              strokeWidth={1}
              radius={i === Math.min(series.length, 3) - 1 ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const shortMonth = (month: string) =>
  new Date(`${month}-01T00:00:00Z`).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" })

/** One value per month, e.g. net revenue. */
export function MonthBars({ data, dataKey, name, format: formatName = "number", height = 220 }: {
  data: Row[]
  dataKey: string
  name: string
  format?: ValueFormat
  height?: number
}) {
  const format = FORMATTERS[formatName]
  return (
    <div style={{ height }} role="img" aria-label={`${name} per month`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="month" tickFormatter={shortMonth} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => format(Number(v))} width={64} />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-white/15 bg-[#12122a] px-3 py-2 text-xs shadow-xl">
                  <p className="font-medium text-white">{shortMonth(String(label))}</p>
                  <p className="text-gray-300">{name}: <span className="font-medium text-white">{format(Number(payload[0].value))}</span></p>
                </div>
              ) : null
            }
          />
          <Bar dataKey={dataKey} name={name} fill={SERIES[0]} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
