/** A note's label is free text ("Sep 14", "2026-09-24"); this reads a day and month out of it when it can. */
export function noteDate(label: string): { day: string; month: string } | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(label.trim())
  const parsed = iso
    ? new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
    : new Date(`${label.trim()} ${new Date().getFullYear()}`)
  if (Number.isNaN(parsed.getTime())) return null
  return {
    day: String(parsed.getDate()),
    month: parsed.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
  }
}

/** "Oct 15": what a new note's label starts as. */
export function todayLabel(): string {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
