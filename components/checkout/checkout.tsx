"use client"

import { CheckoutElementsProvider, ExpressCheckoutElement, PaymentElement, useCheckoutElements } from "@stripe/react-stripe-js/checkout"
import { type Appearance, loadStripe, type StripeExpressCheckoutElementConfirmEvent } from "@stripe/stripe-js"
import { ArrowLeft, Bot, Check, Gauge, LifeBuoy, Loader2, Lock, RefreshCw, ShieldCheck, Sparkles, Target, Wrench, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { checkoutPath, PAID_PLANS, type PaidPlan } from "@/config/plans"
import { siteConfig } from "@/config/site"
import { TESTIMONIALS } from "@/config/testimonials"
import type { PurchaseBlock } from "@/lib/checkout"
import { cn } from "@/lib/utils"

// The site's own checkout. Layout, plan choice and copy are ours; the card
// fields and wallet buttons are Stripe's, drawn inside our page, so card
// numbers go from the customer's browser straight to Stripe and never touch
// this site. Paying grants nothing here: the webhook does that.

// Loaded once, and only on this page
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) : null

const PLAN_ORDER: PaidPlan[] = ["monthly", "lifetime"]

const INCLUDED = [
  { icon: Zap,      text: "Unlimited AI chart analysis" },
  { icon: Target,   text: "Entry, targets and stop loss on every analysis" },
  { icon: Bot,      text: "AI Trading Bot with live market data" },
  { icon: LifeBuoy, text: "Priority support and early access to new features" },
  { icon: Wrench,   text: "Every free tool: AI Screener, journal, calendar, risk calculator" },
]

// A real user quote, word for word (config/testimonials.ts)
const QUOTE = TESTIMONIALS.find((t) => t.name === "Jacob Swan") ?? TESTIMONIALS[0]

// Stripe's fields, styled to sit inside our cards. 16px text so phones don't
// zoom the page when a field is focused.
const APPEARANCE: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#a855f7",
    colorBackground: "#12121f",
    colorText: "#f3f4f6",
    colorTextSecondary: "#9ca3af",
    colorTextPlaceholder: "#6b7280",
    colorDanger: "#f87171",
    fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
    fontSizeBase: "16px",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { backgroundColor: "#12121f", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "none", padding: "13px 14px" },
    ".Input:hover": { border: "1px solid rgba(255,255,255,0.28)" },
    ".Input:focus": { border: "1px solid rgba(168,85,247,0.75)", boxShadow: "0 0 0 3px rgba(168,85,247,0.22)" },
    ".Input--invalid": { border: "1px solid rgba(248,113,113,0.8)", boxShadow: "none" },
    ".Label": { color: "#9ca3af", fontSize: "13px", fontWeight: "500" },
    ".Error": { fontSize: "13px" },
    ".Tab": { backgroundColor: "#12121f", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "none" },
    ".Tab:hover": { border: "1px solid rgba(255,255,255,0.28)" },
    ".Tab--selected": { border: "1px solid rgba(168,85,247,0.75)", boxShadow: "0 0 0 3px rgba(168,85,247,0.22)" },
    ".Block": { backgroundColor: "#12121f", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "none" },
  },
}

