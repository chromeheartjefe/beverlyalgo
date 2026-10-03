"use client"

import { Maximize2, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

/** A picked screenshot: a local object URL plus its real size in pixels */
export type ChartImage = { url: string; width: number; height: number }

// One frame for the picked, the analysing and the analysed chart, so the box
// keeps its size from step to step. It takes the picture's own shape and never
// crops: a picture taller than the limit is scaled down whole and centred on
// the dark background. Phones get a higher limit, a portrait screenshot is
// too narrow to read otherwise.
export function ChartFrame({
  size,
  className,
  children,
}: {
  size?: { width: number; height: number } | null
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative max-h-[70svh] min-h-40 w-full overflow-hidden rounded-2xl border border-white/15 bg-[#08080f] sm:max-h-[min(60svh,520px)]",
        className,
      )}
      style={{ aspectRatio: size ? `${size.width} / ${size.height}` : "16 / 9" }}
    >
      {children}
    </div>
  )
}

// The screenshot inside the frame. A tap opens it full size; `children` are
// overlays on the picture (a badge, the Remove button).
export function ChartPicture({
  image,
  alt,
  children,
}: {
  image: ChartImage
  alt: string
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  return (
    <ChartFrame size={image}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open the chart full size"
        className="absolute inset-0 block size-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-400"
      >
        <img
          src={image.url}
          alt={alt}
          width={image.width}
          height={image.height}
          className="size-full object-contain"
        />
        <span
          aria-hidden
          className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-lg border border-white/20 bg-black/60 text-gray-200 backdrop-blur-sm"
        >
          <Maximize2 className="size-3.5" />
        </span>
      </button>
      {children}
      {open && <FullSize image={image} alt={alt} onClose={() => setOpen(false)} />}
    </ChartFrame>
  )
}

// The whole screenshot at its real size (never enlarged), scrollable when it
// is taller than the screen. A native <dialog>: it sits above everything,
// keeps focus inside, closes on Esc and hands focus back to the picture.
function FullSize({ image, alt, onClose }: { image: ChartImage; alt: string; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // Closing goes through the dialog, so Esc and a tap end the same way (onClose)
  const close = () => ref.current?.close()

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label="Chart, full size"
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-auto overscroll-contain bg-black/90 p-0 text-white backdrop:bg-black/90"
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className="fixed right-3 top-3 z-10 flex size-11 items-center justify-center rounded-xl border border-white/20 bg-black/60 text-gray-200 backdrop-blur-sm transition-colors hover:bg-black/80 hover:text-white"
      >
        <X className="size-4" aria-hidden />
      </button>
      <div onClick={close} className="flex min-h-full cursor-zoom-out flex-col items-center justify-center p-3 sm:p-6">
        <img
          src={image.url}
          alt={alt}
          width={image.width}
          height={image.height}
          className="h-auto max-w-full shrink-0 rounded-lg"
        />
      </div>
    </dialog>
  )
}
