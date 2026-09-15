import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Fragment } from 'react'
import { useActiveCharacter } from '@/components/identity/ActiveCharacter'
import { useDeleteSessionNote } from '@/hooks/mutations/useJournalMutations'
import { useSessionNotes } from '@/hooks/queries/useJournal'
import { errorMessage } from '@/lib/errorMessages'
import LoadFailure from '@/sharedComponents/LoadFailure'
import Loading from '@/sharedComponents/Loading'
import SessionNoteEntry from './SessionNoteEntry'
import SessionNoteForm from './SessionNoteForm'

export default function SessionNotesCard() {
  const { character } = useActiveCharacter()
  const notes = useSessionNotes(character.id)
  const deleteNote = useDeleteSessionNote(character.id)

  return (
    <Paper variant="section">
      <SessionNoteForm characterId={character.id} />

      {deleteNote.error ? (
        <Typography variant="body2" role="alert">
          {errorMessage(deleteNote.error)}
        </Typography>
      ) : null}

      {notes.isPending ? (
        <Loading size={20} label="Loading session notes" />
      ) : notes.isError ? (
        <LoadFailure
          dense
          error={notes.error}
          fallback="Could not load session notes."
          onRetry={() => void notes.refetch()}
        />
      ) : notes.data.length === 0 ? (
        <Typography variant="body2" data-empty="true">
          No session notes yet.
        </Typography>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {notes.data.map((note) => (
            <Fragment key={note.id}>
              <Divider />
              <SessionNoteEntry
                note={note}
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
