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
    <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/[0.06] px-6 py-2.5 text-sm lg:px-8">
      <div className="flex items-center gap-2 text-amber-300">
        <MailWarning className="size-4 shrink-0" />
        <span>Verify your email to secure your account.</span>
        {sent ? (
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="size-3.5" />
            Sent — check your inbox
          </span>
        ) : (
          <button
            onClick={handleResend}
            disabled={sending}
            className="flex items-center gap-1.5 font-semibold text-amber-200 underline decoration-amber-500/40 underline-offset-2 hover:text-white disabled:opacity-60"
          >
            {sending && <Loader2 className="size-3 animate-spin" />}
            Resend email
          </button>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="-my-1.5 -mr-1.5 flex size-9 shrink-0 items-center justify-center rounded-lg text-amber-400/70 transition-colors hover:bg-amber-500/10 hover:text-amber-200"
      >
        <X className="size-4" />
        <span className="sr-only">Dismiss</span>
      </button>
    </div>
  )
}
