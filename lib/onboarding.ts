type OnboardingState = {
  visitedRiskCalc?: boolean
  visitedSettings?: boolean
  dismissed?:       boolean
}

function key(userId: string) {
  return `ba_onboarding_${userId}`
}

export function getOnboardingState(userId: string): OnboardingState {
  try {
    return JSON.parse(localStorage.getItem(key(userId)) ?? "{}")
  } catch {
    return {}
  }
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
