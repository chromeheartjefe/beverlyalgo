"use client"

import { useReducedMotion } from "framer-motion"
import { useEffect, useRef } from "react"

// A night sky: stars that never move and only breathe, a soft halo on the
// brightest ones, and a shooting star now and then.
//
// Every star's place, size and rhythm comes from a fixed seed and is stored as
// a share of the area, so the sky is the same on every visit and survives
// resizing, minimising and re-renders (a particle engine re-scatters its
// particles when the window size passes through zero). One small canvas,
// drawn about 30 times a second (every frame while a shooting star is
// crossing), and only while it is on screen.

type Star = {
  x: number
  y: number
  r: number
  min: number
  max: number
  period: number
  phase: number
  color: string
  // 0 = none; the larger the star, the stronger its halo
  halo: number
  // Left out on phones, where the same sky is squeezed into a narrow strip
  wideOnly: boolean
}

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAR_COUNT = 340
// Mostly white, with the slight warm and cool tints real stars have
const TINTS = ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF", "#EDE9FE", "#EDE9FE", "#DCE9FF", "#FFEFD9"]

function makeStars(): Star[] {
  const rnd = seeded(20261003)
  const between = (a: number, b: number) => a + rnd() * (b - a)
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
  const stars: Star[] = []
  for (let i = 0; i < STAR_COUNT; i++) {
    // Sizes follow the sky: a crowd of pinpoints, fewer mid stars, a handful of bright ones
    const r = 0.35 + 1.95 * Math.pow(rnd(), 3.4)
    const big = clamp01((r - 0.35) / 1.95)
    // A third of the stars gather along a loose diagonal band, like the Milky Way
    let x = rnd()
    let y = rnd()
    if (rnd() < 0.33) {
      const along = rnd()
      x = along
      y = clamp01(0.2 + 0.55 * along + (rnd() + rnd() + rnd() - 1.5) * 0.16)
    }
    const max = clamp01(0.4 + r * 0.36)
    // Some stars barely flicker, others dim right down
    const depth = rnd() < 0.25 ? between(0.6, 0.8) : between(0.12, 0.45)
    stars.push({
      x,
      y,
      r,
      min: max * depth,
      max,
      period: between(1.5, 2.5) + big * between(0.9, 1.6),
      phase: rnd() * Math.PI * 2,
      color: TINTS[Math.floor(rnd() * TINTS.length)],
      halo: r >= 1.55 ? clamp01(0.35 + ((r - 1.55) / 0.75) * 0.65) : 0,
      // Every fourth star, by order of creation, so it is a random quarter
      wideOnly: i % 4 === 3,
    })
  }
  // Small first, so the bright stars and their halos sit on top
  return stars.sort((a, b) => a.r - b.r)
}

const STARS = makeStars()
const FRAME_MS = 33
// Below this width (Tailwind's sm) the sky thins out a little
const NARROW_PX = 640

type Meteor = { start: number; duration: number; x: number; y: number; dx: number; dy: number; distance: number; trail: number; width: number }

// A soft round glow painted once, then stamped under bright stars and the
// heads of shooting stars. Cheaper than a blur filter: nothing is blurred live.
function makeGlow(): HTMLCanvasElement {
  const size = 64
  const sprite = document.createElement("canvas")
  sprite.width = size
  sprite.height = size
  const g = sprite.getContext("2d")
  if (g) {
    const half = size / 2
    const fade = g.createRadialGradient(half, half, 0, half, half, half)
    fade.addColorStop(0, "rgba(255,255,255,0.95)")
    fade.addColorStop(0.18, "rgba(255,255,255,0.38)")
    fade.addColorStop(0.5, "rgba(233,225,255,0.10)")
    fade.addColorStop(1, "rgba(233,225,255,0)")
    g.fillStyle = fade
    g.fillRect(0, 0, size, size)
  }
  return sprite
}

