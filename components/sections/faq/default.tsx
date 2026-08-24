import { ReactNode } from "react";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Section } from "../../ui/section";

interface FAQItemProps {
  question: string;
  answer: ReactNode;
  value?: string;
}

interface FAQProps {
  title?: string;
  items?: FAQItemProps[] | false;
  className?: string;
}

export default function FAQ({
  title = "Frequently Asked Questions",
  items = [
    {
      question: "What is EntrixAlgo, exactly?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            EntrixAlgo is a web dashboard for traders — sign in from any browser, desktop or mobile.
            It bundles AI chart analysis, a trade journal, and a risk calculator, plus an AI trading assistant to chat with.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Pro also includes invite-only access to our TradingView indicator, if you want signals painted directly on your own charts too.
          </p>
        </>
      ),
    },
    {
      question: "Can I use EntrixAlgo for crypto and stocks?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Yes. Upload a screenshot of any chart — crypto, stocks, ETFs, or indices — and the AI reads it, no matter where the chart came from.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            It adapts well to different timeframes and asset classes.
          </p>
        </>
      ),
    },
    {
      question: "What's included with my subscription?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Pro includes unlimited AI chart analysis, the AI trading assistant, and invite-only access to our TradingView indicator.
            Trade journal and risk calculator are free for everyone, no subscription needed.
          </p>
        </>
      ),
    },
    {
      question: 'Can I lose money using EntrixAlgo?',
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Absolutely.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Losses are a natural part of trading. No tool can eliminate risk.
            EntrixAlgo is designed to support your analysis and improve decision-making, but it does not guarantee profits.
            Markets are unpredictable, and outcomes depend on your strategy, discipline, and risk management.
          </p>
        </>
      ),
    },
    {
      question: "Do I need trading experience to use EntrixAlgo?",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          While the interface is user-friendly, trading experience is recommended. EntrixAlgo is an analysis tool, not a trading course or autopilot system.
          Understanding market structure, risk management, and trading psychology will help you get the most value from it.
        </p>
      ),
    },
    {
      question: "Is this a fully automated trading bot?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
          No, EntrixAlgo does not place trades for you. Chart analysis, the indicator, and the AI assistant all surface information and signals — you remain in full control of when and how you execute trades.
          </p>
        </>
      ),
    },
  ],
  className,
}: FAQProps) {
  return (
    <Section className={`relative overflow-hidden bg-black ${className ?? ""}`}>
      {/* Animated gradient background */}
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
      <div className="relative z-[3] max-w-container mx-auto flex flex-col items-center gap-8">
        <h2 className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-center text-3xl font-extrabold text-transparent drop-shadow-[0_0_24px_var(--brand-foreground)] sm:text-5xl pb-2">
          {title}
        </h2>
        {items !== false && items.length > 0 && (
          <Accordion type="single" collapsible className="w-full max-w-[800px] px-3 sm:px-0">
            {items.map((item, index) => (
              <AccordionItem
                key={index}
                value={item.value || `item-${index + 1}`}
              >
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Section>
  );
}
