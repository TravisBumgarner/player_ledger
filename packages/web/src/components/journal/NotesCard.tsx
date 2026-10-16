import { createSessionNoteSchema, type NoteKind } from '@player-ledger/shared'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import JournalList, { type EntryValue } from '@/components/ledger/journal/JournalList'
import { useCreateNote, useDeleteNote, useUpdateNote } from '@/hooks/mutations/useJournalMutations'
import { useNotes } from '@/hooks/queries/useJournal'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import { useMentions } from '@/sharedComponents/RichTextEditor/useMentions'

const COPY: Record<NoteKind, { placeholder: string; empty: string; noun: string }> = {
  session: {
    placeholder: 'What happened, what to remember...',
    empty: 'No session notes yet.',
    noun: 'session notes',
  },
  brewing: {
    placeholder: 'What you tried, what worked, what to brew next...',
    empty: 'No brewing notes yet.',
    noun: 'brewing notes',
  },
  grafting: {
    placeholder: 'Rolls, trees, abilities...',
    empty: 'No grafting notes yet.',
    noun: 'grafting notes',
  },
  development: {
    placeholder: 'How your character is changing...',
    empty: 'No character development notes yet.',
    noun: 'character development notes',
  },
}

/** The API's own rule, checked before sending so a bad draft never reaches it. */
const toInput = ({ label, body }: EntryValue) =>
  createSessionNoteSchema.parse({ date: label, body })

export default function NotesCard({ kind, title }: { kind: NoteKind; title?: string }) {
  const { character } = useActiveCharacter()
  const notes = useNotes(character.id, kind)
  const createNote = useCreateNote(character.id, kind)
  const updateNote = useUpdateNote(character.id, kind)
  const deleteNote = useDeleteNote(character.id, kind)
  const mentions = useMentions()
  const copy = COPY[kind]

  if (notes.isPending) return <Loading size={20} label={`Loading ${copy.noun}`} />
  if (notes.isError) {
    return (
      <LoadFailure
        dense
        error={notes.error}
        fallback={`Could not load ${copy.noun}.`}
        onRetry={() => void notes.refetch()}
      />
    )
  }

  return (
    <JournalList
      entries={notes.data.map((note) => ({ id: note.id, label: note.date, body: note.body }))}
      onCreate={async (value) => (await createNote.mutateAsync(toInput(value))).id}
      onUpdate={async (noteId, value) => {
        await updateNote.mutateAsync({ noteId, input: toInput(value) })
      }}
      onRemove={async (noteId) => {
        await deleteNote.mutateAsync(noteId)
      }}
      bodyPlaceholder={copy.placeholder}
      empty={copy.empty}
      title={title}
      extensions={mentions}
    />
  )
}
