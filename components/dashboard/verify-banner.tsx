"use client"

import { CheckCircle, Loader2, MailCheck, MailWarning, X } from "lucide-react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"

import { Collapse } from "@/components/ui/motion"
import { useFreeAnalysis } from "@/lib/use-free-analysis"
import { FOCUS_EMAIL_EVENT, markVerificationSent, resendCooldownLeft } from "@/lib/verify-sent"

export function VerifyBanner() {
  const { data: session } = useSession()
  const [dismissed, setDismissed] = useState(false)
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const [limited,   setLimited]   = useState(false)
  // Seconds until Resend is offered: right after sign-up (or a resend) the
  // first email is still on its way, so the banner says so instead
  const [cooldown,  setCooldown]  = useState(0)
  // Free accounts unlock their free Chart Analysis by verifying
  const freeWaiting = useFreeAnalysis().state === "verify"

  // Slides open/closed (Collapse) instead of popping, so the page under it
  // doesn't jump when it's dismissed or the email gets verified
  const visible = !dismissed && !!session?.user && !session.user.emailVerified

  useEffect(() => {
    if (!visible) return
    setCooldown(resendCooldownLeft())
    const id = setInterval(() => {
      const left = resendCooldownLeft()
      setCooldown(left)
      if (left === 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [visible, sent])

  const handleResend = async () => {
    setSending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" })
      if (res.ok) {
        markVerificationSent()
        setSent(true)
      } else if (res.status === 429) setLimited(true)
    } finally {
      setSending(false)
    }
  }

  const waiting = !sent && !limited && cooldown > 0
  const email = session?.user?.email

  return (
    <Collapse show={visible}>
    <div className="flex items-center justify-between gap-2 whitespace-nowrap border-b border-amber-500/20 bg-amber-500/[0.06] px-3 py-2 text-xs sm:gap-3 sm:px-6 sm:py-2.5 sm:text-sm lg:px-8">
      <div className="flex min-w-0 items-center gap-1.5 text-amber-300 sm:gap-2">
        {waiting ? <MailCheck className="size-3.5 shrink-0 sm:size-4" /> : <MailWarning className="size-3.5 shrink-0 sm:size-4" />}
        {waiting ? (
          <>
            <span className="min-w-0 truncate sm:hidden">Check your inbox.</span>
            <span className="hidden min-w-0 truncate sm:inline">
              We sent a verification link{email ? ` to ${email}` : ""}. Check your inbox and spam folder.
            </span>
          </>
        ) : (
          <>
            <span className="min-w-0 truncate sm:hidden">{freeWaiting ? "Verify for a free analysis." : "Verify your email."}</span>
            <span className="hidden min-w-0 truncate sm:inline">
              {freeWaiting ? "Verify your email to unlock your free AI chart analysis." : "Verify your email to secure your account."}
            </span>
          </>
        )}
        {!sent && (
          <Link
            href="/dashboard/settings#email"
            onClick={() => window.dispatchEvent(new Event(FOCUS_EMAIL_EVENT))}
            className="shrink-0 text-amber-200/70 underline decoration-amber-500/30 underline-offset-2 hover:text-white"
          >
            Wrong email?
          </Link>
        )}
        {sent ? (
          <span className="flex shrink-0 items-center gap-1 text-emerald-400">
            <CheckCircle className="size-3.5" />
            <span className="sm:hidden">Sent</span>
            <span className="hidden sm:inline">Sent. Any link we emailed you will work.</span>
          </span>
        ) : limited ? (
          <span className="shrink-0 text-amber-200/80">
            <span className="sm:hidden">Try later</span>
            <span className="hidden sm:inline">Resend limit reached, check your spam folder</span>
          </span>
        ) : waiting ? (
          <span className="shrink-0 tabular-nums text-amber-200/60" aria-live="off">
            Resend in {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}
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
    </Collapse>
  )
}
