"use client"

import { CheckCircle, Loader2, MailWarning, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"

export function VerifyBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)

  if (dismissed || !session?.user || session.user.emailVerified) return null

  const handleResend = async () => {
    setSending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" })
      if (res.ok) setSent(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 whitespace-nowrap border-b border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs sm:gap-3 sm:px-6 sm:py-2.5 sm:text-sm lg:px-8">
      <div className="flex min-w-0 items-center gap-1.5 text-amber-300 sm:gap-2">
        <MailWarning className="size-3.5 shrink-0 sm:size-4" />
        <span className="sm:hidden">Verify your email.</span>
        <span className="hidden sm:inline">Verify your email to secure your account.</span>
        {sent ? (
          <span className="flex shrink-0 items-center gap-1 text-emerald-400">
            <CheckCircle className="size-3.5" />
            <span className="sm:hidden">Sent</span>
            <span className="hidden sm:inline">Sent — check your inbox</span>
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            className="flex shrink-0 items-center gap-1.5 font-semibold text-amber-200 underline decoration-amber-500/40 underline-offset-2 hover:text-white disabled:opacity-60"
          >
            {sending && <Loader2 className="size-3 animate-spin" />}
            <span className="sm:hidden">Resend</span>
            <span className="hidden sm:inline">Resend email</span>
          </button>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="-my-1.5 -mr-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-amber-400/70 transition-colors hover:bg-amber-500/10 hover:text-amber-200 sm:-mr-1.5 sm:size-9"
      >
        <X className="size-3.5 sm:size-4" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  )
}
