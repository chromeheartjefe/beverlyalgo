type ResizeOptions = {
  /**
   * A PNG source stays a PNG (sharp text, no JPEG halos around it) as long as
   * the result is under this many bytes. Off by default: everything is JPEG.
   */
  keepPngUnder?: number
  /** A size rule on top of `maxPx`: the picture is shrunk until this passes */
  fits?: (width: number, height: number) => boolean
}

// iOS Safari refuses canvases above this area
const MAX_CANVAS_AREA = 16_777_216

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL.createObjectURL(file)
    img.onload  = () => { URL.revokeObjectURL(src); resolve(img) }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error("Image load failed")) }
    img.src = src
  })
}

function drawScaled(source: CanvasImageSource, width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas")
  canvas.width  = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas unavailable")
  // The default is the browser's fastest, roughest resampling
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(source, 0, 0, width, height)
  return canvas
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))), type, quality)
  })
}

// Hands a canvas's memory back at once (phones run out of it quickly)
const release = (canvas: HTMLCanvasElement) => { canvas.width = canvas.height = 0 }

/**
 * Downscales an image in the browser to at most `maxPx` on its longest edge
 * and re-encodes it as JPEG, so a huge phone photo or screenshot isn't
 * uploaded at full resolution. Smaller images are only re-encoded, or sent
 * untouched when they are a PNG that `keepPngUnder` allows.
 */
export async function resizeForUpload(
  file: File,
  maxPx: number,
  quality: number,
  { keepPngUnder = 0, fits }: ResizeOptions = {},
): Promise<Blob> {
  const img  = await loadImage(file)
  const srcW = img.naturalWidth
  const srcH = img.naturalHeight

  let scale  = Math.min(1, maxPx / Math.max(srcW, srcH))
  let width  = Math.max(1, Math.round(srcW * scale))
  let height = Math.max(1, Math.round(srcH * scale))
  while (fits && !fits(width, height) && width > 1 && height > 1) {
    scale *= 0.98
    width  = Math.max(1, Math.round(srcW * scale))
    height = Math.max(1, Math.round(srcH * scale))
  }

  const png = keepPngUnder > 0 && file.type === "image/png"
  // Already the right size: the PNG goes up as it is, pixel for pixel
  if (png && scale === 1 && file.size <= keepPngUnder) return file

  // Halve in steps on the way down: one big jump skips pixels and leaves thin
  // text (price labels) jagged
  const steps: HTMLCanvasElement[] = []
  let source: CanvasImageSource = img
  let w = srcW
  let h = srcH
  while (w / 2 >= width && h / 2 >= height && (w / 2) * (h / 2) <= MAX_CANVAS_AREA) {
    w = Math.round(w / 2)
    h = Math.round(h / 2)
    const step = drawScaled(source, w, h)
    steps.push(step)
    source = step
  }
  // The last halving can land exactly on the target
  const canvas = steps.length > 0 && w === width && h === height ? steps.pop()! : drawScaled(source, width, height)
  steps.forEach(release)

  try {
    if (png) {
      const blob = await toBlob(canvas, "image/png")
      if (blob.size <= keepPngUnder) return blob
    }
    return await toBlob(canvas, "image/jpeg", quality)
  } finally {
    release(canvas)
  }
}