export function StarField({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const still = useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const glow = makeGlow()
    const between = (a: number, b: number) => a + Math.random() * (b - a)
    let ratio = 1
    let narrow = false
    let meteors: Meteor[] = []
    // Shooting stars begin the first time the sky is properly in view
    let armed = false
    let inView = false
    let nextMeteorAt = Infinity

    const launch = (now: number, delay = 0) => {
      const { width, height } = canvas
      const toRight = Math.random() < 0.5
      const angle = (between(18, 34) * Math.PI) / 180
      const distance = Math.min(between(320, 560) * ratio, width * 0.7)
      meteors.push({
        start: now + delay,
        duration: between(900, 1400),
        x: (toRight ? between(0.1, 0.5) : between(0.5, 0.9)) * width,
        y: between(0.1, 0.35) * height,
        dx: Math.cos(angle) * (toRight ? 1 : -1),
        dy: Math.sin(angle),
        distance,
        trail: Math.min(between(110, 190) * ratio, distance * 0.6),
        width: between(1.4, 2.2) * ratio,
      })
    }

    const drawMeteor = (m: Meteor, now: number) => {
      const p = (now - m.start) / m.duration
      if (p <= 0 || p >= 1) return
      const moved = 1 - Math.pow(1 - p, 1.6)
      const hx = m.x + m.dx * m.distance * moved
      const hy = m.y + m.dy * m.distance * moved
      // The tail grows as it appears and shortens as it burns out
      const trail = m.trail * Math.min(1, p / 0.25) * (p > 0.75 ? 0.4 + ((1 - p) / 0.25) * 0.6 : 1)
      const tx = hx - m.dx * trail
      const ty = hy - m.dy * trail
      const alpha = Math.min(1, p / 0.12) * Math.min(1, (1 - p) / 0.35)

      const fade = ctx.createLinearGradient(tx, ty, hx, hy)
      fade.addColorStop(0, "rgba(255,255,255,0)")
      fade.addColorStop(0.55, `rgba(216,196,255,${0.28 * alpha})`)
      fade.addColorStop(1, `rgba(255,255,255,${0.95 * alpha})`)
      // A sliver that is widest at the head and comes to a point at the tail
      const nx = (-m.dy * m.width) / 2
      const ny = (m.dx * m.width) / 2
      ctx.globalAlpha = 1
      ctx.fillStyle = fade
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(hx + nx, hy + ny)
      ctx.lineTo(hx - nx, hy - ny)
      ctx.closePath()
      ctx.fill()

      const size = 16 * ratio
      ctx.globalAlpha = alpha
      ctx.drawImage(glow, hx - size / 2, hy - size / 2, size, size)
    }

    const draw = (now: number) => {
      const { width, height } = canvas
      const seconds = now / 1000
      ctx.clearRect(0, 0, width, height)
      for (const s of STARS) {
        if (narrow && s.wideOnly) continue
        const wave = still ? 0.6 : 0.5 + 0.5 * Math.sin((seconds / s.period) * Math.PI * 2 + s.phase)
        const alpha = s.min + (s.max - s.min) * wave
        const x = s.x * width
        const y = s.y * height
        if (s.halo > 0) {
          const size = s.r * ratio * 11
          ctx.globalAlpha = alpha * 0.6 * s.halo
          ctx.drawImage(glow, x - size / 2, y - size / 2, size, size)
        }
        ctx.globalAlpha = alpha
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(x, y, s.r * ratio, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const m of meteors) drawMeteor(m, now)
      ctx.globalAlpha = 1
    }

    // Match the canvas to its box. A hidden or minimised window reports no
    // size: keep the last picture rather than drawing into nothing.
    const fit = () => {
      const box = canvas.getBoundingClientRect()
      if (box.width < 1 || box.height < 1) return
      ratio = Math.min(window.devicePixelRatio || 1, 2)
      narrow = box.width < NARROW_PX
      const width = Math.round(box.width * ratio)
      const height = Math.round(box.height * ratio)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      draw(performance.now())
    }

    let frame = 0
    let last = 0
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (armed && inView && now >= nextMeteorAt) {
        launch(now)
        // Now and then two cross almost together
        if (Math.random() < 0.2) launch(now, between(250, 600))
        nextMeteorAt = now + between(3500, 8000)
      }
      meteors = meteors.filter((m) => now < m.start + m.duration)
      // The slow twinkle needs few frames; a shooting star needs all of them
      if (meteors.length === 0 && now - last < FRAME_MS) return
      last = now
      draw(now)
    }
    const stop = () => {
      cancelAnimationFrame(frame)
      frame = 0
    }

    fit()
    const sizes = new ResizeObserver(fit)
    sizes.observe(canvas)
    const visible = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting && entry.intersectionRatio >= 0.4
        if (!entry.isIntersecting || still) {
          stop()
          return
        }
        const now = performance.now()
        if (inView) {
          // First time the pricing sky is really on screen: the show starts.
          // Coming back later, the next one is not kept waiting either.
          if (!armed) {
            armed = true
            nextMeteorAt = now + 500
          } else if (nextMeteorAt < now) {
            nextMeteorAt = now + 600
          }
        }
        if (!frame) frame = requestAnimationFrame(tick)
      },
      { threshold: [0, 0.4] },
    )
    visible.observe(canvas)

    return () => {
      stop()
      sizes.disconnect()
      visible.disconnect()
    }
  }, [still])

  return <canvas ref={ref} aria-hidden="true" className={className} />
}
