"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import { DecorBoundary } from "@/components/ui/decor-boundary";
import { cn } from "@/lib/utils";

interface BackgroundGradientAnimationProps {
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
  /** Orb box size as a percentage of the container, e.g. "80%". */
  size?: string;
  blendingValue?: string;
  /** "center" (default) stacks every orb at the container's center. "corners"
   *  anchors them at the four corners instead, so the drifting motion reads
   *  as glow bleeding in from the edges rather than one blob in the middle. */
  variant?: "center" | "corners";
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

const CORNER_POSITIONS: React.CSSProperties[] = [
  { top: "-15%", left: "-15%" },
  { top: "-15%", right: "-15%" },
  { bottom: "-15%", left: "-15%" },
  { bottom: "-15%", right: "-15%" },
];

// The look these orbs were designed with: a cone of colour (0.85 at the centre
// down to 0 at 55% of the box's corner radius) under a CSS blur(55px) over the
// whole orb layer. That blur had to be redone over the entire section on every
// frame the orbs moved, which is what made the landing page drop frames.
//
// Instead, the same blurred falloff is computed once (per container size) and
// painted straight into each orb's gradient. The orbs are then plain soft
// images the GPU slides around, with no filter left to re-run.
const PEAK_ALPHA = 0.85;
const CONE_EXTENT = 0.55;
const BLUR_SIGMA = 55; // CSS blur(<length>) is the Gaussian's standard deviation
const STOPS = 16;

/**
 * Alpha along the radius of a cone of radius `R` after a Gaussian blur of
 * BLUR_SIGMA (numerical 2D convolution; a few thousand samples, run only when
 * the container resizes). Sampled out to R + 3σ, where it has faded to zero.
 */
function blurredConeProfile(R: number): { reach: number; stops: Array<[number, number]> } {
  const s = BLUR_SIGMA;
  const reach = R + 3 * s;
  const step = s / 3;
  const stops: Array<[number, number]> = [];
  for (let i = 0; i < STOPS; i++) {
    const r = (reach * i) / (STOPS - 1);
    let sum = 0;
    let weight = 0;
    for (let u = -3 * s; u <= 3 * s; u += step) {
      for (let v = -3 * s; v <= 3 * s; v += step) {
        const w = Math.exp(-(u * u + v * v) / (2 * s * s));
        sum += w * Math.max(0, 1 - Math.hypot(r + u, v) / R);
        weight += w;
      }
    }
    stops.push([(r / reach) * 100, sum / weight]);
  }
  stops[STOPS - 1][1] = 0; // no hard edge where the gradient box ends
  return { reach, stops };
}

const BackgroundGradientAnimationInner = ({
  firstColor = "131, 80, 232",
  secondColor = "185, 55, 255",
  thirdColor = "65, 20, 215",
  fourthColor = "220, 100, 255",
  fifthColor = "95, 0, 230",
  size = "80%",
  blendingValue = "screen",
  variant = "center",
  children,
  className,
  containerClassName,
}: BackgroundGradientAnimationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // The orbs keep animating while mounted — only render them while the
  // section is actually near the viewport so scroll performance doesn't pay
  // for every instance on the page at once.
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    const resize = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setBox((prev) => (prev && prev.w === width && prev.h === height ? prev : { w: width, h: height }));
    });
    resize.observe(el);
    return () => {
      observer.disconnect();
      resize.disconnect();
    };
  }, []);

  // One falloff for all five orbs: they share the same box size
  const profile = useMemo(() => {
    if (!box) return null;
    const frac = parseFloat(size) / 100;
    const R = CONE_EXTENT * Math.hypot((frac * box.w) / 2, (frac * box.h) / 2);
    return R > 0 ? blurredConeProfile(R) : null;
  }, [box, size]);

  const orbs: Array<{
    color: string;
    animClass: string;
    opacity: number;
    origin: string;
  }> = [
    {
      color: firstColor,
      animClass: "animate-first",
      opacity: 0.52,
      origin: "center center",
    },
    {
      color: secondColor,
      animClass: "animate-second",
      opacity: 0.45,
      origin: "calc(50% - 400px) center",
    },
    {
      color: thirdColor,
      animClass: "animate-third",
      opacity: 0.40,
      origin: "calc(50% + 400px) center",
    },
    {
      color: fourthColor,
      animClass: "animate-fourth",
      opacity: 0.36,
      origin: "calc(50% - 200px) center",
    },
    {
      color: fifthColor,
      animClass: "animate-fifth",
      opacity: 0.44,
      origin: "calc(50% - 800px) calc(50% + 800px)",
    },
  ];

  return (
    <div ref={containerRef} className={cn("relative overflow-hidden", containerClassName)}>
      {/* Soft orbs — no mouse interaction. Only mounted near the viewport.
          `isolate` keeps their blending among themselves, as before. */}
      <div aria-hidden="true" className="absolute inset-0 isolate">
        {isNearViewport && profile && orbs.map((orb, i) => (
          // The outer box is the orb's original size and position, so the
          // drift keyframes (percent translates, rotation origins) move it
          // exactly as far as they always did. The glow is centred on it and
          // spills past its edges.
          <div
            key={i}
            className={cn("absolute", orb.animClass)}
            style={{
              width: size,
              height: size,
              ...(variant === "corners"
                ? CORNER_POSITIONS[i % CORNER_POSITIONS.length]
                : { top: `calc(50% - ${size} / 2)`, left: `calc(50% - ${size} / 2)` }),
              transformOrigin: orb.origin,
              opacity: orb.opacity,
              mixBlendMode: blendingValue as React.CSSProperties["mixBlendMode"],
              willChange: "transform",
            }}
          >
            <div
              className="absolute"
              style={{
                left: `calc(50% - ${profile.reach}px)`,
                top: `calc(50% - ${profile.reach}px)`,
                width: profile.reach * 2,
                height: profile.reach * 2,
                background: `radial-gradient(circle closest-side, ${profile.stops
                  .map(([at, a]) => `rgba(${orb.color}, ${(a * PEAK_ALPHA).toFixed(3)}) ${at.toFixed(1)}%`)
                  .join(", ")})`,
              }}
            />
          </div>
        ))}
      </div>

      {children && (
        <div className={cn("relative z-10", className)}>{children}</div>
      )}
    </div>
  );
};

// Purely decorative: if it ever fails, the section renders without it
// instead of the whole page falling over.
export const BackgroundGradientAnimation = (props: React.ComponentProps<typeof BackgroundGradientAnimationInner>) => (
  <DecorBoundary name="background-gradient">
    <BackgroundGradientAnimationInner {...props} />
  </DecorBoundary>
);
