"use client"

import { AnimatePresence, motion, type Variants } from "framer-motion"
import { ArrowRight, Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useSession } from "next-auth/react"
import React, { useEffect, useState } from "react"

import { AnimatedGroup } from "@/components/ui/animated-group"
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation"
import { Banner } from "@/components/ui/banner"
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button"
import { StardustButton } from "@/components/ui/stardust-button"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
]

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

export function HeroHeader() {
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
      <Banner
        id="entrix-launch-banner"
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
        className="border-b border-white/5 whitespace-nowrap pl-4 pr-11 text-xs sm:whitespace-normal sm:px-4 sm:text-sm"
      >
        <span className="sm:hidden">🚀 EntrixAlgo is evolving.</span>
        <span className="hidden sm:inline">🚀 EntrixAlgo is evolving. New features coming soon.</span>{" "}
        <a href="#pricing" className="ml-1 underline underline-offset-2 opacity-80 hover:opacity-100">
          Get early access →
        </a>
      </Banner>
      <div className="flex justify-center px-4 pt-3">
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
            <LiquidMetalButton href="/dashboard" label="Dashboard" size="sm" />
          ) : (
            <LiquidMetalButton href="/sign-in" label="Sign In" size="sm" />
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex size-11 items-center justify-center text-white md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-4 top-[72px] rounded-2xl border border-white/10 bg-black/95 px-6 py-5 backdrop-blur-sm md:hidden"
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
              <div className="flex flex-col gap-3 border-t border-white/10 pt-3">
                <LiquidMetalButton
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

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
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
              <AnimatedGroup variants={transitionVariants}>
                {/* Announcement badge */}
                <Link
                  href="#pricing"
                  className="hover:bg-background dark:hover:border-t-border bg-[#1e0938] group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:shadow-zinc-950"
                >
                  <span className="text-foreground text-sm">
                    Join 5,000+ traders using EntrixAlgo
                  </span>
                  <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700" />
                  <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                    <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                      <span className="flex size-6">
                        <ArrowRight className="m-auto size-3" />
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Main headline */}
                <h1
                  className="mx-auto mt-8 max-w-4xl text-balance text-6xl font-black tracking-tight md:text-7xl lg:mt-16 xl:text-[5.25rem] animate-glow-pulse"
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

                {/* Subtext */}
                <p className="mx-auto mt-8 max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
                  <span className="sm:hidden">
                    Professionally designed AI-based TradingView algorithm that elevates your trading. Join thousands of traders using EntrixAlgo.
                  </span>
                  <span className="hidden sm:inline">
                    Professionally designed AI-based TradingView algorithm that elevates your trading with precise, easy-to-read signals. Join thousands of traders using EntrixAlgo.
                  </span>
                </p>
              </AnimatedGroup>

              {/* CTA buttons */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: { staggerChildren: 0.05, delayChildren: 0.75 },
                    },
                  },
                  ...transitionVariants,
                }}
                className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
              >
                <StardustButton href={isAuthed ? "/dashboard" : "#pricing"}>
                  {isAuthed ? "Dashboard" : "Get Access"}
                </StardustButton>
              </AnimatedGroup>
            </div>
          </div>

          {/* Dashboard mockup */}
          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.75 },
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
