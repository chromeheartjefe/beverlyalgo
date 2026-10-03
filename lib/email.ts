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

/**
 * The plain-text twin of wrapper(). HTML-only emails score worse with spam
 * filters, and some people read mail as text, so account emails send both.
 */
function plainText(title: string, body: string, ctaLabel: string, ctaUrl: string): string {
  return [
    "EntrixAlgo",
    "",
    title,
    "",
    body,
    "",
    `${ctaLabel}: ${ctaUrl}`,
    "",
    `Need help? Reply to this email or write to ${siteConfig.supportEmail}.`,
  ].join("\n")
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
    text: plainText(
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
    text: plainText(
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
    text: plainText(
      "Your account email was changed",
      `The email on your EntrixAlgo account was just changed to ${newEmail}. If you made this change, no action is needed. If you didn't, contact EntrixAlgo support at ${siteConfig.supportEmail} right away so we can secure your account.`,
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

// The follow-up to the update above: the indicator script itself with install
// steps, for Pro users who asked for access. Sent from the admin console
// (Indicator queue). The script and the picture of TradingView's Pine button
// are passed in, so neither lives in the site's source: the console reads
// them from the local .indicator/ folder. Wider than wrapper() so the script
// fits, and built from blocks because it has lists and a code box.
const PINE_IMAGE_CID = "pine-button"

export function indicatorEarlyAccessEmail({ script, pineImageSrc }: { script: string; pineImageSrc: string }) {
  const url = `${baseUrl()}/dashboard/chart-analysis`
  const subject = "Your EntrixAlgo indicator: early access is ready"
  const code = script.trim()

  const p = (html: string, margin = "0 0 16px") => `<p style="margin:${margin};font-size:14px;line-height:1.65;color:#9ca3af;">${html}</p>`
  const h2 = (title: string) => `<h2 style="margin:28px 0 10px;font-size:15px;color:#ffffff;">${title}</h2>`
  const b = (label: string) => `<strong style="color:#e5e7eb;">${label}</strong>`
  const list = (tag: "ul" | "ol", items: string[]) =>
    `<${tag} style="margin:0 0 16px;padding-left:20px;font-size:14px;line-height:1.65;color:#9ca3af;">${items.map((item) => `<li style="margin:0 0 8px;">${item}</li>`).join("")}</${tag}>`

  const pineImage = `<br /><img src="${pineImageSrc}" width="160" height="182" alt="The Pine button in TradingView's right-hand toolbar" style="display:block;margin:10px 0 4px;border:1px solid rgba(255,255,255,0.12);border-radius:10px;" />`

  const html = `
<div style="background:#09090f;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#0d0d1c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
    <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#ffffff;">
      Entrix<span style="color:#a855f7;">Algo</span>
    </p>
    <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff;">Your early access is ready</h1>
    ${p("Hi there,")}
    ${p(`Thank you for your patience. Your early access to our TradingView indicator, ${b("EntrixAlgo Signals")}, is in this email. You can have it on your chart in about two minutes.`)}
    ${h2("What you're getting")}
    ${p("EntrixAlgo Signals is a complete, working indicator:")}
    ${list("ul", [
      `${b("BUY and SELL labels")}, printed when a candle closes. A signal never repaints or disappears afterwards.`,
      `${b("A trend line that trails price")}, with candles coloured by the current direction.`,
      `${b("Alerts")} for every signal.`,
      `${b("Two settings and two colours")}, so there's nothing to tune before you start.`,
    ])}
    ${p("It was designed around the 5 and 15 minute charts, and it works on any market.")}
    ${h2("Why you're getting it first")}
    ${p("We'll be straight with you: the indicator we're building is taking longer than we planned. We keep raising the bar on it, and we'd rather take the time than rush it. We didn't want you to wait any longer, so this version is yours now, before anyone else.")}
    ${p("As an early member, every new version comes to you first, by email, as part of your Pro plan.")}
    ${p("This version isn't listed publicly and isn't on our website. It's shared with you personally, so please keep it to yourself.")}
    ${h2("Install it in about two minutes")}
    ${list("ol", [
      "Open any chart on TradingView.",
      `In the toolbar on the right edge of the screen, click the ${b("Pine")} button. The Pine Editor opens.${pineImage}`,
      "Delete whatever is in the editor, then paste the full script from the box below.",
      `Click ${b("Save")} and name it EntrixAlgo Signals.`,
      `Click ${b("Indicators")} at the top of the chart, then ${b("My scripts")}. Click the star next to EntrixAlgo Signals to add it to your favorites.`,
      "Click its name to add it to your chart.",
    ])}
    ${h2("The script")}
    ${p("Copy everything in the box, from the first line to the last.", "0 0 10px")}
    <pre style="margin:0 0 16px;padding:14px;background:#07070d;border:1px solid rgba(255,255,255,0.10);border-radius:10px;font-family:Consolas,Menlo,'Courier New',monospace;font-size:11px;line-height:1.55;color:#d1d5db;white-space:pre-wrap;word-break:break-word;">${escapeHtml(code)}</pre>
    ${h2("Get more from it")}
    ${p("A tip from us: when a signal appears, upload a screenshot of that chart to AI Chart Analysis. You'll get a second read on the setup, with entry, targets and stop loss.")}
    <a href="${url}" style="display:inline-block;margin:4px 0 20px;background:linear-gradient(90deg,#9333ea,#a855f7);color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:12px;">
      Open AI Chart Analysis
    </a>
    ${p("As with any trading tool, signals are information, not advice. You stay in control of every trade.")}
    ${p("If you'd like a hand installing it, or there's something you'd like the indicator to do, just reply to this email. Requests from early members go to the top of our list.")}
    ${p("Thanks for trading with us.<br />The EntrixAlgo team", "0")}
    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#4b5563;">
      Need help? Reply to this email or write to <a href="mailto:${siteConfig.supportEmail}" style="color:#a855f7;">${siteConfig.supportEmail}</a>.
    </p>
  </div>
</div>`.trim()

  const text = [
    "EntrixAlgo",
    "Your early access is ready",
    "Hi there,",
    "Thank you for your patience. Your early access to our TradingView indicator, EntrixAlgo Signals, is in this email. You can have it on your chart in about two minutes.",
    "WHAT YOU'RE GETTING",
    "EntrixAlgo Signals is a complete, working indicator:\n- BUY and SELL labels, printed when a candle closes. A signal never repaints or disappears afterwards.\n- A trend line that trails price, with candles coloured by the current direction.\n- Alerts for every signal.\n- Two settings and two colours, so there's nothing to tune before you start.",
    "It was designed around the 5 and 15 minute charts, and it works on any market.",
    "WHY YOU'RE GETTING IT FIRST",
    "We'll be straight with you: the indicator we're building is taking longer than we planned. We keep raising the bar on it, and we'd rather take the time than rush it. We didn't want you to wait any longer, so this version is yours now, before anyone else.",
    "As an early member, every new version comes to you first, by email, as part of your Pro plan.",
    "This version isn't listed publicly and isn't on our website. It's shared with you personally, so please keep it to yourself.",
    "INSTALL IT IN ABOUT TWO MINUTES",
    "1. Open any chart on TradingView.\n2. In the toolbar on the right edge of the screen, click the Pine button. The Pine Editor opens.\n3. Delete whatever is in the editor, then paste the full script below.\n4. Click Save and name it EntrixAlgo Signals.\n5. Click Indicators at the top of the chart, then My scripts. Click the star next to EntrixAlgo Signals to add it to your favorites.\n6. Click its name to add it to your chart.",
    "THE SCRIPT (copy everything between the two lines)",
    `--------\n${code}\n--------`,
    "GET MORE FROM IT",
    "A tip from us: when a signal appears, upload a screenshot of that chart to AI Chart Analysis. You'll get a second read on the setup, with entry, targets and stop loss.",
    `Open AI Chart Analysis: ${url}`,
    "As with any trading tool, signals are information, not advice. You stay in control of every trade.",
    "If you'd like a hand installing it, or there's something you'd like the indicator to do, just reply to this email. Requests from early members go to the top of our list.",
    "Thanks for trading with us.\nThe EntrixAlgo team",
    `Need help? Reply to this email or write to ${siteConfig.supportEmail}.`,
  ].join("\n\n")

  return { subject, html, text }
}

// The Pine button picture travels inside the email (inline attachment), so it
// shows without the site having to host it.
export async function sendIndicatorEarlyAccessEmail(to: string, assets: { script: string; pineImage: Buffer }) {
  const resendClient = client()
  if (!resendClient) throw new Error("RESEND_API_KEY is not set.")
  const { subject, html, text } = indicatorEarlyAccessEmail({ script: assets.script, pineImageSrc: `cid:${PINE_IMAGE_CID}` })
  await deliver(resendClient, {
    from: fromAddress(),
    replyTo: siteConfig.supportEmail,
    to,
    subject,
    html,
    text,
    attachments: [{ filename: "pine-button.png", content: assets.pineImage, contentType: "image/png", contentId: PINE_IMAGE_CID }],
  })
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

// Internal alert to support about a payment that needs a person: a duplicate
// purchase to refund, a dispute, a fraud warning. Sent from the Stripe webhook.
// Best effort and never throws: a mail problem must not fail the webhook and
// make Stripe replay an event that has already been handled.
export async function sendBillingAlert(alert: {
  subject: string
  title:   string
  /** What happened and what was done about it */
  summary: string
  rows:    [label: string, value: string][]
  /** What the person reading this should do */
  action:  string
  /** Where to do it in the Stripe dashboard */
  url:     string
}) {
  try {
    const resendClient = client()
    if (!resendClient) {
      console.warn("[email] RESEND_API_KEY not set — skipping billing alert:", alert.subject)
      return
    }
    const row = (label: string, value: string) =>
      `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;color:#e5e7eb;font-weight:600;">${escapeHtml(value)}</td></tr>`
    await deliver(resendClient, {
      from:    fromAddress(),
      to:      siteConfig.supportEmail,
      subject: alert.subject.replace(/[\r\n]+/g, " "),
      html: wrapper(
        escapeHtml(alert.title),
        `${escapeHtml(alert.summary)}<br /><br />
<table style="border-collapse:collapse;font-size:14px;">
  ${alert.rows.map(([label, value]) => row(label, value)).join("\n  ")}
  ${row("When", new Date().toUTCString())}
</table><br />
<span style="color:#e5e7eb;">${escapeHtml(alert.action)}</span>`,
        "Open in Stripe",
        alert.url,
        { helpFooter: false },
      ),
      text: [alert.title, "", alert.summary, "", ...alert.rows.map(([label, value]) => `${label}: ${value}`), "", alert.action, "", alert.url].join("\n"),
    })
  } catch (err) {
    console.error("[email] billing alert failed:", alert.subject, err)
  }
}
