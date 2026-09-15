import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CharacterList from '@/components/characters/CharacterList'

export default function Characters() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Typography variant="body1" color="text.secondary">
        Everyone your character knows — the party, and the people you meet. Type @ in any note to
        mention them.
      </Typography>
      <CharacterList />
    </Box>
  )
}
