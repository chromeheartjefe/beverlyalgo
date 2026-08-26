"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Bell, Camera, Eye, EyeOff, Loader2, Lock, LogOut, Moon, Shield, Trash2, User } from "lucide-react"
import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { markVisited } from "@/lib/onboarding"
import { cn } from "@/lib/utils"

const MAX_AVATAR_SOURCE_BYTES = 20 * 1024 * 1024 // client-side sanity cap before we even try to decode it

// Downscale to ≤512 px on the longest edge and re-encode as JPEG before
// upload — mirrors the same technique used for chart-analysis uploads
// (app/dashboard/chart-analysis/page.tsx). The server (sharp) does the
// authoritative square crop/compress; this step just keeps a huge phone
// photo from being uploaded at full resolution for no benefit.
function resizeForUpload(file: File, maxPx = 512): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(src)
      const scale  = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))), "image/jpeg", 0.9)
    }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error("Image load failed")) }
    img.src = src
  })
}

type UserSettings = {
  name:         string
  email:        string
  plan:         string
  notifSignals: boolean
  notifJournal: boolean
  notifUpdates: boolean
  stripeCurrentPeriodEnd: string | null
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-purple-500" : "bg-white/10"
      )}
    >
      <span
        className={cn(
          "inline-block size-3.5 rounded-full bg-white shadow transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-6">
      <h2 className="mb-5 text-sm font-semibold text-white">{title}</h2>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const { data: session, status, update: updateSession } = useSession()
  const plan = (session?.user as { plan?: string })?.plan ?? "free"
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (session?.user?.id) markVisited(session.user.id, "visitedSettings")
  }, [session?.user?.id])

  const [nameInput,  setNameInput]  = useState("")
  const [emailInput, setEmailInput] = useState("")
  const displayName = nameInput  || session?.user?.name  || "User"

  const userId        = session?.user?.id
  const avatarVersion = (session?.user as { avatarVersion?: number | null })?.avatarVersion
  const [avatarBusy, setAvatarBusy]   = useState(false)
  const [avatarError, setAvatarError] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  const [notifSignals, setNotifSignals] = useState(true)
  const [notifJournal, setNotifJournal] = useState(false)
  const [notifUpdates, setNotifUpdates] = useState(true)

  const [saving,     setSaving]     = useState(false)
  const [saveError,  setSaveError]  = useState("")
  const [saved,      setSaved]      = useState(false)

  const [renewsAt,      setRenewsAt]      = useState<string | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError,   setPortalError]   = useState("")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword,     setNewPassword]     = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw,           setShowPw]          = useState(false)
  const [pwSaving,         setPwSaving]        = useState(false)
  const [pwError,          setPwError]         = useState("")
  const [pwSaved,          setPwSaved]         = useState(false)

  useEffect(() => {
    // Wait for the session to resolve to an actual signed-in user before
    // fetching — and guard against a late-resolving response from a
    // previous render (e.g. a fast account switch) clobbering current state.
    if (status !== "authenticated" || !session?.user?.id) return
    let cancelled = false

    fetch("/api/user", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: UserSettings | null) => {
        if (cancelled || !data) return
        setNameInput(data.name)
        setEmailInput(data.email)
        setNotifSignals(data.notifSignals)
        setNotifJournal(data.notifJournal)
        setNotifUpdates(data.notifUpdates)
        setRenewsAt(data.stripeCurrentPeriodEnd)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })

    return () => {
      cancelled = true
    }
  }, [status, session?.user?.id])

  const handleSave = async () => {
    setSaving(true)
    setSaveError("")
    setSaved(false)
    try {
      const res  = await fetch("/api/user", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: nameInput, email: emailInput }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      await updateSession({ name: data.name, email: data.email })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setSaveError("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-selecting the same file next time
    if (!file) return

    setAvatarError("")

    if (!file.type.startsWith("image/")) {
      setAvatarError("File must be an image.")
      return
    }
    if (file.size > MAX_AVATAR_SOURCE_BYTES) {
      setAvatarError("Image must be under 20 MB.")
      return
    }

    // Shown immediately in place of the old photo/spinner-dimmed overlay,
    // rather than making the user stare at the old photo until the upload
    // round-trip resolves. Cleared in `finally`, by which point (success
    // path) `updateSession` has already refreshed avatarVersion, so the
    // real uploaded photo takes over with no flash back to the old one.
    const localPreview = URL.createObjectURL(file)
    setAvatarPreview(localPreview)

    setAvatarBusy(true)
    try {
      const resized = await resizeForUpload(file)
      const form = new FormData()
      form.append("file", resized, "avatar.jpg")

      const res  = await fetch("/api/user/avatar", { method: "POST", body: form })
      const data = await res.json()
      if (!res.ok) {
        setAvatarError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      await updateSession({})
      toast.success("Profile photo updated.")
    } catch {
      setAvatarError("Couldn't process that image. Try a different file.")
    } finally {
      setAvatarBusy(false)
      URL.revokeObjectURL(localPreview)
      setAvatarPreview(null)
    }
  }

  const handleAvatarRemove = async () => {
    setAvatarError("")
    setAvatarBusy(true)
    try {
      const res = await fetch("/api/user/avatar", { method: "DELETE" })
      if (!res.ok) {
        setAvatarError("Something went wrong. Please try again.")
        return
      }
      await updateSession({})
      toast.success("Profile photo removed.")
    } catch {
      setAvatarError("Something went wrong. Please try again.")
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleManageBilling = async () => {
    setPortalLoading(true)
    setPortalError("")
    try {
      const res  = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json()
      if (!res.ok) {
        setPortalError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      window.location.href = data.url
    } catch {
      setPortalError("Something went wrong. Please try again.")
    } finally {
      setPortalLoading(false)
    }
  }

  const handleChangePassword = async () => {
    setPwError("")
    setPwSaved(false)

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.")
      return
    }

    setPwSaving(true)
    try {
      const res  = await fetch("/api/user/password", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setPwError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPwSaved(true)
      setTimeout(() => setPwSaved(false), 2500)
    } catch {
      setPwError("Something went wrong. Please try again.")
    } finally {
      setPwSaving(false)
    }
  }

  const toggleNotif = async (
    field: "notifSignals" | "notifJournal" | "notifUpdates",
    value: boolean,
    revert: () => void,
  ) => {
    try {
      const res = await fetch("/api/user", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ [field]: value }),
      })
      if (!res.ok) revert()
    } catch {
      revert()
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account and preferences.</p>
      </div>

      <div className="relative mx-auto max-w-2xl">
        <motion.div
          animate={{ filter: loaded ? "blur(0px)" : "blur(8px)", opacity: loaded ? 1 : 0.5 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={cn("space-y-5", !loaded && "pointer-events-none select-none")}
        >
        {/* Profile */}
        <SectionCard title="Profile">
          <div className="flex items-center gap-4">
            <div className="group relative shrink-0">
              <Avatar
                userId={userId}
                avatarVersion={avatarVersion}
                name={displayName}
                previewSrc={avatarPreview}
                className="size-14 rounded-2xl text-xl"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={avatarBusy}
                aria-label="Change profile photo"
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-100"
              >
                {avatarBusy ? (
                  <Loader2 className="size-4 animate-spin text-white" />
                ) : (
                  <Camera className="size-4 text-white" />
                )}
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-white">{displayName}</p>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-400 capitalize">
                  {plan} Trader
                </span>
              </div>
              <p className="text-sm text-gray-500">{emailInput || "—"}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarBusy}
                  className="text-xs font-medium text-purple-400 hover:text-purple-300 disabled:opacity-60"
                >
                  Change photo
                </button>
                {avatarVersion && (
                  <button
                    type="button"
                    onClick={handleAvatarRemove}
                    disabled={avatarBusy}
                    className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-400 disabled:opacity-60"
                  >
                    <Trash2 className="size-3" />
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          {avatarError && (
            <p role="alert" className="mt-4 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-400">
              {avatarError}
            </p>
          )}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="displayName" className="mb-1.5 block text-xs font-medium text-gray-500">Display Name</label>
              <input
                id="displayName"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>
            <div>
              <label htmlFor="profileEmail" className="mb-1.5 block text-xs font-medium text-gray-500">Email</label>
              <input
                id="profileEmail"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
              />
            </div>

            {saveError && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-400">
                {saveError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                disabled={saving}
                onClick={handleSave}
                className="gap-2 bg-purple-500 text-white hover:bg-purple-400 disabled:opacity-60"
              >
                {saving && <Loader2 className="size-3.5 animate-spin" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
              {saved && <span role="status" className="text-xs text-emerald-400">Saved.</span>}
            </div>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications">
          <div className="space-y-4">
            {[
              { label: "New AI Signals", desc: "Get notified when a new signal is detected", icon: Bell, field: "notifSignals" as const, state: notifSignals, set: setNotifSignals },
              { label: "Trade Journal reminders", desc: "Daily prompt to log your trades", icon: User, field: "notifJournal" as const, state: notifJournal, set: setNotifJournal },
              { label: "Product updates", desc: "News about new features and improvements", icon: Shield, field: "notifUpdates" as const, state: notifUpdates, set: setNotifUpdates },
            ].map(({ label, desc, icon: Icon, field, state, set }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                    <Icon className="size-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </div>
                <Toggle
                  checked={state}
                  onChange={(value) => {
                    set(value)
                    toggleNotif(field, value, () => set(!value))
                  }}
                />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security">
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="mb-1.5 block text-xs font-medium text-gray-500">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
                <input
                  id="currentPassword"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-xs font-medium text-gray-500">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
                <input
                  id="newPassword"
                  type={showPw ? "text" : "password"}
                  minLength={8}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 pl-10 pr-11 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
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
            </div>
            <div>
              <label htmlFor="confirmNewPassword" className="mb-1.5 block text-xs font-medium text-gray-500">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-gray-600" />
                <input
                  id="confirmNewPassword"
                  type={showPw ? "text" : "password"}
                  minLength={8}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
            </div>

            {pwError && (
              <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-400">
                {pwError}
              </p>
            )}

            <div className="flex items-center gap-3">
              <Button
                size="sm"
                disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
                onClick={handleChangePassword}
                className="gap-2 bg-purple-500 text-white hover:bg-purple-400 disabled:opacity-60"
              >
                {pwSaving && <Loader2 className="size-3.5 animate-spin" />}
                {pwSaving ? "Updating…" : "Update Password"}
              </Button>
              {pwSaved && <span role="status" className="text-xs text-emerald-400">Password updated.</span>}
            </div>
          </div>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                <Moon className="size-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-gray-500">EntrixAlgo always runs in dark mode</p>
              </div>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-xs text-gray-500">
              Always on
            </span>
          </div>
        </SectionCard>

        {/* Plan */}
        <SectionCard title="Subscription">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium capitalize text-white">{plan} Plan</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {plan === "free"
                  ? "No active subscription"
                  : renewsAt
                    ? `Renews on ${new Date(renewsAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`
                    : "Lifetime access"}
              </p>
            </div>
            {plan === "free" ? (
              <Link
                href="/#pricing"
                className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15"
              >
                Manage Plan
              </Link>
            ) : (
              <button
                onClick={handleManageBilling}
                disabled={portalLoading}
                className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/15 disabled:opacity-60"
              >
                {portalLoading ? "Loading…" : "Manage Billing"}
              </button>
            )}
          </div>
          {portalError && (
            <p role="alert" className="mt-3 rounded-lg border border-red-500/20 bg-red-500/[0.08] px-3.5 py-2.5 text-sm text-red-400">
              {portalError}
            </p>
          )}
        </SectionCard>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
          <h2 className="mb-1 text-sm font-semibold text-red-400">Danger Zone</h2>
          <p className="mb-4 text-xs text-gray-500">
            Signing out will end your current session.
          </p>
          <Button
            variant="destructive"
            size="sm"
            className="gap-2 bg-red-500/15 text-red-400 hover:bg-red-500/25"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            <LogOut className="size-3.5" />
            Sign Out
          </Button>
        </div>
        </motion.div>

        <AnimatePresence>
          {!loaded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex items-start justify-center pt-24"
            >
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0d0d1c]/80 px-8 py-6 shadow-2xl backdrop-blur-sm">
                <Loader2 className="size-6 animate-spin text-purple-400" />
                <p className="text-xs text-gray-500">Loading your settings…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
