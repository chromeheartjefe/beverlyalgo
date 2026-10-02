"use client"

import Particles, {
  ParticlesProvider,
  useParticlesProvider,
} from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useReducedMotion } from "framer-motion"
import { useId, useSyncExternalStore } from "react"

// tsparticles 4 draws on an OffscreenCanvas and throws ("OffscreenCanvas is
// required but not supported by this browser") where a canvas can't be handed
// over to one: Safari and iOS before 16.4, older in-app browsers. Its React
// wrapper doesn't catch that, so it reached Sentry as an unhandled rejection.
// The sparkles are decoration, so those browsers simply go without them (and
// never load the particle engine). False on the server and for the first
// client render, which is also what the server sends: nothing.
const noopSubscribe = () => () => {}
const canDrawParticles = () =>
  typeof HTMLCanvasElement !== "undefined" && typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function"

interface SparklesProps {
  className?: string
  size?: number
  minSize?: number | null
  density?: number
  speed?: number
  minSpeed?: number | null
  opacity?: number
  opacitySpeed?: number
  minOpacity?: number | null
  color?: string
  background?: string
  direction?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>
}

// Inner component: consumes ParticlesProvider context
function SparklesInner({
  id,
  particlesOptions,
  className,
}: {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  particlesOptions: Record<string, any>
  className?: string
}) {
  const { loaded } = useParticlesProvider()
  if (!loaded) return null

  return (
    <Particles
      id={id}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options={particlesOptions as any}
      className={className}
    />
  )
}

export function Sparkles({
  className,
  size = 1,
  minSize = null,
  density = 800,
  speed = 1,
  minSpeed = null,
  opacity = 1,
  opacitySpeed = 3,
  minOpacity = null,
  color = "#FFFFFF",
  background = "transparent",
  direction = "none",
  options = {},
}: SparklesProps) {
  const id = useId()
  const shouldReduceMotion = useReducedMotion()
  const supported = useSyncExternalStore(noopSubscribe, canDrawParticles, () => false)

  const defaultOptions = {
    background: {
      color: { value: background },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 60,
    // Stop drawing while the sparkles are scrolled out of view. tsparticles
    // only watches the viewport when interactivity is bound to an element:
    // with the default ("window") it never pauses, so bind it to the canvas.
    // (No hover/click effects are configured, so nothing else changes.)
    pauseOnOutsideViewport: true,
    interactivity: { detectsOn: "canvas" },
    particles: {
      color: { value: color },
      move: {
        // Particles stay put (but still visible) for users who prefer reduced motion.
        enable: !shouldReduceMotion,
        direction,
        speed: {
          min: minSpeed ?? speed / 10,
          max: speed,
        },
        straight: false,
      },
      number: { value: density },
      opacity: {
        value: {
          min: minOpacity ?? opacity / 10,
          max: opacity,
        },
        animation: {
          enable: !shouldReduceMotion,
          sync: false,
          speed: opacitySpeed,
        },
      },
      size: {
        value: {
          min: minSize ?? size / 2.5,
          max: size,
        },
      },
    },
    detectRetina: true,
  }

  const merged = { ...defaultOptions, ...options }

  if (!supported) return null

  return (
    <ParticlesProvider init={loadSlim}>
      <SparklesInner id={id} particlesOptions={merged} className={className} />
    </ParticlesProvider>
  )
}
