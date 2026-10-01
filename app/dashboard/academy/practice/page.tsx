import type { Metadata } from "next"

import { PracticeSession } from "@/components/dashboard/academy/practice-session"

export const metadata: Metadata = {
  title: "Practice – Academy – EntrixAlgo",
}

export default function PracticePage() {
  return <PracticeSession />
}
