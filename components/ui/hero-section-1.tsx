"use client"

import { AnimatePresence, motion, type Variants } from "framer-motion"
import { ArrowRight, Gift, Menu, Users, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"

import { AnimatedGroup } from "@/components/ui/animated-group"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Banner } from "@/components/ui/banner"
import { DecorBoundary } from "@/components/ui/decor-boundary"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { StardustButton } from "@/components/ui/stardust-button"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
]

// Plain stand-in for the shader button if it ever fails to render
function MetalButton(props: React.ComponentProps<typeof LiquidMetalButton> & { href: string; label: string }) {
  return (
    <DecorBoundary
      name="liquid-metal-button"
      fallback={
        <Link
          href={props.href}
          onClick={props.onClick}
          className={cn(
            "inline-flex h-[38px] items-center justify-center rounded-full border border-purple-400/40 bg-[#0d0d1c] px-6 text-[13px] font-medium text-[#ece7fb] transition-colors hover:border-purple-400/70",
            props.className,
          )}
        >
          {props.label}
        </Link>
      }
    >
      <LiquidMetalButton {...props} />
    </DecorBoundary>
  )
}

const Logo = () => (
  <Link href="/" className="flex items-center gap-2">
    <Image
      src="/logo_transparent.png"
      alt="EntrixAlgo logo"
      width={28}
      height={28}
      className="size-7 object-contain"
    />
    <span className="text-xl font-bold tracking-tight">
      Entrix<span className="text-purple-400">Algo</span>
    </span>
  </Link>
)

function HeroHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex flex-col">
      {/* The free analysis offer. A new id, so it also shows for visitors who
          closed the earlier launch banner. */}
      <DecorBoundary name="launch-banner">
      <Banner
        id="entrix-free-analysis-banner"
        variant="rainbow"
        height="2.75rem"
        rainbowColors={[
          "rgba(231,77,255,0.77)",
          "rgba(231,77,255,0.77)",
          "transparent",
          "rgba(231,77,255,0.77)",
          "transparent",
          "rgba(231,77,255,0.77)",
          "transparent",
        ]}
        className="border-b border-white/15 whitespace-nowrap pl-4 pr-11 text-xs sm:whitespace-normal sm:px-4 sm:text-sm"
      >
        <Gift className="mr-1.5 size-3.5 shrink-0 text-emerald-300 sm:mr-2 sm:size-4" aria-hidden="true" />
        <span className="sm:hidden">First AI chart analysis free</span>
        <span className="hidden sm:inline">Your first AI chart analysis is free. No card required.</span>
        <Link
          href={isAuthed ? "/dashboard/chart-analysis" : "/sign-up"}
          className="ml-2 inline-flex min-h-11 items-center gap-1 font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 sm:ml-3"
        >
          <span className="sm:hidden">Try it</span>
          <span className="hidden sm:inline">Try it free</span>
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      </Banner>
      </DecorBoundary>
      <div className="relative flex justify-center px-4 pt-3">
      <nav
        className={cn(
          "flex w-full max-w-6xl items-center justify-between rounded-2xl border px-4 transition-all duration-300 lg:px-8",
          isScrolled
            ? "border-white/35 bg-black/80 py-3 shadow-lg backdrop-blur-md"
            : "border-white/10 bg-transparent py-4"
        )}
      >
        <Logo />

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-gray-300 transition-colors hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          {isAuthed ? (
            <MetalButton href="/dashboard" label="Dashboard" size="sm" />
          ) : (
            <MetalButton href="/sign-in" label="Sign In" size="sm" />
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex size-11 items-center justify-center text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown: anchored under the nav (not a fixed offset), so it
          never covers the close button whether or not the banner is shown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-4 top-full mt-2 rounded-2xl border border-white/25 bg-black/95 px-6 py-5 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="py-1 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex flex-col gap-3 border-t border-white/15 pt-3">
                <MetalButton
                  href={isAuthed ? "/dashboard" : "/sign-in"}
                  label={isAuthed ? "Dashboard" : "Sign In"}
                  size="sm"
                  className="mx-auto"
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </header>
  )
}