const FONTS = [{ cssSrc: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" }]

// The wallets have their own buttons above the card fields, so the card form doesn't repeat them
const PAYMENT_OPTIONS = { layout: "tabs", wallets: { applePay: "never", googlePay: "never" } } as const

const BLOCK_LABEL: Record<PurchaseBlock, string> = {
  has_monthly:  "Your current plan",
  has_lifetime: "Included with Lifetime",
  has_pro:      "Included with your plan",
}

type Blocks = Record<PaidPlan, PurchaseBlock | null>

// ─── Plan choice ──────────────────────────────────────────────────────────────

function PlanPicker({ plan, blocked, onChange }: { plan: PaidPlan; blocked: Blocks; onChange: (plan: PaidPlan) => void }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold text-white">Choose your plan</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {PLAN_ORDER.map((id) => {
          const p = PAID_PLANS[id]
          const block = blocked[id]
          const selected = plan === id
          return (
            <label
              key={id}
              className={cn(
                "relative flex min-h-[5.5rem] cursor-pointer flex-col justify-center rounded-2xl border px-4 py-3.5 transition-[border-color,background-color,box-shadow] duration-200",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple-300 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#09090f]",
                selected
                  ? "border-purple-400/80 bg-purple-500/[0.12] shadow-[0_0_36px_-12px_rgba(168,85,247,0.85)]"
                  : "border-white/15 bg-white/[0.03] hover:border-white/30",
                block && "cursor-not-allowed opacity-55 hover:border-white/15",
              )}
            >
              <input
                type="radio"
                name="plan"
                value={id}
                checked={selected}
                disabled={!!block}
                onChange={() => onChange(id)}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-white">{p.name}</span>
                {/* The radio mark */}
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                    selected ? "border-purple-400 bg-purple-500" : "border-white/30",
                  )}
                >
                  {selected && <Check className="size-3 text-white" strokeWidth={3} />}
                </span>
              </span>
              <span className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums text-white">${p.price}</span>
                <span className="text-xs text-gray-400">{p.cadence}</span>
              </span>
              <span className="mt-0.5 text-xs text-gray-400">{block ? BLOCK_LABEL[block] : p.blurb}</span>
              {id === "monthly" && !block && (
                <span className="absolute -top-2.5 right-3 rounded-full border border-purple-400 bg-purple-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                  Most popular
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── What Pro includes, and why paying here is safe ───────────────────────────

function ValueProps({ plan }: { plan: PaidPlan }) {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-5">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="size-4 text-purple-300" aria-hidden />
          What you get with Pro
        </h2>
        <ul className="mt-4 space-y-3">
          {INCLUDED.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-sm text-gray-200">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 ring-1 ring-emerald-400/30">
                <Icon className="size-3.5 text-emerald-300" aria-hidden />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <figure className="rounded-2xl border border-white/15 bg-gradient-to-br from-purple-500/[0.10] to-transparent p-5">
        <blockquote className="text-sm leading-relaxed text-gray-200">&ldquo;{QUOTE.text}&rdquo;</blockquote>
        <figcaption className="mt-3 flex items-center gap-2.5 text-xs text-gray-400">
          <span aria-hidden className="flex size-7 items-center justify-center rounded-full bg-purple-500/25 text-[11px] font-semibold text-purple-100">
            {QUOTE.name.slice(0, 1).toUpperCase()}
          </span>
          {QUOTE.name}, EntrixAlgo user
        </figcaption>
      </figure>

      <ul className="grid gap-2.5 text-xs text-gray-400 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        <li className="flex items-center gap-2">
          <Gauge className="size-4 shrink-0 text-emerald-300" aria-hidden />
          Instant access after payment
        </li>
        <li className="flex items-center gap-2">
          <RefreshCw className="size-4 shrink-0 text-emerald-300" aria-hidden />
          {plan === "monthly" ? "Cancel anytime in Settings" : "Pay once, no renewals"}
        </li>
        <li className="flex items-center gap-2">
          <ShieldCheck className="size-4 shrink-0 text-emerald-300" aria-hidden />
          Secure payment by Stripe
        </li>
      </ul>

      <p className="text-xs text-gray-500">
        A question before you pay? Write to{" "}
        <a className="text-gray-300 underline underline-offset-2 hover:text-white" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </div>
  )
}

// ─── Payment ──────────────────────────────────────────────────────────────────

function PanelSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading secure payment form" className="space-y-4">
      <div className="h-12 animate-pulse rounded-xl bg-white/[0.07]" />
      <div className="h-4 w-40 animate-pulse rounded bg-white/[0.05]" />
      <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
      </div>
      <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="h-14 animate-pulse rounded-xl bg-purple-500/20" />
    </div>
  )
}

function PanelError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-rose-400/30 bg-rose-500/[0.08] p-4 text-sm text-rose-100">
      <p>{message}</p>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
          >
            <RefreshCw className="size-4" aria-hidden />
            Try again
          </button>
        )}
        <span className="text-xs text-rose-100/80">
          Need help? <a className="underline underline-offset-2" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>
        </span>
      </div>
    </div>
  )
}

