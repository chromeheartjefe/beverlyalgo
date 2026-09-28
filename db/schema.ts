import { bigserial, boolean, doublePrecision, index, integer, pgTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:         varchar("name", { length: 255 }).notNull(),
  email:        varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan:         varchar("plan", { length: 32 }).notNull().default("free"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  notifSignals: boolean("notif_signals").notNull().default(true),
  notifJournal: boolean("notif_journal").notNull().default(false),
  notifUpdates: boolean("notif_updates").notNull().default(true),
  stripeCustomerId:       text("stripe_customer_id"),
  stripeSubscriptionId:   text("stripe_subscription_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end", { withTimezone: true }),
  // Base64-encoded, server-optimized (256x256 WebP, EXIF stripped) avatar image.
  // Stored inline rather than in object storage since the optimized size is
  // small (~5-20KB) and it avoids needing a separate blob store/env var; kept
  // out of the default GET /api/user select so normal profile fetches stay light.
  avatar:           text("avatar"),
  avatarType:       varchar("avatar_type", { length: 32 }),
  avatarUpdatedAt:  timestamp("avatar_updated_at", { withTimezone: true }),
  tradingviewUsername:      varchar("tradingview_username", { length: 255 }),
  indicatorRequestedAt:     timestamp("indicator_requested_at", { withTimezone: true }),
  indicatorInvitedAt:       timestamp("indicator_invited_at", { withTimezone: true }),
  // Bumped on password change/reset. Each login stores the value it saw, and
  // the jwt callback in auth.ts ends any session whose value is older, so a
  // stolen session stops working once the owner changes their password.
  sessionVersion:           integer("session_version").notNull().default(0),
  // Activity, for the admin console. last_seen_at is written at most once
  // every 10 minutes per user (auth.ts jwt callback), not on every request.
  lastSeenAt:               timestamp("last_seen_at", { withTimezone: true }),
  lastLoginAt:              timestamp("last_login_at", { withTimezone: true }),
  loginCount:               integer("login_count").notNull().default(0),
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

export const trades = pgTable("trades", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date:      timestamp("date", { withTimezone: true }).notNull(),
  pair:      varchar("pair", { length: 32 }).notNull(),
  direction: varchar("direction", { length: 4 }).notNull(), // "Buy" | "Sell"
  entry:     doublePrecision("entry").notNull(),
  exit:      doublePrecision("exit").notNull(),
  // User-entered realized P&L in account currency — entry/exit price alone can't
  // derive this correctly across asset classes (position size, leverage, lot
  // conventions all vary), so we don't try; the user reports the real number
  // straight from their broker/exchange. Defaults to 0 only to backfill rows
  // created before this column existed.
  pnl:       doublePrecision("pnl").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("trades_user_id_idx").on(table.userId),
])

export type Trade = typeof trades.$inferSelect
export type NewTrade = typeof trades.$inferInsert

// Trade Calendar monthly P&L goals — one row per user per calendar month
// ("YYYY-MM"). A month with no row of its own carries forward the most
// recent earlier goal (resolved client-side), so users set it once and only
// touch it again when they want to change it.
export const tradingGoals = pgTable("trading_goals", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  month:     varchar("month", { length: 7 }).notNull(),
  amount:    doublePrecision("amount").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("trading_goals_user_month_idx").on(table.userId, table.month),
])

export type TradingGoal = typeof tradingGoals.$inferSelect

export const chartAnalyses = pgTable("chart_analyses", {
  id:         text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:     text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  pair:       varchar("pair", { length: 32 }).notNull(),
  timeframe:  varchar("timeframe", { length: 16 }).notNull(),
  signal:     varchar("signal", { length: 8 }).notNull(), // BUY | SELL | NEUTRAL
  confidence: integer("confidence").notNull(),
  entry:      doublePrecision("entry"),
  tp1:        doublePrecision("tp1"),
  tp2:        doublePrecision("tp2"),
  sl:         doublePrecision("sl"),
  rrRatio:    doublePrecision("rr_ratio"),
  // Admin console / debugging. Null on rows from before 2026-09-28.
  variant:          varchar("variant", { length: 32 }),
  model:            varchar("model", { length: 64 }),
  result:           text("result"), // JSON of the full analysis the user saw (never the screenshot)
  promptTokens:     integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  costUsd:          doublePrecision("cost_usd"),
  createdAt:  timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("chart_analyses_user_id_idx").on(table.userId),
])

export type ChartAnalysis = typeof chartAnalyses.$inferSelect
export type NewChartAnalysis = typeof chartAnalyses.$inferInsert

export const chatMessages = pgTable("chat_messages", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  // Monotonic insertion-order tie-breaker — a user/assistant pair is written
  // in one multi-row INSERT, so both rows get the identical createdAt
  // (defaultNow() evaluates once per statement); ordering by createdAt alone
  // doesn't reliably reproduce insertion order for ties. seq does.
  seq:       bigserial("seq", { mode: "number" }).notNull(),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role:      varchar("role", { length: 16 }).notNull(), // "user" | "assistant"
  content:   text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("chat_messages_user_id_idx").on(table.userId),
])

