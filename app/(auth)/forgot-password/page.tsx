"use client"

import { motion } from "framer-motion"
import { CheckCircle, Loader2, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("")
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch("/api/auth/forgot-password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      })
    } finally {
      // Always show the generic confirmation, whether or not the request succeeded —
      // never reveal whether an account exists for this email.
      setSent(true)
      setLoading(false)
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
        <p className="text-sm text-gray-500">Reset your password</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
        {sent ? (
          <div role="status" className="flex flex-col items-center gap-3 py-2 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle className="size-5 text-emerald-400" />
            </div>
            <p className="text-sm font-semibold text-white">Check your inbox</p>
            <p className="text-sm text-gray-500">
              If an account exists for <span className="text-gray-300">{email}</span>, we&apos;ve sent a password reset link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-gray-500">
              Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
            </p>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-gray-400">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/30 transition-all",
                loading ? "opacity-60 cursor-not-allowed" : "hover:from-purple-500 hover:to-purple-400"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send reset link"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600">
        <Link href="/sign-in" className="hover:text-gray-300">← Back to sign in</Link>
      </div>
    </motion.div>
  )
}
