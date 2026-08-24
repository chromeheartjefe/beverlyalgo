function key(userId: string) {
  return `ba_notifications_last_seen_${userId}`
}

export function getLastSeen(userId: string): number {
  try {
    return Number(localStorage.getItem(key(userId)) ?? 0)
  } catch {
    return 0
  }
}

export function markSeen(userId: string) {
  try {
    localStorage.setItem(key(userId), String(Date.now()))
  } catch {}
}
