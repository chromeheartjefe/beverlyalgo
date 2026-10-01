import { findLessonById } from "@/lib/academy/curriculum"
import { isQuestion, type LessonContent } from "@/lib/academy/types"

import { lesson as u1ExchangesBrokersAndOtc } from "./u1/exchanges-brokers-and-otc"
import { lesson as u1MarketSessionsAndHours } from "./u1/market-sessions-and-hours"
import { lesson as u1RegulationAndScams } from "./u1/regulation-and-scams"
import { lesson as u1TheHonestNumbers } from "./u1/the-honest-numbers"
import { lesson as u1TradingVsInvestingVsGambling } from "./u1/trading-vs-investing-vs-gambling"
import { lesson as u1WhatCanYouTrade } from "./u1/what-can-you-trade"
import { lesson as u1WhatIsAMarket } from "./u1/what-is-a-market"
import { lesson as u1WhoIsOnTheOtherSide } from "./u1/who-is-on-the-other-side"
import { lesson as u2BidAskAndSpread } from "./u2/bid-ask-and-spread"
import { lesson as u2GoingLongAndGoingShort } from "./u2/going-long-and-going-short"
import { lesson as u2LeverageAndMargin } from "./u2/leverage-and-margin"
import { lesson as u2LimitOrders } from "./u2/limit-orders"
import { lesson as u2MarketOrdersAndSlippage } from "./u2/market-orders-and-slippage"
import { lesson as u2PipsPointsTicksAndLots } from "./u2/pips-points-ticks-and-lots"
import { lesson as u2StopAndStopLimitOrders } from "./u2/stop-and-stop-limit-orders"
import { lesson as u2TheOrderBookAndLiquidity } from "./u2/the-order-book-and-liquidity"
import { lesson as u2WhatTradingReallyCosts } from "./u2/what-trading-really-costs"
import { lesson as u3AnatomyOfACandle } from "./u3/anatomy-of-a-candle"
import { lesson as u3CandlesInContext } from "./u3/candles-in-context"
import { lesson as u3Gaps } from "./u3/gaps"
import { lesson as u3LineBarAndCandleCharts } from "./u3/line-bar-and-candle-charts"
import { lesson as u3LogVsLinearScale } from "./u3/log-vs-linear-scale"
import { lesson as u3SingleCandlePatterns } from "./u3/single-candle-patterns"
import { lesson as u3Timeframes } from "./u3/timeframes"
import { lesson as u3TwoAndThreeCandlePatterns } from "./u3/two-and-three-candle-patterns"
import { lesson as u3Volume } from "./u3/volume"
import { lesson as u4BreakOfStructure } from "./u4/break-of-structure"
import { lesson as u4ChangeOfCharacter } from "./u4/change-of-character"
import { lesson as u4ImpulseAndPullback } from "./u4/impulse-and-pullback"
import { lesson as u4InternalVsSwingStructure } from "./u4/internal-vs-swing-structure"
import { lesson as u4MultiTimeframeStructure } from "./u4/multi-timeframe-structure"
import { lesson as u4SwingHighsAndSwingLows } from "./u4/swing-highs-and-swing-lows"
import { lesson as u4TrendVsRange } from "./u4/trend-vs-range"
import { lesson as u4WhereItCameFromDowTheory } from "./u4/where-it-came-from-dow-theory"
import { lesson as u5BreakoutsFakeoutsAndRetests } from "./u5/breakouts-fakeouts-and-retests"
import { lesson as u5ClassicReversalPatterns } from "./u5/classic-reversal-patterns"
import { lesson as u5ContinuationPatterns } from "./u5/continuation-patterns"
import { lesson as u5FibonacciRetracementsAndExtensions } from "./u5/fibonacci-retracements-and-extensions"
import { lesson as u5RoleReversal } from "./u5/role-reversal"
import { lesson as u5RoundNumbers } from "./u5/round-numbers"
import { lesson as u5SupplyAndDemandZones } from "./u5/supply-and-demand-zones"
import { lesson as u5SupportAndResistance } from "./u5/support-and-resistance"
import { lesson as u5TrendlinesAndChannels } from "./u5/trendlines-and-channels"
import { lesson as u6Atr } from "./u6/atr"
import { lesson as u6BollingerBands } from "./u6/bollinger-bands"
import { lesson as u6DivergenceAndCombiningTools } from "./u6/divergence-and-combining-tools"
import { lesson as u6Macd } from "./u6/macd"
import { lesson as u6MovingAverages } from "./u6/moving-averages"
import { lesson as u6Rsi } from "./u6/rsi"
import { lesson as u6VwapAndVolumeTools } from "./u6/vwap-and-volume-tools"
import { lesson as u6WhyIndicatorsLag } from "./u6/why-indicators-lag"
import { lesson as u7BuySideAndSellSideLiquidity } from "./u7/buy-side-and-sell-side-liquidity"
import { lesson as u7EqualHighsEqualLowsAndTrendlineLiquidity } from "./u7/equal-highs-equal-lows-and-trendline-liquidity"
import { lesson as u7Inducement } from "./u7/inducement"
import { lesson as u7InternalVsExternalRangeLiquidity } from "./u7/internal-vs-external-range-liquidity"
import { lesson as u7LiquidityVoids } from "./u7/liquidity-voids"
import { lesson as u7StopHuntsAndTurtleSoup } from "./u7/stop-hunts-and-turtle-soup"
import { lesson as u7SweepsVsRealBreakouts } from "./u7/sweeps-vs-real-breakouts"
import { lesson as u7WhatLiquidityMeansInSmc } from "./u7/what-liquidity-means-in-smc"
import { lesson as u8BreakerAndMitigationBlocks } from "./u8/breaker-and-mitigation-blocks"
import { lesson as u8ConsequentEncroachment } from "./u8/consequent-encroachment"
import { lesson as u8Displacement } from "./u8/displacement"
import { lesson as u8FairValueGaps } from "./u8/fair-value-gaps"
import { lesson as u8InverseFairValueGaps } from "./u8/inverse-fair-value-gaps"
import { lesson as u8OrderBlocks } from "./u8/order-blocks"
import { lesson as u8RankingPointsOfInterest } from "./u8/ranking-points-of-interest"
import { lesson as u8RejectionAndPropulsionBlocks } from "./u8/rejection-and-propulsion-blocks"
import { lesson as u8VolumeImbalanceAndBalancedPriceRange } from "./u8/volume-imbalance-and-balanced-price-range"
import { lesson as u9DealingRanges } from "./u9/dealing-ranges"
import { lesson as u9OpeningPricesAndOpeningGaps } from "./u9/opening-prices-and-opening-gaps"
import { lesson as u9OptimalTradeEntry } from "./u9/optimal-trade-entry"
import { lesson as u9PowerOf3AndTheJudasSwing } from "./u9/power-of-3-and-the-judas-swing"
import { lesson as u9PremiumDiscountAndEquilibrium } from "./u9/premium-discount-and-equilibrium"
import { lesson as u9SessionsAndKillzones } from "./u9/sessions-and-killzones"
import { lesson as u9TheAsianRange } from "./u9/the-asian-range"
import { lesson as u9WyckoffTheRootsOfAmd } from "./u9/wyckoff-the-roots-of-amd"
import { lesson as u10BiasAndDrawOnLiquidity } from "./u10/bias-and-draw-on-liquidity"
import { lesson as u10BuildAndBacktestYourOwnModel } from "./u10/build-and-backtest-your-own-model"
import { lesson as u10MarketMakerModels } from "./u10/market-maker-models"
import { lesson as u10SilverBullet } from "./u10/silver-bullet"
import { lesson as u10SmtDivergence } from "./u10/smt-divergence"
import { lesson as u10TheMssAndFvgEntry } from "./u10/the-mss-and-fvg-entry"
import { lesson as u10TopDownAnalysis } from "./u10/top-down-analysis"
import { lesson as u10TurtleSoupReversal } from "./u10/turtle-soup-reversal"
import { lesson as u10UnicornModel } from "./u10/unicorn-model"
import { lesson as u11DrawdownMath } from "./u11/drawdown-math"
import { lesson as u11LeverageAndCorrelation } from "./u11/leverage-and-correlation"
import { lesson as u11PositionSizing } from "./u11/position-sizing"
import { lesson as u11RMultiplesAndRewardToRisk } from "./u11/r-multiples-and-reward-to-risk"
import { lesson as u11RiskComesFirst } from "./u11/risk-comes-first"
import { lesson as u11RiskOfRuin } from "./u11/risk-of-ruin"
import { lesson as u11The1Rule } from "./u11/the-1-rule"
import { lesson as u11WhereToPutYourStop } from "./u11/where-to-put-your-stop"
import { lesson as u11WinRateRRAndExpectancy } from "./u11/win-rate-r-r-and-expectancy"
import { lesson as u12EntriesAndExits } from "./u12/entries-and-exits"
import { lesson as u12ForwardTesting } from "./u12/forward-testing"
import { lesson as u12HonestBacktesting } from "./u12/honest-backtesting"
import { lesson as u12Journaling } from "./u12/journaling"
import { lesson as u12SampleSizeAndWhenToChange } from "./u12/sample-size-and-when-to-change"
import { lesson as u12SetupTriggerAndManagement } from "./u12/setup-trigger-and-management"
import { lesson as u12TheWeeklyReview } from "./u12/the-weekly-review"
import { lesson as u12WritingATradingPlan } from "./u12/writing-a-trading-plan"
import { lesson as u13CuttingWinnersEarly } from "./u13/cutting-winners-early"
import { lesson as u13Fomo } from "./u13/fomo"
import { lesson as u13LessonsFromLivermore } from "./u13/lessons-from-livermore"
import { lesson as u13LossAversion } from "./u13/loss-aversion"
import { lesson as u13OverconfidenceAndOvertrading } from "./u13/overconfidence-and-overtrading"
import { lesson as u13RevengeTrading } from "./u13/revenge-trading"
import { lesson as u13RoutinesDisciplineAndTilt } from "./u13/routines-discipline-and-tilt"
import { lesson as u14EarningsAndCryptoDrivers } from "./u14/earnings-and-crypto-drivers"
import { lesson as u14InflationAndCpi } from "./u14/inflation-and-cpi"
import { lesson as u14JobsAndNfp } from "./u14/jobs-and-nfp"
import { lesson as u14RatesAndCentralBanks } from "./u14/rates-and-central-banks"
import { lesson as u14TheEconomicCalendar } from "./u14/the-economic-calendar"
import { lesson as u14TradingAroundNews } from "./u14/trading-around-news"
import { lesson as u14WhyNewsMovesPrice } from "./u14/why-news-moves-price"
import { lesson as u15ChoosingYourMarket } from "./u15/choosing-your-market"
import { lesson as u15ChoosingYourStyle } from "./u15/choosing-your-style"
import { lesson as u15Crypto } from "./u15/crypto"
import { lesson as u15Forex } from "./u15/forex"
import { lesson as u15FuturesAndIndices } from "./u15/futures-and-indices"
import { lesson as u15Gold } from "./u15/gold"
import { lesson as u15Stocks } from "./u15/stocks"
import { lesson as u16ADailyRoutine } from "./u16/a-daily-routine"
import { lesson as u16JournalAndCalendarWorkflow } from "./u16/journal-and-calendar-workflow"
import { lesson as u16ReadingAChartAnalysis } from "./u16/reading-a-chart-analysis"
import { lesson as u16TheAiIndicator } from "./u16/the-ai-indicator"
import { lesson as u16TheAiScreener } from "./u16/the-ai-screener"
import { lesson as u16TheAiTradingBot } from "./u16/the-ai-trading-bot"

