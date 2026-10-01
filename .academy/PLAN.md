# Entrix Academy: master plan

Living document. Started 2026-10-01. Update the Timeline section at the end of every work session.

## Goal

A dashboard tab that takes a complete beginner to a knowledgeable, risk-aware trader.
About 13 hours of learner time across ~129 bite-size lessons (5-7 min each), with Duolingo-style
gamification, interactive charts, animations and short videos.

## Decisions (user, 2026-10-01)

1. Free for every account (Free and Pro). Lives in the dashboard, so sign-in is required.
2. Example markets: a mix of Nasdaq futures (NQ), gold, BTC and EUR/USD.
3. Smart Money / ICT (liquidity, FVG, order blocks, killzones, entry models) is taught as one approach among several,
   but it gets the most depth: it is how people actually trade in 2026. Classic material (Dow, Wyckoff, classic patterns)
   is compressed to the base layer and history. Stay honest: present it as a framework to test, not proven truth.
4. Remotion: user installs it now; use it whenever an animation needs it.

## Competitor benchmark: SimpleAlgo University (simplealgo.io/learn)

- 15 courses in 3 groups: Trading Fundamentals (5), AI Dashboard Mastery (4, product tutorials),
  Indicator Mastery (6, product tutorials). Claimed total ~8.5h, but fundamentals are only ~2.8h
  (25-45 min per course, 5-8 chapters).
- One chapter = one long scrolling page: intro, one interactive widget (a fake "Live Order Book"),
  text sections with bullet lists, an inline True/False "Quick Check", "Key Takeaways",
  one multiple-choice "Knowledge Check", then "Next: <chapter>".
- Gamification: 12 badges ("Quiz Master", "XP Legend"), XP tiers (100/500/1000), 3- and 7-day streaks,
  "0 of 6 chapters completed" progress bar. Emoji icons, colour-coded section labels (CORE, NEW).
- Gaps we can beat: shallow content, text-heavy, only 2 question types, no spaced review, no real
  chart practice, no link between lessons and the product's tools.

## Content sourcing rules (legal)

"Take and rephrase" is only safe for public-domain and CC BY sources. Popular free courses are
NOT reusable:
- BabyPips School of Pipsology: all rights reserved, personal and non-commercial use only.
- Zerodha Varsity: reproduction of text and images not permitted.
- Investopedia, StockCharts ChartSchool, CME, CFI: copyrighted.
- OpenStax Principles of Finance 2e and Economics 3e, MIT OCW, Khan Academy: CC BY-NC-SA (no commercial use).
- Wikipedia: CC BY-SA (adapted text would have to be released CC BY-SA). Use for fact-checking only.
- ICT (Michael Huddleston) mentorship videos and paid SMC courses: copyrighted. The concepts and terms
  (FVG, order block, killzone, OTE...) are free to teach; never transcribe or closely paraphrase a video.

Facts, formulas and concepts (RSI formula, what a limit order is, Dow theory) are not copyrightable.
Copyrighted courses are used only to benchmark coverage and order. We write every lesson in our own
words, our own examples, our own figures.

### Adaptable sources (we may rephrase/rework, with credit on a Sources page)

| Source | Status | Use for |
|---|---|---|
| Investor.gov / SEC (glossary, order types, margin, short selling, fraud alerts) | US gov, public domain | U1, U2, U11 |
| CFTC Learn & Protect (futures basics, leverage, forex and crypto fraud advisories) | US gov, public domain | U1, U2, U15 |
| Federal Reserve Board, BLS (rates, CPI, jobs report explainers) | US gov, public domain | U14 |
| "Liquidity, Markets and Trading in Action" (Ozenbas, Pagano, Schwartz, Weber; Springer 2022) | CC BY 4.0 | U1, U2 (order book, liquidity, price discovery) |
| Hamilton, "The Stock Market Barometer" (1922), archive.org | US public domain | U4 (one Dow theory lesson) |
| Wyckoff, "Studies in Tape Reading" (1910), archive.org | US public domain | U5, U9 (Wyckoff, AMD roots) |
| Lefevre, "Reminiscences of a Stock Operator" (1923), Gutenberg #60979 | US public domain | U13 (psychology stories, quotes) |
| Saylor Academy original course text | CC BY (exam banks excluded) | check per course |

