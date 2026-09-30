import { Resend } from "resend"

import { siteConfig } from "@/config/site"

let resend: Resend | null = null

function client() {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

// Resend reports a refused email (daily quota, unverified sender domain, bad
// address) in its return value, { data, error }, and does not throw. Every
// caller used to treat that as sent. Throwing here makes their existing
// try/catch blocks (and the admin bulk resend's failed list) see it.
async function deliver(resendClient: Resend, payload: Parameters<Resend["emails"]["send"]>[0]) {
  const { error } = await resendClient.emails.send(payload)
  if (error) throw new Error(`Resend refused the email: ${error.name}: ${error.message}`)
}

function wrapper(title: string, body: string, ctaLabel: string, ctaUrl: string, { helpFooter = true } = {}) {
  return `
<div style="background:#09090f;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:440px;margin:0 auto;background:#0d0d1c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
    <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#ffffff;">
      Entrix<span style="color:#a855f7;">Algo</span>
    </p>
    <h1 style="margin:0 0 12px;font-size:18px;color:#ffffff;">${title}</h1>
    <p style="margin:0 0 24px;font-size:14px;line-height:1.6;color:#9ca3af;">${body}</p>
    <a href="${ctaUrl}" style="display:inline-block;background:linear-gradient(90deg,#9333ea,#a855f7);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:12px;">
      ${ctaLabel}
    </a>
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#4b5563;">
      If the button doesn't work, copy and paste this link into your browser:<br />
      <span style="color:#6b7280;">${ctaUrl}</span>
    </p>
    ${helpFooter ? `<p style="margin:16px 0 0;font-size:12px;line-height:1.6;color:#4b5563;">
      Need help? Reply to this email or write to <a href="mailto:${siteConfig.supportEmail}" style="color:#a855f7;">${siteConfig.supportEmail}</a>.
    </p>` : ""}
  </div>
</div>`.trim()
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? "EntrixAlgo <onboarding@resend.dev>"
}

// Base for every link in our emails (verify, reset, sign-in). It used to be
// AUTH_URL with a localhost fallback, and production had no usable AUTH_URL,
// so every verification and password-reset link pointed at
// http://localhost:3000 and only worked on the developer's machine. On the
// production deployment a missing or local AUTH_URL now falls back to the
// real site; previews use their own deployment URL; local dev keeps localhost.
function baseUrl() {
  const configured = process.env.AUTH_URL?.replace(/\/+$/, "")
  const isLocal = !configured || /localhost|127\.0\.0\.1/.test(configured)
  if (process.env.VERCEL_ENV === "production") return isLocal ? siteConfig.url : configured
  if (configured) return configured
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return "http://localhost:3000"
}

export async function sendVerificationEmail(to: string, token: string) {
  const resendClient = client()
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY not set — skipping verification email to", to)
    return
  }
  const url = `${baseUrl()}/verify-email?token=${token}`
  await deliver(resendClient, {
    from:    fromAddress(),
    replyTo: siteConfig.supportEmail,
    to,
    subject: "Verify your EntrixAlgo email",
    html: wrapper(
      "Verify your email",
      "Confirm this is your email address to secure your EntrixAlgo account. This link expires in 24 hours.",
      "Verify email",
      url
    ),
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resendClient = client()
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY not set — skipping password reset email to", to)
    return
  }
  const url = `${baseUrl()}/reset-password?token=${token}`
  await deliver(resendClient, {
    from:    fromAddress(),
    replyTo: siteConfig.supportEmail,
    to,
    subject: "Reset your EntrixAlgo password",
    html: wrapper(
      "Reset your password",
      "We received a request to reset your EntrixAlgo password. This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
      "Reset password",
      url
    ),
  })
}

const escapeHtml = (v: string) =>
  v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

// Sent to the OLD address after an email change, so the real owner finds out
// if someone else changed it.
export async function sendEmailChangedNotice(to: string, newEmail: string) {
  const resendClient = client()
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY not set — skipping email-changed notice to", to)
    return
  }
  await deliver(resendClient, {
    from:    fromAddress(),
    replyTo: siteConfig.supportEmail,
    to,
    subject: "Your EntrixAlgo email was changed",
    html: wrapper(
      "Your account email was changed",
      `The email on your EntrixAlgo account was just changed to ${escapeHtml(newEmail)}. If you made this change, no action is needed. If you didn't, contact EntrixAlgo support at <a href="mailto:${siteConfig.supportEmail}" style="color:#a855f7;">${siteConfig.supportEmail}</a> right away so we can secure your account.`,
      "Open EntrixAlgo",
      `${baseUrl()}/sign-in`
    ),
  })
}

// Internal alert to support: a Pro user asked for TradingView indicator
// access. There is no automated invite, so this is how the request gets seen.
// Replying goes straight to the user.
export async function sendIndicatorRequestAlert(user: { email: string; name: string | null; plan: string }, tradingviewUsername: string) {
  const resendClient = client()
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY not set — skipping indicator request alert for", tradingviewUsername)
    return
  }
  const profileUrl = `https://www.tradingview.com/u/${encodeURIComponent(tradingviewUsername)}/`
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;">${label}</td><td style="padding:4px 0;color:#e5e7eb;font-weight:600;">${value}</td></tr>`
  await deliver(resendClient, {
    from:    fromAddress(),
    replyTo: user.email,
    to:      siteConfig.supportEmail,
    subject: `Indicator access request: @${tradingviewUsername}`,
    html: wrapper(
      "New indicator access request",
      `Add this user to the invite-only script on TradingView.<br /><br />
<table style="border-collapse:collapse;font-size:14px;">
  ${row("TradingView", `@${escapeHtml(tradingviewUsername)}`)}
  ${row("Account", escapeHtml(user.email))}
  ${user.name ? row("Name", escapeHtml(user.name)) : ""}
  ${row("Plan", escapeHtml(user.plan))}
  ${row("Requested", new Date().toUTCString())}
</table><br />
Reply to this email to reach the user directly.`,
      "Open TradingView profile",
      profileUrl,
      { helpFooter: false },
    ),
  })
}