function PayForm({ plan, email, sessionId }: { plan: PaidPlan; email: string; sessionId: string | null }) {
  const result = useCheckoutElements()
  // Wallet buttons: unknown until Stripe has looked at the device
  const [express, setExpress] = useState<"checking" | "available" | "none">("checking")
  const [fieldsReady, setFieldsReady] = useState(false)
  // Stripe's card fields didn't load (an ad blocker, a dropped connection)
  const [fieldsFailed, setFieldsFailed] = useState(false)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // The confirm call broke off without an answer: the payment may or may not
  // have gone through, so paying again is held back until that is checked
  const [unsure, setUnsure] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)
  const unsureRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (error) errorRef.current?.focus()
  }, [error])
  useEffect(() => {
    if (unsure) unsureRef.current?.focus()
  }, [unsure])

  const monthly = plan === "monthly"
  // Stable objects: Stripe re-applies element options whenever they change
  const expressOptions = useMemo(
    () => ({
      buttonHeight: 48,
      buttonTheme: { applePay: "white", googlePay: "white" } as const,
      buttonType: monthly ? ({ applePay: "subscribe", googlePay: "subscribe" } as const) : ({ applePay: "buy", googlePay: "buy" } as const),
      layout: { maxColumns: 1, maxRows: 3, overflow: "never" } as const,
      paymentMethodOrder: undefined,
      paymentMethods: undefined,
    }),
    [monthly],
  )

  if (result.type === "loading") return <PanelSkeleton />
  if (result.type === "error") return <PanelError message="The secure payment form couldn't load. Check your connection and try again." onRetry={() => window.location.reload()} />

  const { checkout } = result
  const total = checkout.total.total.amount

  const confirm = async (expressEvent?: StripeExpressCheckoutElementConfirmEvent) => {
    if (paying || unsure) return
    setError(null)
    setPaying(true)
    try {
      // Cards and wallets finish here; only methods that must leave the page
      // (a bank redirect) go through the return URL
      const outcome = await checkout.confirm({ redirect: "if_required", ...(expressEvent ? { expressCheckoutConfirmEvent: expressEvent } : {}) })
      if (outcome.type === "error") {
        setError(outcome.error.message)
        setPaying(false)
        return
      }
      window.location.assign(`/checkout/complete?session_id=${encodeURIComponent(outcome.session.id)}`)
    } catch {
      // No answer from Stripe (a dropped connection, say). The card may have
      // been charged all the same, so this never says "you were not charged"
      // and never invites a second payment: the customer checks first.
      setUnsure(true)
      setPaying(false)
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void confirm()
      }}
      noValidate
    >
      {/* One-tap wallets first: most visitors are on a phone */}
      <div className={cn((express === "none" || unsure) && "hidden")}>
        <div className={cn("relative", express === "checking" && "min-h-12")}>
          {express === "checking" && <div aria-hidden className="absolute inset-0 animate-pulse rounded-xl bg-white/[0.07]" />}
          <ExpressCheckoutElement
            options={expressOptions}
            onReady={({ availablePaymentMethods }) =>
              setExpress(availablePaymentMethods && Object.values(availablePaymentMethods).some(Boolean) ? "available" : "none")}
            onLoadError={() => setExpress("none")}
            onConfirm={(event) => void confirm(event)}
          />
        </div>
        <div className="my-5 flex items-center gap-3 text-xs text-gray-500" role="separator">
          <span className="h-px flex-1 bg-white/10" />
          or pay with card
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm">
        <span className="text-gray-400">Account</span>
        <span className="min-w-0 truncate font-medium text-gray-100">{checkout.email ?? email}</span>
      </div>

      {fieldsFailed && !fieldsReady && (
        <PanelError
          message="The card fields couldn't load. Check your connection, turn off any ad blocker for this page, and try again."
          onRetry={() => window.location.reload()}
        />
      )}

      {/* Space is held for the card fields while they load, so nothing jumps */}
      <div className={cn("relative", !fieldsReady && "min-h-[13.5rem]", fieldsFailed && !fieldsReady && "hidden")}>
        {!fieldsReady && (
          <div aria-hidden className="absolute inset-0 space-y-3">
            <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
              <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
            </div>
            <div className="h-[52px] animate-pulse rounded-xl bg-white/[0.06]" />
          </div>
        )}
        <PaymentElement
          options={PAYMENT_OPTIONS}
          onReady={() => setFieldsReady(true)}
          onLoadError={() => setFieldsFailed(true)}
        />
      </div>

      {/* What is charged, in full, before the button */}
      <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
        {checkout.total.discount.minorUnitsAmount > 0 && (
          <div className="flex items-center justify-between text-emerald-300">
            <dt>Discount</dt>
            <dd className="tabular-nums">-{checkout.total.discount.amount}</dd>
          </div>
        )}
        {checkout.total.taxExclusive.minorUnitsAmount > 0 && (
          <div className="flex items-center justify-between text-gray-400">
            <dt>Tax</dt>
            <dd className="tabular-nums">{checkout.total.taxExclusive.amount}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="font-medium text-gray-200">Due today</dt>
          <dd className="text-xl font-bold tabular-nums text-white">{total}</dd>
        </div>
        <p className="text-xs text-gray-400">
          {monthly
            ? `Then ${checkout.recurring?.dueNext.total.amount ?? total} every month until you cancel.`
            : "One payment. No renewals, ever."}
        </p>
      </dl>

      <p
        ref={errorRef}
        tabIndex={-1}
        role="alert"
        className={cn("mt-4 rounded-xl border border-rose-400/30 bg-rose-500/[0.08] px-3.5 py-3 text-sm text-rose-100 outline-none", !error && "hidden")}
      >
        {error}
      </p>

      {unsure && (
        <div
          ref={unsureRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 rounded-xl border border-amber-400/30 bg-amber-500/[0.08] px-3.5 py-3 text-sm text-amber-100 outline-none"
        >
          <p>
            We lost the connection while confirming your payment, so we can&apos;t tell yet whether it went through.
            Please check before you pay again.
          </p>
          {sessionId ? (
            <a
              href={`/checkout/complete?session_id=${encodeURIComponent(sessionId)}`}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-4 text-sm font-medium text-white transition-colors hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
            >
              <RefreshCw className="size-4" aria-hidden />
              Check my payment
            </a>
          ) : (
            <p className="mt-2 text-xs text-amber-100/80">
              Look for a receipt in your inbox, or write to{" "}
              <a className="underline underline-offset-2" href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={paying || !fieldsReady || unsure}
        aria-busy={paying}
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 text-base font-semibold text-white shadow-[0_0_32px_-6px_rgba(192,38,211,0.75)] transition-[filter,box-shadow,opacity] duration-200 hover:brightness-110 hover:shadow-[0_0_40px_-6px_rgba(192,38,211,0.95)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d1c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paying ? (
          <>
            <Loader2 className="size-5 animate-spin" aria-hidden />
            Processing...
          </>
        ) : (
          <>
            <Lock className="size-4" aria-hidden />
            {monthly ? `Subscribe for ${total} a month` : `Pay ${total}`}
          </>
        )}
      </button>

      <p className="mt-3 text-center text-xs leading-relaxed text-gray-500">
        {monthly
          ? "Your subscription renews every month until you cancel, which you can do anytime in Settings. "
          : "This is a one-time payment for lifetime access. "}
        By continuing you agree to our{" "}
        <Link href="/terms" target="_blank" className="text-gray-300 underline underline-offset-2 hover:text-white">Terms</Link> and{" "}
        <Link href="/privacy" target="_blank" className="text-gray-300 underline underline-offset-2 hover:text-white">Privacy Policy</Link>.
      </p>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
        <Lock className="size-3.5 shrink-0" aria-hidden />
        Your card details go straight to Stripe. EntrixAlgo never sees them.
      </p>
    </form>
  )
}

type Secret = { status: "loading" } | { status: "ready"; clientSecret: string } | { status: "error"; message: string }

function PaymentPanel({ plan, email, secrets }: { plan: PaidPlan; email: string; secrets: React.RefObject<Map<PaidPlan, string>> }) {
  const [secret, setSecret] = useState<Secret>(() => {
    const cached = secrets.current.get(plan)
    return cached ? { status: "ready", clientSecret: cached } : { status: "loading" }
  })

  const open = useCallback(async () => {
    setSecret({ status: "loading" })
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      })
      const data = (await res.json().catch(() => null)) as { clientSecret?: string; error?: string } | null
      if (res.status === 401) {
        window.location.assign(`/sign-in?callbackUrl=${encodeURIComponent(checkoutPath(plan))}`)
        return
      }
      if (!res.ok || !data?.clientSecret) {
        setSecret({ status: "error", message: data?.error ?? "Checkout is temporarily unavailable. Please try again in a moment." })
        return
      }
      secrets.current.set(plan, data.clientSecret)
      setSecret({ status: "ready", clientSecret: data.clientSecret })
    } catch {
      setSecret({ status: "error", message: "We couldn't reach the server. Check your connection and try again." })
    }
  }, [plan, secrets])

  // One session per plan per visit: switching back reuses the first one
  const started = useRef(false)
  useEffect(() => {
    if (started.current || secrets.current.has(plan)) return
    started.current = true
    void open()
  }, [open, plan, secrets])

  const clientSecret = secret.status === "ready" ? secret.clientSecret : null
  const options = useMemo(
    () => (clientSecret ? { clientSecret, elementsOptions: { appearance: APPEARANCE, fonts: FONTS } } : null),
    [clientSecret],
  )

  if (secret.status === "error") return <PanelError message={secret.message} onRetry={open} />
  if (!options || !stripePromise) return <PanelSkeleton />

  return (
    <CheckoutElementsProvider stripe={stripePromise} options={options}>
      {/* A client secret is "<session id>_secret_<rest>"; only the id part is ever put in a link */}
      <PayForm plan={plan} email={email} sessionId={clientSecret?.includes("_secret_") ? clientSecret.split("_secret_")[0] : null} />
    </CheckoutElementsProvider>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function Checkout({ initialPlan, email, blocked }: { initialPlan: PaidPlan; email: string; blocked: Blocks }) {
  const [plan, setPlan] = useState<PaidPlan>(initialPlan)
  const secrets = useRef(new Map<PaidPlan, string>())

  const choose = (next: PaidPlan) => {
    if (next === plan || blocked[next]) return
    setPlan(next)
    // Keep the address in step, so a reload or a shared link opens the same plan
    window.history.replaceState(null, "", checkoutPath(next))
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#09090f] text-white">
      {/* Colour without blur filters: two soft radial washes */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(60% 45% at 85% 0%, rgba(147,51,234,0.30), transparent 70%), radial-gradient(50% 40% at 0% 100%, rgba(192,38,211,0.16), transparent 70%)",
        }}
      />

      <header className="relative mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6">
        <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300">
          <Image src="/logo_transparent.png" alt="" width={28} height={28} className="size-7 object-contain" />
          <span className="text-lg font-bold tracking-tight">
            Entrix<span className="text-purple-400">Algo</span>
          </span>
        </Link>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
          <Lock className="size-3.5" aria-hidden />
          Secure checkout
        </span>
      </header>

      <main id="main-content" className="relative mx-auto max-w-5xl px-4 pb-16 sm:px-6">
        <Link
          href="/#pricing"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg text-sm text-gray-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-300"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to plans
        </Link>

        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Upgrade to EntrixAlgo Pro</h1>
        <p className="mt-1.5 text-sm text-gray-400">One step left. Your Pro tools unlock the moment the payment goes through.</p>

        {/* Phones: plan, then payment, then the details. PC: plan and details
            on the left, payment on the right and in view while scrolling.
            The first row is only as tall as the plan cards and the second
            takes whatever the payment card adds, so a tall card form never
            opens a gap between the plan cards and the details under them. */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-10 lg:gap-y-6">
          <div className="lg:col-start-1 lg:row-start-1">
            <PlanPicker plan={plan} blocked={blocked} onChange={choose} />
            {blocked.monthly === "has_monthly" && plan === "lifetime" && (
              <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-gray-300">
                Your Monthly subscription is cancelled automatically when you buy Lifetime, so it does not bill again.
              </p>
            )}
          </div>

          <section
            aria-label="Payment"
            className="relative rounded-2xl border border-white/15 bg-[#0d0d1c] p-5 shadow-[0_0_60px_-24px_rgba(168,85,247,0.6)] sm:p-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1"
          >
            {/* A lit top edge */}
            <span aria-hidden className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-purple-400/70 to-transparent" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">Payment</h2>
              <span className="text-xs text-gray-400">
                {PAID_PLANS[plan].name} · ${PAID_PLANS[plan].price}
                {PAID_PLANS[plan].cadence.startsWith("/") ? PAID_PLANS[plan].cadence : ` ${PAID_PLANS[plan].cadence}`}
              </span>
            </div>
            {/* A new form per plan: a subscription and a one-time payment are different Stripe sessions */}
            <PaymentPanel key={plan} plan={plan} email={email} secrets={secrets} />
          </section>

          <div className="lg:col-start-1 lg:row-start-2">
            <ValueProps plan={plan} />
          </div>
        </div>
      </main>
    </div>
  )
}
