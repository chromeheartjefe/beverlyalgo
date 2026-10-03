import type { Metadata } from "next"
import Link from "next/link"

import { Callout, LegalPage, type LegalSection } from "@/components/legal/legal-page"
import { SupportEmail } from "@/components/ui/support-email"
import { PAPER_TRADING } from "@/config/features"
import { courtsDescription, legal, operatorDescription } from "@/config/legal"

export const metadata: Metadata = {
  title:       "Terms of Service",
  description: "The terms that govern your use of EntrixAlgo.",
}

// The wording here is a contract. Keep it in step with what the product really
// does (billing in app/api/webhooks/stripe, limits in lib/rate-limit.ts and
// lib/ai-budget.ts), and update `legal.lastUpdated` when it changes.

const SECTIONS: LegalSection[] = [
  {
    id: "about",
    title: "About these Terms",
    content: (
      <>
        <p>
          EntrixAlgo is operated by {operatorDescription()} (&quot;EntrixAlgo&quot;, &quot;we&quot;, &quot;us&quot; or &quot;our&quot;). These Terms of
          Service (the &quot;Terms&quot;) are a binding agreement between you and us. They cover your use of entrixalgo.com, the
          dashboard, and every tool, course and feature we offer (together, the &quot;Service&quot;).
        </p>
        <p>
          You accept these Terms when you create an account, sign in with Google, buy a plan, or use the Service in any
          other way. If you do not agree with them, do not use the Service.
        </p>
        <p>
          Our <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookie Policy</Link> explain how we handle
          personal data. They are part of the information you should read together with these Terms.
        </p>
        <p>
          This version applies from the date shown above. If you created your account before that date, it applies to you
          15 days after we tell you about it, or earlier if you accept it.
        </p>
      </>
    ),
  },
  {
    id: "eligibility",
    title: "Who can use EntrixAlgo",
    content: (
      <>
        <p>You may use the Service only if all of the following are true:</p>
        <ul>
          <li>You are at least 18 years old, and old enough to enter a binding contract where you live.</li>
          <li>
            You are not located in, and are not a resident or national of, a country or territory that is subject to
            comprehensive sanctions, and you are not on any sanctions list of the United Arab Emirates, the United Nations,
            the European Union, the United Kingdom or the United States.
          </li>
          <li>Using trading tools and analysis like ours is lawful where you live. It is your responsibility to check.</li>
          <li>We have not previously closed your account for breaking these Terms.</li>
        </ul>
        <p>
          If you use the Service on behalf of a company or another person, you confirm that you have the authority to accept
          these Terms for them, and &quot;you&quot; includes them.
        </p>
      </>
    ),
  },
  {
    id: "service",
    title: "The Service",
    content: (
      <>
        <p>
          EntrixAlgo is a set of software tools and educational material for people who trade or want to learn about
          trading. It currently includes AI chart analysis, the AI Trading Bot, the AI Screener, the Trade Journal, the Trade
          Calendar, the Risk Calculator, {PAPER_TRADING ? "Paper Trading, " : ""}Entrix Academy with its practice, exam and certificate, the Glossary, a support chat,
          and from time to time other tools such as chart indicators.
        </p>
        <p>
          The Service changes as we build it. We may add, change, limit, suspend or remove any feature, and we may release
          features that are marked as early access, beta or under construction. Those are provided as they are and may
          change or be withdrawn without notice.
        </p>
        <p>
          We work to keep the Service running, but we do not promise that it will be available at all times, free of errors
          or free of interruptions. It depends on services we do not control, including AI model providers, market data
          providers, payment and hosting providers. Maintenance, outages and limits at those providers can affect it.
        </p>
      </>
    ),
  },
  {
    id: "no-advice",
    title: "No financial advice",
    content: (
      <>
        <Callout title="Information and education only">
          <p>
            Everything the Service produces or contains is general information and education. That includes signals such
            as BUY, SELL and NEUTRAL, confidence grades, entry, target and stop levels, risk to reward figures, screener
            picks and scores, chat answers, calculator results, indicator signals, lessons, glossary entries and anything
            said by our support chat.
          </p>
          <p>
            <strong>
              None of it is financial, investment, trading, legal or tax advice, a personal recommendation, an offer or a
              solicitation to buy or sell any asset.
            </strong>
          </p>
        </Callout>
        <ul>
          <li>
            We are not a bank, broker, dealer, exchange, investment adviser, portfolio manager or financial analyst, and we
            are not licensed, authorised or supervised by any financial regulator in any country.
          </li>
          <li>
            The Service does not know your financial situation, goals, experience or tolerance for risk, and its output is
            not adapted to you. It is produced automatically, from the material submitted and from market data.
          </li>
          <li>
            We do not place trades, hold your money or assets, or connect to your broker or exchange account. Every trade
            you make is placed by you, with a third party you chose.
          </li>
          <li>Using the Service does not create an advisory, fiduciary or professional relationship between you and us.</li>
        </ul>
        <p>
          You alone decide whether, what, when and how much to trade. Before you risk money, do your own research and
          consider speaking to a licensed financial adviser.
        </p>
      </>
    ),
  },
  {
    id: "risk",
    title: "Trading risk",
    content: (
      <>
        <Callout title="Risk warning">
          <p>
            Trading stocks, currencies, cryptocurrencies, commodities, futures, contracts for difference and other
            instruments carries a high level of risk. Leverage increases that risk. You can lose some or all of the money
            you trade with, and with some products you can lose more than you deposited. Most retail traders lose money.
          </p>
          <p>Only trade with money you can afford to lose.</p>
        </Callout>
        <ul>
          <li>
            <strong>No promise of results.</strong> We do not guarantee profits, a win rate, the accuracy of any signal or
            level, or that any target will be reached.
          </li>
          <li>
            <strong>Past and hypothetical performance.</strong> Performance figures, backtests, examples and screenshots
            shown on the Service are historical or hypothetical. Hypothetical results are prepared with hindsight, do not
            involve real money and may not reflect costs, slippage or the liquidity available at the time. They do not
            predict future results.
          </li>
          <li>
            <strong>Reviews.</strong> Reviews and stories from other users describe their own experience. They are not
            typical results and not a promise of what you will achieve.
          </li>
          <li>
            <strong>Your losses are yours.</strong> You are solely responsible for your trading decisions and for every
            gain, loss, fee and tax that follows from them.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ai-output",
    title: "AI output, market data and education",
    content: (
      <>
        <h3>AI output can be wrong</h3>
        <p>
          Chart analysis, the AI Trading Bot, the AI Screener and the support chat are powered by artificial intelligence
          models. These models can misread a chart image, read a price or a label incorrectly, invent facts, contradict
          themselves, give different answers to the same question, or miss information that matters. A confidence grade
          describes how many conditions of a setup line up. It is not the probability that a trade will win.
        </p>
        <p>Check every level, number and statement yourself before you rely on it.</p>

        <h3>Market data</h3>
        <p>
          Prices, tickers, news and other market data come from third parties. They can be delayed, incomplete, inaccurate
          or unavailable, and they may differ from the prices at your broker or exchange. Do not use them as your only
          source for a trading decision.
        </p>

        <h3>Entrix Academy</h3>
        <p>
          Lessons, the Glossary, practice questions and the exam are educational. We work to keep them accurate, but they
          may contain mistakes and can become out of date, and they describe trading methods that are not proven to be
          profitable. The Entrix Academy certificate records that you completed our course. It is not a licence, a
          professional qualification or an accreditation, and it does not authorise you to give financial advice or to
          manage money for others.
        </p>

        {PAPER_TRADING && (
          <>
            <h3>Paper Trading</h3>
            <p>
              Paper Trading is a practice simulator. Its prices are generated by a random process and do not come from any
              real market or instrument. Balances, profits and losses there are virtual: they have no monetary value and
              cannot be withdrawn, transferred or exchanged for anything. Results in the simulator say nothing about the
              results you would get with real money in a real market.
            </p>
          </>
        )}

        <h3>Indicators and scripts</h3>
        <p>
          Any indicator or script we provide is a tool that draws on a chart. It is provided as it is, may behave
          differently across markets and timeframes, and comes with no promise of performance.
        </p>
      </>
    ),
  },
  {
    id: "accounts",
    title: "Your account",
    content: (
      <>
        <ul>
          <li>Give accurate information when you register and keep it up to date.</li>
          <li>One person, one account. Do not share your account, sell it or let anyone else use it.</li>
          <li>
            Keep your password secret. You are responsible for everything done through your account, whether or not you
            approved it. Tell us straight away at <SupportEmail /> if you think someone else has access.
          </li>
          <li>
            If you sign in with Google, your use of Google is also subject to the terms of Google. We are not responsible
            for it.
          </li>
          <li>We may refuse a registration, ask you to verify your email address, or reclaim a name that misleads others.</li>
        </ul>
      </>
    ),
  },
  {
    id: "billing",
    title: "Plans, payments and renewals",
    content: (
      <>
        <h3>Plans and prices</h3>
        <p>
          Some features are free and others need a paid plan. The plans, their prices and what they include are shown on
          our site and at checkout before you pay. Prices are in US dollars unless we say otherwise. Taxes, where they
          apply, are added or included as shown at checkout, and your bank or card issuer may charge its own fees.
        </p>

        <h3>Payment</h3>
        <p>
          Payments are processed by Stripe. When you buy a plan, you authorise us and Stripe to charge the payment method
          you provide for the price shown, and for each renewal of a subscription. You confirm that you are allowed to use
          that payment method.
        </p>

        <h3>Pro Monthly renews automatically</h3>
        <p>
          <strong>
            Pro Monthly is a subscription. It renews every month and your payment method is charged the then current price
            each month until you cancel.
          </strong>{" "}
          You can cancel at any time from the billing portal in your dashboard Settings, or by emailing <SupportEmail />.
          Cancelling stops future renewals. Your paid access continues until the end of the period you already paid for,
          and no part of that period is refunded.
        </p>
        <p>
          If a renewal payment fails, we or Stripe may try it again, and we may suspend or downgrade your plan until it is
          paid.
        </p>

        <h3>Pro Lifetime</h3>
        <p>
          Pro Lifetime is a single payment with no renewals. &quot;Lifetime&quot; means for as long as we operate the Service,
          not for your lifetime or any fixed number of years. It covers the Pro features of the Service as we offer them
          from time to time, belongs to the account that bought it and cannot be transferred. It may not include products
          we launch later and sell separately. If you buy Lifetime while you have a Monthly subscription, the subscription
          is cancelled and the month already paid is not refunded.
        </p>

        <h3>Price changes</h3>
        <p>
          We may change our prices. A new price applies to a subscription only from a renewal that comes at least 30 days
          after we emailed you about it. If you do not accept a new price, cancel before that renewal.
        </p>

        <h3>Free features, trials and offers</h3>
        <p>
          Free features, free analyses, discounts and other offers are given at our discretion, are limited to one per
          person unless we say otherwise, and can be changed or withdrawn at any time. We may refuse an offer where we see
          signs of duplicate accounts or abuse.
        </p>

        <h3>Fair use</h3>
        <p>
          Plans described as &quot;unlimited&quot; are for one person&apos;s normal use. To keep the Service stable and fair for
          everyone, technical limits apply, such as limits per minute and per day, and we may temporarily limit or pause AI
          features when system-wide capacity limits are reached. These limits do not entitle you to a refund.
        </p>
      </>
    ),
  },
  {
    id: "refunds",
    title: "No refunds",
    content: (
      <>
        <Callout title="All payments are final">
          <p>
            <strong>
              We do not give refunds or credits, in full or in part, except where the law that applies to you requires us
              to.
            </strong>
          </p>
          <p>
            This applies to every payment, including a subscription period you did not use or only partly used, a Lifetime
            purchase, a plan you no longer want, features that changed or were removed, an account we closed because these
            Terms were broken, and losses from trading.
          </p>
        </Callout>

        <h3>Access starts immediately</h3>
        <p>
          Paid access is a digital service that we start providing the moment your payment succeeds. By paying, you ask us
          to start straight away. To the extent the law allows, you accept that any right you may have to withdraw from the
          purchase or to a cooling-off period ends once the service has started. Where the law does not allow that right to
          be given up, any refund is limited to the minimum the law requires and is reduced by the value of the service
          already provided.
        </p>

        <h3>Charged by mistake</h3>
        <p>
          If you believe you were charged in error, for example twice for the same thing, email <SupportEmail /> within 30
          days of the charge with the details. We will look into it and correct any charge that was a mistake on our side.
        </p>

        <h3>Rights the law gives you</h3>
        <p>
          Nothing in this section takes away a right that the law gives you and that cannot be removed by agreement. To use
          such a right, email <SupportEmail /> from the address on your account, tell us which purchase it concerns and
          which right you are relying on.
        </p>

        <h3>Chargebacks</h3>
        <p>
          Contact us before you dispute a charge with your bank or card issuer, so we can try to solve the problem. If you
          open a dispute or chargeback that is not justified, that is a breach of these Terms. We may suspend your account
          while it is open, we may give the payment provider our records of your purchase and use of the Service, and you
          remain responsible for the amount and for the fees the dispute causes.
        </p>
      </>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    content: (
      <>
        <p>You agree not to do any of the following, and not to help anyone else do them:</p>
        <ul>
          <li>Get around usage limits, rate limits, plan restrictions or any security measure of the Service.</li>
          <li>Create more than one account, or use false details, to obtain free analyses or other offers more than once.</li>
          <li>Use bots, scripts or other automated means to access the Service, or scrape, crawl or copy it in bulk.</li>
          <li>
            Reverse engineer, decompile or probe the Service, or try to extract our prompts, models, rules, source code or
            data.
          </li>
          <li>
            Resell, rent, share or redistribute the Service or its output, including running a paid or public signal
            service, group or channel from it, without our written permission.
          </li>
          <li>Present output of the Service to others as professional or personalised financial advice.</li>
          <li>Use the Service or its content to build a competing product or to train an artificial intelligence model.</li>
          <li>
            Upload anything unlawful, infringing, harmful or unrelated to the purpose of a feature, anything containing
            malware, or personal data of other people that you have no right to share.
          </li>
          <li>Use the Service to break any law or regulation, including rules against market manipulation and fraud.</li>
          <li>Interfere with the Service, overload it, or try to access accounts or data that are not yours.</li>
          <li>Use a payment method without authorisation, or abuse refunds, disputes or chargebacks.</li>
          <li>Harass, threaten or abuse our staff or our support chat.</li>
        </ul>
        <p>
          We may investigate suspected breaches and may limit, suspend or close an account that breaks these rules, as set
          out in <Link href="#termination">Suspension and termination</Link>.
        </p>
      </>
    ),
  },
  {
    id: "your-content",
    title: "Your content",
    content: (
      <>
        <p>
          &quot;Your content&quot; is what you put into the Service: chart screenshots, trade journal entries and goals,
          messages to the AI Trading Bot and to support, your profile details and picture, and anything else you submit.
        </p>
        <ul>
          <li>You keep ownership of your content.</li>
          <li>
            You give us a worldwide, non-exclusive, royalty-free licence to host, store, copy, transmit and process your
            content, and to pass it to the providers we use (such as our AI model provider), only as needed to run, secure
            and support the Service for you.
          </li>
          <li>
            You confirm that you have the right to submit your content and that it does not break the law or anyone
            else&apos;s rights.
          </li>
          <li>
            We may use information about how the Service is used, in a form that does not identify you, to maintain and
            improve it.
          </li>
        </ul>
        <p>
          If you send us ideas or feedback, you agree that we may use them freely, without payment and without any
          obligation to you.
        </p>
        <p>
          How we handle the personal data in your content is described in the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    title: "Our content and your licence",
    content: (
      <>
        <p>
          The Service and everything in it, including the software, design, text, graphics, Entrix Academy lessons, the
          Glossary, indicators and scripts, the name EntrixAlgo and our logos, belongs to us or to our licensors and is
          protected by intellectual property laws.
        </p>
        <p>
          As long as you follow these Terms, we give you a personal, limited, non-exclusive, non-transferable and revocable
          licence to use the Service for your own trading and learning. You may use the output you receive for your own
          trading decisions. You may not copy, publish, sell or distribute the Service, its lessons, its indicators or
          scripts, or its output, except as these Terms allow.
        </p>
        <p>
          An indicator or script we give you is for your own use on your own charting account only. Do not publish it, share
          it or pass it on.
        </p>
        <p>All rights that these Terms do not expressly give you stay with us.</p>
      </>
    ),
  },
  {
    id: "third-parties",
    title: "Third-party services",
    content: (
      <>
        <p>
          The Service relies on, links to or works alongside services run by others, such as Stripe for payments, Google for
          sign-in, TradingView and other charting platforms, and the broker or exchange you trade with. Your use of those
          services is governed by their own terms and privacy policies. We do not control them, we are not responsible for
          them, and a mention of a third party is not an endorsement.
        </p>
        <p>
          EntrixAlgo is not affiliated with, sponsored by or endorsed by TradingView or any broker or exchange. Their names
          and marks belong to their owners.
        </p>
      </>
    ),
  },
  {
    id: "termination",
    title: "Suspension and termination",
    content: (
      <>
        <h3>By you</h3>
        <p>
          You can stop using the Service at any time. To cancel a subscription, use the billing portal in Settings. To have
          your account deleted, email <SupportEmail /> from the address on the account. Cancel any subscription first:
          deleting an account does not create a right to a refund.
        </p>

        <h3>By us</h3>
        <p>We may limit, suspend or close your account, or refuse to provide the Service, if:</p>
        <ul>
          <li>you break these Terms or we reasonably suspect that you have;</li>
          <li>a payment is reversed, disputed, fraudulent or unpaid;</li>
          <li>your use creates a security, legal or financial risk for us or for other users;</li>
          <li>the law, a court or an authority requires it; or</li>
          <li>we stop offering the Service or a part of it.</li>
        </ul>
        <p>
          Where it is reasonable and lawful, we will tell you and give you a chance to put things right first. We may act
          without notice where the matter is serious or urgent.
        </p>

        <h3>What happens then</h3>
        <p>
          When your account is closed, your right to use the Service ends and you may lose access to your content, so export
          what you want to keep, such as your Trade Journal, beforehand. Closing an account, by you or by us, does not
          entitle you to a refund, except where the law requires one. If we permanently shut down the whole Service, we will
          give reasonable notice where we can.
        </p>
        <p>
          The sections of these Terms that by their nature should continue after the end of the agreement do so, including
          those on advice, risk, refunds, intellectual property, disclaimers, liability, indemnity and disputes.
        </p>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to these Terms",
    content: (
      <>
        <p>
          We may update these Terms, for example when the Service, the law or our business changes. The date at the top
          shows when they were last changed.
        </p>
        <p>
          When a change is material, we will tell you by email or by a notice in the dashboard at least 15 days before it
          applies to you, unless the change is needed sooner for legal or security reasons. If you keep using the Service
          after a change applies, you accept the updated Terms. If you do not agree, stop using the Service and cancel your
          subscription before the change applies.
        </p>
      </>
    ),
  },
  {
    id: "disclaimers",
    title: "Disclaimers",
    content: (
      <>
        <Callout title="Provided as is">
          <p>
            <strong>
              The Service, its content and its output are provided &quot;as is&quot; and &quot;as available&quot;, with all faults and
              without warranties of any kind, whether express, implied or statutory.
            </strong>
          </p>
          <p>
            To the fullest extent the law allows, we disclaim all warranties, including implied warranties of
            merchantability, satisfactory quality, fitness for a particular purpose, accuracy, title and non-infringement.
          </p>
        </Callout>
        <p>Without limiting that, we do not warrant that:</p>
        <ul>
          <li>the Service or any output, signal, level, score, data or lesson is accurate, complete, current or reliable;</li>
          <li>using the Service will lead to profitable trades or to any particular result;</li>
          <li>the Service will be uninterrupted, timely, secure or free of errors, or that defects will be corrected; or</li>
          <li>the Service will keep any particular feature, or remain available for any period.</li>
        </ul>
        <p>No information or statement from us, in any form, creates a warranty that is not written in these Terms.</p>
      </>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    content: (
      <>
        <Callout title="Please read this section carefully">
          <p>
            <strong>To the fullest extent the law allows, we are not liable for:</strong>
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>trading or investment losses of any kind, or profits you expected and did not make;</li>
            <li>decisions you made, or did not make, based on the Service or its output;</li>
            <li>indirect, incidental, special, consequential, exemplary or punitive damages;</li>
            <li>loss of revenue, business, opportunity, goodwill or data;</li>
            <li>the acts, omissions, outages or errors of third parties, including AI, data, payment and hosting providers; or</li>
            <li>events beyond our reasonable control.</li>
          </ul>
          <p>
            <strong>
              Our total liability to you for all claims connected with the Service or these Terms is limited to the greater
              of (a) the amount you paid us in the 12 months before the event that gave rise to the claim and (b) 100 US
              dollars.
            </strong>
          </p>
        </Callout>
        <p>
          These limits apply to every kind of claim, whether based on contract, negligence or another tort, statute or any
          other legal theory, even if we were told that the loss was possible, and even if a remedy fails of its essential
          purpose. They also protect our owners, directors, employees, contractors and suppliers.
        </p>
        <p>
          Nothing in these Terms excludes or limits liability that cannot be excluded or limited under the law that applies,
          such as liability for fraud, for death or personal injury caused by negligence, or for gross negligence or wilful
          misconduct where the law does not permit a limit.
        </p>
        <p>
          To the extent the law allows, a claim connected with the Service must be brought within one year after the event
          that gave rise to it. After that, it is barred.
        </p>
        <p>
          You accept that the price of the Service reflects this allocation of risk, and that we would not provide it
          without these limits.
        </p>
      </>
    ),
  },
  {
    id: "indemnity",
    title: "Your responsibility to us",
    content: (
      <>
        <p>
          To the extent the law allows, you agree to defend and compensate us, and our owners, directors, employees,
          contractors and suppliers, for any claim, loss, liability, penalty and reasonable cost, including legal fees, that
          arises from:
        </p>
        <ul>
          <li>your breach of these Terms or of any law;</li>
          <li>your content, or your infringement of the rights of another person;</li>
          <li>your trading, and anything you told other people on the basis of the Service; or</li>
          <li>your misuse of the Service or of your account.</li>
        </ul>
        <p>We may take over the defence of such a claim at our own cost, and you agree to cooperate with us if we do.</p>
      </>
    ),
  },
  {
    id: "disputes",
    title: "Governing law and disputes",
    content: (
      <>
        <h3>Talk to us first</h3>
        <p>
          If you have a complaint or a dispute, email <SupportEmail /> first and describe it. Both sides will try in good
          faith to settle it within 30 days before starting any formal proceedings.
        </p>

        <h3>Governing law and courts</h3>
        <p>
          These Terms, and any dispute or claim connected with them or with the Service, are governed by the laws of the{" "}
          {legal.country}, without regard to conflict of law rules. You and we agree that {courtsDescription()} have
          exclusive jurisdiction.
        </p>

        <h3>Consumers</h3>
        <p>
          If you are a consumer and the mandatory law of the country where you live gives you protections that cannot be
          removed by agreement, including the right to bring a claim before your local courts, nothing in these Terms takes
          those protections away.
        </p>

        <h3>Individual claims only</h3>
        <p>
          To the extent the law allows, you and we agree that claims will be brought only on an individual basis, and not as
          a claimant or member in any class, collective or representative action, and that each side gives up any right to a
          jury trial.
        </p>
      </>
    ),
  },
  {
    id: "general",
    title: "General",
    content: (
      <>
        <ul>
          <li>
            <strong>Whole agreement.</strong> These Terms, together with the documents they refer to, are the whole
            agreement between you and us about the Service and replace any earlier agreement or statement about it.
          </li>
          <li>
            <strong>If part is invalid.</strong> If a court finds any part of these Terms invalid or unenforceable, that
            part is limited or removed to the smallest extent needed, and the rest stays in force.
          </li>
          <li>
            <strong>No waiver.</strong> If we do not enforce a right at one time, we can still enforce it later.
          </li>
          <li>
            <strong>Transfer.</strong> You may not transfer your rights or duties under these Terms. We may transfer ours
            to a company in our group or to someone who takes over the Service or our business.
          </li>
          <li>
            <strong>No third-party rights.</strong> These Terms give rights only to you and to us, and to the persons
            protected by the liability and indemnity sections.
          </li>
          <li>
            <strong>No partnership.</strong> Nothing in these Terms makes you and us partners, agents or employees of each
            other.
          </li>
          <li>
            <strong>Events beyond our control.</strong> We are not responsible for a delay or failure caused by something
            beyond our reasonable control, such as outages of networks or providers, attacks, actions of authorities,
            natural events or changes in the law.
          </li>
          <li>
            <strong>Notices.</strong> We may send you notices by email to the address on your account or by a message in
            the dashboard, and you agree that these electronic notices satisfy any requirement that a notice be in writing.
            Send notices to us at <SupportEmail />.
          </li>
          <li>
            <strong>Language.</strong> These Terms are written in English. If they are translated, the English version
            prevails to the extent the law allows.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    content: (
      <>
        <p>
          EntrixAlgo is operated by {operatorDescription()}. For any question about these Terms, email <SupportEmail />.
        </p>
      </>
    ),
  },
]

export default function TermsPage() {
  return (
    <LegalPage
      path="/terms"
      title="Terms of Service"
      intro={
        <p>
          These Terms are the agreement between you and EntrixAlgo. Please read them carefully: the sections on advice,
          trading risk, refunds, disclaimers, liability and disputes limit our responsibility and affect your rights.
        </p>
      }
      summary={[
        "EntrixAlgo gives you tools and education. It is not financial advice, and we are not a broker or an adviser.",
        "Trading is risky. You decide what to trade, and the results are yours.",
        "AI output can be wrong. Check it before you rely on it.",
        "Pro Monthly renews every month until you cancel. You can cancel at any time in Settings.",
        "Payments are final. We do not give refunds, except where the law requires one.",
        "You must be 18 or older to use EntrixAlgo.",
        "Our liability to you is limited, as the Limitation of liability section explains.",
      ]}
      sections={SECTIONS}
    />
  )
}
