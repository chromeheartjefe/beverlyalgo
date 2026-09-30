type OnboardingState = {
  visitedRiskCalc?: boolean
  visitedSettings?: boolean
  dismissed?:       boolean
}

function key(userId: string) {
  return `ba_onboarding_${userId}`
}

// Raw stored JSON, "{}" when unset. A string, so it can be a stable
// useSyncExternalStore snapshot (read during render, no flash).
export function readOnboardingRaw(userId: string): string {
  try {
    return localStorage.getItem(key(userId)) ?? "{}"
  } catch {
    return "{}"
  }
}

export function parseOnboardingState(raw: string): OnboardingState {
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function getOnboardingState(userId: string): OnboardingState {
  return parseOnboardingState(readOnboardingRaw(userId))
}

function setOnboardingState(userId: string, patch: OnboardingState) {
  try {
    const next = { ...getOnboardingState(userId), ...patch }
    localStorage.setItem(key(userId), JSON.stringify(next))
  } catch {}
}

export function markVisited(userId: string, field: "visitedRiskCalc" | "visitedSettings") {
  setOnboardingState(userId, { [field]: true })
}

export function dismissOnboarding(userId: string) {
  setOnboardingState(userId, { dismissed: true })
}
