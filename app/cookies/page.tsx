import type { Metadata } from "next"
import Link from "next/link"

import { Callout, LegalPage, type LegalSection, LegalTable } from "@/components/legal/legal-page"
import { SupportEmail } from "@/components/ui/support-email"
import { PAPER_TRADING } from "@/config/features"

export const metadata: Metadata = {
  title:       "Cookie Policy",
  description: "The cookies and browser storage EntrixAlgo uses, and your choices.",
}

// This page lists what the site really sets. Update it when any of these change:
//   - sign-in cookies: Auth.js (auth.ts, middleware.ts), 30-day session
//   - analytics: <GoogleAnalytics> in app/layout.tsx
//   - payments: Stripe.js on /checkout (components/checkout)
//   - browser storage: search the code for localStorage and sessionStorage
// If a consent bar is added for analytics, rewrite "Your choices" to describe it.

const code = (text: string) => <code className="break-all rounded bg-white/[0.06] px-1.5 py-0.5 text-[13px] text-gray-200">{text}</code>

const SECTIONS: LegalSection[] = [
  {
    id: "what",
    title: "What cookies and browser storage are",
    content: (
      <>
        <p>
          A cookie is a small text file that a website saves in your browser. It lets the site recognise the browser on the
          next page or the next visit. Browser storage (called local storage and session storage) does a similar job: it
          keeps small pieces of information in your browser, and it is read only by the site that saved it.
        </p>
        <p>
          Cookies set by entrixalgo.com are first-party cookies. Cookies set by another company whose service is loaded on
          our pages are third-party cookies.
        </p>
      </>
    ),
  },
  {
    id: "essential",
    title: "Essential cookies",
    content: (
      <>
        <p>
          These are needed to sign you in and to keep your account safe. The Service does not work without them, so they
          cannot be switched off here.
        </p>
        <LegalTable
          head={["Cookie", "Purpose", "Lasts"]}
          rows={[
            [code("__Secure-authjs.session-token"), "Keeps you signed in. It holds an encrypted session, not your password.", "30 days, renewed while you use the site"],
            [code("__Host-authjs.csrf-token"), "Protects sign-in and sign-out forms against forged requests.", "Until you close the browser"],
            [code("__Secure-authjs.callback-url"), "Remembers which page to return you to after signing in.", "Until you close the browser"],
            [
              <>
                {code("__Secure-authjs.pkce.code_verifier")}, {code("__Secure-authjs.state")}, {code("__Secure-authjs.nonce")}
              </>,
              "Used only while you sign in with Google, to confirm that the answer really comes from Google.",
              "About 15 minutes",
            ],
          ]}
        />
        <p>
          When you sign in with Google, you do so on a page run by Google, which sets its own cookies under its own policy.
        </p>
      </>
    ),
  },
  {
    id: "payments",
    title: "Payment cookies",
    content: (
      <>
        <p>
          Payments are handled by Stripe. On our checkout page, and on the pages of Stripe if you pay there, Stripe sets
          cookies that help it detect fraud and keep the payment working.
        </p>
        <LegalTable
          head={["Cookie", "Purpose", "Lasts"]}
          rows={[
            [code("__stripe_mid"), "Fraud prevention: recognises a browser across payments.", "1 year"],
            [code("__stripe_sid"), "Fraud prevention during a payment session.", "30 minutes"],
          ]}
        />
        <p>Stripe may set further cookies on its own domain. Its cookie policy describes them.</p>
      </>
    ),
  },
  {
    id: "analytics",
    title: "Analytics cookies",
    content: (
      <>
        <p>
          We use Google Analytics to see how many people visit, which pages they open and where visitors come from, so we
          can improve the site. It does not tell us who you are, and we do not use it for advertising.
        </p>
        <LegalTable
          head={["Cookie", "Purpose", "Lasts"]}
          rows={[
            [code("_ga"), "Tells one browser from another, to count visitors.", "2 years"],
            [code("_ga_<ID>"), "Keeps the state of a visit, such as when it started.", "2 years"],
          ]}
        />
        <p>
          Google receives the pages you view, an approximate location derived from your IP address, and details of your
          browser and device, and processes them under its own privacy policy.
        </p>
        <p>
          We also receive error reports through Sentry when something breaks. Sentry does not set cookies for this.
        </p>
      </>
    ),
  },
  {
    id: "storage",
    title: "Browser storage",
    content: (
      <>
        <p>
          These entries stay in your browser. They remember small choices so the site does not ask twice, and none of them
          is used to track you.
        </p>
        <LegalTable
          head={["Entry", "Purpose", "Lasts"]}
          rows={[
            [code("ea_support_chat_v1"), "Keeps your support chat while you move between pages.", "Until you close the tab"],
            [code("dashboardRevealed"), "Plays the dashboard opening animation only once per visit.", "Until you close the tab"],
            [code("entrix:global-error-reload"), "Stops the page from reloading in a loop after an error.", "Until you close the tab"],
            [code("ea_announcement_<account>"), "Remembers that you closed an announcement.", "Until you clear it"],
            [code("ea_changelog_seen_<account>"), "Remembers the latest What's new entry you have seen.", "Until you clear it"],
            [code("nd-banner-<name>"), "Remembers that you closed a banner on the home page.", "Until you clear it"],
            ...(PAPER_TRADING
              ? [
                  [code("entrix:sim:<account>"), "Paper Trading: the practice market and your open practice trade, so they are still there when you come back.", "Until you clear it"],
                  [code("entrix:sim:ticket"), "Paper Trading: the risk, stop and target you last chose.", "Until you clear it"],
                ]
              : []),
            [code("entrix:calendar:weekends"), "Your choice to show or hide weekends in the Trade Calendar.", "Until you clear it"],
            [code("glossary:saved"), "The Glossary terms you saved.", "Until you clear it"],
            [code("verifyEmailSentAt"), "The time a verification email was last sent, to space out repeat requests.", "Until you clear it"],
          ]}
        />
      </>
    ),
  },
  {
    id: "choices",
    title: "Your choices",
    content: (
      <>
        <Callout tone="note" title="Turning analytics off">
          <p>
            You can stop Google Analytics on every site with the{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics opt-out add-on
            </a>{" "}
            for your browser, or by blocking third-party scripts and cookies in your browser or with a content blocker.
            EntrixAlgo works normally without analytics.
          </p>
        </Callout>
        <ul>
          <li>
            <strong>Browser settings.</strong> Every browser lets you see, block and delete cookies and stored data, for all
            sites or for one site. Look under privacy or site settings.
          </li>
          <li>
            <strong>Essential cookies.</strong> If you block or delete them, you are signed out and cannot sign in until
            you allow them again.
          </li>
          <li>
            <strong>Browser storage.</strong> Clearing it only resets the small preferences listed above.
          </li>
        </ul>
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> explains how we handle personal data more generally, including
          your rights.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    content: (
      <>
        <p>
          We update this policy when we add, change or remove a cookie or a storage entry. The date at the top shows the
          latest version.
        </p>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <>
        <p>
          For any question about cookies on EntrixAlgo, email <SupportEmail />.
        </p>
      </>
    ),
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalPage
      path="/cookies"
      title="Cookie Policy"
      intro={
        <p>
          This policy lists the cookies and browser storage that EntrixAlgo uses, what each is for, how long it lasts and
          how you can control it.
        </p>
      }
      summary={[
        "Essential cookies keep you signed in and protect your account. The site needs them.",
        "Stripe sets cookies on payment pages to prevent fraud.",
        "Google Analytics cookies measure how the site is used. You can turn them off.",
        "There are no advertising cookies on EntrixAlgo.",
        "Small preferences are saved in your browser, such as a banner you closed.",
      ]}
      sections={SECTIONS}
    />
  )
}
