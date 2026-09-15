import type { SessionNote } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import RichTextEditor from '@/sharedComponents/RichTextEditor/RichTextEditor'
import { useMentions } from '@/sharedComponents/RichTextEditor/useMentions'
import TextAction from '@/sharedComponents/TextAction'
import NoteForm from './NoteForm'

export type NoteEntryProps = {
  note: SessionNote
  label: string
  placeholder: string
  onRemove: () => void
  disabled: boolean
}

export default function NoteEntry({
  note,
  label,
  placeholder,
  onRemove,
  disabled,
}: NoteEntryProps) {
  const [editing, setEditing] = useState(false)
  const mentions = useMentions()

  if (editing) {
    return (
      <Box component="article" aria-label={`Editing ${note.date}`}>
        <NoteForm
          characterId={note.characterId}
          kind={note.kind}
          label={label}
          placeholder={placeholder}
          note={note}
          onDone={() => setEditing(false)}
        />
      </Box>
    )
  }

  return (
    <Box component="article" sx={{ display: 'grid', gap: 0.5 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="h6" component="h3">
          {note.date}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextAction onClick={() => setEditing(true)} disabled={disabled}>
            Edit
          </TextAction>
          <TextAction onClick={onRemove} disabled={disabled}>
            Remove
          </TextAction>
        </Box>
      </Box>
      <RichTextEditor
        value={note.body}
        editable={false}
        extensions={mentions}
        aria-label={`Notes for ${note.date}`}
      />
    </Box>
  )
}