## Curriculum (~129 lessons, ~13h)

Level 1: Foundations
- U1 Welcome to the Markets (8): what a market is; asset classes; who is on the other side; exchanges, OTC, brokers;
  trading vs investing vs gambling; sessions and hours; regulation and scams; the honest numbers (most retail traders lose, why).
- U2 Orders and Execution (9): bid/ask/spread; order book and liquidity; market orders and slippage; limit orders;
  stop and stop-limit; long vs short; leverage and margin; costs (commission, spread, swap/funding); pips, points, ticks, lots.
- U3 Reading a Chart (9): line/bar/candle; OHLC anatomy; timeframes; volume; single-candle patterns; two/three-candle
  patterns; candles in context; log vs linear scale; gaps.

Level 2: Technical Analysis Essentials (the base layer, kept lean)
- U4 Market Structure (8): swing highs/lows; trend vs range; impulse and pullback; break of structure (BOS);
  change of character (CHoCH) / market structure shift; internal vs swing structure, strong vs weak highs/lows;
  multi-timeframe structure; where it all came from (Dow theory in one lesson).
- U5 Levels, Trendlines and Classic Patterns (9): support/resistance; role reversal; round numbers; trendlines and channels;
  supply/demand zones; classic reversal patterns (double top/bottom, head and shoulders); continuation patterns
  (triangles, flags, wedges); breakouts vs fakeouts and retests; Fibonacci retracements and extensions.
- U6 Indicators (8): why indicators lag; SMA/EMA; RSI; MACD; Bollinger Bands; ATR; VWAP and volume;
  divergence and combining tools without redundancy.

Level 3: Smart Money Concepts and ICT (the depth focus)
- U7 Liquidity (8): what liquidity means in SMC; buy-side and sell-side liquidity; equal highs/lows and trendline liquidity;
  sweeps and raids vs real breakouts; inducement; internal vs external range liquidity; stop hunts and turtle soup;
  liquidity voids.
- U8 Imbalances and Order Blocks (9): displacement; fair value gaps (BISI/SIBI); consequent encroachment (50% of the gap);
  inverse FVG; volume imbalance and balanced price range; order blocks (ICT vs SMC definitions); breaker and mitigation blocks;
  rejection and propulsion blocks; validity, mitigation and ranking points of interest.
- U9 Time and Price (8): dealing ranges; premium vs discount and equilibrium; optimal trade entry (OTE);
  sessions and killzones; the Asian range; opening prices (midnight open, NWOG/NDOG); Power of 3 (AMD) and the Judas swing;
  Wyckoff accumulation/distribution as the roots of AMD.
- U10 SMC and ICT Entry Models (9): higher-timeframe bias and draw on liquidity; top-down analysis (HTF to LTF);
  the MSS + FVG entry model; Silver Bullet; Unicorn (breaker + FVG); turtle soup reversal; SMT divergence;
  market maker buy/sell models (overview); building and honestly backtesting your own SMC model.

Level 4: Becoming a Trader
- U11 Risk Management (9): risk first; the 1% rule; position sizing (links to Risk Calculator); stop placement
  (structure + ATR); R-multiples and R:R; win rate vs R:R and expectancy; drawdown math; risk of ruin; leverage and correlation.
- U12 Building and Testing a Strategy (8): setup/trigger/management; writing a trading plan; entries and exits
  (TP, trailing, partials, breakeven); honest backtesting (look-ahead, overfitting, survivorship); forward/demo testing;
  journaling (links to Journal); weekly review (links to Calendar); sample size and when to change a strategy.
