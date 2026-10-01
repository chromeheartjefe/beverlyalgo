"use client";
import { X } from "lucide-react";
import { type HTMLAttributes, useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BannerVariant = "rainbow" | "normal";

export function Banner({
  id,
  xColor,
  variant = "normal",
  height = "2.5rem",
  rainbowColors = [
    "rgba(0,149,255,0.56)",
    "rgba(231,77,255,0.77)",
    "rgba(255,0,0,0.73)",
    "rgba(131,255,166,0.66)",
  ],
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  height?: string;
  xColor?: string;
  variant?: BannerVariant;
  rainbowColors?: string[];
}) {
  const [open, setOpen] = useState(true);
  const globalKey = id ? `nd-banner-${id}` : null;

  // Some browsers block site storage entirely (all cookies/site data blocked,
  // some in-app browsers): even reading localStorage throws there. Then the
  // banner just shows, and closing it only lasts for this visit.
  useEffect(() => {
    if (!globalKey) return;
    try {
      setOpen(localStorage.getItem(globalKey) !== "true");
    } catch {
      setOpen(true);
    }
  }, [globalKey]);

  if (!open) return null;

  return (
    <div
      id={id}
      {...props}
      className={cn(
        "sticky top-0 z-40 flex flex-row items-center justify-center px-4 text-center text-sm font-medium",
        variant === "normal" && "bg-zinc-900",
        variant === "rainbow" && "bg-black",
        props.className,
      )}
      style={{ height }}
    >
      {globalKey ? (
        <style>{`.${globalKey} #${id} { display: none; }`}</style>
      ) : null}
      {globalKey ? (
        <script
          dangerouslySetInnerHTML={{
            __html: `try { if (localStorage.getItem('${globalKey}') === 'true') document.documentElement.classList.add('${globalKey}'); } catch (e) {}`,
          }}
        />
      ) : null}

      {variant === "rainbow" ? <RainbowFlow colors={rainbowColors} /> : null}

      {props.children}

      {id ? (
        <button
          type="button"
          aria-label="Close Banner"
          onClick={() => {
            setOpen(false);
            if (globalKey) {
              try {
                localStorage.setItem(globalKey, "true");
              } catch {
                // Storage blocked: hidden for this visit only
              }
              window.dispatchEvent(new Event("banner-status-changed"));
            }
          }}
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "absolute end-2 md:end-20 top-1/2 -translate-y-1/2 cursor-pointer text-white/50 hover:text-white hover:bg-white/10",
          )}
        >
          <X size={14} color={xColor} />
        </button>
      ) : null}
    </div>
  );
}

const maskImage =
  "linear-gradient(to bottom, white, transparent), radial-gradient(circle at top center, white, transparent)";

function RainbowFlow({ colors }: { colors: string[] }) {
  return (
    <>
      <div
        className="absolute inset-0 z-[-1]"
        style={{
          maskImage,
          maskComposite: "intersect",
          animation: "fd-moving-banner 20s linear infinite",
          backgroundImage: `repeating-linear-gradient(70deg, ${[...colors, colors[0]].map((c, i) => `${c} ${(i * 50) / colors.length}%`).join(", ")})`,
          backgroundSize: "200% 100%",
          filter: "saturate(2)",
        }}
      />
      <style>{`
        @keyframes fd-moving-banner {
          from { background-position: 0% 0; }
          to   { background-position: 100% 0; }
        }
      `}</style>
    </>
  );
}
