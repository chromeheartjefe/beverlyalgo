import { Resend } from "resend"

let resend: Resend | null = null

function client() {
  if (!process.env.RESEND_API_KEY) return null
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

function wrapper(title: string, body: string, ctaLabel: string, ctaUrl: string) {
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
  </div>
</div>`.trim()
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? "EntrixAlgo <onboarding@resend.dev>"
}

function baseUrl() {
  return process.env.AUTH_URL ?? "http://localhost:3000"
}

export async function sendVerificationEmail(to: string, token: string) {
  const resendClient = client()
  if (!resendClient) {
    console.warn("[email] RESEND_API_KEY not set — skipping verification email to", to)
    return
  }
  const url = `${baseUrl()}/verify-email?token=${token}`
  await resendClient.emails.send({
    from:    fromAddress(),
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
  await resendClient.emails.send({
    from:    fromAddress(),
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