// Shared by the headline and its glow layer, so both lay out identically
const HEADLINE_CLASS = "text-balance text-5xl font-black tracking-tight sm:text-6xl md:text-7xl xl:text-[5.25rem]"

// Fade and rise for the dashboard mockup. No blur: an animated blur would be
// recomputed every frame for 1.5s, right while the page is still loading.
const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      y: 12,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
}

export function HeroSection() {
  const { status } = useSession()
  const isAuthed = status === "authenticated"

  return (
    <>
      <HeroHeader />
      <section className="relative overflow-hidden bg-black">
        {/* Animated gradient background — static orbs, no mouse interaction */}
        <BackgroundGradientAnimation containerClassName="absolute inset-0 z-0" />

        {/* Top vignette: keeps the fixed navbar area pitch black */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-80 bg-gradient-to-b from-black via-black/85 to-transparent"
        />

        {/* Bottom vignette: smooth transition into the next black section */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[28rem] bg-gradient-to-t from-black via-black/90 to-transparent"
        />

        {/* Content */}
        <div className="relative z-[3] pt-40 md:pt-52">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
              {/* Badge, headline, sub-line and buttons are plain markup: they are
                  in the first paint, before any script has loaded. Only the
                  dashboard mockup below still animates in. */}
              <div>
                {/* Social-proof badge: 1px animated gradient outline around a dark pill */}
                <Link
                  href="#pricing"
                  aria-label="Join 5,000+ traders using EntrixAlgo, see pricing"
                  className="group relative mx-auto flex w-fit rounded-full bg-[linear-gradient(90deg,#a855f7,#e879f9,#fbbf24,#e879f9,#a855f7)] bg-[length:200%_100%] p-px shadow-[0_0_28px_-6px_rgba(192,38,211,0.55)] transition-shadow duration-300 hover:shadow-[0_0_36px_-4px_rgba(192,38,211,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-safe:animate-border-flow"
                >
                  <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-[#12061f] py-1 pl-1 pr-1 transition-colors duration-300 group-hover:bg-[#1a0a2c] sm:gap-3">
                    {/* Count chip */}
                    <span className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-500 px-2.5 py-1 text-xs font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] sm:text-sm">
                      <Users className="size-3.5" aria-hidden="true" />
                      5,000+
                    </span>

                    <span className="text-[13px] font-medium text-gray-200 sm:text-sm">
                      traders <span className="hidden sm:inline">already </span>using{" "}
                      <span className="bg-gradient-to-r from-fuchsia-300 to-amber-200 bg-clip-text font-semibold text-transparent">EntrixAlgo</span>
                    </span>

                    {/* Sliding arrow */}
                    <span className="size-6 shrink-0 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 transition-colors duration-500 group-hover:bg-gradient-to-r group-hover:from-purple-500 group-hover:to-fuchsia-500">
                      <span className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0" aria-hidden="true">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3 text-white" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3 text-white" />
                        </span>
                      </span>
                    </span>
                  </span>
                </Link>

                {/* Main headline. The glow is two layers: a steady one on the
                    headline itself, and a wider, brighter halo behind it whose
                    opacity breathes. Only that opacity animates, so the glow
                    is drawn once instead of being recomputed every frame. */}
                <div className="relative mx-auto mt-8 max-w-4xl lg:mt-16">
                  <div
                    aria-hidden="true"
                    className={cn(HEADLINE_CLASS, "pointer-events-none absolute inset-0 select-none text-transparent opacity-50 motion-safe:animate-glow-breathe")}
                    style={{
                      WebkitTextFillColor: "transparent",
                      textShadow: "0 0 56px rgba(131,80,232,0.6), 0 0 22px rgba(185,55,255,0.34)",
                    }}
                  >
                    <span className="font-semibold">Trade Smarter with</span>
                    <br />
                    <span className="font-black">AI-Powered Precision</span>
                  </div>
                  <h1
                    className={cn(HEADLINE_CLASS, "relative")}
                    style={{
                      filter: [
                        "drop-shadow(0 0 28px rgba(131,80,232,0.45))",
                        "drop-shadow(0 0 10px rgba(185,55,255,0.22))",
                        "drop-shadow(0 4px 10px rgba(0,0,0,0.6))",
                      ].join(" "),
                    }}
                  >
                    <span
                      className="font-semibold"
                      style={{
                        backgroundImage:
                          "linear-gradient(135deg, #ffffff 0%, #f5f0ff 55%, #d8b4fe 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }}
                    >
                      Trade Smarter with
                    </span>
                    <br />
                    <span
                      className="font-black"
                      style={{
                        WebkitTextFillColor: "white",
                        color: "white",
                        textShadow: [
                          "0 0 1px rgba(255,255,255,0.9)",
                          "0 0 1px rgba(255,255,255,0.9)",
                          "0 0 4px rgba(255,255,255,0.5)",
                          "0 0 24px rgba(216,180,254,0.5)",
                        ].join(", "),
                      }}
                    >
                      AI-Powered Precision
                    </span>
                  </h1>
                </div>

                {/* Subtext */}
                <p className="mx-auto mt-8 max-w-2xl text-balance text-sm text-muted-foreground sm:text-lg">
                  <span className="sm:hidden">
                    Professionally designed private AI trading algorithm that elevates your trading. Join thousands of traders using EntrixAlgo.
                  </span>
                  <span className="hidden sm:inline">
                    Professionally designed private AI trading algorithm that elevates your trading with precise, easy-to-read signals. Join thousands of traders using EntrixAlgo.
                  </span>
                </p>
              </div>

              {/* CTA buttons */}
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                {isAuthed ? (
                  <StardustButton href="/dashboard" mobileSize="md">Dashboard</StardustButton>
                ) : (
                  <>
                    <StardustButton href="#pricing" mobileSize="md">Get Access</StardustButton>
                    <StardustButton href="/sign-in" mobileSize="md">Login</StardustButton>
                  </>
                )}
              </div>

              {/* The free analysis, right under the buttons. Same green as the
                  offer inside the dashboard. A quiet text link, so the buttons
                  stay the main action; the padding makes it a full tap target.
                  The slot keeps its height when the line is hidden (signed in),
                  so the mockup below doesn't jump once the session loads. */}
              <div className="mt-2 min-h-10 sm:min-h-11">
                {!isAuthed && (
                  <Link
                    href="/sign-up"
                    className="group mx-auto block w-fit rounded-full px-3 py-3 text-balance text-xs text-gray-400 transition-colors hover:text-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/60 sm:text-sm"
                  >
                    <Gift className="mr-1.5 inline size-3.5 align-[-2px] text-emerald-400 sm:size-4 sm:align-[-3px]" aria-hidden="true" />
                    <span className="font-medium text-emerald-300 underline-offset-4 group-hover:underline">
                      <span className="sm:hidden">First AI chart analysis free</span>
                      <span className="hidden sm:inline">Your first AI chart analysis is free.</span>
                    </span>
                    <span className="sm:hidden"> · No card required</span>
                    <span className="hidden sm:inline"> No card required.</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Dashboard mockup: the one hero element that still animates in */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                },
              },
              ...transitionVariants,
            }}
          >
            <div className="relative mt-8 overflow-hidden px-2 sm:mt-12 md:mt-20">
              <div
                aria-hidden="true"
                className="absolute inset-0 z-10 bg-gradient-to-b from-transparent from-[35%] to-black"
              />
              <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-zinc-950/15 ring-1 ring-background">
                <Image
                  className="relative rounded-2xl"
                  src="/dashboard.png"
                  alt="EntrixAlgo trading dashboard"
                  width={1876}
                  height={1175}
                  // The frame is at most 1120px wide (max-w-6xl minus its padding)
                  // and nearly full width below that. Without this hint a phone
                  // was sent the full 1876px file for a 330px slot.
                  sizes="(min-width: 1200px) 1120px, calc(100vw - 48px)"
                  priority
                />
              </div>
            </div>
          </AnimatedGroup>
        </div>
      </section>
    </>
  )
}
