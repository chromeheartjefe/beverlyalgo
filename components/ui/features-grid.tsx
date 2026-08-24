import { CandlestickChart, ScanSearch, Zap } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

export function FeaturesGrid() {
    return (
        <section className="line-x px-4 py-12 sm:py-24 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-3xl px-2 lg:max-w-6xl lg:px-6">
                <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">

                    {/* Card 1 — Pattern Recognition */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="flex h-full flex-col justify-center pt-6 lg:p-10">
                            <div className="mx-auto flex flex-col items-center gap-4 text-center lg:gap-5">
                                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5 lg:size-14">
                                    <ScanSearch className="m-auto size-5 text-purple-400 lg:size-6" strokeWidth={1.5} />
                                </div>
                                <span className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-5xl font-semibold text-transparent lg:text-6xl">
                                    20+
                                </span>
                                <div className="space-y-2 lg:space-y-3">
                                    <h2 className="text-lg font-medium dark:text-white lg:text-xl">Chart Patterns Recognized</h2>
                                    <p className="text-muted-foreground text-sm lg:text-base">
                                        From head-and-shoulders to order blocks and fair value gaps — the AI checks every chart against 20+ classic setups.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 2 — Any Chart, Any Platform */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="flex h-full flex-col justify-center pt-6 lg:p-10">
                            <div className="relative mx-auto flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5 lg:size-14">
                                <CandlestickChart className="m-auto size-5 text-purple-400 lg:size-6" strokeWidth={1.5} />
                            </div>
                            <div className="relative z-10 mt-6 space-y-3 text-center lg:mt-7">
                                <h2 className="text-lg font-medium dark:text-white lg:text-xl">Any Chart, Any Platform</h2>
                                <p className="text-muted-foreground text-sm lg:text-base">
                                    Upload a screenshot from TradingView, MT4, your exchange, or your broker — the AI reads it the same way either way.
                                </p>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                                    {["Crypto", "Stocks", "Indices", "ETFs", "Forex"].map((tag) => (
                                        <span
                                            key={tag}
                                            className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card 3 — Instant Buy/Sell Calls */}
                    <Card className="relative overflow-hidden">
                        <CardContent className="flex h-full flex-col justify-center pt-6 lg:p-10">
                            <div className="mx-auto flex flex-col items-center gap-4 text-center lg:gap-5">
                                <div className="relative flex aspect-square size-12 rounded-full border before:absolute before:-inset-2 before:rounded-full before:border dark:border-white/10 dark:before:border-white/5 lg:size-14">
                                    <Zap className="m-auto size-5 text-purple-400 lg:size-6" strokeWidth={1.5} />
                                </div>
                                <div className="space-y-2 lg:space-y-3">
                                    <h2 className="text-lg font-medium dark:text-white lg:text-xl">Instant Buy/Sell Calls</h2>
                                    <p className="text-muted-foreground text-sm lg:text-base">
                                        Upload a chart and get a clear signal in seconds — entry, targets, and stop-loss included, no waiting required.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                                        BUY
                                    </span>
                                    <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                                        SELL
                                    </span>
                                    <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-2.5 py-1 text-xs font-semibold text-yellow-400">
                                        NEUTRAL
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </section>
    );
}
