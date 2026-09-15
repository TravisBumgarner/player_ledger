/** 0–100 for a LinearProgress; an empty or inverted span (thresholds not set yet) reads as 0. */
export function percentOf(value: number, span: number): number {
  if (span <= 0) return 0
  return Math.min(100, Math.max(0, (value / span) * 100))
}

/** A whole number from a text field, or null when it is blank or not one. */
export function parseWhole(text: string): number | null {
  if (text.trim() === '') return null
  const value = Number(text)
  return Number.isInteger(value) ? value : null
}
