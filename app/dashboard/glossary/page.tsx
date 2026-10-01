import type { Metadata } from "next"
import { Suspense } from "react"

import { Glossary } from "@/components/dashboard/glossary/glossary"

export const metadata: Metadata = {
  title: "Trading Glossary – EntrixAlgo",
}

export default function GlossaryPage() {
  // The open term is read from ?term=, which needs a Suspense boundary
  return (
    <Suspense>
      <Glossary />
    </Suspense>
  )
}
