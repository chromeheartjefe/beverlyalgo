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
