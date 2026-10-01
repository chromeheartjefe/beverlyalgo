import { eq } from "drizzle-orm"
import { Award } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { auth } from "@/auth"
import { CertificateCard } from "@/components/academy/certificate-card"
import { ShareCertificate } from "@/components/academy/share-certificate"
import { siteConfig } from "@/config/site"
import { LESSON_CONTENT } from "@/content/academy"
import { db } from "@/db"
import { academyCertificates } from "@/db/schema"

export const metadata: Metadata = {
  title: "Certificate – Academy – EntrixAlgo",
}

export default async function CertificatePage() {
  const session = await auth()
  const userId = session?.user?.id
  const [cert] = userId ? await db.select().from(academyCertificates).where(eq(academyCertificates.userId, userId)) : []

  if (!cert) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-amber-400/30 bg-amber-500/10">
            <Award className="size-6 text-amber-300" aria-hidden />
          </div>
          <p className="mt-4 text-base font-semibold text-white">No certificate yet</p>
          <p className="mt-1 text-sm text-gray-400">Finish every lesson, then pass the final exam to earn it.</p>
          <Link href="/dashboard/academy" className="mt-6 inline-flex rounded-xl bg-purple-500 px-6 py-3 text-sm font-bold text-white hover:bg-purple-400">
            Back to Academy
          </Link>
        </div>
      </div>
    )
  }

  const url = `${siteConfig.url}/certificate/${cert.id}`
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Your certificate</h1>
          <p className="mt-1 text-sm text-gray-500">Share it, download it, or add it to your profile.</p>
        </div>
        <CertificateCard cert={{ ...cert, lessons: Object.keys(LESSON_CONTENT).length }} />
        <ShareCertificate url={url} imageUrl={`/api/certificate/${cert.id}/image`} />
      </div>
    </div>
  )
}
