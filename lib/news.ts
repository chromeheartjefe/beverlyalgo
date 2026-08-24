export type NewsItem = { title: string; source: string; publishedAt: string }

// Marketaux free tier caps at 100 requests/day, shared across every chat
// message on the site. Two guards keep us safely under that: a per-query
// 15-min cache (repeat questions about the same topic across many users
// don't refetch), and a hard daily call budget well below the real cap.
const QUERY_CACHE_TTL = 15 * 60 * 1000
const DAILY_BUDGET     = 80

const cache = new Map<string, { items: NewsItem[]; fetchedAt: number }>()
let callsToday = 0
let callDay = ""

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

// Only fire a news lookup when the message is plausibly about news/a
// specific asset — most trading questions (position sizing, order types,
// psychology) don't need it, which keeps real-world usage a small fraction
// of the daily budget.
const TOPIC_TRIGGERS: { pattern: RegExp; query: string }[] = [
  { pattern: /\b(bitcoin|btc)\b/i,                                   query: "bitcoin"          },
  { pattern: /\b(ethereum|eth)\b/i,                                  query: "ethereum"         },
  { pattern: /\bcrypto\b/i,                                          query: "crypto"           },
  { pattern: /\bgold\b/i,                                            query: "gold"             },
  { pattern: /\b(oil|crude)\b/i,                                     query: "oil"              },
  { pattern: /\b(fed|fomc|rate cut|rate hike|interest rate)\b/i,     query: "federal reserve"  },
  { pattern: /\b(cpi|inflation)\b/i,                                 query: "inflation"        },
  { pattern: /\b(s&p|nasdaq|stocks|stock market|equities)\b/i,       query: "stock market"     },
  { pattern: /\b(dollar|usd|dxy)\b/i,                                query: "us dollar"        },
  { pattern: /\beuro\b/i,                                            query: "euro"             },
  { pattern: /\bforex\b/i,                                           query: "forex market"     },
  { pattern: /\b(news|headline|catalyst|happening)\b/i,              query: "markets"          },
]

export function pickNewsQuery(message: string): string | null {
  for (const { pattern, query } of TOPIC_TRIGGERS) {
    if (pattern.test(message)) return query
  }
  return null
}

export async function fetchNews(query: string): Promise<NewsItem[]> {
  const apiKey = process.env.MARKETAUX_API_TOKEN
  if (!apiKey) return []

  const day = todayKey()
  if (day !== callDay) {
    callDay = day
    callsToday = 0
  }

  const cached = cache.get(query)
  if (cached && Date.now() - cached.fetchedAt < QUERY_CACHE_TTL) return cached.items
  if (callsToday >= DAILY_BUDGET) return cached?.items ?? []

  callsToday += 1

  try {
    const publishedAfter = `${day}T00:00`
    const url = `https://api.marketaux.com/v1/news/all?language=en&published_after=${publishedAfter}&search=${encodeURIComponent(query)}&api_token=${apiKey}`
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return cached?.items ?? []
    const data = await res.json()

    const items: NewsItem[] = Array.isArray(data.data)
      ? data.data.slice(0, 3).map((a: { title: string; source: string; published_at: string }) => ({
          title:       a.title,
          source:      a.source,
          publishedAt: a.published_at,
        }))
      : []

    cache.set(query, { items, fetchedAt: Date.now() })
    return items
  } catch {
    return cached?.items ?? []
  }
}

export function formatNewsForPrompt(items: NewsItem[]): string {
  if (items.length === 0) return ""
  return items.map((i) => `- ${i.title} (${i.source})`).join("\n")
}
