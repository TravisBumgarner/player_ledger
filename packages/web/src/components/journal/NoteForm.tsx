import {
  createSessionNoteSchema,
  type NoteKind,
  type RichDoc,
  type SessionNote,
  trimRichDoc,
} from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { type FormEvent, useState } from 'react'
import { useCreateNote, useUpdateNote } from '@/hooks/mutations/useJournalMutations'
import { errorMessage } from '@/lib/errorMessages'
import RichTextEditor from '@/sharedComponents/RichTextEditor/RichTextEditor'
import { useMentions } from '@/sharedComponents/RichTextEditor/useMentions'

/** "Sep 14", as the prototype writes it. */
function today(): string {
  return new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export type NoteFormProps = {
  characterId: string
  kind: NoteKind
  label: string
  placeholder: string
  /** Given, the form edits this note in place; absent, it adds a new one. */
  note?: SessionNote
  onDone?: () => void
}

export default function NoteForm({
  characterId,
  kind,
  label,
  placeholder,
  note,
  onDone,
}: NoteFormProps) {
  const createNote = useCreateNote(characterId, kind)
  const updateNote = useUpdateNote(characterId, kind)
  const save = note ? updateNote : createNote
  const mentions = useMentions()

  const [date, setDate] = useState(() => note?.date ?? today())
  // Untrimmed, so it matches what the editor holds and the editor never resyncs mid-edit.
  const [body, setBody] = useState<RichDoc | null>(note?.body ?? null)
  // Remounts the add form's editor after a save; it owns its document while focused.
  const [editorKey, setEditorKey] = useState(0)

  const parsed = createSessionNoteSchema.safeParse({
    date,
    body: body ? trimRichDoc(body) : null,
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!parsed.success) return

    if (note) {
      updateNote.mutate({ noteId: note.id, input: parsed.data }, { onSuccess: () => onDone?.() })
      return
    }
    createNote.mutate(parsed.data, {
      onSuccess: () => {
        setDate(today())
        setBody(null)
        setEditorKey((key) => key + 1)
      },
    })
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 1 }}>
      <TextField
        size="small"
        label={label}
        value={date}
        onChange={(event) => setDate(event.target.value)}
        slotProps={{ htmlInput: { maxLength: 80 } }}
      />
      <RichTextEditor
        key={editorKey}
        value={body}
        onChange={(doc, isEmpty) => setBody(isEmpty ? null : doc)}
        placeholder={placeholder}
        aria-label="Note"
        extensions={mentions}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button type="submit" variant="contained" disabled={!parsed.success || save.isPending}>
          {note ? 'Save' : 'Add Entry'}
        </Button>
        {note ? <Button onClick={onDone}>Cancel</Button> : null}
        {save.error ? (
          <Typography variant="body2" role="alert">
            {errorMessage(save.error)}
          </Typography>
        ) : null}
      </Box>
    </Box>
  )
}
