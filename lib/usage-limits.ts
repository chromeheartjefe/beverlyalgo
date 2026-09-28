// Rolling 24-hour AI limits per account. Shared by the API routes that
// enforce them and the sidebar plan card that shows how much is left.
export const DAY_MS = 24 * 60 * 60 * 1000

export const DAILY_ANALYSIS_LIMIT = 30 // Chart Analysis, key `analyze-daily:<userId>`
export const DAILY_MESSAGE_LIMIT  = 40 // AI Trading Bot, key `chat-daily:<userId>`
