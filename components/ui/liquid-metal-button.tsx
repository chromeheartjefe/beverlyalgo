"use client"

import { getShaderColorFromString, liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

interface LiquidMetalButtonProps {
  label?: string
  href?: string
  onClick?: () => void
  size?: "default" | "sm"
  className?: string
}

// Brand purple tint applied to the shader's animated rim + a purple-black plate,
// so the metal reads as "ours" instead of the library's default neutral silver.
const COLOR_TINT = getShaderColorFromString("#9333ea") // purple-600, color-burn tint on the shader rim
const COLOR_BACK = getShaderColorFromString("#0d0d1c") // matches the dropdown/email dark-surface color used elsewhere

const SIZE_TOKENS = {
  default: { width: 142, height: 46, fontSize: "14px" },
  sm:      { width: 116, height: 38, fontSize: "13px" },
} as const

export function LiquidMetalButton({
  label = "Get Started",
  href,
  onClick,
  size = "default",
  className,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const shaderRef = useRef<HTMLDivElement>(null)
  const shaderMount = useRef<ShaderMount | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const rippleId = useRef(0)
  const router = useRouter()

  const { width, height, fontSize } = SIZE_TOKENS[size]
  const dimensions = useMemo(() => {
    const inner = width - 4 // 2px margin on each side, matching the shader's rim reveal
    return { width, height, innerWidth: inner, innerHeight: height - 4 }
  }, [width, height])

  useEffect(() => {
    const styleId = "liquid-metal-button-style"
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style")
      style.id = styleId
      style.textContent = `
        .liquid-metal-shader-container canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 100px !important;
        }
        @keyframes liquid-metal-ripple {
          0%   { transform: translate(-50%, -50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    if (shaderRef.current) {
      shaderMount.current = new ShaderMount(
        shaderRef.current,
        liquidMetalFragmentShader,
        {
          u_colorBack:  COLOR_BACK,
          u_colorTint:  COLOR_TINT,
          u_repetition: 4,
          u_softness:   0.5,
          u_shiftRed:   0.15,
          u_shiftBlue:  0.45,
          u_distortion: 0,
          u_contour:    0,
          u_angle:      45,
          u_scale:      8,
          u_shape:      1,
          u_offsetX:    0.1,
          u_offsetY:    -0.1,
        },
        undefined,
        0.6
      )
    }

    return () => {
      shaderMount.current?.dispose()
      shaderMount.current = null
    }
  }, [])

  const handleMouseEnter = () => {
    setIsHovered(true)
    shaderMount.current?.setSpeed(1)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setIsPressed(false)
    shaderMount.current?.setSpeed(0.6)
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    shaderMount.current?.setSpeed(2.4)
    setTimeout(() => shaderMount.current?.setSpeed(isHovered ? 1 : 0.6), 300)

    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ }
      setRipples((prev) => [...prev, ripple])
      setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== ripple.id)), 600)
    }

    onClick?.()
    if (href) router.push(href)
  }

  const ringShadow = isPressed
    ? "0px 0px 0px 1px rgba(0, 0, 0, 0.5), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)"
    : isHovered
      ? "0px 0px 0px 1px rgba(0, 0, 0, 0.4), 0px 0px 22px 0px rgba(147, 51, 234, 0.35), 0px 12px 6px 0px rgba(0, 0, 0, 0.05), 0px 8px 5px 0px rgba(0, 0, 0, 0.1), 0px 4px 4px 0px rgba(0, 0, 0, 0.15)"
      : "0px 0px 0px 1px rgba(0, 0, 0, 0.3), 0px 0px 14px 0px rgba(147, 51, 234, 0.12), 0px 20px 12px 0px rgba(0, 0, 0, 0.08), 0px 9px 9px 0px rgba(0, 0, 0, 0.12), 0px 2px 5px 0px rgba(0, 0, 0, 0.15)"

  return (
    <div className={`relative inline-block ${className ?? ""}`} style={{ perspective: "1000px" }}>
      <div
        style={{
          position: "relative",
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transformStyle: "preserve-3d",
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transformStyle: "preserve-3d",
            transform: "translateZ(20px)",
            zIndex: 30,
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize,
              color: "#ece7fb",
              fontWeight: 500,
              textShadow: "0px 1px 2px rgba(0, 0, 0, 0.6), 0px 0px 10px rgba(147, 51, 234, 0.35)",
              whiteSpace: "nowrap",
            }}
          >
            {label}
          </span>
        </div>

        {/* Dark plate — covers the shader except for a 2px animated rim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: `${dimensions.innerWidth}px`,
              height: `${dimensions.innerHeight}px`,
              margin: "2px",
              borderRadius: "100px",
              background: "linear-gradient(180deg, #1c1428 0%, #050308 100%)",
              boxShadow: isPressed
                ? "inset 0px 2px 4px rgba(0, 0, 0, 0.4), inset 0px 1px 2px rgba(0, 0, 0, 0.3)"
                : "none",
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease",
            }}
          />
        </div>

        {/* Shader rim */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformStyle: "preserve-3d",
            transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: `translateZ(0px) ${isPressed ? "translateY(1px) scale(0.98)" : "translateY(0) scale(1)"}`,
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: `${dimensions.height}px`,
              width: `${dimensions.width}px`,
              borderRadius: "100px",
              boxShadow: ringShadow,
              transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s ease",
              background: "rgb(0 0 0 / 0)",
            }}
          >
            <div
              ref={shaderRef}
              className="liquid-metal-shader-container"
              style={{
                borderRadius: "100px",
                overflow: "hidden",
                position: "relative",
                width: `${dimensions.width}px`,
                height: `${dimensions.height}px`,
              }}
            />
          </div>
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            outline: "none",
            zIndex: 40,
            transformStyle: "preserve-3d",
            transform: "translateZ(25px)",
            overflow: "hidden",
            borderRadius: "100px",
          }}
          aria-label={label}
        >
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              style={{
                position: "absolute",
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 70%)",
                pointerEvents: "none",
                animation: "liquid-metal-ripple 0.6s ease-out",
              }}
            />
          ))}
        </button>
      </div>
    </div>
  )
}
