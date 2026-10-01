import Image from "next/image"

import { formatIssued } from "@/lib/academy/certificate"

// The Entrix Academy certificate, shared by the learner's dashboard page and
// the public verification page. Plain markup, no client code.

export interface CertificateData {
  id: string
  name: string
  correct: number
  total: number
  issuedAt: Date | string
  lessons: number
}

export function CertificateCard({ cert }: { cert: CertificateData }) {
  return (
    <div className="relative overflow-hidden border border-amber-400/40 bg-[#0b0b13] p-1">
      <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-purple-500/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="relative border border-white/10 px-6 py-8 text-center sm:px-12 sm:py-12">
        <div className="flex items-center justify-center gap-2.5">
          <Image src="/logo_transparent.png" alt="" width={28} height={28} className="size-7 object-contain" />
          <span className="text-base font-bold tracking-tight text-white">
            Entrix<span className="text-purple-400">Algo</span>
          </span>
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-amber-300/90">Entrix Academy</p>
        <p className="mt-2 text-sm text-gray-400">Certificate of completion</p>
        <p className="mt-6 text-balance text-3xl font-bold text-white sm:text-4xl">{cert.name}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-gray-300">
          has completed all {cert.lessons} lessons of the Entrix Academy trading course, from market basics to Smart Money
          Concepts and risk management, and passed the final exam with a score of {cert.correct} out of {cert.total}.
        </p>
        <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4 border-t border-white/10 pt-5 text-left">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Issued</p>
            <p className="mt-1 text-sm text-gray-200">{formatIssued(cert.issuedAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Certificate ID</p>
            <p className="mt-1 font-mono text-sm text-gray-200">{cert.id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
