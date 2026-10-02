import { ReactNode } from "react";

import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { SupportEmail } from "@/components/ui/support-email"

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
  /** No background of its own: the landing paints one shared background behind FAQ and footer */
  bare?: boolean;
}

export default function FAQ({
  title = "Frequently Asked Questions",
  items = [
    {
      question: "What is EntrixAlgo, exactly?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            EntrixAlgo is a web dashboard for traders that you can sign in to from any browser, desktop or mobile.
            It bundles AI chart analysis, an AI screener, a trade journal, and a risk calculator, plus an AI trading assistant to chat with and a free trading course.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[640px] text-balance">
            Pro also includes invite-only access to our TradingView indicator, if you want signals painted directly on your own charts too.
          </p>
        </>
      ),
    },
    {
      question: "Can I try it for free?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Yes. Every free account includes one AI chart analysis, no card required.
            Sign up, verify your email, and upload a chart to get the full result with entry, target, and stop-loss levels.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            The AI screener, trade journal, trade calendar, risk calculator, and Entrix Academy stay free for everyone, no subscription needed.
          </p>
        </>
      ),
    },
    {
      question: "How is this different from asking ChatGPT about my chart?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            ChatGPT is a general chatbot. It was not built for trading, and it can give you a different answer every time you ask.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            EntrixAlgo runs on our own private trading algorithm, designed specifically for reading charts.
            You will not find it in ChatGPT or anywhere else, only inside your EntrixAlgo dashboard.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Every chart goes through the same checks on trend, market structure, and liquidity, so you get a clear signal
            with entry, target, and stop-loss levels instead of a generic opinion.
          </p>
        </>
      ),
    },
    {
      question: "Can I use EntrixAlgo for crypto and stocks?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[600px]">
            Yes. Upload a screenshot of any chart (crypto, stocks, ETFs, or indices) and the AI reads it, no matter where the chart came from.
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
            The AI screener, trade journal, trade calendar, risk calculator, and Entrix Academy are free for everyone, no subscription needed.
          </p>
        </>
      ),
    },
    {
      question: "Can I cancel anytime?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Yes. You can cancel anytime from the Settings page in your dashboard, and you keep Pro until the end of the period you already paid for.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            Lifetime is a one-time payment, so there is nothing to renew or cancel.
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
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            No. The interface is user-friendly, and every free account includes Entrix Academy, a full trading course with 129 lessons that takes you from the basics to market structure and risk management.
          </p>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
            EntrixAlgo is still an analysis tool, not an autopilot system.
            Understanding market structure, risk management, and trading psychology will help you get the most value from it.
          </p>
        </>
      ),
    },
    {
      question: "Is this a fully automated trading bot?",
      answer: (
        <>
          <p className="text-muted-foreground mb-4 max-w-[580px]">
          No, EntrixAlgo does not place trades for you. Chart analysis, the indicator, and the AI assistant all surface information and signals, while you remain in full control of when and how you execute trades.
          </p>
        </>
      ),
    },
    {
      question: "How do I contact support?",
      answer: (
        <p className="text-muted-foreground mb-4 max-w-[580px]">
          Email us at{" "}
          <SupportEmail />{" "}
          with any question about your account, billing, or the tools. Include the email you signed up with so we can find your account quickly.
        </p>
      ),
    },
  ],
  className,
  bare = false,
}: FAQProps) {
  return (
    <Section className={`relative ${bare ? "[--line-width:0px]" : "overflow-hidden bg-black"} ${className ?? ""}`}>
      {!bare && (
        <>
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
        </>
      )}

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
