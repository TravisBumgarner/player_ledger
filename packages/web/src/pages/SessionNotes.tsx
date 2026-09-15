import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import SessionNotesCard from '@/components/journal/SessionNotesCard'

export default function SessionNotes() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="body1" color="text.secondary">
        A running log of session notes.
      </Typography>
      <SessionNotesCard />
    </Box>
  )
}
