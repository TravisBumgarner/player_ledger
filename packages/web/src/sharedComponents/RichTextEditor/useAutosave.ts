import { type RichDoc, trimRichDoc } from '@awesomeness-mgmt/shared'
import { useEffect, useRef, useState } from 'react'
import type { SaveState } from '@/components/ledger/SaveStatus'
import { errorMessage } from '@/lib/errorMessages'

export const AUTOSAVE_DELAY_MS = 800

/** Untrimmed, so it matches what the editor holds and the editor never resyncs mid-edit. */
export type EntryDraft = { label: string; body: RichDoc | null }
export type EntryValue = { label: string; body: RichDoc }

export function toValue(draft: EntryDraft): EntryValue | null {
  const label = draft.label.trim()
  if (!label || !draft.body) return null
  return { label, body: trimRichDoc(draft.body) }
}

const serialize = (draft: EntryDraft) => {
  const value = toValue(draft)
  return value ? JSON.stringify(value) : null
}

/**
 * Debounced saving of a label and body. `save` resolves once stored; a draft that
 * cannot be saved (no label, no text) waits rather than failing.
 */
export function useAutosave(initial: EntryDraft, save: (value: EntryValue) => Promise<void>) {
  const [draft, setDraft] = useState(initial)
  const [state, setState] = useState<SaveState>({ kind: 'saved' })
  const latest = useRef(initial)
  // The editor emits updates that change nothing, on mount among others; those are not edits.
  const saved = useRef(serialize(initial))
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const saveRef = useRef(save)
  saveRef.current = save

  function flush() {
    clearTimeout(timer.current)
    const value = toValue(latest.current)
    if (!value) return
    const body = JSON.stringify(value)
    if (body === saved.current) return
    saved.current = body
    const sent = latest.current
    setState({ kind: 'saving' })
    saveRef.current(value).then(
      () => setState(latest.current === sent ? { kind: 'saved' } : { kind: 'saving' }),
      (error: unknown) => setState({ kind: 'error', message: errorMessage(error) }),
    )
  }

  function change(next: Partial<EntryDraft>) {
    const merged = { ...latest.current, ...next }
    latest.current = merged
    setDraft(merged)
    clearTimeout(timer.current)
    const value = serialize(merged)
    if (value === saved.current) return setState({ kind: 'saved' })
    setState(value ? { kind: 'saving' } : { kind: 'invalid' })
    if (value) timer.current = setTimeout(flush, AUTOSAVE_DELAY_MS)
  }

  // Leaving mid-pause still saves; `flush` only reads refs, so the stale closure is fine.
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs on unmount only
  useEffect(() => flush, [])

  return { draft, state, change, flush }
}