// Update to Pro users waiting for indicator access while it's being finished,
// sent from the admin console (Indicator queue). One builder, so the console
// can preview exactly what goes out. Doesn't mention how access is granted.
export function indicatorUpdateEmail({ tradingviewUsername }: { tradingviewUsername: string | null }) {
  const handle = tradingviewUsername ? ` for <strong style="color:#e5e7eb;">@${escapeHtml(tradingviewUsername)}</strong>` : ""
  const handleText = tradingviewUsername ? ` for @${tradingviewUsername}` : ""
  const url = `${baseUrl()}/dashboard`
  const subject = "Your EntrixAlgo indicator is almost ready"
  const html = wrapper(
    "Your indicator is almost ready",
    `Hi there,<br /><br />
Thank you for requesting access to the EntrixAlgo TradingView indicator${handle}. Your request is saved, and you don't need to do anything else.<br /><br />
We're sorry for the wait. We're taking a few extra days to finish the indicator, because we want it to be genuinely useful on your charts from day one: clear signals and settings that hold up in live markets. We'd rather get it right than rush it.<br /><br />
As soon as it's ready, you'll get access and we'll email you to let you know. We expect that within the next few days.<br /><br />
In the meantime, everything else in your Pro plan is ready to use, including AI Chart Analysis and the AI Trading Bot.<br /><br />
Thanks for your patience, and for trading with us.<br />
The EntrixAlgo team`,
    "Open your dashboard",
    url,
  )
  const text = [
    "Hi there,",
    `Thank you for requesting access to the EntrixAlgo TradingView indicator${handleText}. Your request is saved, and you don't need to do anything else.`,
    "We're sorry for the wait. We're taking a few extra days to finish the indicator, because we want it to be genuinely useful on your charts from day one: clear signals and settings that hold up in live markets. We'd rather get it right than rush it.",
    "As soon as it's ready, you'll get access and we'll email you to let you know. We expect that within the next few days.",
    "In the meantime, everything else in your Pro plan is ready to use, including AI Chart Analysis and the AI Trading Bot.",
    `Open your dashboard: ${url}`,
    "Thanks for your patience, and for trading with us.\nThe EntrixAlgo team",
    `Need help? Reply to this email or write to ${siteConfig.supportEmail}.`,
  ].join("\n\n")
  return { subject, html, text }
}

export async function sendIndicatorUpdateEmail(to: string, user: { tradingviewUsername: string | null }) {
  const resendClient = client()
  if (!resendClient) throw new Error("RESEND_API_KEY is not set.")
  const { subject, html, text } = indicatorUpdateEmail(user)
  await deliver(resendClient, { from: fromAddress(), replyTo: siteConfig.supportEmail, to, subject, html, text })
}

// Support request from the site's chat widget ("talk to a person"). Goes to
// support only: no copy is sent to the visitor, because the address they type
// is unverified and a copy would let anyone send our emails to any inbox.
// Replying goes straight to the address they gave.
export async function sendSupportRequest(request: {
  name:       string
  email:      string
  message:    string
  page:       string | null
  account:    { id: string; email: string | null; plan: string | null } | null
  transcript: { role: "user" | "assistant"; content: string }[]
}) {
  const resendClient = client()
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY not set — skipping support request from", request.email)
    return
  }
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top;">${label}</td><td style="padding:4px 0;color:#e5e7eb;font-weight:600;">${value}</td></tr>`
  const account = request.account
    ? `${escapeHtml(request.account.email ?? "unknown")} (${escapeHtml(request.account.plan ?? "free")}, id ${escapeHtml(request.account.id)})`
    : "Not signed in"
  const transcript = request.transcript.length
    ? `<br /><br /><span style="color:#6b7280;">Chat before the request:</span><br />${request.transcript
        .map((m) => `<span style="color:${m.role === "user" ? "#e5e7eb" : "#a78bfa"};">${m.role === "user" ? "Visitor" : "Bot"}:</span> ${escapeHtml(m.content)}`)
        .join("<br />")}`
    : ""
  // A name typed with line breaks must not reach the subject header.
  const subjectName = request.name.replace(/[\r\n]+/g, " ").slice(0, 60)

  await deliver(resendClient, {
    from:    fromAddress(),
    replyTo: request.email,
    to:      siteConfig.supportEmail,
    subject: `Support request: ${subjectName}`,
    html: wrapper(
      "New support request",
      `<table style="border-collapse:collapse;font-size:14px;">
  ${row("Name", escapeHtml(request.name))}
  ${row("Email", escapeHtml(request.email))}
  ${row("Account", account)}
  ${request.page ? row("Page", escapeHtml(request.page)) : ""}
  ${row("Sent", new Date().toUTCString())}
</table><br />
<span style="color:#e5e7eb;white-space:pre-wrap;">${escapeHtml(request.message)}</span>${transcript}<br /><br />
Reply to this email to answer them directly. The email they typed is not verified; check "Account" when it matters.`,
      "Reply by email",
      `mailto:${encodeURIComponent(request.email)}?subject=${encodeURIComponent("Re: your EntrixAlgo support request")}`,
      { helpFooter: false },
    ),
  })
}
