import type { SessionNote } from '@awesomeness-mgmt/shared'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextAction from '@/sharedComponents/TextAction'

export type SessionNoteEntryProps = {
  note: SessionNote
  onRemove: () => void
  disabled: boolean
}

export default function SessionNoteEntry({ note, onRemove, disabled }: SessionNoteEntryProps) {
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
        <TextAction onClick={onRemove} disabled={disabled}>
          Remove
        </TextAction>
      </Box>
      {/* Typed line breaks are the note's structure. */}
      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        {note.text}
      </Typography>
    </Box>
  )
}
