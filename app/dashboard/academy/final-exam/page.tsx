import type { Metadata } from "next"

import { ExamSession } from "@/components/dashboard/academy/exam-session"

export const metadata: Metadata = {
  title: "Final exam – Academy – EntrixAlgo",
}

export default function FinalExamPage() {
  return <ExamSession />
}