- U13 Trading Psychology (7): loss aversion; FOMO; revenge trading; overconfidence and overtrading; cutting winners early;
  routines, discipline and tilt; lessons from Livermore.
- U14 Fundamentals and News (7): why news moves price; economic calendar; rates and central banks; inflation/CPI;
  jobs/NFP; earnings and crypto-specific drivers; trading around news (spreads, slippage, killzone overlap).
- U15 Market Playbooks (7): forex; crypto; stocks; futures and indices (NQ/ES, contracts, margin, rollover); gold;
  choosing a market; choosing a style (scalp, day, swing, position).

Level 5: Trading with EntrixAlgo
- U16 Product mastery (6): Chart Analysis and reading its output; AI Screener; AI Indicator; Journal + Calendar workflow;
  AI Bot; a daily routine using all of it.
- Capstone: final exam across all units, shareable certificate.

Each unit ends with a checkpoint test. Every lesson ends with 3-6 checks and a "mistakes come back" round.

## Lesson format

Short screens, one idea each (Duolingo pacing, not one long article like SimpleAlgo):
concept screen -> visual (figure / animated figure / interactive chart) -> check -> next concept -> ... -> recap -> XP screen.

Exercise types (build in this order):
1. Multiple choice, True/False
2. Tap the chart (tap the swing high, the FVG, the order block, the liquidity pool)
3. Numeric answer (position size, R:R, pip value) with tolerance
4. Match pairs (candle name to shape, order type to situation)
5. Order/sort steps (build a trade plan in the right order)
6. Spot the mistake (a flawed trade plan or chart markup)
7. Scenario replay: chart reveals candle by candle, learner decides (framed as practice, never as gambling)

## Gamification

- XP per lesson (bonus for no mistakes), levels with trader-themed rank names.
- Daily streak with one streak freeze per week. Daily goal (1 / 2 / 3 lessons).
- Badges (first lesson, unit complete, perfect checkpoint, 7/30-day streak, all units, certificate).
- Practice tab: spaced repetition of missed questions (Leitner boxes).
- No hearts/lives (punishes beginners; Duolingo itself has softened them). No leaderboard until the user base is large enough.
- Certificate at the end (shareable image, doubles as marketing).

## Visuals

- `TeachingChart`: our own SVG candlestick component fed by JSON candles + annotations (lines, zones, FVG boxes, labels,
  arrows, liquidity marks), animated with framer-motion (already installed). Covers most figures. Handcrafted
  realistic candle datasets, not live data.
- Static illustrations: SVG diagrams in the site's design language.
- Remotion (`remotion` + `@remotion/player`, lazy-loaded only in lessons): richer animated explainers played in the browser,
  no video hosting. The same compositions can be rendered to MP4 for Instagram reels (main traffic channel).
  Free for companies with up to 3 people.

## Architecture

- Routes: /dashboard/academy (path map), /dashboard/academy/[unitSlug]/[lessonSlug] (lesson player). Sidebar item.
- Content as typed TS data in content/academy/<unit>/<lesson>.ts (steps: concept, figure, chart, checks), versioned in git,
  stable lesson/question ids. Registry with the full 129-lesson map; unbuilt lessons show as "Coming soon".
- DB (Neon migration the user runs): academy_progress (user, lesson, best score, attempts, xp, completed_at),
  academy_stats (user, xp, streak, best streak, last active local day, freezes, daily goal). academy_reviews comes later
  with the Practice tab.
- XP and streak are computed on the server from the lesson registry; the client only reports right/total.
- Sources and credits page for CC BY / public-domain attribution. Educational disclaimer in every lesson.

## Per-lesson quality bar

- Written from scratch in plain English, no em-dashes, no hype, no invented statistics.
- Every fact checked against 2 sources; numbers carry a source note in the content file.
- One concrete example per concept on a real-looking chart (NQ, gold, BTC, EUR/USD).
- Honest about risk: no "guaranteed", no "easy money".

