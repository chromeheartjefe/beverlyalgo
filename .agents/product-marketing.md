# EntrixAlgo: product marketing context

Last updated: 2026-10-02. Numbers come from the live database and Stripe (read-only) and exclude the owner's two accounts. Refresh the "Funnel" section before relying on it.

## Product

EntrixAlgo (entrixalgo.com) is a web dashboard of AI trading tools. It works in any browser on desktop or phone, nothing to install. It is an analysis tool: it does not place trades, connect to brokers, manage money or give financial advice.

Positioning (owner's decision, 2026-10-02): EntrixAlgo is framed as a **private AI trading algorithm**, not as "a chart analyzer". Chart Analysis is how people use the algorithm today, but headline-level copy sells the algorithm and its signals. Do not tie the top-level pitch to TradingView or the indicator, which has not shipped.

Hero copy (approved): "Trade Smarter with AI-Powered Precision" / "Professionally designed private AI trading algorithm that elevates your trading with precise, easy-to-read signals."

What the product does in practice: upload a chart screenshot, get an AI read with a Buy or Sell call, confidence grade, entry, two targets, stop and risk:reward.

### What is in it

Pro (paid):
- **AI Chart Analysis**: the core product. Screenshot in, structured trade plan out (signal, confidence, entry, TP1, TP2, stop, R:R, patterns, market structure, risk notes). Works on any chart from any platform.
- **AI Trading Bot**: chat assistant with live market data and news.
- **TradingView indicator**: invite-only. Still in development as of 2026-10-02; paying users who requested it have been told "within the next few days". Do not promise a date or call it a direct TradingView invite.

Free on every account:
- 1 AI Chart Analysis (verified email, one per inbox)
- AI Screener (top 5 crypto and top 5 stocks per scan)
- Trade Journal, Trade Calendar, Risk Calculator
- Entrix Academy (129-lesson course, practice, final exam, certificate) and a 198-term Trading Glossary

## Pricing

| Plan | Price | Notes |
|---|---|---|
| Free | $0 | No card. 1 chart analysis plus the free tools. |
| Pro Monthly | $49/month | Cancel anytime. Every sale so far is this plan. |
| Pro Lifetime | $299 once | Marked "Best Value" on the pricing section. 0 sales. |

- Checkout is two Stripe Payment Links. Buttons live on the landing page pricing section (`/#pricing`); every "Upgrade to Pro" button in the dashboard links there.
- No free trial (owner rejected a card-up-front trial: a few days of trading is luck, plus cancel and dispute risk).
- No refund or money-back guarantee is offered. Terms: the current period is not refunded unless required by law.
- Pricing copy says "Unlimited AI chart analysis"; there is a fair-use cap of 30 a day that is never stated.
- AI cost per analysis is about $0.0014, so giving analyses away is nearly free. Margin is driven by Stripe fees and fixed costs.

## Audience

- Retail traders arriving from the owner's Instagram reels, which show the owner's own trades. Mostly on phones.
- Markets: crypto first (BTC, ETH, SOL), then index futures (MNQ, MES), some gold and forex. Short timeframes, 1m to 15m.
- Skill: beginner to intermediate. Many are new and may expect the tool to reproduce the expert results they saw in the reels.
- Sign-up: 60 of the last 77 accounts used Google sign-in.
- Payers so far: Switzerland, United States, Italy. 2 of 3 paid with Apple Pay.

### Job to be done

"Tell me whether this setup is worth taking and where to put my entry, stop and target, so I stop guessing and stop getting chopped up."

Secondary jobs: a second opinion before entering, a way to learn to read charts, a place to track trades.

### What they believe before buying

- A good signal tool can make them profitable quickly.
- AI can see something on the chart that they cannot.
- Most signal products are scams, so they are suspicious of paying before seeing proof.

## Funnel (as of 2026-10-02)

- 157 accounts. Sign-ups per day: 16, 12, 9, 14, 20 (Sep 26 to 30), then 35 and 42 (Oct 1 and 2).
- 3 paying subscribers, all Monthly, MRR $147. No cancellations. First renewals fall around 2026-10-27.
- Overall: 3 sales from about 148 sign-ups since Sep 26 (2.0%). The sample is far too small to compare periods.

Before the free analysis (sign-ups Sep 26 to 30, 71 accounts):
- About 22 opened Stripe checkout, 20 of them within 15 minutes of signing up, without having tried the AI.
- 2 paid, both within 8 minutes of signing up. The rest left the Stripe page without entering anything. Lifetime: 0 purchases from about 8 opens.

With the free analysis live (sign-ups Oct 1 and 2, 77 accounts):
- 94% verified email (Google sign-in).
- 57 used the free analysis (74%), median 2 minutes after signing up.
- Of all 60 free-analysis users, 37 were last seen within about 10 minutes of the result. None has come back on a later day yet (window is only two days).
- Every free analysis so far returned a directional call: 44 Sell, 16 Buy, confidence 75 to 95 (median 88). No neutral results.
- 1 sale: signed up, ran the free analysis, paid 81 minutes later, then ran 8 more analyses the same day.
- Checkout opens since Oct 1 are not known: the admin Stripe key lacks "Checkout Sessions: Read", and the site does not log upgrade clicks or checkout opens itself.

Paying users are heavy users: 46, 30 and 9 analyses each, and all three requested the indicator.

Free-tool usage is low: a handful of users have logged a trade or opened the bot.

## Proof and trust assets

Real:
- 20 written user testimonials (`config/testimonials.ts`), shown as a marquee on the landing page.
- Four TradingView Strategy Tester backtests (BTC, ETH, SOL, XRP, one 19-day window in August 2026) with a "past performance" disclaimer.
- Live product demos on the landing page.
- The Academy and its certificate.

Unverified claims on the site (basis unknown, check before reusing or amplifying them):
- "5,000+ traders already using EntrixAlgo" (hero badge and pricing strip). The database holds 157 accounts.
- "4.8/5 · 52+ verified reviews" (pricing strip). No review system exists on the site.

## Objections to expect

1. "Does it actually work?" A signal can only be judged after price has moved, which is hours after the free analysis.
2. "$49 is a lot for something I tried once."
3. "Is this another signals scam?" Fed by hype in the niche.
4. "Can I get my money back if it is not for me?" Currently no.
5. "Why not just use ChatGPT on my screenshot?"
6. "I'm a beginner, will I understand it?"

## Competitors and alternatives

- LuxAlgo and similar TradingView indicator suites (indicator-first, subscription).
- simplealgo.io (benchmark for the Academy; has a learn section).
- Telegram and Discord signal groups.
- General AI chat with a pasted screenshot.
- Doing nothing: trading on instinct.

Differentiators: any chart from any platform, a full trade plan rather than a bare arrow, honest framing (grades are setup quality, not a win rate), and a free course plus journal around the AI.

## Voice and rules for copy

- Plain, direct, confident without hype. Sentence case.
- No em dashes in user-facing text.
- Never promise profits, win rates or guaranteed results. No "can't lose", "easy money", "sure thing".
- Ratio is written Risk : Reward as 1:X.
- Support contact is shown as a plain address: support@entrixalgo.com.
- Scarcity, urgency and social-proof numbers only when they are true.
- Protect existing subscribers: pricing or checkout changes must not alter what current payers have.

## Channels

- Instagram reels (owner's account): the only acquisition source so far, about 25k views by 2026-09-30.
- Email: transactional only (verification, password reset, email changed, indicator update). No onboarding, follow-up or win-back emails exist.
- In-app: "What's new" changelog panel, announcement banner, AI support chat.
- No paid ads, no SEO content, no referral program.