// Every written lesson. Register a new lesson file here; its id must exist
// in lib/academy/curriculum.ts. Server-side only (lesson pages and the API),
// so the client bundle never carries the whole course.
const ALL: LessonContent[] = [
  // Unit 1
  u1WhatIsAMarket,
  u1WhatCanYouTrade,
  u1WhoIsOnTheOtherSide,
  u1ExchangesBrokersAndOtc,
  u1TradingVsInvestingVsGambling,
  u1MarketSessionsAndHours,
  u1RegulationAndScams,
  u1TheHonestNumbers,
  // Unit 2
  u2BidAskAndSpread,
  u2TheOrderBookAndLiquidity,
  u2MarketOrdersAndSlippage,
  u2LimitOrders,
  u2StopAndStopLimitOrders,
  u2GoingLongAndGoingShort,
  u2LeverageAndMargin,
  u2WhatTradingReallyCosts,
  u2PipsPointsTicksAndLots,
  // Unit 3
  u3LineBarAndCandleCharts,
  u3AnatomyOfACandle,
  u3Timeframes,
  u3Volume,
  u3SingleCandlePatterns,
  u3TwoAndThreeCandlePatterns,
  u3CandlesInContext,
  u3LogVsLinearScale,
  u3Gaps,
  // Unit 4
  u4SwingHighsAndSwingLows,
  u4TrendVsRange,
  u4ImpulseAndPullback,
  u4BreakOfStructure,
  u4ChangeOfCharacter,
  u4InternalVsSwingStructure,
  u4MultiTimeframeStructure,
  u4WhereItCameFromDowTheory,
  // Unit 5
  u5SupportAndResistance,
  u5RoleReversal,
  u5RoundNumbers,
  u5TrendlinesAndChannels,
  u5SupplyAndDemandZones,
  u5ClassicReversalPatterns,
  u5ContinuationPatterns,
  u5BreakoutsFakeoutsAndRetests,
  u5FibonacciRetracementsAndExtensions,
  // Unit 6
  u6WhyIndicatorsLag,
  u6MovingAverages,
  u6Rsi,
  u6Macd,
  u6BollingerBands,
  u6Atr,
  u6VwapAndVolumeTools,
  u6DivergenceAndCombiningTools,
  // Unit 7
  u7WhatLiquidityMeansInSmc,
  u7BuySideAndSellSideLiquidity,
  u7EqualHighsEqualLowsAndTrendlineLiquidity,
  u7SweepsVsRealBreakouts,
  u7Inducement,
  u7InternalVsExternalRangeLiquidity,
  u7StopHuntsAndTurtleSoup,
  u7LiquidityVoids,
  // Unit 8
  u8Displacement,
  u8FairValueGaps,
  u8ConsequentEncroachment,
  u8InverseFairValueGaps,
  u8VolumeImbalanceAndBalancedPriceRange,
  u8OrderBlocks,
  u8BreakerAndMitigationBlocks,
  u8RejectionAndPropulsionBlocks,
  u8RankingPointsOfInterest,
  // Unit 9
  u9DealingRanges,
  u9PremiumDiscountAndEquilibrium,
  u9OptimalTradeEntry,
  u9SessionsAndKillzones,
  u9TheAsianRange,
  u9OpeningPricesAndOpeningGaps,
  u9PowerOf3AndTheJudasSwing,
  u9WyckoffTheRootsOfAmd,
  // Unit 10
  u10BiasAndDrawOnLiquidity,
  u10TopDownAnalysis,
  u10TheMssAndFvgEntry,
  u10SilverBullet,
  u10UnicornModel,
  u10TurtleSoupReversal,
  u10SmtDivergence,
  u10MarketMakerModels,
  u10BuildAndBacktestYourOwnModel,
  // Unit 11
  u11RiskComesFirst,
  u11The1Rule,
  u11PositionSizing,
  u11WhereToPutYourStop,
  u11RMultiplesAndRewardToRisk,
  u11WinRateRRAndExpectancy,
  u11DrawdownMath,
  u11RiskOfRuin,
  u11LeverageAndCorrelation,
  // Unit 12
  u12SetupTriggerAndManagement,
  u12WritingATradingPlan,
  u12EntriesAndExits,
  u12HonestBacktesting,
  u12ForwardTesting,
  u12Journaling,
  u12TheWeeklyReview,
  u12SampleSizeAndWhenToChange,
  // Unit 13
  u13LossAversion,
  u13Fomo,
  u13RevengeTrading,
  u13OverconfidenceAndOvertrading,
  u13CuttingWinnersEarly,
  u13RoutinesDisciplineAndTilt,
  u13LessonsFromLivermore,
  // Unit 14
  u14WhyNewsMovesPrice,
  u14TheEconomicCalendar,
  u14RatesAndCentralBanks,
  u14InflationAndCpi,
  u14JobsAndNfp,
  u14EarningsAndCryptoDrivers,
  u14TradingAroundNews,
  // Unit 15
  u15Forex,
  u15Crypto,
  u15Stocks,
  u15FuturesAndIndices,
  u15Gold,
  u15ChoosingYourMarket,
  u15ChoosingYourStyle,
  // Unit 16
  u16ReadingAChartAnalysis,
  u16TheAiScreener,
  u16TheAiIndicator,
  u16JournalAndCalendarWorkflow,
  u16TheAiTradingBot,
  u16ADailyRoutine,
]

export const LESSON_CONTENT: Record<string, LessonContent> = Object.fromEntries(
  ALL.map((lesson) => {
    if (!findLessonById(lesson.id)) throw new Error(`Academy lesson "${lesson.id}" is not in the curriculum`)
    return [lesson.id, lesson]
  }),
)

export function getLessonContent(id: string): LessonContent | undefined {
  return LESSON_CONTENT[id]
}

/** Questions in a lesson; the API checks reported scores against it */
export function questionCount(lesson: LessonContent): number {
  return lesson.steps.filter(isQuestion).length
}
