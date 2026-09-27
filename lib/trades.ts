export type TradeRow = {
  id:        string
  date:      string
  pair:      string
  direction: "Buy" | "Sell"
  entry:     number
  exit:      number
  pnl:       number
}

export function tradeResult(pnl: number): "Win" | "Loss" {
  return pnl >= 0 ? "Win" : "Loss"
}

// The calendar day a trade belongs to, as "YYYY-MM-DD". The journal stores the
// picked date as UTC midnight and displays `date.slice(0, 10)`, so every view
// buckets by that same UTC string — never by the viewer's local day, which
// would shift trades by one day for anyone west of UTC.
export function tradeDayKey(date: string): string {
  return date.slice(0, 10)
}
