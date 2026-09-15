import type { NoteKind } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Fragment } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useDeleteNote } from '@/hooks/mutations/useJournalMutations'
import { useNotes } from '@/hooks/queries/useJournal'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import NoteEntry from './NoteEntry'
import NoteForm from './NoteForm'

const COPY: Record<NoteKind, { label: string; placeholder: string; empty: string; noun: string }> =
  {
    session: {
      label: 'Session date / label',
      placeholder: 'What happened, what to remember...',
      empty: 'No session notes yet.',
      noun: 'session notes',
    },
    brewing: {
      label: 'Date / label',
      placeholder: 'What you tried, what worked, what to brew next...',
      empty: 'No brewing notes yet.',
      noun: 'brewing notes',
    },
  }

export default function NotesCard({ kind }: { kind: NoteKind }) {
  const { character } = useActiveCharacter()
  const notes = useNotes(character.id, kind)
  const deleteNote = useDeleteNote(character.id, kind)
  const copy = COPY[kind]

  return (
    <Paper variant="section">
      <NoteForm
        characterId={character.id}
        kind={kind}
        label={copy.label}
        placeholder={copy.placeholder}
      />

      {deleteNote.error ? (
        <Typography variant="body2" role="alert">
          {errorMessage(deleteNote.error)}
        </Typography>
      ) : null}

      {notes.isPending ? (
        <Loading size={20} label={`Loading ${copy.noun}`} />
      ) : notes.isError ? (
        <LoadFailure
          dense
          error={notes.error}
          fallback={`Could not load ${copy.noun}.`}
          onRetry={() => void notes.refetch()}
        />
      ) : notes.data.length === 0 ? (
        <Typography variant="body2" data-empty="true">
          {copy.empty}
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {notes.data.map((note) => (
            <Fragment key={note.id}>
              <Divider />
              <NoteEntry
                note={note}
                label={copy.label}
                placeholder={copy.placeholder}
                disabled={deleteNote.isPending}
                onRemove={() => deleteNote.mutate(note.id)}
              />
            </Fragment>
          ))}
        </Box>
      )}
    </Paper>
  )
}
