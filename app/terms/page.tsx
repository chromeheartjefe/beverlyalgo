import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title:       "Terms of Service – EntrixAlgo",
  description: "The terms that govern your use of EntrixAlgo.",
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-gray-400">{children}</div>
    </section>
  )
}

export default function TermsPage() {
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
        <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
        <p className="mt-2 text-sm text-gray-600">Last updated: August 19, 2026</p>

        <div className="mt-10 space-y-10">
          <Section title="1. Overview">
            <p>
              EntrixAlgo (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides an AI-assisted chart analysis tool and a set of
              trading utilities, including a trade journal and a risk calculator, accessed through a web dashboard. By
              creating an account or using EntrixAlgo, you agree to these Terms of Service.
            </p>
          </Section>

          <Section title="2. Not Financial Advice">
            <p>
              EntrixAlgo&apos;s chart analysis, signals, patterns, confidence scores, and any other output are generated for
              educational purposes only and do not constitute financial, investment, or trading advice. AI-generated
              analysis can be wrong, incomplete, or based on misread chart data. You are solely responsible for your own
              trading decisions and any resulting gains or losses. Always do your own research before trading.
            </p>
          </Section>

          <Section title="3. Accounts">
            <p>
              You must provide accurate information when creating an account and are responsible for maintaining the
              confidentiality of your password. You are responsible for all activity that occurs under your account. Let
              us know immediately if you suspect unauthorized access.
            </p>
          </Section>

          <Section title="4. Subscriptions & Billing">
            <p>
              Some features (including AI chart analysis) require a paid subscription. Subscriptions are billed on a
              recurring basis through our payment processor, Stripe, and renew automatically until cancelled. You can
              manage or cancel your subscription at any time from the billing portal in your dashboard settings.
              Cancelling stops future renewals; it does not retroactively refund the current billing period unless
              required by law.
            </p>
          </Section>

          <Section title="5. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Attempt to circumvent usage limits, rate limits, or subscription gating on any feature.</li>
              <li>Use automated scripts or bots to abuse the AI chart analysis endpoint.</li>
              <li>Upload content you don&apos;t have the right to upload, or content unrelated to chart analysis.</li>
              <li>Attempt to reverse-engineer, resell, or redistribute EntrixAlgo&apos;s underlying models or data.</li>
            </ul>
          </Section>

          <Section title="6. Your Data">
            <p>
              Trade journal entries you log and chart images you upload for analysis are stored to power the dashboard
              and analysis history features described in our{" "}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300">Privacy Policy</Link>. You retain
              ownership of any content you submit.
            </p>
          </Section>

          <Section title="7. Termination">
            <p>
              We may suspend or terminate accounts that violate these terms, including abuse of rate limits or
              fraudulent payment activity. You may stop using EntrixAlgo and delete your account at any time by
              contacting us.
            </p>
          </Section>

          <Section title="8. Disclaimer & Limitation of Liability">
            <p>
              EntrixAlgo is provided &quot;as is&quot; without warranties of any kind. To the fullest extent permitted by law,
              we are not liable for any trading losses, missed opportunities, or damages arising from your use of the
              service, including reliance on AI-generated analysis.
            </p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>
              We may update these terms from time to time. Continued use of EntrixAlgo after changes take effect
              constitutes acceptance of the updated terms.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>Questions about these terms? Reach out through the contact options listed on our homepage.</p>
          </Section>
        </div>
      </main>
    </div>
  )
}