## Phases

0. Research and plan (2026-10-01): done.
1. Engine + pilot: content schema, lesson player, MC/TF/tap-chart/numeric checks, TeachingChart, first Remotion figure,
   progress DB + API, XP/streak, Academy home, sidebar. Pilot = U1 lessons 1-3 for the user to judge format and tone.
2. Level 1 content (U1-U3), then release.
3. Level 2 (U4-U6).
4. Level 3 SMC/ICT (U7-U10).
5. Level 4 (U11-U15) + Practice tab (spaced review).
6. Level 5 + capstone + certificate.

## Open decisions

- Public SEO lesson pages (outside the dashboard) later?
- Lesson unlocking: sequential with a "test out" checkpoint to skip a unit (proposed).

## Timeline

- 2026-10-01: competitor teardown, licensing research, curriculum and plan written.
- 2026-10-01: user decisions: free for all, mixed markets, SMC/ICT gets the depth, Remotion installed by user.
  Curriculum reshaped (SMC/ICT = Level 3, 4 units). Phase 1 spec sent for review.
- 2026-10-01: Phase 1 BUILT (uncommitted, typecheck + lint clean, not user-tested yet):
  engine (lib/academy: types, curriculum with all 129 lessons, xp/ranks/streak rules, candle helpers, server logic,
  SWR hook), content/academy (registry + U1 lessons 1-3), API GET /api/academy and POST /api/academy/complete,
  pages /dashboard/academy and /dashboard/academy/[unit]/[lesson], components/dashboard/academy (home path,
  lesson player, steps, lesson-complete, TeachingChart, figures incl. Remotion order-matching), sidebar LEARN group,
  migration db/migrations/2026-10-01-academy.sql (user must run in Neon first). Remotion pinned to 4.0.532.
- 2026-10-01: user tested Phase 1 ("I like everything"), migration run. Phase 2 BUILT (uncommitted, not user-tested):
  all 26 Level 1 lessons (U1 8, U2 9, U3 9). Engine additions: TeachingChart ohlc bars, volume pane, log scale,
  marker padding; "match pairs" question type; shared RemotionFigure wrapper; new figures sessions-timeline,
  order-book, market-sweep (Remotion), candle-anatomy, candle-merge (Remotion), chart-types. Changelog v2.5 entry
  added (set its date to the deploy date). Content validated by a throwaway tsx script (ids, ranges, tap answers).
  Next: user tests Level 1 -> release. Then Phase 3 (Level 2: U4-U6). Unit checkpoint tests still not built.
- 2026-10-01: user approved Level 1 ("it's good"). Phase 3 BUILT (uncommitted, not user-tested): all 25 Level 2
  lessons (U4 8, U5 9, U6 8). Engine: chart "line" annotations (trendlines, necklines, BOS/CHoCH lines, extend),
  indicator overlays (MAs, bands, VWAP) with legend, indicator pane (lines, histogram, levels, segments),
  lib/academy/indicators.ts (SMA, EMA, Wilder RSI, MACD 12/26/9, Bollinger 20/2, Wilder ATR, VWAP),
  swingCandles() helper (guaranteed clean swing points), Remotion figure structure-story (HH/HL, BOS, CHoCH).
  Validator now lives at .academy/check-lessons.ts (run: npx tsx --tsconfig tsconfig.json .academy/check-lessons.ts):
  51 lessons, 0 problems. Changelog v2.5 text updated to "two levels, 51 lessons".
  Next: user tests Level 2 -> release (Levels 1+2 together). Then Phase 4 (Level 3 SMC/ICT, U7-U10).
  Unit checkpoint tests still not built.
