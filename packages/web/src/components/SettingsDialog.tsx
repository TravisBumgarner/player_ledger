import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import CharacterSettings from '@/components/CharacterSettings'
import ThemeModeToggle from '@/components/ThemeModeToggle'
import { useCurrentIdentity } from '@/hooks/queries/useIdentity'

export default function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, character } = useCurrentIdentity()

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Settings</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 6 }}>
        {user && character ? (
          <Box sx={{ display: 'grid', gap: 3, pt: 2 }}>
            <Typography variant="capsXs" component="h3">
              Character
            </Typography>
            <CharacterSettings userId={user.id} characterId={character.id} />
          </Box>
        ) : null}
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Typography variant="capsXs" component="h3">
            Palette
          </Typography>
          <ThemeModeToggle fullWidth />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  )
}
