"use client";

import NumberFlow from "@number-flow/react";
import { motion } from "framer-motion";
import { Star, Users } from "lucide-react";
import { useSession } from "next-auth/react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Reveal, RevealGroup,revealItem } from "@/components/ui/reveal";
import { Sparkles as SparklesComp } from "@/components/ui/sparkles";
import { cn } from "@/lib/utils";

const PRO_FEATURES = [
  "Everything included:",
  "Invite-only TradingView indicator access",
  "Unlimited AI chart analysis",
  "AI trading assistant chat",
  "Pattern recognition & signal detection",
  "Entry, target, and stop-loss levels",
  "AI Screener, trade journal, trade calendar & risk calculator, included free",
  "Priority support",
  "Early feature access",
];

// The Free plan's first line is the hook: one real Chart Analysis before paying
const FREE_FEATURES = [
  "Free forever:",
  "1 AI chart analysis, on us",
  "AI Screener",
  "Trade journal",
  "Trade calendar",
  "Risk calculator",
  "No card required",
];

type Plan = {
  name: string
  description: string
  price: number
  period: "month" | "lifetime" | "free"
  buttonText: string
  popular: boolean
  // Stripe Payment Link; null for Free (account sign-up instead)
  buttonHref: string | null
  features: string[]
}

const plans: Plan[] = [
  {
    name: "EntrixAlgo Free",
    description: "Try the AI on your own chart and use the trading tools. Upgrade whenever you want.",
    price: 0,
    period: "free",
    buttonText: "Create free account",
    popular: false,
    buttonHref: null,
    features: FREE_FEATURES,
  },
  {
    name: "EntrixAlgo PRO™ Monthly",
    description: "Billed monthly. Cancel anytime.",
    price: 49,
    period: "month",
    buttonText: "Get started",
    popular: false,
    buttonHref: "https://buy.stripe.com/4gMcMYeZkeoI5Pibz26wE04",
    features: PRO_FEATURES,
  },
  {
    name: "EntrixAlgo PRO™ Lifetime",
    description: "One-time payment. Yours forever, no renewals.",
    price: 299,
    period: "lifetime",
    buttonText: "Get lifetime access",
    popular: true,
    buttonHref: "https://buy.stripe.com/00w14geZkdkE6Tm1Ys6wE0a",
    features: PRO_FEATURES,
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

  // Free: make an account, or go straight in when already signed in
  const hrefFor = (plan: Plan) =>
    plan.buttonHref ? getCheckoutHref(plan.buttonHref) : status === "authenticated" ? "/dashboard" : "/sign-up";
  const labelFor = (plan: Plan) =>
    !plan.buttonHref && status === "authenticated" ? "Go to dashboard" : plan.buttonText;

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
            Trusted by traders worldwide. Start free with one AI chart analysis, then unlock everything
            with Pro, billed monthly or once for life.
          </p>

          {/* Social proof strip */}
          {/* One line on phones: smaller text, icons and padding below sm */}
          <div className="mx-auto mt-4 flex w-fit flex-nowrap items-center justify-center gap-2.5 whitespace-nowrap rounded-full border border-white/25 bg-white/[0.03] px-3 py-2 text-[11px] text-gray-300 min-[380px]:gap-3 min-[380px]:px-4 min-[380px]:text-xs sm:gap-6 sm:px-5 sm:py-2.5 sm:text-sm">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400 sm:size-4" />
              <span><span className="font-semibold text-white">4.8/5</span> · 52+ verified reviews</span>
            </div>
            <div className="hidden h-4 w-px bg-white/10 sm:block" />
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Users className="size-3.5 shrink-0 text-purple-400 sm:size-4" />
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
      {/* Free spans both columns at md, three across from lg. From md up each
          card is a 3-row subgrid (header / button / features) of this grid, so
          the buttons line up even when a title or description wraps to more
          lines in one card than another. */}
      <RevealGroup className="grid md:grid-cols-2 lg:grid-cols-3 max-w-6xl gap-6 py-6 mx-auto px-4" stagger={0.12}>
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            variants={revealItem}
            className={cn("md:row-span-3 md:grid md:grid-rows-subgrid md:gap-y-0", plan.period === "free" && "md:col-span-2 lg:col-span-1")}
          >
            <Card
              className={cn(
                "relative text-white h-full md:row-span-3 md:grid md:grid-rows-subgrid md:gap-y-0",
                plan.popular
                  ? "border-purple-500/40 bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[0px_-8px_120px_0px_rgba(147,51,234,0.5)] z-20"
                  : "border-white/25 bg-gradient-to-b from-neutral-900 to-neutral-950 z-10"
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
                    {plan.period === "lifetime" ? "one-time" : plan.period === "free" ? "forever" : `/${plan.period}`}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0 pb-0">
                <a
                  href={hrefFor(plan)}
                  className={cn(
                    "w-full mb-6 p-3.5 text-base font-semibold rounded-xl text-center block transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                    plan.popular
                      ? "bg-gradient-to-b from-purple-500 to-purple-700 shadow-lg shadow-purple-900/50 border border-purple-400/50 text-white"
                      : "bg-gradient-to-b from-neutral-700 to-neutral-900 shadow-lg shadow-neutral-950 border border-white/20 text-white"
                  )}
                >
                  {labelFor(plan)}
                </a>
              </CardContent>

              <CardContent className="pt-0">
                <div className="space-y-3 pt-4 border-t border-white/15">
                  <h4 className="font-semibold text-sm text-white mb-3">
                    {plan.features[0]}
                  </h4>
                  <ul className="space-y-2.5">
                    {plan.features.slice(1).map((feature, featureIndex) => {
                      // The free analysis is the Free plan's headline, in the green used for it in the dashboard
                      const highlight = plan.period === "free" && featureIndex === 0
                      return (
                        <li
                          key={featureIndex}
                          className="flex items-center gap-2.5"
                        >
                          <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", highlight ? "bg-emerald-400" : "bg-purple-500")} />
                          <span className={cn("text-sm", highlight ? "font-semibold text-emerald-300" : "text-gray-300")}>{feature}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </RevealGroup>

      {/* Bottom note */}
      <p className="text-center text-xs text-gray-500 pb-16 px-4">
        Free needs no card · Monthly cancels anytime · Lifetime is a one-time payment. Prices in USD.
      </p>
    </div>
  );
}
