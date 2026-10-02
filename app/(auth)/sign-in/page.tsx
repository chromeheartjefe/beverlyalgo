"use client"

import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { useSession } from "next-auth/react"
import { Suspense, useEffect, useState } from "react"

import { GoogleSignInButton } from "@/components/auth/google-button"
import { Collapse } from "@/components/ui/motion"
import { SupportEmail } from "@/components/ui/support-email"
import { isPlanCallback, safeCallbackUrl, withCallback } from "@/lib/callback-url"
import { cn } from "@/lib/utils"

// Errors that come back in ?error= from Google sign-in (our own codes from
// the signIn callback in auth.ts, plus Auth.js's generic ones)
function errorFromUrl(code: string | null): string {
  if (!code) return ""
  if (code === "GoogleUnverified") return "Your Google account's email isn't verified. Verify it with Google, or sign in with your email and password."
  if (code === "GoogleFailed") return "Google sign-in didn't work this time. Please try again."
  if (code === "AccessDenied") return "Google sign-in was cancelled."
  return "Sign-in didn't work. Please try again."
}

function SignInForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl  = safeCallbackUrl(searchParams.get("callbackUrl"))

  const { status } = useSession()

  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState(() => errorFromUrl(searchParams.get("error")))
  const [loading,  setLoading]  = useState(false)

  // Already logged in — send to dashboard
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard")
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.code === "rate_limited") {
        setError("Too many sign-in attempts. Wait 15 minutes and try again, or reset your password.")
      } else if (result?.error) {
        setError("Invalid email or password.")
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
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
        <p className="text-sm text-gray-500">{isPlanCallback(callbackUrl) ? "Sign in to choose your plan" : "Sign in to your account"}</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
        <GoogleSignInButton callbackUrl={callbackUrl} />
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
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
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-base sm:text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="password" className="block text-xs font-medium text-gray-400">
                Password
              </label>
              <Link href="/forgot-password" className="text-xs font-medium text-purple-400 hover:text-purple-300">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-11 text-base sm:text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-gray-600 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          <Collapse show={!!error} className="pb-5">
            <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-400">
              {error}
            </p>
          </Collapse>

          {/* Submit */}
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
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-300">← Back to landing page</Link>
        <p>
          Don&apos;t have an account?{" "}
          <Link href={withCallback("/sign-up", callbackUrl)} className="font-medium text-purple-400 hover:text-purple-300">
            Sign up
          </Link>
        </p>
        <p>
          Trouble signing in?{" "}
          Email us at <SupportEmail />
        </p>
      </div>
    </motion.div>
  )
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
