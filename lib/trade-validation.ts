import { z } from "zod"

// Shared by POST /api/trades and PATCH /api/trades/[id]. Bounds keep junk out
// of the journal: a trade dated year 9999 or a P&L of 1e300 would otherwise
// be stored as-is and skew the Overview stats and the Trade Calendar.

const MAX_PRICE = 1e9  // far above any real asset price
const MAX_PNL   = 1e9  // realized P&L of a single trade, either direction

const EARLIEST = new Date("1990-01-01T00:00:00Z")

// Journal size cap. GET /api/trades returns up to this many rows and every
// stat (Overview, Journal, Calendar) is computed from that list client-side,
// so allowing more rows than GET returns would make those stats silently wrong.
export const MAX_TRADES_PER_USER = 5000

export const tradeInput = {
  date: z.coerce.date().refine(
    // "Tomorrow" still allowed so a trade logged near midnight in any timezone passes
    (d) => d >= EARLIEST && d.getTime() <= Date.now() + 36 * 60 * 60 * 1000,
    "Trade date can't be in the future.",
  ),
  pair:      z.string().trim().min(1).max(32),
  direction: z.enum(["Buy", "Sell"]),
  entry:     z.number().positive().max(MAX_PRICE),
  exit:      z.number().positive().max(MAX_PRICE),
  // Realized P&L, user-reported — can be negative (loss) or zero (breakeven).
  pnl:       z.number().min(-MAX_PNL).max(MAX_PNL),
}
