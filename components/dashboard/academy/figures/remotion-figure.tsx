"use client"

import { Player } from "@remotion/player"
import { useReducedMotion } from "framer-motion"
import type { ComponentType } from "react"
import { Easing, interpolate } from "remotion"

// Shared Remotion setup for lesson animations: a looping, silent Player that
// fills the lesson column. With reduced motion it shows one finished frame
// with controls instead of autoplaying.
export function RemotionFigure<Props extends Record<string, unknown> = Record<string, never>>({
  component,
  inputProps,
  durationInFrames,
  width,
  height,
  fps = 30,
  stillFrame,
}: {
  component: ComponentType<Props>
  /** Data for scenes that are drawn from a lesson's content */
  inputProps?: Props
  durationInFrames: number
  width: number
  height: number
  fps?: number
  /** Frame shown when the learner prefers reduced motion */
  stillFrame: number
}) {
  const reduceMotion = useReducedMotion()
  return (
    <div className="w-full overflow-hidden border border-white/10">
      <Player
        // The Player ties the props type to the component's; ours is checked above
        component={component as ComponentType<Record<string, unknown>>}
        inputProps={inputProps}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={fps}
        style={{ width: "100%", aspectRatio: `${width} / ${height}` }}
        autoPlay={!reduceMotion}
        loop
        initialFrame={reduceMotion ? stillFrame : 0}
        controls={!!reduceMotion}
        acknowledgeRemotionLicense
      />
    </div>
  )
}

const EASE_REMOTION = Easing.bezier(0.22, 1, 0.36, 1)

/** Clamped interpolate with the house ease */
export function iv(frame: number, input: [number, number], output: [number, number]) {
  return interpolate(frame, input, output, { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_REMOTION })
}
