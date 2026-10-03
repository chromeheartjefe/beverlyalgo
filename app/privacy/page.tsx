import type { Metadata } from "next"
import Link from "next/link"

import { Callout, LegalPage, type LegalSection, LegalTable } from "@/components/legal/legal-page"
import { SupportEmail } from "@/components/ui/support-email"
import { PAPER_TRADING } from "@/config/features"
import { legal, operatorDescription } from "@/config/legal"

export const metadata: Metadata = {
  title:       "Privacy Policy",
  description: "How EntrixAlgo collects, uses, and protects your data.",
}

// Every statement here describes what the code does today. When a table, a
// provider, a retention period or a cookie changes, change this page with it:
//   - what is stored: db/schema.ts
//   - retention: lib/rate-limit.ts (housekeeping), lib/free-analysis.ts
//   - providers: package.json and the env vars the app reads
//   - staff access: admin/ (read-only role, admin_audit_log)

const SECTIONS: LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    content: (
      <>
        <p>
          EntrixAlgo is operated by {operatorDescription()} (&quot;EntrixAlgo&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;). We decide why and how
          the personal data described here is used, which makes us the controller of that data.
        </p>
        <p>
          This policy covers entrixalgo.com, the dashboard and every tool and course we offer (the &quot;Service&quot;). For any
          privacy question or request, email <SupportEmail />.
        </p>
      </>
    ),
  },
  {
    id: "collect",
    title: "The data we collect",
    content: (
      <>
        <LegalTable
          head={["Category", "What it includes"]}
          rows={[
            [
              "Account",
              "Your name, email address and a hashed password. Whether your email is verified. A profile picture, if you upload one (we remove its hidden metadata). If you sign in with Google: your name, email address and Google account ID. We never see your Google password.",
            ],
            [
              "Purchases",
              "Your plan, your Stripe customer and subscription IDs and the date your paid period ends. Whether you opened a checkout page. Card and bank details are entered with Stripe and never reach our servers.",
            ],
            [
              "Chart analyses",
              "The screenshot you upload is sent to our AI provider to be analysed and is not stored by us. We store the result: the market and timeframe read from the chart, the signal, the confidence grade, price levels and the written analysis.",
            ],
            ["AI Trading Bot", "The messages you send and the replies, until you clear your chat history or your account is deleted."],
            ["Trade Journal and Calendar", "The trades you log (market, direction, prices, dates, profit or loss) and your monthly goals."],
            ...(PAPER_TRADING
              ? [["Paper Trading", "Your practice account (level, virtual balance, passes and fails), your simulated trades and the missions you completed."]]
              : []),
            [
              "Entrix Academy",
              "The lessons you finished, your scores, experience points and streaks, your exam attempts, and your certificate, which shows your name.",
            ],
            [
              "Support",
              "Support chat messages are sent to our AI provider to produce a reply and are not stored on our servers. If you ask to reach our team, the name, email address and message you enter are emailed to our support inbox together with that chat.",
            ],
            [
              "Indicator access",
              "Your TradingView username, if you gave it to us to receive an indicator, and the date you asked.",
            ],
            [
              "Usage and security",
              "When you signed in and last used the dashboard, how many times you signed in, account events such as a password or email change, the IP address behind sign-in, sign-up, password reset, support contact and free analysis requests, and how much of the AI features each account uses.",
            ],
            [
              "Technical",
              "Error reports and a sample of performance measurements (page, browser, device type, and what went wrong), and the data described in our Cookie Policy.",
            ],
          ]}
        />
        <h3>What we do not collect</h3>
        <ul>
          <li>Card numbers or bank details.</li>
          <li>Logins, keys or balances of your broker or exchange account. The Service does not connect to them.</li>
          <li>Identity documents, or sensitive data such as health, religion or political views. Please do not send us any.</li>
        </ul>
        <h3>Where the data comes from</h3>
        <p>
          Most of it comes from you. Some is created as you use the Service. Google sends us your basic profile when you
          choose to sign in with Google, and Stripe tells us whether a payment or a subscription succeeded, failed, was
          cancelled or was disputed.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How we use it and why we are allowed to",
    content: (
      <>
        <LegalTable
          head={["Purpose", "Data used", "Legal basis"]}
          rows={[
            [
              "Provide the Service: your account, analyses, chat, journal, Academy, certificate",
              "Account, content you add, Academy data",
              "Performing our contract with you",
            ],
            ["Take payment and manage your plan", "Purchases", "Performing our contract with you"],
            [
              "Send service emails: verification, password reset, security and billing notices, replies to support, messages about a feature you asked for",
              "Account, support",
              "Performing our contract; our legitimate interest in keeping accounts secure",
            ],
            [
              "Keep the Service secure and fair: prevent abuse, enforce usage limits, stop repeat claims of free offers, handle payment disputes",
              "Usage and security, purchases",
              "Our legitimate interest in protecting the Service and our users",
            ],
            [
              "Fix problems and help you: staff may look at your analysis results and AI Trading Bot chat only for debugging and support, and each such view of a chat is logged",
              "Content you add, technical",
              "Our legitimate interest in running a working product",
            ],
            [
              "Understand how the site is used and improve it",
              "Technical, analytics",
              "Our legitimate interest in improving the Service. You can opt out at any time, see the Cookie Policy",
            ],
            ["Keep records and meet legal duties, such as accounting and tax rules and lawful requests from authorities", "Purchases, account", "Legal obligation"],
          ]}
        />
        <p>
          Where we rely on a legitimate interest, we have weighed it against your rights. You can object at any time, see{" "}
          <Link href="#rights">Your rights</Link>. Where we ask for your consent, you can withdraw it at any time.
        </p>
        <p>
          You are not required by law to give us personal data, but without an email address we cannot create an account,
          and without the content you submit the tools have nothing to work on.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "Artificial intelligence",
    content: (
      <>
        <p>
          Chart analysis, the AI Trading Bot, the AI Screener and the support chat send content to OpenAI, our AI model
          provider, through its programming interface. That content is the screenshot or the messages you submit, together
          with our instructions.
        </p>
        <ul>
          <li>
            According to the data policies OpenAI publishes for that interface at the time of writing, content sent through
            it is not used to train its models unless a customer opts in, which we have not done, and may be kept by OpenAI
            for a limited period to monitor for abuse.
          </li>
          <li>We do not use your content to train any model of our own.</li>
          <li>Do not put personal data about yourself or other people into a screenshot or a chat message. The tools do not need it.</li>
        </ul>
        <p>
          The output is information for you to consider. We do not use it, or any other automated process, to make
          decisions about you that have legal or similarly significant effects. Automated limits, such as usage caps and
          checks for repeat claims of a free offer, can block a request. If you think that happened wrongly, email us and a
          person will look at it.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    content: (
      <>
        <Callout tone="note" title="We do not sell your data">
          <p>
            We do not sell your personal data, and we do not share it with anyone for their advertising. We have no
            advertising or social media trackers on the Service.
          </p>
        </Callout>
        <p>We use these providers to run the Service. Each receives only what it needs for its task:</p>
        <LegalTable
          head={["Provider", "What it does for us", "Where"]}
          rows={[
            ["OpenAI", "Produces chart analyses, chat replies, screener results and support chat replies", "United States"],
            ["Stripe", "Takes payments, runs subscriptions and the billing portal, screens for fraud", "United States and other countries where Stripe operates"],
            ["Neon", "Hosts our database", "United States"],
            ["Vercel", "Hosts and delivers the website and runs our server code", "United States, with a worldwide delivery network"],
            ["Resend", "Sends our emails", "United States"],
            ["Sentry", "Receives error and performance reports so we can fix problems", "Germany"],
            ["Google", "Sign-in with Google, if you choose it, and Google Analytics", "United States and other countries where Google operates"],
          ]}
        />
        <p>
          Market prices and news come from data providers. Those requests are made by our servers and do not include your
          personal data.
        </p>
        <p>We also disclose personal data:</p>
        <ul>
          <li>to authorities, courts or other parties when the law requires it, or when it is needed to establish, exercise or defend legal claims;</li>
          <li>to a payment provider or card network, to respond to a dispute or chargeback about your payment;</li>
          <li>to a buyer or successor if our business or the Service is sold, merged or reorganised, under the protections of this policy;</li>
          <li>to professional advisers such as accountants and lawyers, who are bound by confidentiality; and</li>
          <li>to anyone else when you ask us to or agree to it.</li>
        </ul>
        <h3>Things you make public</h3>
        <p>
          Your Entrix Academy certificate has its own page that shows your name. The address of that page contains a random
          code, is not listed in search engines, and is seen only by people you give the link to.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "International transfers",
    content: (
      <>
        <p>
          We are based in the {legal.country}, and most of our providers are in the United States. Your data is therefore
          processed in countries other than your own, whose data protection laws may differ from the ones you are used to.
        </p>
        <p>
          Where the law requires a safeguard for such a transfer, we rely on the mechanisms our providers offer, such as the
          standard contractual clauses approved by the European Commission, the United Kingdom addendum to them, or a
          provider&apos;s certification under a recognised data privacy framework. You can ask us for more information about
          the safeguard that applies to a transfer of your data.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    content: (
      <>
        <LegalTable
          head={["Data", "Kept for"]}
          rows={[
            ["Account, journal, goals, analysis results, Academy progress and certificate", "As long as your account exists. Deleted when your account is deleted."],
            ["AI Trading Bot conversations", "Until you clear your chat history, or your account is deleted."],
            ...(PAPER_TRADING
              ? [["Paper Trading", "The newest 200 simulated trades, and your practice account and missions, until your account is deleted."]]
              : []),
            ["Chart screenshots", "Not stored by us."],
            ["Activity log: sign-ins and account events", "12 months."],
            ["Rate limit records, which can contain an IP address", "About 48 hours."],
            ["Email verification and password reset links", "Until they are used or expire."],
            [
              "Record that a free analysis was claimed: a normalised form of the email address and the IP address",
              "Kept after the account is deleted, so the same person cannot claim the offer again. We remove it when you ask and no longer need it for that purpose.",
            ],
            ["AI usage amounts", "Kept without a link to your account once your account is deleted."],
            ["Log of actions our staff took on accounts", "Kept for accountability. An entry can still show the email address or username the action concerned."],
            ["Payment and invoice records", "For as long as accounting and tax laws require. Stripe keeps its own records under its policy."],
            ["Support emails", "As long as needed to handle your request and for a reasonable time afterwards."],
            ["Error reports and analytics", "For the periods set by Sentry and Google Analytics, see the Cookie Policy."],
          ]}
        />
        <p>
          When you ask us to delete your account, we delete it and the data tied to it within 30 days, apart from what the
          table says is kept and what we must keep by law. Copies in backups are overwritten on a rolling schedule.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    content: (
      <>
        <ul>
          <li>Passwords are stored only as a salted hash (bcrypt), never as plain text.</li>
          <li>Verification and password reset links are single use and expire.</li>
          <li>Changing or resetting your password signs out every other session of your account.</li>
          <li>All traffic between your browser and the Service is encrypted in transit.</li>
          <li>Card details are handled by Stripe and never touch our servers.</li>
          <li>Staff access to the database is restricted, and staff actions and views of chat conversations are logged.</li>
        </ul>
        <p>
          No system is perfectly secure, and we cannot promise that data will never be accessed without permission. If a
          breach affects your personal data in a way that the law requires us to tell you about, we will tell you and the
          competent authority.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    content: (
      <>
        <p>Depending on where you live, you have some or all of these rights over your personal data:</p>
        <ul>
          <li><strong>Access.</strong> Ask whether we hold data about you and get a copy of it.</li>
          <li><strong>Correction.</strong> Have inaccurate or incomplete data corrected.</li>
          <li><strong>Deletion.</strong> Have your data deleted.</li>
          <li><strong>Restriction.</strong> Have us pause the use of your data in certain cases.</li>
          <li><strong>Objection.</strong> Object to a use that is based on our legitimate interests.</li>
          <li><strong>Portability.</strong> Receive the data you gave us in a common, machine-readable format.</li>
          <li><strong>Withdraw consent.</strong> Where a use is based on your consent, withdraw it at any time.</li>
          <li><strong>Complain.</strong> Complain to a data protection authority.</li>
        </ul>
        <h3>What you can do yourself</h3>
        <ul>
          <li>Change your name, email address, password and profile picture in Settings.</li>
          <li>Delete trades in the Trade Journal, and export your journal as a CSV file.</li>
          <li>Clear your AI Trading Bot chat history.</li>
        </ul>
        <h3>How to make a request</h3>
        <p>
          Email <SupportEmail /> from the address on your account and tell us what you want. We may ask for information to
          confirm that the request comes from you. We answer within one month, or within the period the law that applies to
          you sets. Requests are free, unless they are clearly unfounded or excessive.
        </p>
        <p>We will not treat you worse for using your rights.</p>
      </>
    ),
  },
  {
    id: "regions",
    title: "Information for specific regions",
    content: (
      <>
        <h3>European Economic Area, United Kingdom and Switzerland</h3>
        <p>
          The legal bases we rely on are listed in <Link href="#use">How we use it</Link>. You have all the rights listed
          above. You can complain to the data protection authority of the country where you live or work, for example the
          Information Commissioner&apos;s Office in the United Kingdom, although we would appreciate the chance to deal with
          your concern first.
        </p>
        <h3>United Arab Emirates</h3>
        <p>
          You have the rights given by the UAE personal data protection law, including the rights to access, correction,
          erasure, restriction, and to object to and stop certain processing. You can complain to the UAE Data Office or
          another competent authority.
        </p>
        <h3>United States</h3>
        <p>
          We do not sell personal information and do not share it for cross-context behavioural advertising, and we have
          not done so in the past 12 months. We do not use sensitive personal information to infer characteristics about
          you. The categories we collect, the purposes and the recipients are described in this policy. Residents of
          California and of other states with privacy laws can ask to know, correct and delete their personal information,
          and can use an authorised agent to do so. We will not discriminate against you for making a request.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    content: (
      <>
        <p>
          The Service is for adults. You must be at least 18 years old to use it, and we do not knowingly collect personal
          data from anyone under 18. If you believe a minor has given us personal data, email <SupportEmail /> and we will
          delete it.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies",
    content: (
      <>
        <p>
          We use cookies and browser storage to keep you signed in, to remember your preferences and to measure how the site
          is used. The <Link href="/cookies">Cookie Policy</Link> lists them and explains your choices.
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
          We may update this policy when the Service or the law changes. The date at the top shows the latest version. When
          a change is material, we will tell you by email or by a notice in the dashboard before it applies.
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
          EntrixAlgo is operated by {operatorDescription()}. For any question about this policy or about your data, or to
          use your rights, email <SupportEmail />.
        </p>
      </>
    ),
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage
      path="/privacy"
      title="Privacy Policy"
      intro={
        <p>
          This policy explains what personal data EntrixAlgo collects, why, who receives it, how long we keep it and what
          you can do about it.
        </p>
      }
      summary={[
        "We collect what we need to run your account and the tools: your account details, what you add to the Service, and usage and security records.",
        "Chart screenshots are analysed by our AI provider and are not stored by us. We keep the result.",
        "Card details go straight to Stripe. We never see them.",
        "We do not sell your data, and there are no advertising trackers on EntrixAlgo.",
        "Our providers are mostly in the United States, so your data is processed outside your country.",
        "You can ask for a copy of your data, or for it to be corrected or deleted, at any time.",
      ]}
      sections={SECTIONS}
    />
  )
}
