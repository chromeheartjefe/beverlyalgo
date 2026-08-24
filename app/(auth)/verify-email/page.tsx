"use client"

import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Suspense, useEffect, useState } from "react"

type Status = "verifying" | "success" | "error"

function VerifyEmailContent() {
  const token = useSearchParams().get("token")
  const { status: sessionStatus } = useSession()

  const [status,  setStatus]  = useState<Status>("verifying")
  const [message, setMessage] = useState("")
  const [resent,  setResent]  = useState(false)
  const [resending, setResending] = useState(false)

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("This verification link is missing its token.")
      return
    }

    fetch("/api/auth/verify-email", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok) {
          setStatus("error")
          setMessage(data.error ?? "This link is invalid or has expired.")
          return
        }
        setStatus("success")
      })
      .catch(() => {
        setStatus("error")
        setMessage("Something went wrong. Please try again.")
      })
  }, [token])

  const handleResend = async () => {
    setResending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" })
      if (res.ok) setResent(true)
    } finally {
      setResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo_transparent.png"
            alt="EntrixAlgo"
            width={36}
            height={36}
            className="size-9 object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Entrix<span className="text-purple-400">Algo</span>
          </span>
        </Link>
        <p className="text-sm text-gray-500">Email verification</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          {status === "verifying" && (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
                <Loader2 className="size-5 animate-spin text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-white">Verifying your email…</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <CheckCircle className="size-5 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-white">Email verified</p>
              <p className="text-sm text-gray-500">Your account is now verified.</p>
              <Link
                href="/dashboard"
                className="mt-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 hover:from-purple-500 hover:to-purple-400"
              >
                Go to dashboard
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
                <AlertTriangle className="size-5 text-red-400" />
              </div>
              <p className="text-sm font-semibold text-white">Verification failed</p>
              <p className="text-sm text-gray-500">{message}</p>

              {sessionStatus === "authenticated" && (
                resent ? (
                  <p className="mt-2 text-sm text-emerald-400">New verification email sent — check your inbox.</p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="mt-2 flex items-center gap-2 rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15 disabled:opacity-60"
                  >
                    {resending && <Loader2 className="size-3.5 animate-spin" />}
                    Resend verification email
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-300">← Back to landing page</Link>
      </div>
    </motion.div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  )
}
