import { PROFILE_IMAGE_EDGE } from '@awesomeness-mgmt/shared'

export type CropArea = { x: number; y: number; width: number; height: number }

/** Cuts `area` (source pixels) out of `file` as a square, at most `PROFILE_IMAGE_EDGE` on a side. */
export async function cropImage(file: Blob, area: CropArea): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const edge = Math.max(1, Math.min(PROFILE_IMAGE_EDGE, Math.round(area.width)))
  const canvas = document.createElement('canvas')
  canvas.width = edge
  canvas.height = edge

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context unavailable')
  context.drawImage(bitmap, area.x, area.y, area.width, area.height, 0, 0, edge, edge)
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
