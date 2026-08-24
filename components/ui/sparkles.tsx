"use client"

import Particles, {
  ParticlesProvider,
  useParticlesProvider,
} from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import { useReducedMotion } from "framer-motion"
import { useId } from "react"

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

  const defaultOptions = {
    background: {
      color: { value: background },
    },
    fullScreen: {
      enable: false,
      zIndex: 1,
    },
    fpsLimit: 60,
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

  return (
    <ParticlesProvider init={loadSlim}>
      <SparklesInner id={id} particlesOptions={merged} className={className} />
    </ParticlesProvider>
  )
}
