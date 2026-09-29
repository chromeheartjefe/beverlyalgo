"use client"

import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useMemo, useState } from "react"

import { GoogleSignInButton } from "@/components/auth/google-button"
import { checkPassword, type PasswordCheck } from "@/lib/password-strength"
import { cn } from "@/lib/utils"

const LEVEL_BAR  = ["bg-red-400", "bg-amber-400", "bg-lime-400", "bg-emerald-400"]
const LEVEL_TEXT = ["text-red-400", "text-amber-300", "text-lime-300", "text-emerald-300"]

// Quiet strength meter: appears once typing starts, one tip line, no
// checklist of rules. Only "Too weak" blocks the form.
function StrengthMeter({ check, flagged }: { check: PasswordCheck; flagged: boolean }) {
  return (
    <div id="password-strength" className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 transition-colors duration-200 motion-reduce:transition-none", i <= check.level ? LEVEL_BAR[check.level] : "bg-white/[0.08]")}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-start justify-between gap-3 text-xs">
        <span className={flagged && !check.ok ? "text-red-400" : "text-gray-500"}>{check.hint}</span>
        <span className={cn("shrink-0 font-medium", LEVEL_TEXT[check.level])} aria-live="polite">
          <span className="sr-only">Password strength: </span>
          {check.label}
        </span>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  const router = useRouter()

  const [name,            setName]            = useState("")
  const [email,           setEmail]           = useState("")
  const [password,        setPassword]        = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw,          setShowPw]          = useState(false)
  const [error,           setError]           = useState("")
  const [loading,         setLoading]         = useState(false)
  const [pwFlagged,       setPwFlagged]       = useState(false)

  const strength = useMemo(() => checkPassword(password, { email, name }), [password, email, name])
  const mismatch = confirmPassword.length > 0 && confirmPassword.length >= password.length && confirmPassword !== password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!strength.ok) {
      setPwFlagged(true)
      document.getElementById("password")?.focus()
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const res  = await fetch("/api/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        router.push("/sign-in")
      } else {
        router.push("/dashboard")
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
        <p className="text-sm text-gray-500">Create your account</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 backdrop-blur-sm">
        <GoogleSignInButton />
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-gray-400">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
              <input
                id="name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Trader"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

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
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-gray-400">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
              <input
                id="password"
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                aria-describedby={password ? "password-strength" : undefined}
                aria-invalid={pwFlagged && !strength.ok}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setPwFlagged(false)
                }}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Hide password" : "Show password"}
                aria-pressed={showPw}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {password && <StrengthMeter check={strength} flagged={pwFlagged} />}
          </div>

          {/* Confirm password */}
          <div>
            <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-gray-400">
              Confirm password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
              <input
                id="confirmPassword"
                type={showPw ? "text" : "password"}
                required
                autoComplete="new-password"
                aria-describedby={mismatch ? "confirm-mismatch" : undefined}
                aria-invalid={mismatch}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            {mismatch && (
              <p id="confirm-mismatch" className="mt-1.5 text-xs text-red-400">
                Passwords don&apos;t match.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.p
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-400"
            >
              {error}
            </motion.p>
          )}

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
                Creating account…
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>

      {/* Footer links */}
      <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600">
        <Link href="/" className="hover:text-gray-300">← Back to landing page</Link>
        <p>
          Already have an account?{" "}
          <Link href="/sign-in" className="font-medium text-purple-400 hover:text-purple-300">
            Sign in
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
