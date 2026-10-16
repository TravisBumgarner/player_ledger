import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import type { AnyExtension } from '@tiptap/react'
import { useCallback, useMemo, useRef, useState } from 'react'
import { errorMessage } from '@/lib/errorMessages'
import { todayLabel } from '@/lib/noteDate'
import type { EntryValue } from '@/sharedComponents/RichTextEditor/useAutosave'
import EmptyState from '../EmptyState'
import { AnimatePresence, MotionCard } from '../motion'
import SaveStatus, { type SaveState } from '../SaveStatus'
import SectionHeader from '../SectionHeader'
import JournalEntry, { type JournalEntryItem } from './JournalEntry'

export type { EntryValue, JournalEntryItem }

export type JournalListProps = {
  entries: JournalEntryItem[]
  /** Resolves with the new entry's id. */
  onCreate: (value: EntryValue) => Promise<string>
  onUpdate: (id: string, value: EntryValue) => Promise<void>
  onRemove: (id: string) => Promise<void>
  bodyPlaceholder: string
  empty: string
  /** Heads the list like a Section, with the save status and New entry beside it. */
  title?: string
  extensions?: AnyExtension[]
}

const DRAFT = 'draft'
const RANK: Record<SaveState['kind'], number> = { saved: 0, saving: 1, invalid: 2, error: 3 }

/** The worst of the parts: one failure outranks any number of saves. */
function overall(states: Record<string, SaveState>): SaveState {
  return Object.values(states).reduce<SaveState>(
    (worst, state) => (RANK[state.kind] > RANK[worst.kind] ? state : worst),
    { kind: 'saved' },
  )
}

/** Session notes, development, grafting and brewing notes: one journal, four homes. */
export default function JournalList({
  entries,
  onCreate,
  onUpdate,
  onRemove,
  bodyPlaceholder,
  empty,
  title,
  extensions,
}: JournalListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<JournalEntryItem | null>(null)
  const [removing, setRemoving] = useState(false)
  const [removeError, setRemoveError] = useState<unknown>(null)
  const [states, setStates] = useState<Record<string, SaveState>>({})
  // A new entry is written in place, at the top of the list, so saving it moves nothing.
  const [draft, setDraft] = useState<JournalEntryItem | null>(null)
  const draftId = useRef<string | null>(null)
  const draftCreate = useRef<Promise<string> | null>(null)

  function startDraft() {
    draftId.current = null
    draftCreate.current = null
    setDraft({ id: DRAFT, label: todayLabel(), body: { type: 'doc' } })
    setEditingId(DRAFT)
  }

  // The first save creates the entry; any that land while that is in flight wait and update it.
  async function saveDraft(value: EntryValue) {
    if (draftId.current) return onUpdate(draftId.current, value)
    if (!draftCreate.current) {
      draftCreate.current = onCreate(value).then((id) => {
        draftId.current = id
        return id
      })
      await draftCreate.current
      return
    }
    await onUpdate(await draftCreate.current, value)
  }

  function finishDraft() {
    setDraft(null)
    setEditingId(null)
  }

  const report = useCallback((key: string, state: SaveState) => {
    setStates((current) => (current[key] === state ? current : { ...current, [key]: state }))
  }, [])

  // Memoised: a fresh object every render would bounce through the page's state forever.
  const status = useMemo(() => overall(states), [states])

  async function remove() {
    if (!confirming) return
    setRemoving(true)
    setRemoveError(null)
    try {
      await onRemove(confirming.id)
      setStates(({ [confirming.id]: _gone, ...rest }) => rest)
      setConfirming(null)
    } catch (error) {
      setRemoveError(error)
    } finally {
      setRemoving(false)
    }
  }

  return (
    <Box component="section" aria-label={title} sx={{ display: 'flex', flexDirection: 'column' }}>
      <SectionHeader
        title={title ?? ''}
        right={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <SaveStatus state={status} />
            {draft ? null : (
              <Button variant="text" onClick={startDraft}>
                + New entry
              </Button>
            )}
          </Box>
        }
      />

      {entries.length === 0 && !draft ? (
        <EmptyState>{empty}</EmptyState>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <AnimatePresence initial={false}>
            {draft ? (
              <MotionCard key={DRAFT}>
                <JournalEntry
                  key={DRAFT}
                  entry={draft}
                  editing
                  onEdit={() => {}}
                  onDoneEditing={finishDraft}
                  onSave={saveDraft}
                  onRemove={() => {
                    const id = draftId.current
                    finishDraft()
                    if (id) setConfirming(entries.find((entry) => entry.id === id) ?? null)
                  }}
                  onStateChange={(state) => report(DRAFT, state)}
                  bodyPlaceholder={bodyPlaceholder}
                  extensions={extensions}
                />
              </MotionCard>
            ) : null}
            {entries
              .filter((entry) => !draft || entry.id !== draftId.current)
              .map((entry) => (
                <MotionCard key={entry.id}>
                  <JournalEntry
                    key={entry.id}
                    entry={entry}
                    editing={editingId === entry.id}
                    onEdit={() => setEditingId(entry.id)}
                    onDoneEditing={() =>
                      setEditingId((current) => (current === entry.id ? null : current))
                    }
                    onSave={(value) => onUpdate(entry.id, value)}
                    onRemove={() => setConfirming(entry)}
                    onStateChange={(state) => report(entry.id, state)}
                    bodyPlaceholder={bodyPlaceholder}
                    extensions={extensions}
                  />
                </MotionCard>
              ))}
          </AnimatePresence>
        </Box>
      )}

      <Dialog
        open={confirming !== null}
        onClose={() => setConfirming(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Remove entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirming?.label ? `"${confirming.label}" ` : 'This entry '}
            will be removed. This cannot be undone.
          </DialogContentText>
          {removeError ? (
            <DialogContentText role="alert">{errorMessage(removeError)}</DialogContentText>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirming(null)}>Cancel</Button>
          <Button color="error" disabled={removing} onClick={remove}>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
