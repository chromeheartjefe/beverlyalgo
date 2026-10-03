import type { Metadata } from "next"

import { PracticeSession } from "@/components/dashboard/academy/practice-session"

export const metadata: Metadata = {
  title: "Practice – Academy",
}

export default function PracticePage() {
  return <PracticeSession />
}
