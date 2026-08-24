"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Reveal, RevealGroup,revealItem } from "@/components/ui/reveal";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Everything included:",
  "Invite-only TradingView indicator access",
  "Unlimited AI chart analysis",
  "AI trading assistant chat",
  "Pattern recognition & signal detection",
  "Entry, target, and stop-loss levels",
  "Trade journal & risk calculator, included free",
  "Priority support",
  "Early feature access",
];

const plans = [
  {
    name: "EntrixAlgo PRO™ Monthly",
    description: "Billed monthly. Cancel anytime.",
    price: 49,
    period: "month" as const,
    buttonText: "Get started",
    popular: false,
    buttonHref: "https://buy.stripe.com/4gMcMYeZkeoI5Pibz26wE04",
  },
  {
    name: "EntrixAlgo PRO™ Lifetime",
    description: "One-time payment. Yours forever, no renewals.",
    price: 299,
    period: "lifetime" as const,
    buttonText: "Get lifetime access",
    popular: true,
    buttonHref: "https://buy.stripe.com/00w14geZkdkE6Tm1Ys6wE0a",
  },
];

export default function PricingSection4() {
  const { data: session, status } = useSession();

  const getCheckoutHref = (baseHref: string) => {
    if (status !== "authenticated" || !session?.user?.email) {
      return "/sign-in?callbackUrl=%2F%23pricing";
    }
    const params = new URLSearchParams({
      client_reference_id: session.user.id,
      prefilled_email:     session.user.email,
    });
    return `${baseHref}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen mx-auto relative overflow-x-hidden">
      {/* Sparkles background — grid comes from body via globals.css */}
      <div className="absolute top-0 h-96 w-full overflow-hidden [mask-image:radial-gradient(50%_50%,white,transparent)]">
        <SparklesComp
          density={150}
          direction="bottom"
          speed={0.8}
          color="#FFFFFF"
          className="absolute inset-x-0 bottom-0 h-full w-full [mask-image:radial-gradient(50%_50%,white,transparent_85%)]"
        />
      </div>

      {/* Purple glow ellipse */}
      <div className="absolute left-0 top-[-114px] w-full h-[60vh] pointer-events-none z-0 overflow-hidden">
        <div
          className="absolute left-[-30%] right-[-30%] top-0 h-[800px] rounded-full"
          style={{
            border: "150px solid rgba(147,51,234,0.4)",
            filter: "blur(80px)",
            WebkitFilter: "blur(80px)",
          }}
        />
      </div>

      {/* Heading */}
      <Reveal className="text-center mb-6 pt-12 sm:pt-24 md:pt-32 max-w-3xl mx-auto space-y-4 relative z-30 px-6">
        <article>
          <h2 className="from-foreground to-foreground dark:to-brand bg-linear-to-r bg-clip-text text-4xl font-extrabold text-transparent drop-shadow-[0_0_24px_var(--brand-foreground)] sm:font-bold sm:text-5xl md:text-6xl pb-2">
            Accelerate your trading potential, today.
          </h2>

          <p className="text-gray-400 text-base mt-4">
            Trusted by traders worldwide. One plan, full access. Choose monthly or lifetime billing.
          </p>

          {/* Social proof strip */}
          <div className="mx-auto mt-4 flex w-fit flex-wrap items-center justify-center gap-4 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-gray-300 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              <span><span className="font-semibold text-white">4.8/5</span> · 52+ verified reviews</span>
            </div>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-1.5">
              <Users className="size-4 text-purple-400" />
              <span><span className="font-semibold text-white">5,000+</span> traders</span>
            </div>
          </div>
        </article>
      </Reveal>

      {/* Radial purple overlay */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 80% at 50% 30%, #6d28d9 0%, transparent 100%)",
          opacity: 0.25,
          mixBlendMode: "screen",
        }}
      />

      {/* Pricing cards */}
      <RevealGroup className="grid md:grid-cols-2 max-w-4xl gap-6 py-6 mx-auto px-4" stagger={0.12}>
        {plans.map((plan) => (
          <motion.div key={plan.name} variants={revealItem}>
            <Card
              className={cn(
                "relative text-white h-full",
                plan.popular
                  ? "border-purple-500/40 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[0px_-8px_120px_0px_rgba(147,51,234,0.5)] z-20"
                  : "border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 z-10"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30">
                  <span className="bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full border border-purple-400 shadow-lg shadow-purple-900/50">
                    Best Value
                  </span>
                </div>
              )}

              <CardHeader className="text-left pt-8">
                <h3 className="text-2xl font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    $
                    <NumberFlow value={plan.price} className="text-4xl font-bold" />
                  </span>
                  <span className="text-gray-400 text-sm">
                    {plan.period === "lifetime" ? "one-time" : `/${plan.period}`}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <a
                  href={getCheckoutHref(plan.buttonHref)}
                  className={cn(
                    "w-full mb-6 p-3.5 text-base font-semibold rounded-xl text-center block transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                    plan.popular
                      ? "bg-gradient-to-b from-purple-500 to-purple-700 shadow-lg shadow-purple-900/50 border border-purple-400/50 text-white"
                      : "bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-lg shadow-neutral-950 border border-neutral-700 text-white"
                  )}
                >
                  {plan.buttonText}
                </a>

                <div className="space-y-3 pt-4 border-t border-neutral-700/60">
                  <h4 className="font-semibold text-sm text-white mb-3">
                    {FEATURES[0]}
                  </h4>
                  <ul className="space-y-2.5">
                    {FEATURES.slice(1).map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2.5"
                      >
                        <span className="h-1.5 w-1.5 bg-purple-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </RevealGroup>

      {/* Bottom note */}
      <p className="text-center text-xs text-gray-500 pb-16 px-4">
        Monthly cancels anytime · Lifetime is a one-time payment. Prices in USD.
      </p>
    </div>
  );
}
