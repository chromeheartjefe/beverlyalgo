import { BadgeCheck } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CertificateCard } from "@/components/academy/certificate-card"
import { LESSON_CONTENT } from "@/content/academy"
import { getCertificate } from "@/lib/academy/exam"

type Params = Promise<{ id: string }>

// Public, shareable certificate page. Not indexed: it shows a person's name.
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params
  const cert = await getCertificate(id)
  if (!cert) return { title: "Certificate not found", robots: { index: false } }
  const title = `${cert.name} completed Entrix Academy`
  const image = `/api/certificate/${cert.id}/image`
  return {
    title,
    description: "Entrix Academy certificate of completion: a full trading course from market basics to Smart Money Concepts.",
    robots: { index: false, follow: false },
    openGraph: { title, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, images: [image] },
  }
}

export default async function PublicCertificatePage({ params }: { params: Params }) {
  const { id } = await params
  const cert = await getCertificate(id)
  if (!cert) notFound()

  return (
    <main className="min-h-dvh bg-[#09090f] px-4 py-10 text-white sm:py-16">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-center gap-2 text-sm text-emerald-300">
          <BadgeCheck className="size-4" aria-hidden />
          Verified certificate issued by EntrixAlgo
        </div>
        <CertificateCard cert={{ ...cert, lessons: Object.keys(LESSON_CONTENT).length }} />
        <div className="border border-white/10 bg-white/[0.03] p-5 text-center sm:p-6">
          <p className="text-base font-semibold text-white">Learn to trade, from zero, for free</p>
          <p className="mt-1 text-sm text-gray-400">
            Entrix Academy is a free course inside EntrixAlgo: short lessons, interactive charts and quick checks.
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex rounded-xl bg-purple-500 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-400"
          >
            Start learning free
          </Link>
        </div>
      </div>
    </main>
  )
}
