import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title:       "Privacy Policy – EntrixAlgo",
  description: "How EntrixAlgo collects, uses, and protects your data.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-400">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <header className="border-b border-white/[0.07] px-6 py-5">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo_transparent.png" alt="EntrixAlgo" width={28} height={28} className="size-7 object-contain" />
            <span className="text-base font-bold tracking-tight text-white">
              Entrix<span className="text-purple-400">Algo</span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300">
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mt-2 text-sm text-gray-600">Last updated: August 19, 2026</p>

        <div className="mt-10 space-y-10">
          <Section title="1. What We Collect">
            <p>We collect the following categories of information:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><span className="text-gray-300">Account information</span> — your name, email address, and a securely hashed password.</li>
              <li><span className="text-gray-300">Chart images</span> — screenshots you upload for AI analysis are sent to our AI provider for processing; the resulting analysis (signal, confidence, price levels, patterns) is stored in your account history.</li>
              <li><span className="text-gray-300">Trade journal entries</span> — trade details you manually log (pair, direction, entry/exit prices, dates).</li>
              <li><span className="text-gray-300">Billing information</span> — subscription and payment details are handled entirely by Stripe; we store only your Stripe customer/subscription IDs and plan status, never your card details.</li>
              <li><span className="text-gray-300">Usage data</span> — basic activity needed to operate the product, such as when analyses are run (used to enforce fair-use rate limits).</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Data">
            <p>We use your data to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Provide the core product: chart analysis, trade journal, risk calculator, and dashboard.</li>
              <li>Authenticate you and secure your account (including email verification and password reset flows).</li>
              <li>Process payments and manage subscriptions through Stripe.</li>
              <li>Send account-related emails (email verification, password reset) and, if enabled in your notification settings, product updates.</li>
              <li>Enforce usage limits and prevent abuse of the AI analysis feature.</li>
            </ul>
          </Section>

          <Section title="3. Third-Party Services">
            <p>We rely on a small number of third-party services to operate EntrixAlgo:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li><span className="text-gray-300">OpenAI</span> — processes uploaded chart images to generate analysis. Images are sent for processing but are not used by us for any purpose beyond generating your analysis.</li>
              <li><span className="text-gray-300">Stripe</span> — processes payments and manages subscriptions. We never see or store your raw card details.</li>
              <li><span className="text-gray-300">Resend</span> — delivers transactional emails (verification, password reset).</li>
              <li><span className="text-gray-300">Neon (Postgres)</span> — hosts our database.</li>
            </ul>
          </Section>

          <Section title="4. Data Retention">
            <p>
              We retain your account data for as long as your account is active. Chart analysis history and trade
              journal entries are retained until you delete them or close your account. You can request account
              deletion at any time.
            </p>
          </Section>

          <Section title="5. Data Security">
            <p>
              Passwords are hashed with bcrypt and never stored in plain text. Verification and password-reset links
              use single-use, time-limited tokens. All traffic to EntrixAlgo is encrypted in transit.
            </p>
          </Section>

          <Section title="6. Your Choices">
            <p>
              You can update your profile information and notification preferences at any time from your dashboard
              settings. You can unsubscribe from non-essential emails via your notification settings; account-security
              emails (verification, password reset) cannot be disabled, as they are required to keep your account
              secure.
            </p>
          </Section>

          <Section title="7. Changes to This Policy">
            <p>
              We may update this policy from time to time. Material changes will be reflected by updating the &quot;Last
              updated&quot; date above.
            </p>
          </Section>

          <Section title="8. Contact">
            <p>Questions about this policy or your data? Reach out through the contact options listed on our homepage.</p>
          </Section>
        </div>
      </main>
    </div>
  )
}
