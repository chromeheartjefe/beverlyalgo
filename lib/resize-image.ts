/**
 * Downscales an image in the browser to at most `maxPx` on its longest edge
 * and re-encodes it as JPEG, so a huge phone photo or screenshot isn't
 * uploaded at full resolution. Smaller images are only re-encoded.
 */
export function resizeForUpload(file: File, maxPx: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(src)
      const scale  = Math.min(1, maxPx / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width  = Math.round(img.width  * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Resize failed"))), "image/jpeg", quality)
    }
    img.onerror = () => { URL.revokeObjectURL(src); reject(new Error("Image load failed")) }
    img.src = src
  })
}
