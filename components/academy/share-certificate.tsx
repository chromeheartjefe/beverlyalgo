"use client"

import { Check, Copy, Download, ExternalLink } from "lucide-react"
import { useState } from "react"

// Share tools for a certificate: copy the public link, open it, download the image.
export function ShareCertificate({ url, imageUrl }: { url: string; imageUrl: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="space-y-3">
      <div className="flex overflow-hidden border border-white/15 bg-white/[0.03] has-[input:focus-visible]:border-purple-400/60">
        <input readOnly value={url} aria-label="Certificate link" className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-base sm:text-xs text-gray-300 focus:outline-none" />
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex items-center gap-1.5 border-l border-white/15 px-3 text-xs font-semibold text-gray-200 hover:bg-white/[0.06]"
        >
          {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2.5">
        <a
          href={imageUrl}
          download="entrix-academy-certificate.png"
          className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-400"
        >
          <Download className="size-4" /> Download image
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:bg-white/[0.06]"
        >
          <ExternalLink className="size-4" /> Open public page
        </a>
      </div>
      <p className="text-xs text-gray-500">Anyone with this link can see your name, score and the date you passed.</p>
    </div>
  )
}
