import { PROFILE_IMAGE_EDGE } from '@awesomeness-mgmt/shared'

/** Scales down to `PROFILE_IMAGE_EDGE` on the longest side, keeping the aspect ratio. */
export async function resizeImage(file: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, PROFILE_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context unavailable')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  // A browser that cannot encode WebP (Safari) hands back a PNG, and `blob.type` says so.
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))),
      'image/webp',
      0.85,
    )
  })
}
