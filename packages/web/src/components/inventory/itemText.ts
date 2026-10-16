import type { InventoryItem, ItemNote, ResetOn } from '@player-ledger/shared'

const RESET_WORD: Record<ResetOn, string> = {
  none: 'never',
  short: 'short rest',
  long: 'long rest',
}

export function resetLabel(resetOn: ResetOn): string {
  // The prototype printed "resets on never".
  return resetOn === 'none' ? "doesn't reset" : `resets on ${RESET_WORD[resetOn]}`
}

const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })

/** Notes are stored without a date; every one reads "Sep 10 — ..." from its createdAt. */
export function noteText(note: ItemNote): string {
  return `${dateFormat.format(new Date(note.createdAt))} — ${note.text}`
}

/** The latest note, or null when there are none. `more` counts the rest. */
export function latestNote(item: InventoryItem): { text: string; more: number } | null {
  const [latest] = item.notes
  if (!latest) return null
  return { text: noteText(latest), more: item.notes.length - 1 }
}
