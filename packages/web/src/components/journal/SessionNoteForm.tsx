import { createSessionNoteSchema } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { useCreateSessionNote } from '@/hooks/mutations/useJournalMutations'
import { errorMessage } from '@/lib/errorMessages'

/** "Sep 14", as the prototype writes it. */
function today(): string {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function SessionNoteForm({ characterId }: { characterId: string }) {
  const createNote = useCreateSessionNote(characterId)
  const [date, setDate] = useState('')
  const [text, setText] = useState('')

  const hasText = text.trim().length > 0

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const parsed = createSessionNoteSchema.safeParse({ date: date.trim() || today(), text })
    if (!parsed.success) return
    createNote.mutate(parsed.data, {
      onSuccess: () => {
        setDate('')
        setText('')
      },
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1 }}>
      <TextField
        size="small"
        placeholder="session date / label"
        aria-label="Session date or label"
        value={date}
        onChange={(event) => setDate(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 80 } }}
      />
      <TextField
        size="small"
        multiline
        minRows={2}
        placeholder="what happened, what to remember..."
        aria-label="Session notes"
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button type="submit" variant="contained" disabled={!hasText || createNote.isPending}>
          Add Entry
        </Button>
        {createNote.error ? (
          <Typography variant="body2" role="alert">
            {errorMessage(createNote.error)}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
