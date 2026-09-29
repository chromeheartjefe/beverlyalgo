"use client"

import { type TargetAndTransition, type Transition, useInView } from "framer-motion"
import { createContext, type RefObject } from "react"

// The landing page's looping demos (chart analyser, AI bot, screener, feature
// cards, Quick Start) only play while they are on screen. Scrolled away, their
// phase timers stop and their endless animations settle, so the page isn't
// re-rendering and animating sections nobody can see.

/** True while the element is on screen or within 200px of it. */
export function useDemoLive(ref: RefObject<Element | null>) {
  return useInView(ref, { margin: "200px 0px" })
}

/** Lets a demo's inner parts read whether the demo is currently playing. */
export const DemoLiveContext = createContext(true)

/**
 * `animate` + `transition` props for an endlessly repeating animation that
 * rests (instantly, it's off screen) while its demo isn't playing.
 */
export function demoLoop(
  live: boolean,
  keyframes: TargetAndTransition,
  rest: TargetAndTransition,
  transition: Transition,
): { animate: TargetAndTransition; transition: Transition } {
  return live ? { animate: keyframes, transition } : { animate: rest, transition: { duration: 0 } }
}