export type ChatMessage = typeof chatMessages.$inferSelect
export type NewChatMessage = typeof chatMessages.$inferInsert

export const aiUsage = pgTable("ai_usage", {
  id:               text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  feature:          varchar("feature", { length: 32 }).notNull(), // "chat" | "chart_analysis" | "screener"
  promptTokens:     integer("prompt_tokens").notNull(),
  completionTokens: integer("completion_tokens").notNull(),
  // Who and what, for per-user spend in the admin console. Null on rows from
  // before 2026-09-28. "set null" (not cascade) so deleting an account keeps
  // its spend in the monthly budget.
  userId:           text("user_id").references(() => users.id, { onDelete: "set null" }),
  model:            varchar("model", { length: 64 }),
  reasoningEffort:  varchar("reasoning_effort", { length: 16 }),
  costUsd:          doublePrecision("cost_usd"),
  createdAt:        timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("ai_usage_created_at_idx").on(table.createdAt),
  index("ai_usage_user_id_created_at_idx").on(table.userId, table.createdAt),
])

export type AiUsage = typeof aiUsage.$inferSelect
export type NewAiUsage = typeof aiUsage.$inferInsert

export const authTokens = pgTable("auth_tokens", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token:     text("token").notNull().unique(),
  type:      varchar("type", { length: 24 }).notNull(), // "email_verify" | "password_reset"
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("auth_tokens_user_id_idx").on(table.userId),
])

export type AuthToken = typeof authTokens.$inferSelect
export type NewAuthToken = typeof authTokens.$inferInsert

export const rateLimitHits = pgTable("rate_limit_hits", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  key:       text("key").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  // checkRateLimit() always filters by key + a createdAt lower bound together.
  index("rate_limit_hits_key_created_at_idx").on(table.key, table.createdAt),
])

export type RateLimitHit = typeof rateLimitHits.$inferSelect

// Records each Stripe webhook event id we've successfully processed, so a
// retried/replayed delivery of the same event (Stripe's own retries, or a
// malicious replay) can be detected and skipped instead of silently re-running
// the handler. Insert-first with a unique constraint on `id` (the Stripe event
// id itself) gives us an atomic "have we seen this" check without a race.
export const processedStripeEvents = pgTable("processed_stripe_events", {
  id:        text("id").primaryKey(), // Stripe event id, e.g. "evt_..."
  type:      varchar("type", { length: 64 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type ProcessedStripeEvent = typeof processedStripeEvents.$inferSelect

// Single-row cache for the AI Screener's hourly scan result. DB-backed
// because the stock-movers source (Alpha Vantage) caps out at 25 req/day —
// a purely in-memory cache resets on every serverless cold start, and on
// Vercel those can happen often enough on a low-traffic dashboard to blow
// through that budget in a single day. Persisting the hourly gate to
// Postgres makes it survive cold starts and hold across every
// instance/user, so a real re-scan truly happens at most once/hour no
// matter how many people or instances hit the route.
export const screenerCache = pgTable("screener_cache", {
  id:          text("id").primaryKey(), // always "singleton" — one row total
  data:        text("data").notNull(),  // JSON-encoded ScreenerResult
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
})

export type ScreenerCache = typeof screenerCache.$inferSelect

// Same singleton-row pattern for lib/market-data.ts's index/forex ticker
// snapshot. Originally an in-memory module variable, which had the same
// cold-start problem as screenerCache above — worse, actually: it shares
// Twelve Data's account-wide 8-credits/minute cap with AI Screener's stock
// verification, so every unintended extra fetch (each restart/cold start)
// risked colliding with a screener scan and blowing the per-minute limit
// for both features at once. Persisting this closes that gap the same way.
export const indexTickerCache = pgTable("index_ticker_cache", {
  id:          text("id").primaryKey(), // always "singleton" — one row total
  data:        text("data").notNull(),  // JSON-encoded TickerItem[]
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull(),
})

export type IndexTickerCache = typeof indexTickerCache.$inferSelect

// Account activity timeline for the admin console: actions not already
// recorded elsewhere (analyses, trades, chat messages and goals have their
// own tables). type is e.g. "login", "login_failed", "screener_scan".
// Kept 12 months (cleanup in lib/rate-limit.ts).
export const userEvents = pgTable("user_events", {
  id:        text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type:      varchar("type", { length: 48 }).notNull(),
  meta:      text("meta"), // optional JSON details
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("user_events_user_id_created_at_idx").on(table.userId, table.createdAt),
  index("user_events_type_created_at_idx").on(table.type, table.createdAt),
])

export type UserEvent = typeof userEvents.$inferSelect

// Every write, and every sensitive read (chat logs), done from the local
// admin console (admin/), with details. Never deleted automatically.
export const adminAuditLog = pgTable("admin_audit_log", {
  id:           text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  action:       varchar("action", { length: 48 }).notNull(), // e.g. "mark_invited", "chat_viewed"
  targetUserId: text("target_user_id").references(() => users.id, { onDelete: "set null" }),
  details:      text("details"), // JSON
  createdAt:    timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("admin_audit_log_created_at_idx").on(table.createdAt),
])

export type AdminAuditLog = typeof adminAuditLog.$inferSelect
