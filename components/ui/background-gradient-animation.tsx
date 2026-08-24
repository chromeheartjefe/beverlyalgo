"use client";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface BackgroundGradientAnimationProps {
  firstColor?: string;
  secondColor?: string;
  thirdColor?: string;
  fourthColor?: string;
  fifthColor?: string;
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

export const BackgroundGradientAnimation = ({
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
  const [isSafari, setIsSafari] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // These blurred, continuously-animating orbs are expensive to keep painting —
  // only render them while the section is actually near the viewport so scroll
  // performance doesn't pay for every instance on the page at once.
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    setIsSafari(/^((?!chrome|android).)*safari/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsNearViewport(entry.isIntersecting),
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      {/* Blurry orbs — no mouse interaction. Only mounted near the viewport. */}
      <div
        aria-hidden="true"
        className={cn("absolute inset-0", isSafari ? "blur-[30px]" : "blur-[55px]")}
      >
        {isNearViewport && orbs.map((orb, i) => (
          <div
            key={i}
            className={cn("absolute", orb.animClass)}
            style={{
              background: `radial-gradient(circle at center, rgba(${orb.color}, 0.85) 0%, rgba(${orb.color}, 0) 55%) no-repeat`,
              mixBlendMode: blendingValue as React.CSSProperties["mixBlendMode"],
              width: size,
              height: size,
              ...(variant === "corners"
                ? CORNER_POSITIONS[i % CORNER_POSITIONS.length]
                : { top: `calc(50% - ${size} / 2)`, left: `calc(50% - ${size} / 2)` }),
              transformOrigin: orb.origin,
              opacity: orb.opacity,
              willChange: "transform",
            }}
          />
        ))}
      </div>

      {children && (
        <div className={cn("relative z-10", className)}>{children}</div>
      )}
    </div>
  );
};