- 2026-10-01: user approved Level 2 and asked for an admin unlock (done: AcademyState.unlockAll via lib/admin.ts).
  Phase 4 BUILT (uncommitted, not user-tested): all 34 Level 3 SMC/ICT lessons (U7 8, U8 9, U9 8, U10 9).
  Engine: chart sessions shading + clock labels, stacked "charts" visual, ChartSpec.height, lib/academy/smc.ts
  (findFvgs, midpoint...). Hand-written shared setups in content/academy/l3/setups.ts (REVERSAL, REVERSAL_DEEP,
  REVERSAL_NO_SWEEP, REVERSAL_BEAR mirror, BREAKER, DAY hourly session day) with index constants R/B/D.
  New figures: Remotion liquidity-sweep, fvg-fill, power-of-three (shared remotion-candles.tsx); framer killzones.
  Validator re-derives every Level 3 fact (sweep, MSS, FVG/CE, OTE, IFVG, BPR, breaker/unicorn, Asian sweep,
  Judas, spring, SMT): 85 lessons, 0 problems. Changelog v2.5 text: three levels, 85 lessons.
  Next: user tests Level 3 -> release. Then Phase 5 (Level 4: U11-U15, 38 lessons) + Practice tab.
- 2026-10-01: user approved Level 3. Phase 5 BUILT (uncommitted, not user-tested):
  Practice tab: table academy_reviews + academy_stats.practice_day/practice_xp (migration
  db/migrations/2026-10-01-academy-practice.sql, USER MUST RUN before testing: GET /api/academy now counts due reviews).
  Leitner boxes 1..5, intervals 1/3/7/16/35 days, graduate after box 5; missed first-try questions from lessons enter
  box 1 due tomorrow; sessions of 10 (due first, then random refreshers from finished lessons); practice XP 1 per right
  answer, capped 30/day; practice counts for the streak. Files: lib/academy/server.ts (getPracticeSet, completePractice,
  bumpStats), app/api/academy/practice/route.ts, app/dashboard/academy/practice/page.tsx,
  components/dashboard/academy/practice-session.tsx + practice-complete.tsx, LessonPlayer practice mode, home Practice card.
  Level 4: all 38 lessons (U11 9, U12 8, U13 7, U14 7, U15 7); content/academy/l4/equity.ts (fixed 50-trade sequence);
  Livermore quotes verified verbatim against Gutenberg #60979. Validator: 123 lessons, 0 problems.
  Changelog v2.5: four levels, 123 lessons, plus Practice.
  Next: user runs migration + tests -> release. Then Phase 6 (Level 5 product lessons U16 + capstone + certificate).
- 2026-10-01: user approved Level 4 + Practice. Phase 6 BUILT (uncommitted, not user-tested): COURSE COMPLETE.
  U16 product lessons (6), all describing the real tools (Chart Analysis readout, Screener as a watchlist with no levels,
  Indicator without promising access timing, Journal/Calendar incl. CSV export, Trading Bot, daily routine) + figure
  analysis-readout. Final exam: 30 questions (2 random per unit U1-U15, choice/tf/numeric/tap only), sent WITHOUT answers
  and graded on the server (lib/academy/grading.ts shared with the lesson player; lib/academy/exam.ts), pass 80% (24/30),
  3 attempts/day, attempt TTL 3h, +50 XP on first pass. Certificate: academy_certificates (public 10-char code),
  dashboard page /dashboard/academy/certificate, public page /certificate/[id] (noindex, CTA to sign-up), PNG at
  /api/certificate/[id]/image (next/og), home Capstone card. Migration db/migrations/2026-10-01-academy-exam.sql
  (USER MUST RUN). Checks: 129 lessons 0 problems; all 432 questions grade right/wrong correctly.
  Not built: unit checkpoint tests (optional; the final exam covers assessment).
- 2026-10-01 (session end): user approved Phase 6 ("good"). Everything saved to memory. Next: user runs migration #3 if not done, then says when to commit (split by phase) and release; optional unit checkpoint tests.
