"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { Reveal, RevealGroup,revealItem } from "@/components/ui/reveal";

import { Badge } from "../../ui/badge";
import { Section } from "../../ui/section";

interface LogosProps {
  title?: string;
  description?: string;
  badge?: ReactNode | false;
  className?: string;
}

interface Backtest {
  pair:          string;
  image:         string;
  width:         number;
  height:        number;
  pnl:           string;
  drawdown:      string;
  winRate:       string;
  winRecord:     string;
  profitFactor:  string;
}

const BACKTESTS: Backtest[] = [
  {
    pair: "BTC/USDT", image: "/backtest1.png", width: 1755, height: 1033,
    pnl: "+57,288", drawdown: "17,626", winRate: "77.56%", winRecord: "121 / 156 trades", profitFactor: "2.912",
  },
  {
    pair: "ETH/USDT", image: "/backtest3.png", width: 1753, height: 1039,
    pnl: "+62,608", drawdown: "16,462", winRate: "70.27%", winRecord: "78 / 111 trades", profitFactor: "2.733",
  },
  {
    pair: "SOL/USDT", image: "/backtest2.png", width: 1750, height: 1039,
    pnl: "+35,143", drawdown: "12,087", winRate: "69.92%", winRecord: "93 / 133 trades", profitFactor: "2.874",
  },
  {
    pair: "XRP/USDT", image: "/backtest4.png", width: 1760, height: 1020,
    pnl: "+11,187", drawdown: "3,053", winRate: "79.06%", winRecord: "68 / 86 trades", profitFactor: "2.822",
  },
];

function StatTile({
  label,
  value,
  unit,
  caption,
  accent,
}: {
  label: string
  value: string
  unit?: string
  caption?: string
  accent?: "emerald"
}) {
  return (
    <div className="flex flex-col justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <p className="whitespace-nowrap text-[10px] font-medium uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1.5 whitespace-nowrap text-lg font-semibold leading-none ${accent === "emerald" ? "text-emerald-400" : "text-white"}`}>
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-gray-500">{unit}</span>}
      </p>
      {caption && <p className="mt-1.5 whitespace-nowrap text-[11px] text-gray-500">{caption}</p>}
    </div>
  );
}

function BacktestCard({ backtest }: { backtest: Backtest }) {
  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-500/25 hover:shadow-[0_0_32px_-12px_rgba(147,51,234,0.45)]">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-sm font-semibold tracking-tight text-white">{backtest.pair}</span>
        <span className="text-xs text-gray-500">Aug 3 – 22, 2026</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile label="Total PnL" value={backtest.pnl} unit="USDT" accent="emerald" />
        <StatTile label="Max Drawdown" value={backtest.drawdown} unit="USDT" />
        <StatTile label="Win Rate" value={backtest.winRate} caption={backtest.winRecord} />
        <StatTile label="Profit Factor" value={backtest.profitFactor} />
      </div>

      {/* Backtest chart */}
      <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.06]">
        <Image
          src={backtest.image}
          alt={`${backtest.pair} strategy tester backtest`}
          width={backtest.width}
          height={backtest.height}
          className="w-full h-auto"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
      </div>
    </div>
  );
}

export default function Logos({
  title = "Results speak for themselves",
  description = "Four independent TradingView Strategy Tester backtests across BTC, ETH, SOL, and XRP — same signal engine every subscriber runs, unedited results over the same 19-day window.",
  badge = (
    <Badge variant="outline" className="border-brand/30 text-brand">
      Backtested · Aug 3 – 22, 2026
    </Badge>
  ),
  className,
}: LogosProps) {
  return (
    <Section className={`relative overflow-hidden bg-black ${className ?? ""}`}>
      {/* Animated gradient background — orbs drift in from the corners instead of the center */}
      <BackgroundGradientAnimation variant="corners" size="55%" containerClassName="absolute inset-0 z-0" />

      {/* Top vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-black via-black/60 to-transparent"
      />

      {/* Bottom vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-32 bg-gradient-to-t from-black via-black/60 to-transparent"
      />

      {/* Content */}
      <div className="relative z-[3] max-w-container mx-auto flex flex-col items-center gap-10 px-4">

        {/* Header */}
        <Reveal className="flex flex-col items-center gap-6 max-w-3xl text-center">
          {badge !== false && badge}

          <h2 className="text-3xl font-bold leading-tight sm:text-5xl">
            {title}
          </h2>

          {description && (
            <p className="text-muted-foreground text-base sm:text-xl leading-relaxed">
              {description}
            </p>
          )}
        </Reveal>

        {/* Backtest grid */}
        <RevealGroup className="grid w-full max-w-5xl grid-cols-1 gap-5 lg:grid-cols-2" stagger={0.1}>
          {BACKTESTS.map((backtest) => (
            <motion.div key={backtest.pair} variants={revealItem}>
              <BacktestCard backtest={backtest} />
            </motion.div>
          ))}
        </RevealGroup>

        <p className="max-w-2xl text-center text-xs text-gray-600">
          Past performance does not guarantee future results. All backtests run via TradingView&apos;s Strategy Tester on historical data.
        </p>

      </div>
    </Section>
  );
}
