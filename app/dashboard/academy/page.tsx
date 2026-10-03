import type { Metadata } from "next"

import { AcademyHome } from "@/components/dashboard/academy/academy-home"
import { LESSON_CONTENT } from "@/content/academy"

export const metadata: Metadata = {
  title: "Academy",
}

export default function AcademyPage() {
  // Only the ids of written lessons go to the client, not their content
  return <AcademyHome availableIds={Object.keys(LESSON_CONTENT)} />
}
